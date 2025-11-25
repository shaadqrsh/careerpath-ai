
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { AppView } from './types';
import { getUserProfile, getSavedCareers, getCurrentUser, signOut } from './services/supabaseService';
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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
  const { currentView, theme, setView, setUser, setSavedCareers, pendingDeleteCareer, confirmDeleteCareer, cancelDeleteCareer, toast, isDeletingCareer, showToast } = useAppStore();
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
            const hash = window.location.hash;
            
            // 0. Check for Supabase Errors in URL (e.g. Link Expired)
            if (hash && hash.includes('error_description')) {
                const params = new URLSearchParams(hash.substring(1));
                const errorDesc = params.get('error_description');
                if (errorDesc) {
                    // Clear hash and show error
                    window.history.replaceState(null, '', window.location.pathname);
                    showToast(errorDesc.replace(/\+/g, ' '));
                    setView(AppView.AUTH);
                    setIsInitializing(false);
                    return;
                }
            }

            // 1. Check for Password Reset or Signup Confirmation Hashes (Success case)
            if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1)); 
                const accessToken = params.get('access_token');
                const type = params.get('type');
                
                if (accessToken) {
                    localStorage.setItem('access_token', accessToken);
                    window.history.replaceState(null, '', window.location.pathname);
                    
                    // Specific check: Only redirect to password update if it is a recovery flow
                    if (type === 'recovery') {
                        setView(AppView.UPDATE_PASSWORD);
                        setIsInitializing(false);
                        return; 
                    }
                    
                    // For type='signup', 'invite', or 'magiclink', we proceed to the user check below
                    // which will route them to dashboard or onboarding appropriately.
                }
            }

            // 2. Normal Session Check
            const authUser = await getCurrentUser();
            
            if (authUser) {
                // Attempt to fetch profile with a simple retry strategy for robustness
                let profile = null;
                try {
                    profile = await getUserProfile(authUser.id);
                } catch (e) {
                    console.warn("Profile fetch failed first attempt, retrying...", e);
                    // Simple retry logic for transient backend issues
                    await new Promise(res => setTimeout(res, 1000));
                    try {
                        profile = await getUserProfile(authUser.id);
                    } catch (e2) {
                        console.error("Profile fetch failed second attempt", e2);
                        // Do not throw here, let profile be null so we can check if it's a 404 case handled by service
                    }
                }

                if (profile) {
                    setUser(profile);
                    try {
                        const saved = await getSavedCareers(authUser.id);
                        setSavedCareers(saved);
                    } catch (e) {
                        console.warn("Failed to load saved careers", e);
                    }

                    if (currentView === AppView.LANDING || currentView === AppView.AUTH) {
                        setView(AppView.DASHBOARD);
                    }
                } else {
                    // Valid User ID, but No Profile (404) -> Onboarding
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
            // If auth fails violently (e.g. 500 error from backend), sign out locally to prevent stuck state
            signOut(); 
            setView(AppView.LANDING);
        } finally {
            setIsInitializing(false);
        }
    };
    
    initAuth();
  }, [setUser, setView, setSavedCareers, showToast]);

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

      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fadeIn_0.3s_ease-out] z-[150]">
            {toast.message.toLowerCase().includes('failed') || toast.message.toLowerCase().includes('error') || toast.message.toLowerCase().includes('expired') ? (
               <XCircle className="text-red-400 shrink-0" />
            ) : (
               <CheckCircle className="text-green-400 shrink-0" />
            )}
            <div>
                <p className="font-bold">{toast.message}</p>
            </div>
        </div>
      )}

      {pendingDeleteCareer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isDeletingCareer ? cancelDeleteCareer : undefined}></div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10 animate-[scaleIn_0.2s_ease-out] border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
                    <AlertTriangle size={28} />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Unsave Career?</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Are you sure you want to remove <strong>{pendingDeleteCareer.title}</strong> from your saved paths? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={cancelDeleteCareer} disabled={isDeletingCareer}>Cancel</Button>
                    <Button 
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:opacity-50"
                        onClick={confirmDeleteCareer}
                        disabled={isDeletingCareer}
                    >
                        {isDeletingCareer ? "Deleting..." : "Yes, Remove It"}
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
