
# CareerPath AI

A personalized career guidance platform powered by **Gemini 1.5 Pro** (Reasoning) and **Gemini 2.0 Flash** (Visualization).

## Architecture

*   **Frontend**: React, TypeScript, Tailwind, Zustand (State).
*   **Backend**: Python FastAPI (Handles Auth Proxy, DB logic, and AI Generation).
*   **Database**: Supabase (PostgreSQL).
*   **AI**: Google Gemini.

## Setup Instructions

### 1. Database (Supabase)
1.  Create a Supabase Project.
2.  Go to **SQL Editor**.
3.  Open `database.txt`, copy the content, and run it in the SQL Editor.
4.  Go to **Storage**, create a public bucket named `career_slideshows`.

### 2. Backend (Deploy to Hugging Face Spaces)
1.  Create a new Space on Hugging Face (Select **Docker** as the SDK).
2.  Upload the backend files. **IMPORTANT: Rename them as follows:**
    *   `backend/main.txt` -> Rename to `main.py`
    *   `backend/Dockerfile.txt` -> Rename to `Dockerfile`
    *   `backend/requirements.txt` -> Keep as `requirements.txt`
3.  Set Secrets in Space Settings:
    *   `SUPABASE_URL`: Your Supabase URL.
    *   `SUPABASE_KEY`: Your Supabase Service Role Key (or Anon Key if RLS is tight).
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.

### 3. Frontend (Local)
1.  Create a `.env` file in the root:
    ```
    VITE_API_BASE_URL="https://your-huggingface-space-url.hf.space"
    ```
2.  `npm install`
3.  `npm run dev`

### 4. Extra Stuff
See `extrastuff.md` for Email Templates and Gitignore rules.
