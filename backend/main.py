import os
import json
import base64
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, HTTPException, Header, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import google.generativeai as genai

# --- CONFIG ---
TEXT_MODEL_NAME = 'gemini-2.5-pro'
IMAGE_MODEL_NAME = 'gemini-2.0-flash'

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
    # Just a warning for local dev if missing, but will fail at runtime
    print("WARNING: Missing environment variables")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
genai.configure(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app = FastAPI()

# CORS Config
# In production, replace ["*"] with your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---

class AuthRequest(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    fullName: str
    gender: str
    age: int
    educationLevel: str
    specialization: Optional[str] = ""
    residenceCountry: str
    preferredWorkCountry: str

class QuizAnswer(BaseModel):
    questionId: int
    answer: str
    domain: str

class CareerGenRequest(BaseModel):
    user_profile: UserProfile
    quiz_answers: List[QuizAnswer]

class ImageGenRequest(BaseModel):
    career_title: str
    prompts: List[str]
    user_context: Optional[UserProfile]
    future_age: Optional[int]

class CareerUploadRequest(BaseModel):
    career_uid: str
    images: List[str] # List of base64 strings or URLs

# --- HELPERS ---

def get_user_from_token(authorization: str = Header(None)):
    """
    Validates the Bearer token sent from frontend against Supabase Auth.
    Returns the User object.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    token = authorization.replace("Bearer ", "")
    try:
        # Verify token with Supabase
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid Token")
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Session expired or invalid")

# --- ENDPOINTS ---

@app.get("/")
def health_check():
    return {"status": "ok", "service": "CareerPath AI Backend"}

# 0. AUTHENTICATION (PROXY)

@app.post("/api/auth/signup")
def signup(creds: AuthRequest):
    try:
        res = supabase.auth.sign_up({"email": creds.email, "password": creds.password})
        if not res.user:
             raise HTTPException(status_code=400, detail="Signup failed")
        return {"status": "success", "message": "Check email for verification"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
def login(creds: AuthRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": creds.email, "password": creds.password})
        if not res.session:
             raise HTTPException(status_code=400, detail="Login failed")
             
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": {
                "id": res.user.id,
                "email": res.user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/auth/me")
def get_current_user(authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    return {"id": user.id, "email": user.email}


# 1. PROFILE MANAGEMENT

@app.get("/api/profile")
def get_profile(authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    
    try:
        response = supabase.table("profiles").select("*").eq("user_id", user.id).single().execute()
        data = response.data
        if not data:
             raise HTTPException(status_code=404, detail="Profile not found")
             
        # Map snake_case to camelCase
        return {
            "id": data['user_id'],
            "fullName": data['full_name'],
            "gender": data['gender'],
            "age": data['age'],
            "educationLevel": data['education_level'],
            "specialization": data['specialization'],
            "residenceCountry": data['residence_country'],
            "preferredWorkCountry": data['preferred_work_country']
        }
    except Exception as e:
        if "404" in str(e):
             raise HTTPException(status_code=404, detail="Profile not found")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/profile")
def upsert_profile(profile: UserProfile, authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    
    if user.id != profile.id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    data = {
        "user_id": profile.id,
        "full_name": profile.fullName,
        "gender": profile.gender,
        "age": profile.age,
        "education_level": profile.educationLevel,
        "specialization": profile.specialization,
        "residence_country": profile.residenceCountry,
        "preferred_work_country": profile.preferredWorkCountry,
        "updated_at": "now()"
    }

    try:
        supabase.table("profiles").upsert(data).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. CAREER GENERATION (GEMINI TEXT)

@app.post("/api/generate-career")
def generate_career(request: CareerGenRequest, authorization: str = Header(None)):
    user = get_user_from_token(authorization) 
    
    u = request.user_profile
    answers = request.quiz_answers
    target_country = u.residenceCountry if u.preferredWorkCountry == 'Undecided' else u.preferredWorkCountry
    
    # Text Model: Gemini 1.5 Pro
    prompt = f"""
    Act as an expert Career Counselor.
    User: {u.fullName}, {u.age}yo, {u.gender}.
    Education: {u.educationLevel} in {u.specialization}.
    Location: {u.residenceCountry} -> Target: {target_country}.
    Quiz Answers: {json.dumps([a.dict() for a in answers])}
    
    Generate 5 career paths available in {target_country}.
    Compare Specialization ({u.specialization}) to Career.
    Classify as 'Natural Progression' or 'Pivot'.
    Roadmap should start AFTER {u.educationLevel}.
    
    Output JSON format:
    {{
        "recommendations": [
            {{
                "id": "uuid", "title": "string", "matchScore": int, "summary": "string",
                "salaryRange": "string", "growth": "string", "tags": ["str"],
                "isPivot": bool, "pivotAnalysis": "string",
                "roadmap": [
                    {{"title": "str", "description": "str", "localPath": "str", "targetPath": "str", "duration": "str"}}
                ],
                "dayInLifePrompts": ["str"]
            }}
        ]
    }}
    STRICT ENGLISH OUTPUT.
    """
    
    try:
        model = genai.GenerativeModel(TEXT_MODEL_NAME)
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)
    except Exception as e:
        print(f"GenAI Error: {e}")
        raise HTTPException(status_code=500, detail="AI Generation Failed")

# 3. IMAGE GENERATION (GEMINI 2.0 FLASH)

@app.post("/api/generate-images")
def generate_images(request: ImageGenRequest, authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    
    # Image Model: Gemini 2.0 Flash
    model = genai.GenerativeModel(IMAGE_MODEL_NAME)
    
    u = request.user_context
    subject = f"a {request.future_age or 30} year old {u.gender if u else 'professional'}"
    
    urls = []
    
    for prompt_text in request.prompts:
        full_prompt = f"Cinematic photo of {subject} working as {request.career_title}, {prompt_text}. High quality, realistic."
        
        try:
            # Gemini 2.0 Flash creates images via generate_content but returns bytes in parts
            response = model.generate_content(full_prompt)
            
            img_found = False
            for part in response.parts:
                if part.inline_data:
                    img_data = part.inline_data.data
                    mime = part.inline_data.mime_type
                    # Convert bytes to base64 string for frontend
                    b64_str = base64.b64encode(img_data).decode('utf-8')
                    urls.append(f"data:{mime};base64,{b64_str}")
                    img_found = True
                    break
            
            if not img_found:
                print(f"No image data found in response for prompt: {prompt_text}")
                urls.append(f"https://picsum.photos/seed/{request.career_title.replace(' ','')}/1280/720")
                
        except Exception as e:
             print(f"Image Gen Error: {e}")
             urls.append(f"https://picsum.photos/seed/{request.career_title.replace(' ','')}/1280/720")
             
    return {"images": urls}

# 4. SAVED CAREERS

@app.get("/api/saved-careers")
def get_saved_careers(authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    
    res = supabase.table("saved_careers").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    
    formatted = []
    for row in res.data:
        data = row['data']
        data['id'] = row['career_uid']
        formatted.append(data)
        
    return formatted

@app.post("/api/saved-careers")
def save_career(career: Dict[str, Any], authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    
    career_uid = career.get('id')
    
    data = {
        "user_id": user.id,
        "career_uid": career_uid,
        "title": career.get('title'),
        "data": career,
        "created_at": "now()"
    }
    
    try:
        supabase.table("saved_careers").upsert(data, on_conflict="user_id, career_uid").execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/saved-careers/{career_uid}")
def delete_career(career_uid: str, authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    
    try:
        supabase.table("saved_careers").delete().eq("user_id", user.id).eq("career_uid", career_uid).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-images")
def upload_images(req: CareerUploadRequest, authorization: str = Header(None)):
    user = get_user_from_token(authorization)
    
    uploaded_urls = []
    
    for i, img_str in enumerate(req.images):
        if img_str.startswith("http"):
            uploaded_urls.append(img_str)
            continue
            
        try:
            if "base64," in img_str:
                header, encoded = img_str.split("base64,", 1)
                data = base64.b64decode(encoded)
            else:
                data = base64.b64decode(img_str)
                
            file_path = f"{user.id}/{req.career_uid}/img_{i}.png"
            
            supabase.storage.from_("career_slideshows").upload(
                file_path, 
                data, 
                {"content-type": "image/png", "upsert": "true"}
            )
            
            public_url = supabase.storage.from_("career_slideshows").get_public_url(file_path)
            uploaded_urls.append(public_url)
            
        except Exception as e:
            print(f"Upload failed: {e}")
            uploaded_urls.append(img_str) # Keep base64 as fallback
            
    return {"urls": uploaded_urls}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
