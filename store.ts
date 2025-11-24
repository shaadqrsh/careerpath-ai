import { create } from 'zustand';
import { AppView, UserProfile, QuizAnswer, CareerRecommendation, CareerDomain } from './types';
import { generateCareerImages, calculateRoadmapDurationYears } from './services/geminiService';
import { uploadCareerImages, saveCareerToDb, deleteCareerFromDb } from './services/supabaseService';

interface AppState {
  currentView: AppView;
  previousView: AppView | null; // Track where we came from generally
  careerOrigin: 'results' | 'saved' | null; // Specific origin for Career Detail back navigation
  user: UserProfile | null;
  theme: 'dark' | 'light';
  
  // Quiz State
  selectedDomain: CareerDomain;
  quizAnswers: QuizAnswer[];
  
  // Data State
  recommendations: CareerRecommendation[];
  selectedCareer: CareerRecommendation | null;
  savedCareers: CareerRecommendation[];
  
  isLoading: boolean;
  isSavingCareer: boolean; 
  
  // Actions
  setView: (view: AppView) => void;
  setCareerOrigin: (origin: 'results' | 'saved') => void;
  setUser: (user: UserProfile) => void;
  toggleTheme: () => void;
  setDomain: (domain: CareerDomain) => void;
  
  addQuizAnswer: (answer: QuizAnswer) => void;
  resetQuiz: () => void;
  
  setRecommendations: (recs: CareerRecommendation[]) => void;
  setSelectedCareer: (career: CareerRecommendation) => void;
  updateCareerImages: (careerId: string, images: string[]) => void;
  
  toggleSavedCareer: (career: CareerRecommendation) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: AppView.LANDING,
  previousView: null,
  careerOrigin: null,
  user: null,
  theme: 'dark', // Default to dark
  
  selectedDomain: 'general',
  quizAnswers: [],
  
  recommendations: [],
  selectedCareer: null,
  savedCareers: [], 
  
  isLoading: false,
  isSavingCareer: false,

  setView: (view) => set((state) => ({ 
    previousView: state.currentView, 
    currentView: view 
  })),
  setCareerOrigin: (origin) => set({ careerOrigin: origin }),
  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setDomain: (domain) => set({ selectedDomain: domain }),
  
  addQuizAnswer: (answer) => set((state) => {
    const filtered = state.quizAnswers.filter(a => a.questionId !== answer.questionId);
    return { quizAnswers: [...filtered, answer] };
  }),
  
  resetQuiz: () => set({ quizAnswers: [] }),
  
  setRecommendations: (recs) => set({ recommendations: recs }),
  setSelectedCareer: (career) => set({ selectedCareer: career }),
  
  // Updates the images in memory (e.g. from Slideshow generation) so they can be saved later without regen
  updateCareerImages: (careerId, images) => set((state) => {
    // Update in selectedCareer if matched
    const newSelected = state.selectedCareer?.id === careerId 
        ? { ...state.selectedCareer, slideImages: images } 
        : state.selectedCareer;

    // Update in recommendations if matched
    const newRecommendations = state.recommendations.map(c => 
        c.id === careerId ? { ...c, slideImages: images } : c
    );

    return { selectedCareer: newSelected, recommendations: newRecommendations };
  }),
  
  toggleSavedCareer: async (career) => {
    const state = get();
    const exists = state.savedCareers.find(c => c.id === career.id);

    // If removing
    if (exists) {
      const confirmDelete = window.confirm("Are you sure you want to remove this saved career? This action cannot be undone.");
      if (!confirmDelete) return; // Abort if user cancels

      set({ savedCareers: state.savedCareers.filter(c => c.id !== career.id) });
      if (state.user) {
        // This function also deletes associated images from bucket
        await deleteCareerFromDb(state.user.id, career.id);
      }
      return;
    }

    // If saving (Adding)
    set({ isSavingCareer: true });
    
    try {
        let careerToSave = { ...career };
        // Check if we have cached images in state (from Slideshow view) even if passed career didn't have them
        if (state.selectedCareer?.id === career.id && state.selectedCareer.slideImages?.length) {
            careerToSave.slideImages = state.selectedCareer.slideImages;
        }

        let imagesToProcess: string[] = [];

        // 1. Check if images exist. 
        if (careerToSave.slideImages && careerToSave.slideImages.length > 0) {
            // Use existing images (Data URI or URL)
            imagesToProcess = careerToSave.slideImages;
        } else {
            // Generate new if absolutely nothing exists
            const prompts = careerToSave.dayInLifePrompts || ["Working at desk", "Meeting colleagues", "Achieving success"];
            
            // Calculate future age for personalized images
            const durationYears = calculateRoadmapDurationYears(careerToSave.roadmap);
            const futureAge = state.user ? state.user.age + durationYears : 25;

            // Generate personalized images (With timeout protection from service)
            const base64Images = await generateCareerImages(careerToSave.title, prompts, state.user, futureAge);
            imagesToProcess = base64Images.map(b64 => b64.startsWith('http') ? b64 : `data:image/png;base64,${b64}`);
        }
            
        // 2. Upload/Process Images via Supabase Service
        // This service now smartly handles skipping already-hosted URLs
        let finalImageUrls = imagesToProcess;
        if (state.user) {
            finalImageUrls = await uploadCareerImages(state.user.id, careerToSave.id, imagesToProcess);
        }

        careerToSave.slideImages = finalImageUrls;

        // 3. Update Local State
        set((s) => {
            const isCurrentlySelected = s.selectedCareer?.id === careerToSave.id;
            return { 
                savedCareers: [...s.savedCareers, careerToSave],
                // IMPORTANT: Update selectedCareer to ensure it has the final URLs (converted from Base64)
                selectedCareer: isCurrentlySelected ? careerToSave : s.selectedCareer
            };
        });

        // 4. Save Record to DB
        if (state.user) {
            await saveCareerToDb(state.user.id, careerToSave);
        }

    } catch (e) {
        console.error("Error saving career:", e);
        alert("There was an error saving the career. Please try again.");
    } finally {
        set({ isSavingCareer: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));