import { create } from 'zustand';
import { AppView, UserProfile, QuizAnswer, CareerRecommendation, CareerDomain } from './types';
import { generateCareerImages, calculateRoadmapDurationYears } from './services/geminiService';
import { uploadCareerImages, saveCareerToDb, deleteCareerFromDb } from './services/supabaseService';

interface AppState {
  currentView: AppView;
  previousView: AppView | null; 
  careerOrigin: 'results' | 'saved' | null; 
  user: UserProfile | null;
  theme: 'dark' | 'light';
  
  // Settings
  debugImageGenerationEnabled: boolean; 

  // Quiz State
  selectedDomain: CareerDomain;
  quizAnswers: QuizAnswer[];
  
  // Data State
  recommendations: CareerRecommendation[];
  selectedCareer: CareerRecommendation | null;
  savedCareers: CareerRecommendation[];
  hasViewedSavedPaths: boolean; 
  
  isLoading: boolean;
  isSavingCareer: boolean; 
  
  // Modals
  pendingDeleteCareer: CareerRecommendation | null;
  showPasswordResetModal: boolean;

  // Actions
  setView: (view: AppView) => void;
  setCareerOrigin: (origin: 'results' | 'saved') => void;
  setUser: (user: UserProfile) => void;
  toggleTheme: () => void;
  setDomain: (domain: CareerDomain) => void;
  setDebugImageGeneration: (enabled: boolean) => void;
  
  addQuizAnswer: (answer: QuizAnswer) => void;
  resetQuiz: () => void;
  
  setRecommendations: (recs: CareerRecommendation[]) => void;
  setSelectedCareer: (career: CareerRecommendation) => void;
  setSavedCareers: (careers: CareerRecommendation[]) => void;
  updateCareerImages: (careerId: string, images: string[]) => void;
  
  toggleSavedCareer: (career: CareerRecommendation) => Promise<void>;
  confirmDeleteCareer: () => Promise<void>; 
  cancelDeleteCareer: () => void;
  
  setShowPasswordResetModal: (show: boolean) => void;
  
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: AppView.LANDING,
  previousView: null,
  careerOrigin: null,
  user: null,
  theme: 'dark', 
  
  debugImageGenerationEnabled: localStorage.getItem('debug_image_gen') !== 'false',

  selectedDomain: 'general',
  quizAnswers: [],
  
  recommendations: [],
  selectedCareer: null,
  savedCareers: [], 
  hasViewedSavedPaths: false,
  
  isLoading: false,
  isSavingCareer: false,
  
  pendingDeleteCareer: null,
  showPasswordResetModal: false,

  setView: (view) => {
    window.scrollTo(0, 0);
    if (view === AppView.SAVED_PATHS) {
        set({ hasViewedSavedPaths: true });
    }
    set((state) => ({ 
      previousView: state.currentView, 
      currentView: view 
    }));
  },
  setCareerOrigin: (origin) => set({ careerOrigin: origin }),
  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setDomain: (domain) => set({ selectedDomain: domain }),
  
  setDebugImageGeneration: (enabled) => {
      localStorage.setItem('debug_image_gen', enabled.toString());
      set({ debugImageGenerationEnabled: enabled });
  },
  
  addQuizAnswer: (answer) => set((state) => {
    const filtered = state.quizAnswers.filter(a => a.questionId !== answer.questionId);
    return { quizAnswers: [...filtered, answer] };
  }),
  
  resetQuiz: () => set({ quizAnswers: [] }),
  
  setRecommendations: (recs) => set({ recommendations: recs }),
  setSelectedCareer: (career) => set({ selectedCareer: career }),
  setSavedCareers: (careers) => set({ savedCareers: careers }),
  
  updateCareerImages: (careerId, images) => set((state) => {
    const newSelected = state.selectedCareer?.id === careerId 
        ? { ...state.selectedCareer, slideImages: images } 
        : state.selectedCareer;

    const newRecommendations = state.recommendations.map(c => 
        c.id === careerId ? { ...c, slideImages: images } : c
    );

    return { selectedCareer: newSelected, recommendations: newRecommendations };
  }),
  
