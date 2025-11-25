import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppView, CareerDomain } from '../types';
import { Beaker, Briefcase, Palette, LogOut, User, Heart, HelpCircle, ArrowRight, Zap, Image, Menu, X } from 'lucide-react';
import { APP_NAME, DAILY_CAREER_LIMIT, DAILY_IMAGE_LIMIT } from '../constants';
import { signOut } from '../services/supabaseService';

export const Dashboard: React.FC = () => {
  const { setView, setDomain, savedCareers, hasViewedSavedPaths, user } = useAppStore();
  
  const [careerQuota, setCareerQuota] = useState(0);
  const [imageQuota, setImageQuota] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
        const getRemaining = (count: number | undefined, lastDateStr: string | undefined, limit: number) => {
            if (!lastDateStr) return limit;
            
            const lastDate = new Date(lastDateStr);
            const now = new Date();
            
            const isSameDay = lastDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
            
            if (!isSameDay) return limit;
            return Math.max(0, limit - (count || 0));
        };

        setCareerQuota(getRemaining(user.dailyCareerGenerationsCount, user.lastCareerGenerationDate, DAILY_CAREER_LIMIT));
        setImageQuota(getRemaining(user.dailyImageGenerationsCount, user.lastImageGenerationDate, DAILY_IMAGE_LIMIT));
    }
  }, [user]);

  useEffect(() => {
      if (isMobileMenuOpen) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = 'unset';
      }
      return () => {
          document.body.style.overflow = 'unset';
      };
  }, [isMobileMenuOpen]);

  const handleStartQuiz = (domain: CareerDomain) => {
    setDomain(domain);
    setView(AppView.QUIZ);
  };

  const handleLogout = async () => {
      await signOut();
      setView(AppView.LANDING);
  };

  const categories: {id: CareerDomain, title: string, icon: React.ReactNode, color: string, desc: string}[] = [
    { id: 'science', title: 'Science & Tech', icon: <Beaker size={32} />, color: 'from-cyan-500 to-blue-600', desc: 'Engineering, Medicine, Research' },
    { id: 'commerce', title: 'Commerce', icon: <Briefcase size={32} />, color: 'from-emerald-500 to-green-600', desc: 'Business, Finance, Law' },
    { id: 'arts', title: 'Arts & Creative', icon: <Palette size={32} />, color: 'from-pink-500 to-rose-600', desc: 'Design, Media, Humanities' },
  ];

  const getQuotaStyles = (current: number) => {
     if (current === 0) {
         return "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400";
     }
     return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300";
  };
  
  const getImageQuotaStyles = (current: number) => {
     if (current === 0) {
         return "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400";
     }
     return "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    {APP_NAME}
                </h1>
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                        <path d="M12 24C12 24 10 14 0 12C10 10 12 0 12 0C12 0 14 10 24 12C14 14 12 24 12 24Z" />
                    </svg>
                    <span className="text-xs font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Powered by Gemini
                    </span>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 mr-2">
                 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getQuotaStyles(careerQuota)}`} title="Daily Career Assessments Remaining">
                    <Zap size={14} />
                    <span className="hidden sm:inline">Assessments:</span>
                    <span>{careerQuota}/{DAILY_CAREER_LIMIT}</span>
                 </div>
                 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getImageQuotaStyles(imageQuota)}`} title="Daily Career Visualization Remaining">
                    <Image size={14} />
                    <span className="hidden sm:inline">Visualizations:</span>
                    <span>{imageQuota}/{DAILY_IMAGE_LIMIT}</span>
                 </div>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <button 
                onClick={() => setView(AppView.SAVED_PATHS)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-500 transition-colors relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Saved Paths"
              >
                <Heart size={20} />
                {savedCareers.length > 0 && !hasViewedSavedPaths && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <button 
                onClick={() => setView(AppView.PROFILE)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                title="Edit Profile"
              >
                <User size={20} />
              </button>
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>

            <div className="md:hidden flex items-center">
                 <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
                 >
                    <Menu size={24} />
                 </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 animate-fade-in flex flex-col h-[100dvh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                 <h2 className="text-lg font-bold">Menu</h2>
                 <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                 >
                    <X size={24} />
                 </button>
            </div>
            <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
                <div className="flex flex-col gap-4">
                     <button 
                        onClick={() => { setView(AppView.SAVED_PATHS); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-4 text-lg font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
                    >
                        <div className="relative">
                            <Heart size={24} />
                            {savedCareers.length > 0 && !hasViewedSavedPaths && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse"></span>
                            )}
                        </div>
                        Saved Paths
                    </button>
                    <button 
                        onClick={() => { setView(AppView.PROFILE); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-4 text-lg font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
                    >
                        <User size={24} />
                        Profile Settings
                    </button>
                    <button 
                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-4 text-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
                    >
                        <LogOut size={24} />
                        Logout
                    </button>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                <div className="space-y-4">
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${getQuotaStyles(careerQuota)}`}>
                        <div className="flex items-center gap-3">
                            <Zap size={20} />
                            <span className="font-medium">Assessments</span>
                        </div>
                        <span className="font-bold">{careerQuota}/{DAILY_CAREER_LIMIT}</span>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${getImageQuotaStyles(imageQuota)}`}>
                         <div className="flex items-center gap-3">
                            <Image size={20} />
                            <span className="font-medium">Visualizations</span>
                        </div>
                        <span className="font-bold">{imageQuota}/{DAILY_IMAGE_LIMIT}</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Start Your Discovery</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Select a domain to begin a specialized career assessment, or use our General Assessment if you are unsure.</p>
        </div>

        {careerQuota === 0 && (
            <div 
                className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-400 flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 animate-fade-in-up opacity-0 w-full"
                style={{ animationDelay: '100ms' }}
            >
                <div className="flex items-center gap-3 mb-1 sm:mb-0">
                    <Zap className="shrink-0" size={20} />
                    <span className="font-medium text-left">Daily Career assessments reached</span>
                </div>
                <div className="text-left sm:text-right ml-8 sm:ml-0">
                    <span className="text-sm opacity-80">Come back tomorrow for more</span>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {categories.map((cat, index) => (
            <div 
                key={cat.id}
                style={{ animationDelay: `${200 + (index * 100)}ms` }}
                className="animate-fade-in-up opacity-0 h-full"
            >
                <div 
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 hover:shadow-xl dark:hover:bg-slate-750 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-slate-500 shadow-sm flex flex-col h-full"
                  onClick={() => handleStartQuiz(cat.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                  
                  <div className="flex flex-row md:flex-col md:items-start gap-4 flex-1">
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-0 md:mb-6 text-white shadow-lg shrink-0`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 text-left">
                          <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-slate-900 dark:text-white">{cat.title}</h3>
                          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-0">{cat.desc}</p>
                      </div>
                  </div>

                  <div className="mt-4 md:mt-6 md:self-end">
                      <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center text-sm md:text-base">
                        Start {cat.title.split(' ')[0]} Quiz <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                  </div>
                </div>
            </div>
          ))}
        </div>

        <div 
            style={{ animationDelay: '500ms' }}
            className="animate-fade-in-up opacity-0"
        >
            <div 
                onClick={() => handleStartQuiz('general')}
                className="group relative w-full bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl dark:hover:bg-slate-750 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:border-blue-500 dark:hover:border-slate-500 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />
                <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                        <HelpCircle size={32} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2">Can't decide?</h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">Take our General Personality Quiz to find your direction.</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-start md:items-center mt-2 md:mt-0 w-full md:w-auto">
                    <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center relative z-10 whitespace-nowrap text-sm md:text-base">
                        Start General Quiz <ArrowRight className="ml-1 w-4 h-4" />
                    </span>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};