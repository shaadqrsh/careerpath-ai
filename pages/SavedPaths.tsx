
import React from 'react';
import { useAppStore } from '../store';
import { AppView, CareerRecommendation } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Trash2, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';

export const SavedPaths: React.FC = () => {
  const { savedCareers, setView, toggleSavedCareer, setSelectedCareer, setCareerOrigin } = useAppStore();

  const handleSelect = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    setCareerOrigin('saved'); // Track origin for back button
    setView(AppView.CAREER_DETAIL);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
            <button 
                onClick={() => setView(AppView.DASHBOARD)} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
        </div>

        <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Paths</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
                {savedCareers.length === 0 
                    ? "You haven't saved any career paths yet." 
                    : `You have ${savedCareers.length} saved career path${savedCareers.length === 1 ? '' : 's'}.`
                }
            </p>
        </div>

        <div className="space-y-6">
            {savedCareers.map((career) => (
                <div key={career.id} className="flex items-center gap-6 group-outer relative">
                    {/* Main Career Card - Clickable Area (Matches Top Matches Style) */}
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

                         {/* Explore Path (Bottom Right) */}
                        <div className="flex-shrink-0 self-end relative z-10 mt-4 md:mt-0">
                            <span className="text-slate-500 dark:text-slate-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 group-hover:translate-x-2 inline-flex items-center">
                                View Details <ArrowRight className="ml-1 w-4 h-4" />
                            </span>
                        </div>
                    </div>

                    {/* Delete Button - Outside Rectangle, Distinct Style */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevents clicking the card
                            toggleSavedCareer(career); // Now triggers the global modal via store
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
             <div className="mt-8 p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center">
                <p className="text-slate-500 dark:text-slate-400">Go explore some quizzes to find your dream job!</p>
                <Button 
                    className="mt-4 group" 
                    onClick={() => setView(AppView.DASHBOARD)}
                >
                    Explore Careers <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </div>
        )}
      </div>
    </div>
  );
};
