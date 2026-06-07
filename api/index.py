import os
import json
import uuid
import logging
import base64
import urllib.parse
import re
import asyncio
import random
import time
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from google import genai
from google.genai import types
from supabase import create_client, Client
import httpx

# --- CONFIGURATION ---
# Visible Rate Limits
DAILY_IMAGE_LIMIT = 3
DAILY_CAREER_LIMIT = 5

# Hidden Rate Limits
DAILY_GENERAL_QUIZ_LIMIT = 10
DAILY_DETAILS_VIEW_LIMIT = 30
# Dummy
# Configuration Constants
SLIDESHOW_IMAGE_COUNT = 3
CAREERS_PER_GENERATION = 5

# Model names
TEXT_MODEL_NAME = "gemini-2.5-flash"
IMAGE_MODEL_NAME = "gemini-2.5-flash-image"

# Serverless time budget (Vercel Hobby kills functions at 60s).
# Image generation must return partial results before that hard limit.
IMAGE_GEN_TIME_BUDGET = 50.0

# Realism contexts for grounded image generation
REALISM_CONTEXTS = [
    "during a typical Monday morning",
    "handling a routine task",
    "in a standard workplace setting",
    "during a regular workday",
    "taking a short break between tasks",
    "collaborating with a colleague",
    "reviewing work at their desk",
    "in a casual team discussion"
]

