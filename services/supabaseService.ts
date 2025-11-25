import { CareerRecommendation, UserProfile } from '../types';
import { API_BASE_URL } from '../constants';

const getToken = () => localStorage.getItem('access_token');
const setToken = (token: string) => localStorage.setItem('access_token', token);
const clearToken = () => localStorage.removeItem('access_token');

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

const fromDbProfile = (d: any): UserProfile => ({
    id: d.id,
    fullName: d.full_name,
    gender: d.gender,
    age: d.age,
    educationLevel: d.education_level,
    specialization: d.specialization,
    residenceCountry: d.residence_country,
    preferredWorkCountry: d.preferred_work_country
});

const toDbCareer = (c: CareerRecommendation) => ({
    id: c.id,
    title: c.title,
    match_score: c.matchScore,
    summary: c.summary,
    salary_range: c.salaryRange,
    growth: c.growth,
    tags: c.tags,
    is_pivot: c.isPivot,
    pivot_analysis: c.pivotAnalysis,
    roadmap: c.roadmap, 
    day_in_life_prompts: c.dayInLifePrompts,
    slide_images: c.slideImages
});

const fromDbCareer = (d: any): CareerRecommendation => ({
    id: d.id,
    title: d.title,
    matchScore: d.match_score,
    summary: d.summary,
    salaryRange: d.salary_range,
    growth: d.growth,
    tags: d.tags || [],
    isPivot: d.is_pivot,
    pivotAnalysis: d.pivot_analysis,
    roadmap: d.roadmap || [],
    dayInLifePrompts: d.day_in_life_prompts || [],
    slideImages: d.slide_images || []
});

export interface AuthUser {
    id: string;
    email?: string;
}

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Login failed");
        }
        
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
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Signup failed");
        }
        
        return await response.json();
    } catch (e) {
        console.error("Sign Up Error:", e);
        throw e;
    }
};

export const sendPasswordResetEmail = async (email: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
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
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            clearToken();
            return null;
        }

        const user = await response.json();
        return user;
    } catch (e) {
        return null;
    }
};

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) throw new Error("Not Authenticated");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const supabase = null; 

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/profile`, { headers });
        
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        return fromDbProfile(data);
    } catch (e) {
        console.error("Error fetching profile:", e);
        return null;
    }
};

export const upsertUserProfile = async (profile: UserProfile) => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: 'POST',
            headers,
            body: JSON.stringify(toDbProfile(profile))
        });
        
        if (!response.ok) throw new Error("Failed to save profile");
    } catch (e) {
        console.error("Error saving profile:", e);
        throw e;
    }
};

export const uploadCareerImages = async (
  userId: string, 
  careerUid: string, 
  images: string[]
): Promise<string[]> => {
    try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`${API_BASE_URL}/api/career-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                career_uid: careerUid,
                images: images
            })
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
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/saved-careers`, { headers });
        
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
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/saved-careers`, {
            method: 'POST',
            headers,
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
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/saved-careers/${careerUid}`, {
            method: 'DELETE',
            headers
        });
        
        if (!response.ok) throw new Error("Failed to delete career");
    } catch (e) {
        console.error("Error deleting career:", e);
        throw e;
    }
};
