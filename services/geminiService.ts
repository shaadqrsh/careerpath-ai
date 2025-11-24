
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, QuizAnswer, CareerRecommendation, Slide, CareerRoadmapStep } from "../types";
import { MOCK_CAREERS, AI_CONFIG } from "../constants";

// --- API KEY MANAGEMENT ---

// ADD WHEN DEPLOY: Replace this function to strictly use process.env.API_KEY
const getGeminiKey = () => {
    // Check Local Storage (Dev mode)
    const localKey = localStorage.getItem('career_path_gemini_key');
    // Fallback to Environment Variable
    return localKey || process.env.API_KEY || '';
};

// ADD WHEN DEPLOY: Remove this helper function
export const saveGeminiKey = (key: string) => {
    localStorage.setItem('career_path_gemini_key', key);
};

const apiKey = getGeminiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

export const generateCareerRecommendations = async (
  user: UserProfile, 
  answers: QuizAnswer[]
): Promise<CareerRecommendation[]> => {

  if (!ai) {
    console.warn("No API Key found. Returning mock data.");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    return MOCK_CAREERS;
  }

  // Logic for location context
  const isUndecidedCountry = user.preferredWorkCountry === 'Undecided';
  // If undecided, default to Residence as primary, with USA as secondary option in prompt context
  const targetCountries = isUndecidedCountry ? [user.residenceCountry, 'USA'] : [user.preferredWorkCountry];
  const targetCountryString = targetCountries.join(' or ');
  
  // If undecided, we treat Residence as the primary default, or USA if they really want global options
  const explicitTarget = isUndecidedCountry ? user.residenceCountry : user.preferredWorkCountry;
  
  const prompt = `
    Act as an expert Career Counselor. 
    
    User Profile: 
    - Name: ${user.fullName}
    - Gender: ${user.gender}
    - Age: ${user.age}
    - Current Education Level: ${user.educationLevel} 
    - Current Specialization/Major: ${user.specialization}
    - Current Residence: ${user.residenceCountry}
    - Preferred Work Location: ${targetCountryString}

    Quiz Answers: ${JSON.stringify(answers)}.

    **CRITICAL INSTRUCTION - LANGUAGE:**
    - THE OUTPUT MUST BE STRICTLY IN ENGLISH.
    - DO NOT translate the output into the language of the residence or target country.
    - Even if the location is Germany, France, Japan, or China, ALL titles, descriptions, degrees, and roadmap steps MUST be written in ENGLISH.

    Task:
    1. Recommend 5 distinct career paths that are highly viable and available in ${targetCountryString}.
    
    2. **CRITICAL - ELIGIBILITY & PIVOT CHECK**:
       - Compare the User's Current Specialization (${user.specialization}) with the recommended Career.
       - If the career requires a strict background the user DOES NOT have (e.g. Arts student -> Quantum Physicist), **DO NOT RECOMMEND IT** unless there is a feasible bridge path (like UX Design for Arts students entering Tech).
       - Classify each recommendation:
         - **Natural Progression**: Matches their current field (e.g. Biology -> Doctor).
         - **Pivot**: Requires switching domains (e.g. Commerce -> Software Engineering).
       - Provide a 'pivotAnalysis' string explaining this relationship. 
         - If it's a pivot, explicitly mention if it's a "Major Pivot" or "Feasible Pivot" and why they are eligible (e.g., "While this is a tech role, your background in Design makes you eligible for UX without a CompSci degree").
         - If it's a natural progression, confirm they are "On the right track".

    3. **ROADMAP INSTRUCTION**: 
       - Start the roadmap *AFTER* their Current Education Level (${user.educationLevel}). 
       - If they need a bridge course (for a Pivot), make that the first step.
       - **DO NOT** suggest steps they have already completed.

    4. **ROADMAP LOCATIONS**:
       - For 'localPath': Provide specific institutions/degrees in ${user.residenceCountry}.
       - For 'targetPath': Provide specific institutions/degrees in ${explicitTarget}. 

    Return a JSON object with a 'recommendations' array.
    Each recommendation must have:
    - id: string (unique)
    - title: string
    - matchScore: number (0-100 based on fit)
    - summary: string (2 sentences)
    - salaryRange: string (Localized to ${targetCountryString} currency but value in English)
    - growth: string (Market trend in ${targetCountryString})
    - tags: string array (max 3)
    - isPivot: boolean (true if it's a domain switch)
    - pivotAnalysis: string (1-2 sentences explaining the link between their current major and this career)
    - roadmap: array of objects (3 steps).
      - title: string
      - description: string (General goal of this step)
      - localPath: string (Actionable step in ${user.residenceCountry})
      - targetPath: string (Actionable step in ${explicitTarget})
      - duration: string
    - dayInLifePrompts: string array (3 simple sentences describing visual scenes of the job, keeping gender in mind for the protagonist)

    REMEMBER: OUTPUT MUST BE 100% ENGLISH.
  `;

  try {
    const response = await ai.models.generateContent({
        model: AI_CONFIG.TEXT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recommendations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                matchScore: { type: Type.NUMBER },
                                summary: { type: Type.STRING },
                                salaryRange: { type: Type.STRING },
                                growth: { type: Type.STRING },
                                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                isPivot: { type: Type.BOOLEAN },
                                pivotAnalysis: { type: Type.STRING },
                                roadmap: { 
                                    type: Type.ARRAY, 
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            localPath: { type: Type.STRING },
                                            targetPath: { type: Type.STRING },
                                            duration: { type: Type.STRING }
                                        }
                                    }
                                },
                                dayInLifePrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    }
                }
            }
        }
    });
    
    const responseText = response.text;
    if (!responseText) {
        throw new Error("No response text generated");
    }

    const data = JSON.parse(responseText);
    return data.recommendations;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return MOCK_CAREERS;
  }
};