# API Keys and URLs
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
# Accept either name: SUPABASE_KEY (HF Spaces convention) or SUPABASE_ANON_KEY
# (the name used in Vercel env + the keep_alive GitHub workflow).
SUPABASE_KEY = (os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or "").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
# --- CONFIGURATION ENDS ---

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Vercel routes /api/* into this single function, but the exact path the function
# receives can include or omit the /api prefix depending on the rewrite config.
# Normalize by stripping a leading /api so the unprefixed routes below always match.
@app.middleware("http")
async def strip_api_prefix(request: Request, call_next):
    path = request.scope.get("path", "")
    # Strip a leading /api ( /api/auth/login -> /auth/login, /api -> "" )
    if path == "/api":
        path = ""
    elif path.startswith("/api/"):
        path = path[4:]
    # The rewrite destination "/api/index" can also surface as /index; treat the
    # function's own entrypoint paths as the health-check root.
    if path in ("", "/index"):
        path = "/"
    request.scope["path"] = path
    return await call_next(request)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    FRONTEND_URL.rstrip('/')
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("Supabase credentials missing.")
    supabase: Client = None
else:
    from supabase.lib.client_options import ClientOptions
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY, options=ClientOptions(schema="careerpath_ai"))

if not GEMINI_API_KEY:
    logger.warning("Gemini API Key missing.")
    ai_client = None
else:
    ai_client = genai.Client(api_key=GEMINI_API_KEY)

def sanitize_input(text: str) -> str:
    if not isinstance(text, str): return str(text)
    text = re.sub(r'<[^>]*>', '', text)
    return re.sub(r'[^\w\s.,!?-]', '', text).strip()

def sanitize_quiz_answers(answers: List[Dict[str, Any]]) -> str:
    clean_text = []
    for a in answers:
        q_id = a.get("questionId", "Unknown")
        ans = sanitize_input(str(a.get("answer", "")))[:200]
        clean_text.append(f"Q{q_id}: {ans}")
    return "; ".join(clean_text)

def clean_json_text(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def get_user_client(token: str) -> Client:
    from supabase.lib.client_options import ClientOptions
    client = create_client(SUPABASE_URL, SUPABASE_KEY, options=ClientOptions(schema="careerpath_ai"))
    client.postgrest.auth(token)
    return client

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "CareerPath AI Backend"}

class BaseSchema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

class UserLogin(BaseSchema):
    email: str
    password: str

class PasswordResetRequest(BaseSchema):
    email: str

class UpdatePasswordRequest(BaseSchema):
    password: str = Field(..., min_length=6, max_length=128)

class Limits(BaseSchema):
    daily_image_limit: int = DAILY_IMAGE_LIMIT
    daily_career_limit: int = DAILY_CAREER_LIMIT
    daily_general_quiz_limit: int = DAILY_GENERAL_QUIZ_LIMIT
    daily_details_view_limit: int = DAILY_DETAILS_VIEW_LIMIT
    slideshow_image_count: int = SLIDESHOW_IMAGE_COUNT

class UserProfile(BaseSchema):
    id: str
    full_name: str = Field(..., max_length=100)
    gender: str = Field(..., max_length=50)
    age: int = Field(..., ge=10, le=100)
    education_level: str = Field(..., max_length=100)
    specialization: str = Field(..., max_length=100)
    residence_country: str = Field(..., max_length=100)
    preferred_work_country: str = Field(..., max_length=100)
    daily_image_generations_count: Optional[int] = 0
    daily_career_generations_count: Optional[int] = 0
    daily_general_quiz_count: Optional[int] = 0
    daily_details_view_count: Optional[int] = 0
    last_image_generation_date: Optional[datetime] = None
    last_career_generation_date: Optional[datetime] = None
    last_general_quiz_date: Optional[datetime] = None
    last_details_view_date: Optional[datetime] = None
    limits: Optional[Limits] = None

class CareerRoadmapStep(BaseSchema):
    title: str
    description: str
    local_path: Optional[str] = None
    target_path: Optional[str] = None
    duration: str
    challenges: Optional[str] = None

class CareerRecommendation(BaseSchema):
    id: str
    title: str
    match_score: int
    summary: str
    salary_range: str
    growth: str
    tags: List[str]
    entry_barriers: Optional[str] = None
    is_pivot: Optional[bool] = False
    pivot_analysis: Optional[str] = None
    roadmap: Optional[List[CareerRoadmapStep]] = []
    day_in_life_prompts: Optional[List[str]] = []
    slide_images: Optional[List[Optional[str]]] = []
    skills: Optional[List[str]] = []

class GenerateCareerResponse(BaseSchema):
    recommendations: List[CareerRecommendation]

class GenerateCareerRequest(BaseSchema):
    user_profile: UserProfile
    quiz_answers: List[Dict[str, Any]]

class GenerateCareerDetailsRequest(BaseSchema):
    user_profile: UserProfile
    career_title: str = Field(..., max_length=200)
    career_summary: str = Field(..., max_length=1000)

class GenerateImagesRequest(BaseSchema):
    career_title: str = Field(..., max_length=200)
    prompts: List[str]
    user_context: Optional[UserProfile] = None
    future_age: Optional[int] = 25

class SaveCareerImageRequest(BaseSchema):
    user_id: str
    career_uid: str
    images: List[Optional[str]]

class GenerateDomainRequest(BaseSchema):
    quiz_answers: List[Dict[str, Any]]

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        if not user: raise HTTPException(status_code=401, detail="Invalid token")
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")

async def verify_registered_user(authorization: str = Header(None), user = Depends(verify_token)):
    """
    Ensures the user has a profile in the careerpath_ai schema.
    This prevents users from other apps on the same Supabase project from accessing this API.
    """
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    try:
        # Check if profile exists by selecting just the ID
        res = client.table("profiles").select("id").eq("id", user.id).single().execute()
        if not res.data:
            raise HTTPException(status_code=403, detail="Access denied. Please complete onboarding.")
        return user
    except Exception:
        # If any error (e.g. 406 Not Acceptable if row missing + RLS), treat as forbidden
        raise HTTPException(status_code=403, detail="Access denied. User profile not found.")

def increment_and_verify_quota(client: Client, user_id: str, count_col: str, date_col: str, limit: int, error_msg: str = None):
    try:
        response = client.rpc('check_and_increment_quota', {
            'p_user_id': user_id,
            'p_count_field': count_col,
            'p_date_field': date_col,
            'p_limit': limit
        }).execute()

        if not response.data:
             msg = error_msg or f"Daily limit of {limit} reached."
             raise HTTPException(status_code=429, detail=msg)

    except HTTPException as he: raise he
    except Exception as e:
        logger.error(f"Quota error: {e}")
        raise HTTPException(status_code=500, detail="Quota verification failed")

@app.post("/auth/signup")
async def signup(creds: UserLogin):
    try:
        res = supabase.auth.sign_up({"email": creds.email, "password": creds.password})
        if res.user and (res.user.identities is not None) and len(res.user.identities) == 0: raise Exception("User already registered")
        return res
    except Exception as e:
        msg = str(e)
        if "User already registered" in msg: raise HTTPException(status_code=400, detail="User already registered")
        raise HTTPException(status_code=400, detail=msg)

@app.post("/auth/login")
async def login(creds: UserLogin):
    try:
        res = supabase.auth.sign_in_with_password({"email": creds.email, "password": creds.password})
        return {"access_token": res.session.access_token, "user": res.user}
    except Exception as e:
        error_msg = str(e)
        if "Email not confirmed" in error_msg:
            raise HTTPException(status_code=400, detail="Email not confirmed")
        if "Invalid login credentials" in error_msg:
            raise HTTPException(status_code=400, detail="Invalid login credentials")
        raise HTTPException(status_code=400, detail=error_msg)

@app.post("/auth/reset-password")
async def reset_password(req: PasswordResetRequest):
    try: supabase.auth.reset_password_email(req.email)
    except Exception: pass
    return {"status": "success"}

@app.post("/auth/update-password")
async def update_password(req: UpdatePasswordRequest, authorization: str = Header(None), user = Depends(verify_token)):
    token = authorization.split(" ")[1]
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.put(url, json={"password": req.password}, headers=headers)
        if response.status_code != 200:
            try:
                err_data = response.json()
                msg = err_data.get("msg") or err_data.get("error_description") or "Failed to update password"
                if "New password should be different" in msg:
                    raise HTTPException(status_code=400, detail="New password must be different from the old password")
                raise HTTPException(status_code=response.status_code, detail=msg)
            except HTTPException as he:
                raise he
            except Exception:
                raise HTTPException(status_code=500, detail="Failed to update password")

    return {"status": "success"}

@app.get("/auth/me")
async def get_current_user(user = Depends(verify_token)): return {"id": user.id, "email": user.email}

@app.get("/profile")
async def get_profile(authorization: str = Header(None), user = Depends(verify_token)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    try:
        # Note: We use verify_token here (not verify_registered_user) because this endpoint
        # allows the frontend to CHECK if the user is registered. Returns 404 if not found.
        res = client.table("profiles").select("*").eq("id", user.id).single().execute()
        if not res.data: raise HTTPException(status_code=404, detail="Profile not found")
        profile = res.data
        profile['limits'] = {
            'daily_image_limit': DAILY_IMAGE_LIMIT,
            'daily_career_limit': DAILY_CAREER_LIMIT,
            'daily_general_quiz_limit': DAILY_GENERAL_QUIZ_LIMIT,
            'daily_details_view_limit': DAILY_DETAILS_VIEW_LIMIT,
            'slideshow_image_count': SLIDESHOW_IMAGE_COUNT
        }
        return profile
    except Exception: raise HTTPException(status_code=500, detail="Database error")

@app.post("/profile")
async def upsert_profile(profile: UserProfile, authorization: str = Header(None), user = Depends(verify_token)):
    # Note: We use verify_token here because this is the ONBOARDING endpoint.
    if profile.id != user.id: raise HTTPException(status_code=403)
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    try:
        data = profile.model_dump(by_alias=False)
        updatable_fields = [
            'id', 'full_name', 'gender', 'age', 'education_level',
            'specialization', 'residence_country', 'preferred_work_country'
        ]
        final_payload = {k: v for k, v in data.items() if k in updatable_fields}
        client.table("profiles").upsert(final_payload).execute()
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error in upsert_profile: {e}")
        raise HTTPException(status_code=500)

@app.post("/generate-domain")
async def generate_domain(req: GenerateDomainRequest, authorization: str = Header(None), user = Depends(verify_registered_user)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    increment_and_verify_quota(client, user.id, "daily_general_quiz_count", "last_general_quiz_date", DAILY_GENERAL_QUIZ_LIMIT, "You have taken the general quiz too many times today.")
    try:
        if not ai_client: raise Exception("AI client not initialized")
        clean_answers = sanitize_quiz_answers(req.quiz_answers)
        prompt = f"Analyze quiz answers: {clean_answers}. Suggest domain: 'science', 'commerce', or 'arts'. Output JSON: {{ \"suggested_domain\": \"name\" }}"
        response = await ai_client.aio.models.generate_content(
            model=TEXT_MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                max_output_tokens=5000,
                safety_settings=[
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
                ]
            )
        )
        try:
            raw_text = clean_json_text(response.text)
        except ValueError:
            logger.warning("Gemini returned empty response. Defaulting to 'general'.")
            return {"suggested_domain": "general"}
        try:
            data = json.loads(raw_text)
            domain = data.get("suggested_domain")
            if domain in ['science', 'commerce', 'arts']:
                return {"suggested_domain": domain}
        except json.JSONDecodeError:
            pass
        text_lower = raw_text.lower()
        if "science" in text_lower: return {"suggested_domain": "science"}
        if "commerce" in text_lower: return {"suggested_domain": "commerce"}
        if "arts" in text_lower: return {"suggested_domain": "arts"}
        return {"suggested_domain": "general"}
    except Exception as e:
        logger.error(f"Error in generate_domain: {e}", exc_info=True)
        return {"suggested_domain": "general"}

@app.post("/generate-career", response_model=GenerateCareerResponse)
async def generate_career(req: GenerateCareerRequest, authorization: str = Header(None), user = Depends(verify_registered_user)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    increment_and_verify_quota(client, user.id, "daily_career_generations_count", "last_career_generation_date", DAILY_CAREER_LIMIT)
    try:
        user_p = req.user_profile
        safe_specialization = sanitize_input(user_p.specialization)
        safe_full_name = sanitize_input(user_p.full_name)
        clean_answers = sanitize_quiz_answers(req.quiz_answers)

        prompt = f"""
Act as an experienced Career Counselor with expertise in global job markets.

USER PROFILE:
<profile>
Name: {safe_full_name}
Age: {user_p.age}
Education: {user_p.education_level}
Specialization: {safe_specialization}
Current Residence: {user_p.residence_country}
Target Residence: {user_p.preferred_work_country}
</profile>

ASSESSMENT RESULTS:
<answers>
{clean_answers}
</answers>

TASK: Recommend {CAREERS_PER_GENERATION} realistic career paths that match this profile.

EVALUATION CRITERIA for each career:
1. ACCESSIBILITY: Can someone with this exact background realistically enter this field within 2-5 years?
2. ALIGNMENT: How well do the assessment results indicate aptitude and interest?
3. MARKET REALITY: Consider actual job availability in both residence and target countries.
4. PROGRESSION: Is there a clear, achievable path from current position to this career?

MATCH SCORE GUIDELINES:
- 90-100: Near-perfect fit, minimal additional training needed
- 75-89: Strong fit, some skill development or certification required
- 60-74: Moderate fit, significant but achievable transition needed
- Below 60: Do not include - too much of a stretch

STRICT ELIGIBILITY: Do not suggest careers that fundamentally require a different educational background (e.g., no Quantum Physics for Arts students). However, if there's a realistic bridge path, consider it.

For salaryRange, provide realistic figures for the TARGET COUNTRY ({user_p.preferred_work_country}) in local currency or USD.

Address the user as "you" throughout. Do NOT use their name. Do not mention the question numbers of the quiz answers anywhere in your response, just vaguely mention the answers the user gave if needed.

OUTPUT FORMAT: Strict JSON
{{
  "recommendations": [
    {{
      "id": "uuid-placeholder",
      "title": "Specific Job Title (not generic)",
      "matchScore": 75,
      "summary": "2-3 sentences explaining WHY this fits based on their specific profile and assessment answers. Be concrete and honest about both the fit and any gaps.",
      "salaryRange": "Realistic entry to mid-level range for target country",
      "growth": "Low/Moderate/High/Very High - based on actual market trends, along with a percentage value and a target as well. Eg: High Growth (50% by 2030)",
      "tags": ["Relevant", "Specific", "Skills"],
      "entryBarriers": "Optional. Only include if there is a specific, significant barrier (e.g., 'Requires PhD', 'Strict licensing') or if the user needs a certain skill which may not be offered by their current specialization. Return null if generally accessible.",
    }}
  ]
}}
IMPORTANT: Do NOT include 'roadmap' or 'dayInLifePrompts' in this response. They will be generated later.
"""
        response = await ai_client.aio.models.generate_content(
            model=TEXT_MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json", max_output_tokens=8192)
        )
        text = clean_json_text(response.text)
        result_json = json.loads(text)
        for rec in result_json.get("recommendations", []):
            if not rec.get("id"): rec["id"] = str(uuid.uuid4())
            rec["roadmap"] = []
            rec["dayInLifePrompts"] = []
            rec["skills"] = []
        return {"recommendations": result_json["recommendations"]}
    except Exception as e:
        logger.error(f"Career Gen Error: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed")

@app.post("/generate-career-details")
async def generate_career_details(req: GenerateCareerDetailsRequest, authorization: str = Header(None), user = Depends(verify_registered_user)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    increment_and_verify_quota(client, user.id, "daily_details_view_count", "last_details_view_date", DAILY_DETAILS_VIEW_LIMIT, "Usage limit reached for career details generation.")
    try:
        user_p = req.user_profile
        safe_title = sanitize_input(req.career_title)
        safe_summary = sanitize_input(req.career_summary)
        prompt = f"""
Act as a practical Career Advisor providing honest, grounded guidance.

USER CONTEXT:
<context>
Career: {safe_title}
Summary: {safe_summary}
User Education: {user_p.education_level} in {sanitize_input(user_p.specialization)}
Current Residence: {user_p.residence_country}
Target Residence: {user_p.preferred_work_country}
</context>

TASK 1 - REALISTIC ROADMAP:
Create a 3-4 step educational and professional roadmap to reach {safe_title}.
- Be specific about certifications, degrees, or experience needed
- Include realistic timeframes (not overly optimistic)
- If Current Residence and Target Residence countries differ, note where each step is best completed using localPath and targetPath. Atleast one of the two (localPath and targetPath) should be generated for each step.
- Address the user as "you" - do NOT use their name
- The description of the step shouldn't be more than in 2-3 short sentences.
- REQUIRED FIELDS: title, description, duration, localPath, targetPath (must be generated)
- OPTIONAL FIELD: challenges (Only include if there is a significant, non-obvious hurdle at this step. Otherwise return null.)

TASK 2 - TRANSITION ANALYSIS:
Evaluate the difficulty of this career transition:
- "Natural Progression": Builds directly on current education/skills (isPivot: false)
- "Moderate Pivot": Related field, requires meaningful reskilling (isPivot: true)
- "Major Pivot": Substantially different, requires extensive retraining (isPivot: true)
Explain in 1-2 sentences what makes this transition easier or harder for this specific user.

TASK 3 - SKILLS ANALYSIS:
List 5-7 specific hard and soft skills required for this role in the target market. Each skill shouldn't be longer than 1-2 words.
Mix technical tools (software, languages, etc.) and interpersonal/cognitive abilities.

TASK 4 - REALISTIC DAY-IN-THE-LIFE SCENARIOS:
Generate {SLIDESHOW_IMAGE_COUNT} image prompts showing TYPICAL, EVERYDAY work scenarios.
Guidelines:
- Show common daily tasks, NOT rare highlights or prestigious moments
- Include realistic settings (normal offices, standard equipment, typical environments)
- Represent the routine 80% of the job, not the glamorous 20%
- Focus on authentic, relatable moments
- Do NOT use names - use "A professional" or "A [job title]"

Good examples: "Reviewing spreadsheets at a desk with morning coffee", "In a casual team standup meeting", "Troubleshooting an issue while chatting with a colleague", "Taking notes during a video call", "Organizing files and planning the week ahead"

Bad examples (avoid these): "Addressing a global summit", "Making a breakthrough discovery", "Closing a million-dollar deal", "Accepting an award"

OUTPUT FORMAT: Strict JSON
{{
    "isPivot": boolean,
    "pivotAnalysis": "Honest 1-2 sentence analysis of transition difficulty for this specific user...",
    "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "roadmap": [
        {{
            "title": "Step Name",
            "description": "Specific details with realistic expectations, addressing user as 'you'...",
            "localPath": "How to accomplish this in {user_p.residence_country}",
            "targetPath": "How to accomplish this in {user_p.preferred_work_country} (or null)",
            "duration": "Realistic duration (e.g., '6-12 months', '2-3 years')",
            "challenges": "Specific obstacle (or null)"
        }}
    ],
    "dayInLifePrompts": ["Realistic everyday prompt 1", "Realistic everyday prompt 2", "Realistic everyday prompt 3"]
}}
"""
        response = await ai_client.aio.models.generate_content(
            model=TEXT_MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json", max_output_tokens=5000)
        )
        text = clean_json_text(response.text)
        return json.loads(text)
    except Exception as e:
        logger.error(f"Career Details Gen Error: {e}")
        raise HTTPException(status_code=500, detail="AI details generation failed")

@app.post("/generate-images")
async def generate_images(req: GenerateImagesRequest, authorization: str = Header(None), user = Depends(verify_registered_user)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    increment_and_verify_quota(client, user.id, "daily_image_generations_count", "last_image_generation_date", DAILY_IMAGE_LIMIT)
    try:
        safe_title = sanitize_input(req.career_title)
        subject = "a professional"
        if req.user_context:
            age = req.future_age or (req.user_context.age + 5)
            subject = f"a {age}yo {req.user_context.gender} professional from {req.user_context.residence_country}"

        safe_prompts = req.prompts[:SLIDESHOW_IMAGE_COUNT]

        # Wall-clock budget guard: on Vercel Hobby the function is hard-killed at
        # 60s. We track elapsed time and bail out with None so the function always
        # returns valid JSON (partial results) instead of being killed mid-flight.
        start = time.monotonic()

        def time_left() -> float:
            return IMAGE_GEN_TIME_BUDGET - (time.monotonic() - start)

        async def gen_one_image(prompt_text, idx):
            # Light stagger to spread out the initial burst without eating the budget.
            await asyncio.sleep(idx * 0.5)
            safe_prompt = sanitize_input(prompt_text)
            context = random.choice(REALISM_CONTEXTS)
            prompt = f"""
Generate a realistic image of {subject} working as a {safe_title} {context}. Only generate a high quality image and no text before or after the image.
Scene: {safe_prompt}.
Style: Natural lighting, authentic workplace environment, candid moment, documentary photography style.
Show genuine work conditions - normal office or workspace, everyday equipment, realistic professional attire.
NOT glamorized or cinematic - capture the real, everyday nature of this work.
Mood: Focused, professional, relatable.
Negative: text, words, watermarks, logos, unrealistic lighting, overly dramatic poses.
"""
            for attempt in range(2):
                # Stop before the budget runs out rather than risk a hard kill.
                if time_left() <= 0:
                    logger.warning(f"Image {idx} skipped: time budget exhausted.")
                    return None
                try:
                    generate_content_config = types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                    )
                    res = await ai_client.aio.models.generate_content(
                        model=IMAGE_MODEL_NAME,
                        contents=prompt,
                        config=generate_content_config,
                    )
                    if res.candidates and res.candidates[0].content.parts:
                        for part in res.candidates[0].content.parts:
                             if part.inline_data and part.inline_data.data:
                                 mime = part.inline_data.mime_type or "image/jpeg"
                                 return f"data:{mime};base64,{base64.b64encode(part.inline_data.data).decode('utf-8')}"
                except Exception as e:
                    logger.error(f"Image gen attempt {attempt} failed: {e}")
                    err_str = str(e)
                    if "429" in err_str or "ResourceExhausted" in err_str or "Quota" in err_str:
                        backoff = min((attempt + 1) * 2, 8)
                    else:
                        backoff = 1.0
                    # Don't sleep past the budget.
                    if backoff >= time_left():
                        return None
                    await asyncio.sleep(backoff)
            return None

        tasks = [gen_one_image(p, i) for i, p in enumerate(safe_prompts)]
        results = await asyncio.gather(*tasks)
        return {"images": results}
    except Exception as e:
        logger.error(f"Global Image Gen Error: {e}")
        return {"images": [None]*len(req.prompts)}

@app.get("/saved-careers")
async def get_saved_careers(authorization: str = Header(None), user = Depends(verify_registered_user)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    try: return client.table("saved_careers").select("*").eq("user_id", user.id).execute().data
    except Exception: return []

@app.post("/saved-careers")
async def save_career(career: CareerRecommendation, authorization: str = Header(None), user = Depends(verify_registered_user)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    try:
        data = career.model_dump(by_alias=False)
        data.update({"user_id": user.id, "career_uid": career.id})
        if 'id' in data: del data['id']
        if data.get('slide_images'): data['slide_images'] = [img if img and len(img) < 2000 else None for img in data['slide_images']]
        client.table("saved_careers").upsert(data, on_conflict="user_id,career_uid").execute()
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.delete("/saved-careers/{career_uid}")
async def delete_career(career_uid: str, authorization: str = Header(None), user = Depends(verify_registered_user)):
    token = authorization.split(" ")[1]
    client = get_user_client(token)
    try:
        try:
            files_to_remove = [f"{user.id}/{career_uid}/slide_{i}.png" for i in range(5)]
            files_to_remove += [f"{user.id}/{career_uid}/slide_{i}.jpg" for i in range(5)]
            client.storage.from_('careerpath_ai_slideshows').remove(files_to_remove)
        except Exception: pass

        client.table("saved_careers").delete().eq("user_id", user.id).eq("career_uid", career_uid).execute()
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/career-images")
async def upload_career_images(req: SaveCareerImageRequest, authorization: str = Header(None), user = Depends(verify_registered_user)):
    if req.user_id != user.id: raise HTTPException(status_code=403)
    uploaded = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        for i, img in enumerate(req.images):
            if not img or img.startswith("http"):
                uploaded.append(img)
                continue
            try:
                header = img.split(",")[0]
                if "image/png" in header: ext = "png"
                elif "image/jpeg" in header: ext = "jpg"
                else:
                     uploaded.append(None)
                     continue

                # Vercel serverless caps request/response bodies at 4.5MB, and several
                # base64 images travel together in one request. Cap each base64 string
                # at ~2.5MB so the combined inbound request stays under the limit.
                if len(img) > int(2.5 * 1024 * 1024):
                     uploaded.append(None)
                     continue

                url = f"{SUPABASE_URL}/storage/v1/object/careerpath_ai_slideshows/{user.id}/{req.career_uid}/slide_{i}.{ext}"
                data = base64.b64decode(img.split(",")[1] if "," in img else img)
                await client.post(url, content=data, headers={"Authorization": authorization, "apikey": SUPABASE_KEY, "Content-Type": f"image/{ext}", "x-upsert": "true"})
                uploaded.append(f"{SUPABASE_URL}/storage/v1/object/public/careerpath_ai_slideshows/{user.id}/{req.career_uid}/slide_{i}.{ext}")
            except: uploaded.append(None)
    return {"image_urls": uploaded}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
