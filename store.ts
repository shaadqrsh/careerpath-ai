
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
  
  // Settings
  debugImageGenerationEnabled: boolean; // Flag to enable/disable AI image gen for debugging

  // Quiz State
  selectedDomain: CareerDomain;
  quizAnswers: QuizAnswer[];
  
  // Data State
  recommendations: CareerRecommendation[];
  selectedCareer: CareerRecommendation | null;
  savedCareers: CareerRecommendation[];
  hasViewedSavedPaths: boolean; // To manage notification badge
  
  isLoading: boolean;
  isSavingCareer: boolean; 
  
  // Delete Confirmation State
  pendingDeleteCareer: CareerRecommendation | null;

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
  confirmDeleteCareer: () => Promise<void>; // Executes the delete
  cancelDeleteCareer: () => void; // Clears the modal
  
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: AppView.LANDING,
  previousView: null,
  careerOrigin: null,
  user: null,
  theme: 'dark', // Default to dark
  
  debugImageGenerationEnabled: localStorage.getItem('debug_image_gen') !== 'false', // Default true unless set to false

  selectedDomain: 'general',
  quizAnswers: [],
  
  recommendations: [],
  selectedCareer: null,
  savedCareers: [], 
  hasViewedSavedPaths: false,
  
  isLoading: false,
  isSavingCareer: false,
  
  pendingDeleteCareer: null,

  setView: (view) => {
    // SCROLL RESET ON VIEW CHANGE
    window.scrollTo(0, 0);
    
    // Badge Logic: If visiting saved paths, mark as viewed
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
  
  cancelDeleteCareer: () => set({ pendingDeleteCareer: null }),

  confirmDeleteCareer: async () => {
      const state = get();
      const career = state.pendingDeleteCareer;
      
      if (!career) return;

      // Optimistic delete
      const previousSaved = state.savedCareers;
      
      // If we are currently viewing the career we are deleting, redirect back to the list
      if (state.currentView === AppView.CAREER_DETAIL && state.selectedCareer?.id === career.id) {
          if (state.careerOrigin === 'saved') {
               set({ currentView: AppView.SAVED_PATHS });
          }
      }

      set({ 
          savedCareers: state.savedCareers.filter(c => c.id !== career.id),
          pendingDeleteCareer: null // Close modal
      });
      
      if (state.user) {
        try {
            console.log(`Deleting career from DB: user=${state.user.id}, career=${career.id}`);
            // This function uses matches using 'career_uid' which corresponds to career.id
            await deleteCareerFromDb(state.user.id, career.id);
        } catch (e) {
            console.error("Error deleting from DB, reverting state", e);
            // Revert state if DB delete fails
            set({ savedCareers: previousSaved }); 
            alert("Failed to delete career. Please try again.");
        }
      }
  },

  toggleSavedCareer: async (career) => {
    const state = get();
    
    // Compare IDs strictly
    const exists = state.savedCareers.find(c => c.id === career.id);

    // If removing -> Trigger Modal
    if (exists) {
      set({ pendingDeleteCareer: career });
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

        // --- ROBUST IMAGE HANDLING ---
        // We isolate this in a try/catch so if image generation fails (API error, AdBlocker),
        // we STILL proceed to save the career with fallback images.
        try {
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

                if (state.debugImageGenerationEnabled) {
                    const generatedImages = await generateCareerImages(careerToSave.title, prompts, state.user, futureAge);
                    imagesToProcess = generatedImages;
                } else {
                    console.warn("Image generation disabled by debug flag. Using fallbacks.");
                    imagesToProcess = prompts.map((_, i) => `https://picsum.photos/seed/${career.id}${i}/1280/720`);
                }
            }
            
            // 2. Upload/Process Images via Supabase Service
            // This service smartly handles skipping already-hosted URLs.
            let finalImageUrls = imagesToProcess;
            if (state.user && imagesToProcess.length > 0) {
                finalImageUrls = await uploadCareerImages(state.user.id, careerToSave.id, imagesToProcess);
            }

            careerToSave.slideImages = finalImageUrls;

        } catch (imgError) {
            console.warn("Image processing failed during save, falling back to mock images to allow save to proceed:", imgError);
            // Fallback so the career still has 'something'
            if (!careerToSave.slideImages || careerToSave.slideImages.length === 0) {
                 careerToSave.slideImages = [
                    `https://picsum.photos/seed/${career.id}-1/1280/720`,
                    `https://picsum.photos/seed/${career.id}-2/1280/720`,
                    `https://picsum.photos/seed/${career.id}-3/1280/720`
                 ];
            }
        }

        // 3. Update Local State (Immediate UI Feedback)
        set((s) => {
            const isCurrentlySelected = s.selectedCareer?.id === careerToSave.id;
            return { 
                savedCareers: [...s.savedCareers, careerToSave],
                // Update selectedCareer to ensure it has the final URLs (converted from Base64)
                selectedCareer: isCurrentlySelected ? careerToSave : s.selectedCareer,
                hasViewedSavedPaths: false // Reset badge
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
        // ALWAYS ensure we turn off the loading spinner
        set({ isSavingCareer: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