// Generates an image using Gemini
const generateImage = async (prompt: string, fallbackId: string): Promise<string> => {
    if (!ai) return `https://picsum.photos/seed/${fallbackId}/1280/720`;

    try {
        const response = await ai.models.generateContent({
            model: AI_CONFIG.IMAGE_MODEL,
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                // imageConfig is supported by gemini-3-pro-image-preview and gemini-2.5-flash-image
                // But keeping it minimal for compatibility
            }
        });

        // Iterate parts to find the image
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image data found in response");

    } catch (error) {
        console.warn("Gemini Image Gen Failed (Using Fallback):", error);
        return `https://picsum.photos/seed/${fallbackId}/1280/720`;
    }
}

export const generateCareerImages = async (
    careerTitle: string, 
    prompts: string[], 
    user?: UserProfile | null, 
    futureAge?: number,
    imageGenerationEnabled: boolean = true
): Promise<string[]> => {
    
    // Explicitly check the debug flag.
    if (!imageGenerationEnabled) {
        console.warn("Image generation disabled. Using Mock images.");
        return prompts.map((_, i) => `https://picsum.photos/seed/${careerTitle.replace(/\s/g,'')}${i}/1280/720`);
    }

    const subjectDescription = user 
        ? `a ${futureAge || user.age + 5} year old ${user.gender || 'professional'} from ${user.residenceCountry || 'city'}` 
        : `a professional`;

    // Process strictly in parallel
    const imagePromises = prompts.map(async (sceneDescription, i) => {
        // Construct a prompt optimized for Gemini
        const imagePrompt = `Generate a photorealistic cinematic image of ${subjectDescription} working as a ${careerTitle}, ${sceneDescription}. High resolution, 8k, professional lighting.`;
        // Fallback ID to ensure unique picsum image if it fails
        const fallbackId = `${careerTitle.replace(/\s/g,'')}-${i}-${Date.now()}`;
        return generateImage(imagePrompt, fallbackId);
    });

    const results = await Promise.all(imagePromises);
    return results;
}

export const generateStorySlides = async (career: CareerRecommendation, user?: UserProfile | null, imageGenerationEnabled: boolean = true): Promise<Slide[]> => {
    const prompts = career.dayInLifePrompts || [
        "Working focused on a key task in a professional environment",
        "Collaborating with colleagues in a meeting",
        "Achieving a successful outcome or milestone"
    ];

    let imageUrls: string[] = [];

    // If career already has persistent images, use them
    if (career.slideImages && career.slideImages.length > 0) {
        imageUrls = career.slideImages;
    } else {
        // Calculate age at the 'end' of the roadmap for realism
        const durationYears = calculateRoadmapDurationYears(career.roadmap);
        const futureAge = user ? user.age + durationYears : 25;

        // Generate images using Gemini
        imageUrls = await generateCareerImages(career.title, prompts, user, futureAge, imageGenerationEnabled);
    }

    return prompts.map((text, index) => ({
        id: index,
        text,
        imageUrl: imageUrls[index]
    }));
};
