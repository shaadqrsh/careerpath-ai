import React from 'react';
import { create } from 'zustand';
import { AppView, UserProfile, QuizAnswer, CareerRecommendation, CareerDomain } from './types';
import { saveCareerToDb, deleteCareerFromDb, uploadCareerImages, signOut as serviceSignOut } from './services/supabaseService';

export type AppTheme = 'light' | 'dark' | 'system';

interface ModalConfig {
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    icon?: React.ReactNode;
    buttonText: string;
    onButtonClick: () => void;
}

interface AppState {
  currentView: AppView;
  previousView: AppView | null; 
  careerOrigin: 'results' | 'saved' | null; 
  user: UserProfile | null;
  theme: AppTheme;
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
  modal: ModalConfig | null;
  toast: { show: boolean; message: string };

  showModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  hideModal: () => void;
  setView: (view: AppView) => void;
  setCareerOrigin: (origin: 'results' | 'saved') => void;
  setUser: (user: UserProfile) => void;
  setTheme: (theme: AppTheme) => void;
  setDomain: (domain: CareerDomain) => void;
  setDebugImageGeneration: (enabled: boolean) => void;
  addQuizAnswer: (answer: QuizAnswer) => void;
  resetQuiz: () => void;
  setRecommendations: (recs: CareerRecommendation[]) => void;
  setSelectedCareer: (career: CareerRecommendation) => void;
  updateCareerDetails: (id: string, details: Partial<CareerRecommendation>) => void;
  setSavedCareers: (careers: CareerRecommendation[]) => void;
  updateCareerImages: (careerId: string, images: (string | null)[]) => void;
  toggleSavedCareer: (career: CareerRecommendation) => Promise<void>;
  confirmDeleteCareer: () => Promise<void>; 
  cancelDeleteCareer: () => void;
  setShowPasswordResetModal: (show: boolean) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  clearState: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: AppView.LANDING,
  previousView: null,
  careerOrigin: null,
  user: null,
  theme: (localStorage.getItem('app_theme') as AppTheme) || 'system',
  debugImageGenerationEnabled: localStorage.getItem('debug_image_gen') !== 'false',
  selectedDomain: 'general',
  quizAnswers: [],
  recommendations: [],
  selectedCareer: null,
  savedCareers: [], 
  hasViewedSavedPaths: localStorage.getItem('hasViewedSavedPaths') === 'true',
  isLoading: false,
  isSavingCareer: false,
  isDeletingCareer: false,
  pendingDeleteCareer: null,
  showPasswordResetModal: false,
  modal: null,
  toast: { show: false, message: '' },

  showModal: (config) => set({ modal: { ...config, isOpen: true } }),
  hideModal: () => set(state => ({ modal: state.modal ? { ...state.modal, isOpen: false } : null })),

  setView: (view) => {
    window.scrollTo(0, 0);
    if (view === AppView.SAVED_PATHS) {
        set({ hasViewedSavedPaths: true });
        localStorage.setItem('hasViewedSavedPaths', 'true');
    }
    set((state) => ({ 
      previousView: state.currentView, 
      currentView: view 
    }));
  },
  setCareerOrigin: (origin) => set({ careerOrigin: origin }),
  setUser: (user) => set({ user }),
  setTheme: (theme) => {
    localStorage.setItem('app_theme', theme);
    set({ theme });
  },
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
  updateCareerDetails: (id, details) => set((state) => {
    const update = (c: CareerRecommendation) => (c.id === id ? { ...c, ...details } : c);
    return {
        recommendations: state.recommendations.map(update),
        savedCareers: state.savedCareers.map(update),
        selectedCareer: state.selectedCareer?.id === id ? { ...state.selectedCareer, ...details } : state.selectedCareer
    };
  }),
  setSavedCareers: (careers) => set({ savedCareers: careers }),
  updateCareerImages: (careerId, images) => set((state) => {
    const newSelected = state.selectedCareer?.id === careerId 
        ? { ...state.selectedCareer, slideImages: images } 
        : state.selectedCareer;
    const newRecommendations = state.recommendations.map(c => 
        c.id === careerId ? { ...c, slideImages: images } : c
    );
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
        const newSaved = state.savedCareers.filter(c => c.id !== career.id);
        const cleanedCareer = { ...career, slideImages: [] };
        let newSelected = state.selectedCareer;
        if (state.selectedCareer?.id === career.id) {
             newSelected = cleanedCareer;
        }
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
    const currentCareerState = state.selectedCareer?.id === career.id ? state.selectedCareer : career;
    const exists = state.savedCareers.find(c => c.id === career.id);
    if (exists) {
      set({ pendingDeleteCareer: exists });
      return;
    }
    set({ isSavingCareer: true });
    try {
        let currentVersion = { ...currentCareerState };
        if (state.user) {
            const hasRawImages = currentVersion.slideImages && currentVersion.slideImages.some(img => img && img.startsWith('data:'));
            if (hasRawImages && currentVersion.slideImages) {
                 try {
                     const uploadedUrls = await uploadCareerImages(state.user.id, currentVersion.id, currentVersion.slideImages as string[]);
                     const cleanUrls = uploadedUrls.map(u => (u && u.startsWith('http')) ? u : null);
                     currentVersion = { ...currentVersion, slideImages: cleanUrls };
                     state.updateCareerImages(currentVersion.id, cleanUrls);
                 } catch (uploadError) {
                     console.warn("Image upload during save failed", uploadError);
                     currentVersion.slideImages = [];
                 }
            }
            await saveCareerToDb(state.user.id, currentVersion);
        }
        set((s) => {
            const isCurrentlySelected = s.selectedCareer?.id === currentVersion.id;
            localStorage.setItem('hasViewedSavedPaths', 'false'); 
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
  clearState: () => {
      set({
        currentView: AppView.LANDING,
        previousView: null,
        careerOrigin: null,
        user: null,
        selectedDomain: 'general',
        quizAnswers: [],
        recommendations: [],
        selectedCareer: null,
        savedCareers: [],
        hasViewedSavedPaths: false,
        pendingDeleteCareer: null,
        modal: null
      });
      localStorage.removeItem('hasViewedSavedPaths');
  },
  logout: async () => {
      await serviceSignOut();
      get().clearState();
      get().hideModal();
  }
}));