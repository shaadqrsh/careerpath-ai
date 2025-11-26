import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { AppView } from './types';
import { getUserProfile, getSavedCareers, getCurrentUser } from './services/supabaseService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { APP_NAME } from './constants';
import { ConfirmModal } from './components/ConfirmModal';
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

const FullScreenInfoModal: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
}> = ({ icon, title, description, buttonText, onButtonClick }) => (
  <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center text-white p-4 text-center animate-fade-in">
    <div className="bg-slate-900 p-8 rounded-2xl border border-red-900/50 max-w-md shadow-2xl animate-fade-in-up">
      {icon}
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 mb-8 leading-relaxed">{description}</p>
      <Button onClick={onButtonClick} className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-colors font-bold">
        {buttonText}
      </Button>
    </div>
  </div>
);

const App: React.FC = () => {
  const { currentView, theme, setView, setUser, setSavedCareers, pendingDeleteCareer, confirmDeleteCareer, cancelDeleteCareer, toast, isDeletingCareer, showToast, logout, modal } = useAppStore();
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
            body.classList.remove('bg-slate-50');
            body.classList.add('bg-slate-900');
        } else {
            root.classList.remove('dark');
            body.classList.remove('bg-slate-900');
            body.classList.add('bg-slate-50');
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
                    showToast(errorDesc.replace(/\+/g, ' '));
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
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 relative">
      {renderView()}

      {modal && modal.isOpen && (
        <FullScreenInfoModal
          icon={modal.icon}
          title={modal.title}
          description={modal.description}
          buttonText={modal.buttonText}
          onButtonClick={modal.onButtonClick}
        />
      )}

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

      <ConfirmModal
        isOpen={!!pendingDeleteCareer}
        onClose={cancelDeleteCareer}
        onConfirm={confirmDeleteCareer}
        title="Unsave Career?"
        description={
          <p>
            Are you sure you want to remove <strong>{pendingDeleteCareer?.title}</strong> from your saved paths? This action cannot be undone.
          </p>
        }
        confirmText="Yes, Remove It"
        isLoading={isDeletingCareer}
      />
    </div>
  );
};

export default App;