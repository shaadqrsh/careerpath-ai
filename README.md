# CareerPath AI - Setup Guide

This project consists of a **React Frontend** and a **Python FastAPI Backend**. The backend handles all database interactions (Supabase) and AI Generation (Gemini).

## Project Structure

*   `backend/` - Contains the Python API code (`main.py`, `Dockerfile`, `requirements.txt`).
*   `database.sql` - SQL queries to set up your Supabase database.
*   `src/` (root) - The React Frontend code.

---

## 1. Supabase Setup (Database & Auth)

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Go to **SQL Editor** in the Supabase dashboard.
3.  Copy the content from `database.sql` and run it to create your tables and policies.
4.  Go to **Storage**, create a new bucket named `career_slideshows`, and set it to **Public**.
5.  Go to **Settings -> API** and copy your:
    *   Project URL
    *   Service Role Key (Secret, starts with `ey...`)

## 2. Backend Setup (Hugging Face Spaces)

You need to deploy the backend so the frontend can talk to it.

1.  Go to [Hugging Face Spaces](https://huggingface.co/spaces).
2.  Click **Create new Space**.
    *   Name: `careerpath-backend`
    *   SDK: **Docker**
    *   Template: **Blank**
3.  Upload the files from the `backend/` folder (`main.py`, `Dockerfile`, `requirements.txt`) to your Space.
4.  Go to **Settings -> Variables and secrets** in your Space and add these Secrets:
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_KEY`: Your Supabase **Service Role** Key.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
5.  Once the Space is "Running", click **Embed this space** to copy the Direct URL (e.g., `https://huggingface.co/spaces/username/careerpath-backend`).

## 3. Frontend Setup

1.  Create a `.env` file in the root of this project.
2.  Add the backend URL you just deployed:

```env
VITE_API_BASE_URL="https://your-huggingface-space-url.hf.space"
```

3.  Install dependencies and run the frontend:

```bash
npm install
npm run dev
```

## 4. Local Development (Backend)

If you want to run the backend locally instead of on Hugging Face:

1.  Navigate to the `backend/` folder.
2.  Install dependencies: `pip install -r requirements.txt`.
3.  Set environment variables in your terminal:
    ```bash
    export SUPABASE_URL="your-url"
    export SUPABASE_KEY="your-service-role-key"
    export GEMINI_API_KEY="your-gemini-key"
    ```
4.  Run the server: `uvicorn main:app --reload`.
5.  Update your frontend `.env` to `VITE_API_BASE_URL="http://localhost:8000"`.
