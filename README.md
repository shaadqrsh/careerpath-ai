# 🚀 CareerPath AI

<div align="center">

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**An AI-powered career guidance platform that analyzes your profile and quiz results to recommend personalized career paths with roadmaps and day-in-the-life visualizations.**

[🔴 Live Demo](https://pathfinder-ai-nine.vercel.app/) &nbsp;&nbsp;|&nbsp;&nbsp; [📂 Source Code](https://github.com/shaadqrsh/careerpath-ai)

</div>

---

## 🏗 Architecture

The frontend and backend are deployed together on **Vercel** as a single project — the static React app plus Python serverless functions — so the browser calls the API same-origin (no CORS) under `/api/*`.

*   **Frontend**: React, TypeScript, Tailwind, Zustand (State Management). Built with Vite, served as static assets.
*   **Backend**: Python FastAPI running as a **Vercel serverless function** (`api/index.py`). Handles Auth Proxy, Database Logic, AI Generation, and Rate Limiting.
*   **Database**: Supabase (PostgreSQL + Auth).
*   **AI Engine**: Google Gemini 2.5 Flash (Reasoning & Visualization).

> **Routing note:** Vercel strips the `/api` prefix before invoking the function, so routes in `api/index.py` are registered *without* the `/api` prefix and the app sets `root_path="/api"`. A request to `/api/auth/login` therefore reaches FastAPI's `@app.post("/auth/login")` handler.

---

## 🚀 Deployment Instructions

Follow these steps in order to deploy the application to the cloud.

### 1. Database Setup (Supabase)
1.  **Create Project**: Log in to [Supabase](https://supabase.com/) and create a new project.
2.  **Run SQL Setup**: 
    *   Navigate to the **SQL Editor** in the sidebar.
    *   Click **New Query**.
    *   Copy the contents of the file `backend/database.txt` provided in this repository.
    *   Paste it into the editor and click **Run**.
    *   *Note: This script will automatically create the dedicated schema `careerpath_ai`, the necessary tables (`profiles`, `saved_careers`), set up Row Level Security (RLS) policies, and configure the `careerpath_ai_slideshows` storage bucket with strict security.*
3.  **Email Templates (Optional)**: 
    *   Go to **Authentication** -> **Email Templates**.
    *   Update "Confirm Signup" and "Reset Password" with the content from `backend/email_templates.txt` for consistent styling.

### 2. Deployment (Vercel)

The frontend and the Python backend deploy together from this single repository. Vercel auto-detects the Vite app and builds the functions in `api/` separately — no extra build config needed.

1.  Log in to Vercel.
2.  Add a **New Project** and import this Git repository.
3.  Confirm **Build & Development Settings** (defaults are correct):
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  Configure **Environment Variables** (scope: Production + Preview):
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_ANON_KEY` *(or `SUPABASE_KEY`)*: Your Supabase **Public Anon** Key. The backend accepts either name.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `VITE_API_BASE_URL`: Leave **empty** (`""`), or omit it entirely. With no value the frontend calls the API same-origin at `/api/*`. (It is only set to a full URL if you host the API elsewhere.)
5.  Click **Deploy**.

> **Keeping Supabase awake:** Supabase's free tier pauses the database after inactivity. The `.github/workflows/keep_alive.yml` GitHub Action pings it hourly to keep it warm. It uses the `SUPABASE_URL` and `SUPABASE_ANON_KEY` repository secrets (Settings → Secrets and variables → Actions).

> **Function timeout:** On the Vercel Hobby plan, functions are capped at 60s. The image-generation endpoint is tuned to fit within this budget (`IMAGE_GEN_TIME_BUDGET` in `api/index.py`) and returns partial results rather than timing out. If you upgrade to Pro, you can raise `maxDuration` in `vercel.json`.

---

## ⚙️ Configuration & Customization

### Backend Config (`api/index.py`)
All rate limits and model settings are controlled centrally in the backend function.
*   **`DAILY_IMAGE_LIMIT`**: Max image generations per user/day.
*   **`DAILY_CAREER_LIMIT`**: Max career assessments per user/day.
*   **`DAILY_GENERAL_QUIZ_LIMIT`**: Max "free" general assessments (anti-abuse).
*   **`DAILY_DETAILS_VIEW_LIMIT`**: Max "free" detail generations (anti-abuse).
*   **`TEXT_MODEL_NAME`**: Change the Gemini model version.
*   **`IMAGE_MODEL_NAME`**: Change the model used for visualization.

### Frontend Config (`constants.ts`)
*   **`APP_NAME`**: Change the display name of the application.
*   **`QUESTIONS`**: Modify or add new questions to the personality/aptitude quiz.
*   **`FALLBACK_COUNTRIES`**: Update the list of countries available in the onboarding dropdown.

---

<div align="center">
  <p>Built with ❤️ using Gemini 3 Preview</p>
</div>