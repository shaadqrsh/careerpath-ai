import { UserProfile, QuizAnswer, CareerRecommendation, Slide, CareerRoadmapStep, CareerDomain } from "../types";
import { MOCK_CAREERS, API_BASE_URL, SLIDESHOW_IMAGE_COUNT } from "../constants";

// Helper to calculate estimated roadmap duration in years
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
    return Math.round(totalYears) || 3; // Default to 3 years if parsing fails
};

// --- BACKEND API INTEGRATION ---

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

    if (!response.ok) {
        throw new Error("Backend API Failed");
    }

    const data = await response.json();
    return data.recommendations;

  } catch (error) {
    console.error("Career Generation Error:", error);
    return MOCK_CAREERS;
  }
};

export const generateCareerImages = async (
    careerTitle: string, 
    prompts: string[], 
    user?: UserProfile | null, 
    futureAge?: number,
    imageGenerationEnabled: boolean = true
): Promise<string[]> => {
    
    // We respect the flag, but now the backend actually handles the generation
    if (!imageGenerationEnabled) {
        console.warn("Image generation disabled (client-side flag). Using Mock images.");
        return prompts.map((_, i) => `https://picsum.photos/seed/${careerTitle.replace(/\s/g,'')}${i}/1280/720`);
    }

    try {
        const token = localStorage.getItem('access_token');

        if (!token) return prompts.map((_, i) => `https://picsum.photos/seed/${careerTitle}${i}/1280/720`);

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

        if (!response.ok) throw new Error("Backend Image Gen Failed");

        const data = await response.json();
        return data.images;

    } catch (error) {
        console.warn("Image Gen Failed (Using Fallback):", error);
        return prompts.map((_, i) => `https://picsum.photos/seed/${careerTitle.replace(/\s/g,'')}-${i}/1280/720`);
    }
}

export const generateStorySlides = async (career: CareerRecommendation, user?: UserProfile | null, imageGenerationEnabled: boolean = true): Promise<Slide[]> => {
    // USE CONSTANT HERE: If prompts are missing or fewer than needed, fill them up
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

    let imageUrls: string[] = [];

    // If career already has persistent images, use them
    if (career.slideImages && career.slideImages.length > 0) {
        imageUrls = career.slideImages;
    } else {
        // Calculate age at the 'end' of the roadmap for realism
        const durationYears = calculateRoadmapDurationYears(career.roadmap);
        const futureAge = user ? user.age + durationYears : 25;

        // Generate images using Backend
        imageUrls = await generateCareerImages(career.title, prompts, user, futureAge, imageGenerationEnabled);
    }

    return prompts.map((text, index) => ({
        id: index,
        text,
        imageUrl: imageUrls[index] || `https://picsum.photos/seed/${career.id}-${index}/1280/720`
    }));
};