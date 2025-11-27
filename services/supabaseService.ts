import { CareerRecommendation, UserProfile } from '../types';
import { API_BASE_URL } from '../constants';
import { useAppStore } from '../store';

const getToken = () => localStorage.getItem('access_token');
const setToken = (token: string) => localStorage.setItem('access_token', token);
const clearToken = () => localStorage.removeItem('access_token');

const handleAuthError = () => {
    const { showModal, logout } = useAppStore.getState();
    if (useAppStore.getState().modal?.isOpen) return;
    showModal({
        variant: 'danger',
        title: "Session Expired",
        description: "Your session has expired. Please log in again to continue.",
        buttonText: "Okay, Log In",
        onButtonClick: () => logout(),
    });
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        if (response.status === 401) {
             handleAuthError();
        }
        const errorBody = await response.json().catch(() => ({ detail: "Authentication Error" }));
        throw new Error(errorBody.detail || "Authentication Error");
    }

    return response;
};

const toDbProfile = (p: UserProfile) => ({
    id: p.id,
    full_name: p.fullName || '',
    gender: p.gender || '',
    age: p.age || 0,
    education_level: p.educationLevel || '',
    specialization: p.specialization || '',
    residence_country: p.residenceCountry || '',
    preferred_work_country: p.preferredWorkCountry || ''
});

const fromDbProfile = (d: any): UserProfile => {
    const limits = d.limits ? {
        dailyImageLimit: d.limits.daily_image_limit,
        dailyCareerLimit: d.limits.daily_career_limit,
        dailyGeneralQuizLimit: d.limits.daily_general_quiz_limit,
        dailyDetailsViewLimit: d.limits.daily_details_view_limit,
        slideshowImageCount: d.limits.slideshow_image_count
    } : undefined;

    return {
        id: d.id,
        fullName: d.full_name,
        gender: d.gender,
        age: d.age,
        educationLevel: d.education_level,
        specialization: d.specialization,
        residenceCountry: d.residence_country,
        preferredWorkCountry: d.preferred_work_country,
        dailyImageGenerationsCount: d.daily_image_generations_count,
        lastImageGenerationDate: d.last_image_generation_date,
        dailyCareerGenerationsCount: d.daily_career_generations_count,
        lastCareerGenerationDate: d.last_career_generation_date,
        dailyGeneralQuizCount: d.daily_general_quiz_count,
        dailyDetailsViewCount: d.daily_details_view_count,
        limits: limits
    };
};

const toDbCareer = (c: CareerRecommendation) => ({
    id: c.id,
    title: c.title,
    match_score: c.matchScore,
    summary: c.summary,
    salary_range: c.salaryRange,
    growth: c.growth,
    tags: c.tags,
    entry_barriers: c.entryBarriers,
    is_pivot: c.isPivot,
    pivot_analysis: c.pivotAnalysis,
    roadmap: c.roadmap, 
    day_in_life_prompts: c.dayInLifePrompts,
    slide_images: c.slideImages,
    skills: c.skills 
});

const fromDbCareer = (d: any): CareerRecommendation => {
    const roadmap = (d.roadmap || []).map((step: any) => ({
        title: step.title,
        description: step.description,
        localPath: step.local_path || step.localPath,
        targetPath: step.target_path || step.targetPath,
        duration: step.duration,
        challenges: step.challenges
    }));
    
    const detailsLoaded = roadmap.length > 0;

    return {
        id: d.career_uid, 
        title: d.title,
        matchScore: d.match_score,
        summary: d.summary,
        salaryRange: d.salary_range,
        growth: d.growth,
        tags: d.tags || [],
        entryBarriers: d.entry_barriers,
        isPivot: d.is_pivot,
        pivotAnalysis: d.pivot_analysis,
        roadmap: roadmap,
        dayInLifePrompts: d.day_in_life_prompts || [],
        slideImages: d.slide_images || [],
        skills: d.skills || [],
        detailsLoaded: detailsLoaded
    };
};

export interface AuthUser {
    id: string;
    email?: string;
}

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error("Login failed");
        const data = await response.json();
        setToken(data.access_token);
        return { user: data.user, session: data };
    } catch (e) {
        console.error("Sign In Error:", e);
        throw e;
    }
};

export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error("Signup failed");
        return await response.json();
    } catch (e) {
        console.error("Sign Up Error:", e);
        throw e;
    }
};

export const sendPasswordResetEmail = async (email: string) => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error("Failed to send reset email");
        return true;
    } catch (e) {
        console.error("Reset Password Error:", e);
        throw e;
    }
};

export const updateUserPassword = async (password: string) => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/auth/update-password`, {
            method: 'POST',
            body: JSON.stringify({ password })
        });
        if (!response.ok) throw new Error("Failed to update password");
        return true;
    } catch (e) {
        console.error("Update Password Error:", e);
        throw e;
    }
};

export const signOut = async () => {
    clearToken();
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
    const token = getToken();
    if (!token) return null;
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/auth/me`);
        if (!response.ok) { clearToken(); return null; }
        return await response.json();
    } catch (e) { return null; }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/profile`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`Profile fetch failed: ${response.status}`);
        const data = await response.json();
        return fromDbProfile(data);
    } catch (e) {
        console.error("Error fetching profile:", e);
        throw e;
    }
};

export const upsertUserProfile = async (profile: UserProfile) => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/profile`, {
            method: 'POST',
            body: JSON.stringify(toDbProfile(profile))
        });
        if (!response.ok) throw new Error("Failed to save profile");
    } catch (e) {
        console.error("Error saving profile:", e);
        throw e;
    }
};

export const uploadCareerImages = async (userId: string, careerUid: string, images: string[]): Promise<string[]> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/career-images`, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, career_uid: careerUid, images: images })
        });
        if (!response.ok) throw new Error("Image upload failed");
        const data = await response.json();
        return data.image_urls;
    } catch (e) {
        console.error("Image upload error:", e);
        return images.filter(img => img.startsWith('http'));
    }
};

export const getSavedCareers = async (userId: string): Promise<CareerRecommendation[]> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/saved-careers`);
        if (!response.ok) throw new Error("Failed to fetch saved careers");
        const data = await response.json();
        return data.map(fromDbCareer);
    } catch (e) {
        console.error("Error fetching saved careers:", e);
        return [];
    }
};

export const saveCareerToDb = async (userId: string, career: CareerRecommendation) => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/saved-careers`, {
            method: 'POST',
            body: JSON.stringify(toDbCareer(career))
        });
        if (!response.ok) throw new Error("Failed to save career");
    } catch (e) {
        console.error("Error saving career:", e);
        throw e;
    }
};

export const deleteCareerFromDb = async (userId: string, careerUid: string) => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/saved-careers/${careerUid}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error("Failed to delete career");
    } catch (e) {
        console.error("Error deleting career:", e);
        throw e;
    }
};