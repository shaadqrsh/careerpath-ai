
import { CareerRecommendation, UserProfile } from '../types';
import { API_BASE_URL } from '../constants';

// --- CLIENT AUTH CONFIG ---
// Keys are NO LONGER needed in frontend. Everything goes through the backend proxy.

// Helper to get the JWT token
const getToken = () => localStorage.getItem('access_token');
const setToken = (token: string) => localStorage.setItem('access_token', token);
const clearToken = () => localStorage.removeItem('access_token');

// --- AUTHENTICATION (Via Backend API) ---

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
            clearToken(); // Token invalid
            return null;
        }

        const user = await response.json();
        return user;
    } catch (e) {
        return null;
    }
};

// --- DATA HELPERS (Via Backend API) ---

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) throw new Error("Not Authenticated");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const supabase = null; // Removed client usage entirely

// --- PROFILE ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/profile`, { headers });
        
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Failed to fetch profile");

        return await response.json();
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
            body: JSON.stringify(profile)
        });
        
        if (!response.ok) throw new Error("Failed to save profile");
    } catch (e) {
        console.error("Error saving profile:", e);
        throw e;
    }
};

// --- IMAGES & DB ---

export const uploadCareerImages = async (
  userId: string, 
  careerUid: string, 
  images: string[]
): Promise<string[]> => {
    try {
        if (!careerUid) throw new Error("Missing Career UID");

        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/upload-images`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ career_uid: careerUid, images })
        });
        
        if (!response.ok) throw new Error("Upload Failed");
        const data = await response.json();
        return data.urls;
    } catch (e) {
        console.warn("Backend upload failed, returning originals", e);
        return images;
    }
};

export const deleteCareerImages = async (userId: string, careerUid: string) => {
     // Handled by backend deleteCareerFromDb
};

export const getSavedCareers = async (userId: string): Promise<CareerRecommendation[]> => {
    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/saved-careers`, { headers });
        if (!response.ok) throw new Error("Failed to fetch saved careers");
        
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch saved careers", err);
        return [];
    }
};

export const saveCareerToDb = async (userId: string, career: CareerRecommendation) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/saved-careers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(career)
    });
    if (!response.ok) throw new Error("Failed to save career");
  } catch (err) {
    console.error("Failed to save career to DB", err);
    throw err; 
  }
};

export const deleteCareerFromDb = async (userId: string, careerId: string) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/saved-careers/${careerId}`, {
        method: 'DELETE',
        headers
    });
    if (!response.ok) throw new Error("Failed to delete career");
  } catch (err) {
    console.error("Failed to delete career from DB", err);
    throw err;
  }
};
