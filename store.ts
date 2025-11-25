
import { create } from 'zustand';
import { AppView, UserProfile, QuizAnswer, CareerRecommendation, CareerDomain } from './types';
import { saveCareerToDb, deleteCareerFromDb } from './services/supabaseService';

interface AppState {
  currentView: AppView;
  previousView: AppView | null; 
  careerOrigin: 'results' | 'saved' | null; 
  user: UserProfile | null;
  theme: 'dark' | 'light';
  
  debugImageGenerationEnabled: boolean; 

  selectedDomain: CareerDomain;
  quizAnswers: QuizAnswer[];
  
  recommendations: CareerRecommendation[];
  selectedCareer: CareerRecommendation | null;
  savedCareers: CareerRecommendation[];
  hasViewedSavedPaths: boolean; 
  
  isLoading: boolean;
  isSavingCareer: boolean;
  isDeletingCareer: boolean;
  
  pendingDeleteCareer: CareerRecommendation | null;
  showPasswordResetModal: boolean;

  toast: { show: boolean; message: string };

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
  updateCareerImages: (careerId: string, images: (string | null)[]) => void;
  
  toggleSavedCareer: (career: CareerRecommendation) => Promise<void>;
  confirmDeleteCareer: () => Promise<void>; 
  cancelDeleteCareer: () => void;
  
  setShowPasswordResetModal: (show: boolean) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  
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
  isDeletingCareer: false,
  
  pendingDeleteCareer: null,
  showPasswordResetModal: false,

  toast: { show: false, message: '' },

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
    // Only update if images actually changed
    const newSelected = state.selectedCareer?.id === careerId 
        ? { ...state.selectedCareer, slideImages: images } 
        : state.selectedCareer;

    const newRecommendations = state.recommendations.map(c => 
        c.id === careerId ? { ...c, slideImages: images } : c
    );
    
    // Also update saved careers if exists there
    const newSaved = state.savedCareers.map(c => 
        c.id === careerId ? { ...c, slideImages: images } : c
    );

    return { 
        selectedCareer: newSelected, 
        recommendations: newRecommendations,
        savedCareers: newSaved
    };
  }),
  
  cancelDeleteCareer: () => set({ pendingDeleteCareer: null }),

  showToast: (message) => {
      set({ toast: { show: true, message } });
      setTimeout(() => {
          set({ toast: { show: false, message: '' } });
      }, 3000);
  },

  hideToast: () => set({ toast: { show: false, message: '' } }),

  confirmDeleteCareer: async () => {
      const state = get();
      const career = state.pendingDeleteCareer;
      
      if (!career) return;
      if (!state.user) return;
      
      set({ isDeletingCareer: true });

      try {
        await deleteCareerFromDb(state.user.id, career.id);
        
        // Remove from local saved list
        const newSaved = state.savedCareers.filter(c => c.id !== career.id);
        
        // If the selected career is the one being deleted, we need to update its state to reflect it's not saved anymore
        // BUT we also need to clear its images as per requirements
        const cleanedCareer = { ...career, slideImages: [] };
        
        let newSelected = state.selectedCareer;
        if (state.selectedCareer?.id === career.id) {
             newSelected = cleanedCareer;
        }

        // Also clean it in recommendations
        const newRecommendations = state.recommendations.map(c => 
             c.id === career.id ? cleanedCareer : c
        );

        set({ 
            savedCareers: newSaved,
            selectedCareer: newSelected,
            recommendations: newRecommendations,
            pendingDeleteCareer: null 
        });

        state.showToast("Career deleted successfully");

        // Navigate back if on detail view derived from saved paths
        if (state.currentView === AppView.CAREER_DETAIL && state.selectedCareer?.id === career.id) {
            if (state.careerOrigin === 'saved') {
                 set({ currentView: AppView.SAVED_PATHS });
            }
        }
      } catch (e) {
        console.error("Error deleting from DB", e);
        alert("Failed to delete career. Please try again.");
        set({ pendingDeleteCareer: null });
      } finally {
        set({ isDeletingCareer: false });
      }
  },

  toggleSavedCareer: async (career) => {
    const state = get();
    const exists = state.savedCareers.find(c => c.id === career.id);

    if (exists) {
      set({ pendingDeleteCareer: career });
      return;
    }

    set({ isSavingCareer: true });
    
    try {
        // Just save whatever we have. If images exist, they get saved. If not, they don't.
        // We do NOT trigger generation here anymore.
        
        // Ensure we are saving the version from store which might have images if generated in detail view
        const currentVersion = state.selectedCareer?.id === career.id ? state.selectedCareer : career;

        if (state.user) {
            await saveCareerToDb(state.user.id, currentVersion);
        }

        set((s) => {
            const isCurrentlySelected = s.selectedCareer?.id === currentVersion.id;
            return { 
                savedCareers: [...s.savedCareers, currentVersion],
                selectedCareer: isCurrentlySelected ? currentVersion : s.selectedCareer,
                hasViewedSavedPaths: false 
            };
        });

        state.showToast("Career saved successfully");

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
