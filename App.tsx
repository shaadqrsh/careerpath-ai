import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { AppView } from './types';
import { getUserProfile, getSavedCareers, getCurrentUser } from './services/supabaseService';
import { APP_NAME } from './constants';
import { ConfirmModal } from './components/ConfirmModal';
import { AlertModal } from './components/AlertModal';
import { Toast } from './components/Toast';
import { FullScreenLoader } from './components/FullScreenLoader';

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
  const { 
    currentView, 
    theme, 
    setView, 
    setUser, 
    setSavedCareers, 
    confirmation,
    hideConfirm, 
    toast, 
    showToast, 
    logout, 
    modal 
  } = useAppStore();
  
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    const applyTheme = () => {
        let effectiveTheme = theme;
        if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
            body.classList.remove('bg-paper');
            body.classList.add('bg-[#14130f]');
        } else {
            root.classList.remove('dark');
            body.classList.remove('bg-[#14130f]');
            body.classList.add('bg-paper');
        }
    };

    applyTheme();

    if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme();
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
        try {
            const hash = window.location.hash;
            
            if (hash && hash.includes('error_description')) {
                const params = new URLSearchParams(hash.substring(1));
                const errorDesc = params.get('error_description');
                if (errorDesc) {
                    window.history.replaceState(null, '', window.location.pathname);
                    showToast(errorDesc.replace(/\+/g, ' '), 'error');
                    setView(AppView.AUTH);
                    setIsInitializing(false);
                    return;
                }
            }

            if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1)); 
                const accessToken = params.get('access_token');
                const type = params.get('type');
                
                if (accessToken) {
                    localStorage.setItem('access_token', accessToken);
                    window.history.replaceState(null, '', window.location.pathname);
                    
                    if (type === 'recovery') {
                        setView(AppView.UPDATE_PASSWORD);
                        setIsInitializing(false);
                        return; 
                    }
                }
            }

            const authUser = await getCurrentUser();
            
            if (authUser) {
                let profile = null;
                try {
                    profile = await getUserProfile(authUser.id);
                } catch (e) {
                    console.warn("Profile fetch failed first attempt, retrying...", e);
                    await new Promise(res => setTimeout(res, 1000));
                    try {
                        profile = await getUserProfile(authUser.id);
                    } catch (e2) {
                        console.error("Profile fetch failed second attempt", e2);
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
            await logout(); 
            setView(AppView.LANDING);
        } finally {
            setIsInitializing(false);
        }
    };
    
    initAuth();
  }, [setUser, setView, setSavedCareers, showToast, logout]);

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
      return <FullScreenLoader />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-paper text-ink dark:bg-[#14130f] dark:text-paper relative">
      {renderView()}

      <AlertModal
        isOpen={!!modal && modal.isOpen}
        variant={modal?.variant}
        title={modal?.title || ''}
        description={modal?.description}
        buttonText={modal?.buttonText || 'Close'}
        onButtonClick={modal?.onButtonClick || (() => {})}
      />

      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

      <ConfirmModal
        isOpen={!!confirmation && confirmation.isOpen}
        onClose={hideConfirm}
        onConfirm={confirmation?.onConfirm || (() => {})}
        title={confirmation?.title || ''}
        description={confirmation?.description}
        confirmText={confirmation?.confirmText}
        cancelText={confirmation?.cancelText}
        variant={confirmation?.variant}
        isLoading={confirmation?.isLoading}
      />
    </div>
  );
};

export default App;