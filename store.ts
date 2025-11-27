import React from 'react';
import { create } from 'zustand';
import { AppView, UserProfile, QuizAnswer, CareerRecommendation, CareerDomain } from './types';
import { saveCareerToDb, deleteCareerFromDb, uploadCareerImages, signOut as serviceSignOut } from './services/supabaseService';
import { AlertVariant } from './components/AlertModal';

export type AppTheme = 'light' | 'dark' | 'system';

interface ModalConfig {
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    variant?: AlertVariant;
    buttonText?: string;
    onButtonClick?: () => void;
}

interface ConfirmConfig {
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info';
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
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
  showPasswordResetModal: boolean;
  
  modal: ModalConfig | null;
  confirmation: ConfirmConfig | null;
  toast: { show: boolean; message: string; type: 'success' | 'error' };

  showModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  hideModal: () => void;
  
  showConfirm: (config: Omit<ConfirmConfig, 'isOpen'>) => void;
  hideConfirm: () => void;
  
  showToast: (message: string, type?: 'success' | 'error') => void;
  hideToast: () => void;

  setView: (view: AppView) => void;
  setCareerOrigin: (origin: 'results' | 'saved') => void;
  setUser: (user: UserProfile) => void;
  setTheme: (theme: AppTheme) => void;
  setDomain: (domain: CareerDomain) => void;
  addQuizAnswer: (answer: QuizAnswer) => void;
  resetQuiz: () => void;
  setRecommendations: (recs: CareerRecommendation[]) => void;
  setSelectedCareer: (career: CareerRecommendation) => void;
  updateCareerDetails: (id: string, details: Partial<CareerRecommendation>) => void;
  setSavedCareers: (careers: CareerRecommendation[]) => void;
  updateCareerImages: (careerId: string, images: (string | null)[]) => void;
  
  toggleSavedCareer: (career: CareerRecommendation) => Promise<void>;
  executeDeleteCareer: (career: CareerRecommendation) => Promise<void>;
  
  setShowPasswordResetModal: (show: boolean) => void;
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
  showPasswordResetModal: false,
  
  modal: null,
  confirmation: null,
  toast: { show: false, message: '', type: 'success' },

  showModal: (config) => set({ modal: { ...config, isOpen: true } }),
  hideModal: () => set(state => ({ modal: state.modal ? { ...state.modal, isOpen: false } : null })),

  showConfirm: (config) => set({ confirmation: { ...config, isOpen: true } }),
  hideConfirm: () => set({ confirmation: null }),

  showToast: (message, type = 'success') => {
      set({ toast: { show: true, message, type } });
      setTimeout(() => {
          set({ toast: { show: false, message: '', type: 'success' } });
      }, 3000);
  },
  hideToast: () => set({ toast: { show: false, message: '', type: 'success' } }),

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
  
  toggleSavedCareer: async (career) => {
    const state = get();
    const currentCareerState = state.selectedCareer?.id === career.id ? state.selectedCareer : career;
    const exists = state.savedCareers.find(c => c.id === career.id);
    
    if (exists) {
      state.showConfirm({
          title: "Unsave Career?",
          description: React.createElement("p", {}, 
              "Are you sure you want to remove ", 
              React.createElement("strong", {}, career.title), 
              " from your saved paths? This action cannot be undone."
          ),
          confirmText: "Yes, Remove It",
          variant: 'danger',
          onConfirm: () => state.executeDeleteCareer(exists)
      });
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
        state.showToast("Career saved successfully", 'success');
    } catch (e) {
        console.error("Error saving career:", e);
        state.showToast("Error saving career. Please try again.", 'error');
    } finally {
        set({ isSavingCareer: false });
    }
  },

  executeDeleteCareer: async (career) => {
      const state = get();
      if (!state.user) return;
      
      if (state.confirmation) {
          set({ confirmation: { ...state.confirmation, isLoading: true } });
      }

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
            confirmation: null 
        });
        
        state.showToast("Career deleted successfully", 'success');
        
        if (state.currentView === AppView.CAREER_DETAIL && state.selectedCareer?.id === career.id) {
            if (state.careerOrigin === 'saved') {
                 set({ currentView: AppView.SAVED_PATHS });
            }
        }
      } catch (e) {
        console.error("Error deleting from DB", e);
        state.showToast("Failed to delete career. Please try again.", 'error');
        set({ confirmation: null });
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
        modal: null,
        confirmation: null
      });
      localStorage.removeItem('hasViewedSavedPaths');
  },
  logout: async () => {
      await serviceSignOut();
      get().clearState();
  }
}));