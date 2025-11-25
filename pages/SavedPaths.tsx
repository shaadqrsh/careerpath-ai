
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppView, CareerRecommendation } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Trash2, ArrowRight, TrendingUp, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { getSavedCareers } from '../services/supabaseService';

export const SavedPaths: React.FC = () => {
  const { savedCareers, setView, toggleSavedCareer, setSelectedCareer, setCareerOrigin, user, setSavedCareers, showToast } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelect = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    setCareerOrigin('saved'); 
    setView(AppView.CAREER_DETAIL);
  };

  const handleRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
        const saved = await getSavedCareers(user.id);
        setSavedCareers(saved);
        if (saved.length > 0) {
            showToast("Careers refreshed");
        } else {
            showToast("No saved careers found");
        }
    } catch(e) {
        showToast("Failed to refresh careers");
    } finally {
        setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-32 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <button 
                onClick={() => setView(AppView.DASHBOARD)} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh List
            </button>
        </div>

        <div className="mb-10 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Paths</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
                {savedCareers.length === 0 
                    ? "You haven't saved any career paths yet." 
                    : `You have ${savedCareers.length} saved career path${savedCareers.length === 1 ? '' : 's'}.`
                }
            </p>
        </div>

        <div className="space-y-6">
            {savedCareers.map((career, index) => (
                <div key={career.id} style={{ animationDelay: `${200 + (index * 100)}ms` }} className="flex items-center gap-6 group-outer relative animate-fade-in-up opacity-0">
                    <div 
                        onClick={() => handleSelect(career)}
                        className="group flex-1 relative bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col md:flex-row gap-6 md:items-center shadow-sm cursor-pointer hover:shadow-xl hover:border-blue-500 dark:hover:border-slate-500 hover:scale-[1.02] dark:hover:bg-slate-750 overflow-hidden"
                    >
                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                        
                         <div className="flex-grow relative z-10">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {career.tags.map(t => (
                                    <span key={t} className="px-2 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{t}</span>
                                ))}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{career.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-4 max-w-2xl line-clamp-2">{career.summary}</p>
                            
                            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-300 mt-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={18} className="text-blue-500 dark:text-blue-400" />
                                    {career.matchScore}% Match
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign size={18} className="text-green-500 dark:text-green-400" />
                                    {career.salaryRange}
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 self-end relative z-10 mt-4 md:mt-0">
                            <span className="text-slate-500 dark:text-slate-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 group-hover:translate-x-2 inline-flex items-center">
                                View Details <ArrowRight className="ml-1 w-4 h-4" />
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation(); 
                            toggleSavedCareer(career); 
                        }}
                        title="Remove Saved Career"
                        className="flex-shrink-0 w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-pink-500 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
        </div>
        
        {savedCareers.length === 0 && (
             <div className="mt-8 p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
                <p className="text-slate-500 dark:text-slate-400">Go explore some quizzes to find your dream job!</p>
                <div className="mt-4 flex gap-4 justify-center">
                    <Button 
                        onClick={() => setView(AppView.DASHBOARD)}
                        className="group transition-transform hover:scale-105" 
                    >
                        Explore Careers
                    </Button>
                    <Button 
                        onClick={handleRefresh}
                        variant="secondary"
                        disabled={isRefreshing}
                    >
                         {isRefreshing ? 'Refreshing...' : 'Refresh List'}
                    </Button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};
