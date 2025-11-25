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
*   **Backend**: Python FastAPI (Handles Auth Proxy, Database Logic, and AI Generation).
*   **Database**: Supabase (PostgreSQL + Auth).
*   **AI Engine**: Google Gemini 2.5 Flash (Reasoning & Visualization).

---

## 🚀 Deployment Instructions

Follow these steps in order to deploy the application to the cloud.

### 1. Database Setup (Supabase)
1.  Create a new **Supabase Project**.
2.  Navigate to the **SQL Editor** in your Supabase dashboard.
3.  Open the file `database.txt` from this repository, copy the content, and run it in the SQL Editor.
4.  Go to **Storage**, and create a public bucket named `career_slideshows`.
5.  **Email Templates**: Go to *Authentication -> Email Templates*. Use the content from `email_templates.txt` for "Confirm Signup" and "Reset Password" to ensure consistent styling.

### 2. Backend Deployment (Hugging Face Spaces)
1.  Create a new Space on Hugging Face and select **Docker** as the SDK.
2.  Upload the backend files. **⚠️ IMPORTANT: Rename them as follows before uploading:**
    *   `backend/main.txt` &rarr; Rename to `main.py`
    *   `backend/Dockerfile.txt` &rarr; Rename to `Dockerfile`
    *   `backend/requirements.txt` &rarr; Keep as `requirements.txt`
3.  Go to **Settings** -> **Variables and secrets** and add the following secrets:
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_KEY`: Your Supabase **Service Role** Key.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `FRONTEND_URL`: The URL of your Vercel Frontend (e.g., `https://my-career-app.vercel.app`).
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

You can customize the application logic, branding, and limits by editing the following files.

### Frontend Config (`constants.ts`)
Located in the root (or `src/` if strictly structured) directory.
*   **`APP_NAME`**: Change the display name of the application.
*   **`DAILY_IMAGE_LIMIT` / `DAILY_CAREER_LIMIT`**: Set the visual UI limits for the user.
*   **`QUESTIONS`**: Modify or add new questions to the personality/aptitude quiz.
*   **`FALLBACK_LOCATIONS`**: Update the list of countries available in the onboarding dropdown.

### Backend Config (`backend/main.py`)
Located in the backend directory.
*   **`TEXT_MODEL_NAME`**: Change the Gemini model version (e.g., `gemini-1.5-flash`, `gemini-1.5-pro`).
*   **`IMAGE_MODEL_NAME`**: Change the model used for visualization.
*   **`DAILY_..._LIMIT`**: Enforce server-side hard limits on generation to protect your API quota.
*   **`CAREERS_PER_GENERATION`**: Control how many career paths are generated per request (Default: 5).

---

<div align="center">
  <p>Built with ❤️ using Gemini 3 Preview</p>
</div>