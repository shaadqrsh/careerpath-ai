# CareerPath AI

A personalized career guidance platform powered by **Gemini 1.5 Pro** (Reasoning) and **Gemini 2.0 Flash** (Visualization).

## Architecture

*   **Frontend**: React, TypeScript, Tailwind, Zustand (State).
*   **Backend**: Python FastAPI (Handles Auth Proxy, DB logic, and AI Generation).
*   **Database**: Supabase (PostgreSQL).
*   **AI**: Google Gemini.

## Deployment Instructions

### 1. Database (Supabase)
1.  Create a Supabase Project.
2.  Go to **SQL Editor**.
3.  Open `database.txt`, copy the content, and run it in the SQL Editor.
4.  Go to **Storage**, create a public bucket named `career_slideshows`.
5.  **Email Templates**: Go to Authentication -> Email Templates. The templates provided in `email_templates.txt` should be used for "Confirm Signup" and "Reset Password" to ensure the styling matches the app.

### 2. Backend (Hugging Face Spaces)
1.  Create a new Space on Hugging Face (Select **Docker** as the SDK).
2.  Upload the backend files. **IMPORTANT: Rename them as follows:**
    *   `backend/main.txt` -> Rename to `main.py`
    *   `backend/Dockerfile.txt` -> Rename to `Dockerfile`
    *   `backend/requirements.txt` -> Keep as `requirements.txt`
3.  Set Secrets in Space Settings:
    *   `SUPABASE_URL`: Your Supabase URL.
    *   `SUPABASE_KEY`: Your Supabase Service Role Key.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.

### 3. Frontend (Vercel)
1.  Log in to Vercel.
2.  Add New Project and import this Git repository.
3.  In "Build & Development Settings":
    *   Framework Preset: **Vite**
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
4.  In "Environment Variables":
    *   Key: `VITE_API_BASE_URL`
    *   Value: `https://[YOUR-HUGGINGFACE-SPACE-NAME].hf.space` (e.g., `https://my-career-app.hf.space`)
5.  Deploy.

### 4. Local Development
1.  Create a `.env` file in the root:
    ```
    VITE_API_BASE_URL="http://127.0.0.1:7860"
    ```
2.  `npm install`
3.  `npm run dev`