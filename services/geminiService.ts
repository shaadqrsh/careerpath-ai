
import { UserProfile, QuizAnswer, CareerRecommendation, Slide, CareerRoadmapStep, CareerDomain } from "../types";
import { MOCK_CAREERS, API_BASE_URL, SLIDESHOW_IMAGE_COUNT, DAILY_CAREER_LIMIT, DAILY_IMAGE_LIMIT } from "../constants";

export const calculateRoadmapDurationYears = (roadmap: CareerRoadmapStep[]): number => {
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
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`${API_BASE_URL}/api/generate-domain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/api/generate-career`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
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

export const generateCareerImages = async (
    careerTitle: string, 
    prompts: string[], 
    user?: UserProfile | null, 
    futureAge?: number
): Promise<(string | null)[]> => {
    
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}/api/generate-images`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
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

    const durationYears = calculateRoadmapDurationYears(career.roadmap);
    const futureAge = user ? user.age + durationYears : 25;

    try {
        const generatedResults = await generateCareerImages(career.title, promptsToGenerate, user, futureAge);
        
        const finalImages = [...currentImages];
        while(finalImages.length < SLIDESHOW_IMAGE_COUNT) finalImages.push(null);

        missingIndices.forEach((targetIndex, i) => {
            finalImages[targetIndex] = generatedResults[i];
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
