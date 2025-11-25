import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { AppView } from './types';
import { getUserProfile, getSavedCareers, getCurrentUser } from './services/supabaseService';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './components/Button';

import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Quiz } from './pages/Quiz';
import { Analysis } from './pages/Analysis';
import { Results } from './pages/Results';
import { CareerDetail } from './pages/CareerDetail';
import { Slideshow } from './pages/Slideshow';
import { Profile } from './pages/Profile';
import { SavedPaths } from './pages/SavedPaths';
import { UpdatePassword } from './pages/UpdatePassword';

const App: React.FC = () => {
  const { currentView, theme, setView, setUser, setSavedCareers, pendingDeleteCareer, confirmDeleteCareer, cancelDeleteCareer } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle Dark/Light Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Auth Initialization & Deep Link Detection
  useEffect(() => {
    const initAuth = async () => {
        try {
            // 1. Check for Password Reset Hash (Supabase sends #access_token=...&type=recovery)
            const hash = window.location.hash;
            if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
                // Extract access token
                const params = new URLSearchParams(hash.substring(1)); // remove #
                const accessToken = params.get('access_token');
                
                if (accessToken) {
                    // Manually set token
                    localStorage.setItem('access_token', accessToken);
                    // Clear hash to clean URL
                    window.history.replaceState(null, '', window.location.pathname);
                    // Force view to update password
                    setView(AppView.UPDATE_PASSWORD);
                    setIsInitializing(false);
                    return; // Stop further checks
                }
            }

            // 2. Normal Session Check
            const authUser = await getCurrentUser();
            
            if (authUser) {
                const profile = await getUserProfile(authUser.id);
                if (profile) {
                    setUser(profile);
                    const saved = await getSavedCareers(authUser.id);
                    setSavedCareers(saved);

                    if (currentView === AppView.LANDING || currentView === AppView.AUTH) {
                        setView(AppView.DASHBOARD);
                    }
                } else {
                    setUser({ id: authUser.id } as any);
                    setView(AppView.ONBOARDING);
                }
            } else {
                if (currentView !== AppView.LANDING && currentView !== AppView.AUTH) {
                    setView(AppView.LANDING);
                }
            }
        } catch (e) {
            console.error("Auth initialization failed", e);
            setView(AppView.LANDING);
        } finally {
            setIsInitializing(false);
        }
    };
    
    initAuth();
  }, [setUser, setView, setSavedCareers]);

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <Landing />;
      case AppView.AUTH:
        return <Auth />;
      case AppView.UPDATE_PASSWORD:
        return <UpdatePassword />;
      case AppView.ONBOARDING:
        return <Onboarding />;
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.QUIZ:
        return <Quiz />;
      case AppView.ANALYSIS:
        return <Analysis />;
      case AppView.RESULTS:
        return <Results />;
      case AppView.CAREER_DETAIL:
        return <CareerDetail />;
      case AppView.SLIDESHOW:
        return <Slideshow />;
      case AppView.PROFILE:
        return <Profile />;
      case AppView.SAVED_PATHS:
        return <SavedPaths />;
      default:
        return <Landing />;
    }
  };

  if (isInitializing) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 relative">
      {renderView()}

      {pendingDeleteCareer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelDeleteCareer}></div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10 animate-[scaleIn_0.2s_ease-out] border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
                    <AlertTriangle size={28} />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Unsave Career?</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Are you sure you want to remove <strong>{pendingDeleteCareer.title}</strong> from your saved paths? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={cancelDeleteCareer}>Cancel</Button>
                    <Button 
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                        onClick={confirmDeleteCareer}
                    >
                        Yes, Remove It
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;