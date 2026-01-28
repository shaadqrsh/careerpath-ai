# 🚀 CareerPath AI

<div align="center">

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**An AI-powered career guidance platform that analyzes your profile and quiz results to recommend personalized career paths with roadmaps and day-in-the-life visualizations.**

[🔴 Live Demo](https://pathfinder-ai-nine.vercel.app/) &nbsp;&nbsp;|&nbsp;&nbsp; [📂 Source Code](https://github.com/shaadqrsh/pathfinder-ai)

</div>

---

## 🏗 Architecture

This application uses a decoupled architecture for security and scalability:

*   **Frontend**: React, TypeScript, Tailwind, Zustand (State Management).
*   **Backend**: Python FastAPI (Handles Auth Proxy, Database Logic, AI Generation, and Rate Limiting).
*   **Database**: Supabase (PostgreSQL + Auth).
*   **AI Engine**: Google Gemini 2.5 Flash (Reasoning & Visualization).

---

## 🚀 Deployment Instructions

Follow these steps in order to deploy the application to the cloud.

### 1. Database Setup (Supabase)
1.  **Create Project**: Log in to [Supabase](https://supabase.com/) and create a new project.
2.  **Run SQL Setup**: 
    *   Navigate to the **SQL Editor** in the sidebar.
    *   Click **New Query**.
    *   Copy the contents of the file `database.txt` provided in this repository.
    *   Paste it into the editor and click **Run**.
    *   *Note: This script will automatically create the dedicated schema `careerpath_ai`, the necessary tables (`profiles`, `saved_careers`), set up Row Level Security (RLS) policies, and configure the `careerpath_ai_slideshows` storage bucket with strict security.*
3.  **Email Templates (Optional)**: 
    *   Go to **Authentication** -> **Email Templates**.
    *   Update "Confirm Signup" and "Reset Password" with the content from `email_templates.txt` for consistent styling.

### 2. Backend Deployment (Hugging Face Spaces)
1.  Create a new Space on Hugging Face and select **Docker** as the SDK.
2.  Upload the backend files. **⚠️ IMPORTANT: Rename them as follows before uploading:**
    *   `backend/main.txt` &rarr; Rename to `main.py`
    *   `backend/Dockerfile.txt` &rarr; Rename to `Dockerfile`
    *   `backend/requirements.txt` &rarr; Keep as `requirements.txt`
3.  Go to **Settings** -> **Variables and secrets** and add the following secrets:
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_KEY`: Your Supabase **Public Anon** Key.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `FRONTEND_URL`: The URL of your Vercel Frontend
        *   *Note: Do not add a trailing slash `/`.*

### 3. Frontend Deployment (Vercel)
1.  Log in to Vercel.
2.  Add a **New Project** and import this Git repository.
3.  Configure **Build & Development Settings**:
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  Configure **Environment Variables**:
    *   Key: `VITE_API_BASE_URL`
    *   Value: `https://[YOUR-HUGGINGFACE-SPACE-NAME].hf.space` (e.g., `https://my-career-app.hf.space`)
5.  Click **Deploy**.

---

## ⚙️ Configuration & Customization

### Backend Config (`backend/main.py`)
All rate limits and model settings are now controlled centrally in the backend.
*   **`DAILY_IMAGE_LIMIT`**: Max image generations per user/day.
*   **`DAILY_CAREER_LIMIT`**: Max career assessments per user/day.
*   **`DAILY_GENERAL_QUIZ_LIMIT`**: Max "free" general assessments (anti-abuse).
*   **`DAILY_DETAILS_VIEW_LIMIT`**: Max "free" detail generations (anti-abuse).
*   **`TEXT_MODEL_NAME`**: Change the Gemini model version.
*   **`IMAGE_MODEL_NAME`**: Change the model used for visualization.

### Frontend Config (`constants.ts`)
*   **`APP_NAME`**: Change the display name of the application.
*   **`QUESTIONS`**: Modify or add new questions to the personality/aptitude quiz.
*   **`FALLBACK_LOCATIONS`**: Update the list of countries available in the onboarding dropdown.

---

<div align="center">
  <p>Built with ❤️ using Gemini 3 Preview</p>
</div>