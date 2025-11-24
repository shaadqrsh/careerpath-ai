import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { AppView } from './types';
import { supabase, getUserProfile } from './services/supabaseService';
import { Loader2 } from 'lucide-react';

// Page Imports
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

const App: React.FC = () => {
  const { currentView, theme, setView, setUser } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle Dark/Light Mode Class on HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    if (!supabase) {
        setIsInitializing(false);
        return;
    }

    const initAuth = async () => {
        try {
            // Check active session on mount
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await getUserProfile(session.user.id);
                if (profile) {
                    setUser(profile);
                    // Only redirect if on public pages
                    if (currentView === AppView.LANDING || currentView === AppView.AUTH) {
                        setView(AppView.DASHBOARD);
                    }
                } else {
                    // New user with no profile data
                    setUser({ id: session.user.id } as any);
                    setView(AppView.ONBOARDING);
                }
            }
        } catch (e) {
            console.error("Auth initialization failed", e);
        } finally {
            setIsInitializing(false);
        }
    };
    
    initAuth();

    // Listen for changes (Sign In, Sign Out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null as any);
        setView(AppView.LANDING);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // We handle the immediate redirect in Auth.tsx to avoid racing, but we keep this
        // to sync state if the token is refreshed or updated externally.
        const profile = await getUserProfile(session.user.id);
        if (profile) {
            setUser(profile);
            // If we are unexpectedly on Landing/Auth but signed in, move to dashboard
            if (currentView === AppView.LANDING || currentView === AppView.AUTH) {
                 setView(AppView.DASHBOARD);
            }
        } else {
            setUser({ id: session.user.id } as any);
            if (currentView !== AppView.ONBOARDING) {
                setView(AppView.ONBOARDING);
            }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setView]); // Remove currentView dependency to avoid loops

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <Landing />;
      case AppView.AUTH:
        return <Auth />;
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
    // Global Theme Wrapper
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      {renderView()}
    </div>
  );
};

export default App;