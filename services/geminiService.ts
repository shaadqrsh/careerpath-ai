import React from 'react';
import { UserProfile, QuizAnswer, CareerRecommendation, Slide, CareerRoadmapStep, CareerDomain } from "../types";
import { MOCK_CAREERS, API_BASE_URL, SLIDESHOW_IMAGE_COUNT } from "../constants";
import { useAppStore } from './store';
import { AlertOctagon } from 'lucide-react';

const handleAuthError = () => {
    const { showModal, logout } = useAppStore.getState();
    if (useAppStore.getState().modal?.isOpen) return;

    showModal({
        icon: <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-6" />,
        title: "Session Expired",
        description: "Your session has expired. Please log in again to continue.",
        buttonText: "Okay, Log In",
        onButtonClick: () => logout(),
    });
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('access_token');
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

export const calculateRoadmapDurationYears = (roadmap: CareerRoadmapStep[]): number => {
    if (!roadmap) return 3;
    let totalYears = 0;
    roadmap.forEach(step => {
        const lowerDuration = step.duration.toLowerCase();
        if (lowerDuration.includes('year')) {
            const match = lowerDuration.match(/(\d+)/);
            if (match) totalYears += parseInt(match[0]);
        } else if (lowerDuration.includes('month')) {
            const match = lowerDuration.match(/(\d+)/);
            if (match) totalYears += parseInt(match[0]) / 12;
        }
    });
    return Math.round(totalYears) || 3; 
};

export const generateDomainSuggestion = async (answers: QuizAnswer[]): Promise<CareerDomain> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/generate-domain`, {
            method: 'POST',
            body: JSON.stringify({ quiz_answers: answers })
        });

        if (!response.ok) return 'general';
        
        const data = await response.json();
        return (data.suggested_domain as CareerDomain) || 'general';
    } catch (e) {
        console.error("Domain generation failed:", e);
        return 'general';
    }
};

export const generateCareerRecommendations = async (
  user: UserProfile, 
  answers: QuizAnswer[]
): Promise<CareerRecommendation[]> => {

  try {
    const response = await apiFetch(`${API_BASE_URL}/api/generate-career`, {
        method: 'POST',
        body: JSON.stringify({
            user_profile: user,
            quiz_answers: answers
        })
    });

    if (response.status === 429) {
        throw new Error("QUOTA_EXCEEDED");
    }

    if (!response.ok) {
        throw new Error("Backend API Failed");
    }

    const data = await response.json();
    return data.recommendations;

  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") throw error;
    
    console.error("Career Generation Error:", error);
    return MOCK_CAREERS;
  }
};

export const generateCareerDetails = async (
    user: UserProfile,
    career: CareerRecommendation
): Promise<Partial<CareerRecommendation>> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/generate-career-details`, {
            method: 'POST',
            body: JSON.stringify({
                user_profile: user,
                career_title: career.title,
                career_summary: career.summary
            })
        });

        if (!response.ok) throw new Error("Backend Detail API Failed");

        const data = await response.json();
        return {
            isPivot: data.isPivot,
            pivotAnalysis: data.pivotAnalysis,
            roadmap: data.roadmap,
            dayInLifePrompts: data.dayInLifePrompts,
            detailsLoaded: true
        };

    } catch (error) {
        console.error("Career Details Error:", error);
        throw error;
    }
}

export const generateCareerImages = async (
    careerTitle: string, 
    prompts: string[], 
    user?: UserProfile | null, 
    futureAge?: number
): Promise<(string | null)[]> => {
    
    const response = await apiFetch(`${API_BASE_URL}/api/generate-images`, {
        method: 'POST',
        body: JSON.stringify({
            career_title: careerTitle,
            prompts: prompts,
            user_context: user,
            future_age: futureAge
        })
    });

    if (response.status === 429) {
        throw new Error("QUOTA_EXCEEDED");
    }

    if (!response.ok) throw new Error("Backend Image Gen Failed");

    const data = await response.json();
    return data.images; 
}

export const generateStorySlides = async (career: CareerRecommendation, user?: UserProfile | null): Promise<Slide[]> => {
    let prompts = career.dayInLifePrompts || [];
    if (prompts.length < SLIDESHOW_IMAGE_COUNT) {
        const missingCount = SLIDESHOW_IMAGE_COUNT - prompts.length;
        const filler = [
            "Working focused on a key task in a professional environment",
            "Collaborating with colleagues in a meeting",
            "Achieving a successful outcome or milestone"
        ];
        prompts = [...prompts, ...filler.slice(0, missingCount)];
    }

    const currentImages = career.slideImages || [];
    const missingIndices: number[] = [];
    const promptsToGenerate: string[] = [];

    for (let i = 0; i < SLIDESHOW_IMAGE_COUNT; i++) {
        if (!currentImages[i] || currentImages[i] === "") { 
            missingIndices.push(i);
            promptsToGenerate.push(prompts[i]);
        }
    }

    if (missingIndices.length === 0) {
        return prompts.map((text, index) => ({
            id: index,
            text,
            imageUrl: currentImages[index] || ""
        }));
    }

    const durationYears = career.roadmap ? calculateRoadmapDurationYears(career.roadmap) : 3;
    const futureAge = user ? user.age + durationYears : 25;

    try {
        const generatedResults = await generateCareerImages(career.title, promptsToGenerate, user, futureAge);
        
        const finalImages = [...currentImages];
        
        while(finalImages.length < SLIDESHOW_IMAGE_COUNT) finalImages.push(null);

        missingIndices.forEach((originalIndex, i) => {
            finalImages[originalIndex] = generatedResults[i];
        });

        return prompts.map((text, index) => ({
            id: index,
            text,
            imageUrl: finalImages[index] || "" 
        }));

    } catch (e: any) {
        if (e.message === "QUOTA_EXCEEDED") throw e;
        
        console.error("Partial generation failed:", e);
        
        const finalImages = [...currentImages];
        while(finalImages.length < SLIDESHOW_IMAGE_COUNT) finalImages.push(null);
        
        return prompts.map((text, index) => ({
            id: index,
            text,
            imageUrl: finalImages[index] || ""
        }));
    }
};