  cancelDeleteCareer: () => set({ pendingDeleteCareer: null }),

  confirmDeleteCareer: async () => {
      const state = get();
      const career = state.pendingDeleteCareer;
      
      if (!career) return;
      if (!state.user) return;

      // NOTE: We do NOT update state immediately. We wait for DB success.
      
      try {
        await deleteCareerFromDb(state.user.id, career.id);
        
        // Success! Now update UI
        set({ 
            savedCareers: state.savedCareers.filter(c => c.id !== career.id),
            pendingDeleteCareer: null 
        });

        // Redirect if we are currently looking at the deleted career
        if (state.currentView === AppView.CAREER_DETAIL && state.selectedCareer?.id === career.id) {
            if (state.careerOrigin === 'saved') {
                 set({ currentView: AppView.SAVED_PATHS });
            }
        }
      } catch (e) {
        console.error("Error deleting from DB", e);
        alert("Failed to delete career. Please try again.");
        set({ pendingDeleteCareer: null });
      }
  },

  toggleSavedCareer: async (career) => {
    const state = get();
    const exists = state.savedCareers.find(c => c.id === career.id);

    // If it exists, we open the delete modal (handled above)
    if (exists) {
      set({ pendingDeleteCareer: career });
      return;
    }

    // Saving Process
    set({ isSavingCareer: true });
    
    try {
        let careerToSave = { ...career };
        
        // 1. Prepare Images
        if (state.selectedCareer?.id === career.id && state.selectedCareer.slideImages?.length) {
            careerToSave.slideImages = state.selectedCareer.slideImages;
        }

        try {
            let imagesToProcess: string[] = [];

            if (careerToSave.slideImages && careerToSave.slideImages.length > 0) {
                imagesToProcess = careerToSave.slideImages;
            } else {
                const prompts = careerToSave.dayInLifePrompts || ["Working at desk", "Meeting colleagues", "Achieving success"];
                const durationYears = calculateRoadmapDurationYears(careerToSave.roadmap);
                const futureAge = state.user ? state.user.age + durationYears : 25;

                if (state.debugImageGenerationEnabled) {
                    const generatedImages = await generateCareerImages(careerToSave.title, prompts, state.user, futureAge);
                    imagesToProcess = generatedImages;
                } else {
                    imagesToProcess = prompts.map((_, i) => `https://picsum.photos/seed/${career.id}${i}/1280/720`);
                }
            }
            
            let finalImageUrls = imagesToProcess;
            if (state.user && imagesToProcess.length > 0) {
                finalImageUrls = await uploadCareerImages(state.user.id, careerToSave.id, imagesToProcess);
            }

            careerToSave.slideImages = finalImageUrls;

        } catch (imgError) {
            console.warn("Image processing failed during save, falling back to mock images:", imgError);
            if (!careerToSave.slideImages || careerToSave.slideImages.length === 0) {
                 careerToSave.slideImages = [
                    `https://picsum.photos/seed/${career.id}-1/1280/720`,
                    `https://picsum.photos/seed/${career.id}-2/1280/720`,
                    `https://picsum.photos/seed/${career.id}-3/1280/720`
                 ];
            }
        }

        // 2. Save Record to DB FIRST
        if (state.user) {
            await saveCareerToDb(state.user.id, careerToSave);
        }

        // 3. Update Local State (Only after DB success)
        set((s) => {
            const isCurrentlySelected = s.selectedCareer?.id === careerToSave.id;
            return { 
                savedCareers: [...s.savedCareers, careerToSave],
                selectedCareer: isCurrentlySelected ? careerToSave : s.selectedCareer,
                hasViewedSavedPaths: false 
            };
        });

    } catch (e) {
        console.error("Error saving career:", e);
        alert("There was an error saving the career. Please try again.");
    } finally {
        set({ isSavingCareer: false });
    }
  },

  setShowPasswordResetModal: (show) => set({ showPasswordResetModal: show }),

  setLoading: (loading) => set({ isLoading: loading }),
}));