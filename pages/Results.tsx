import React from 'react';
import { useAppStore } from '../store';
import { AppView, CareerRecommendation } from '../types';
import { Button } from '../components/Button';
import { TrendingUp, DollarSign, ArrowRight, ArrowLeft, Heart, Sun, Moon } from 'lucide-react';

export const Results: React.FC = () => {
  const { recommendations, setSelectedCareer, setView, toggleSavedCareer, savedCareers, setCareerOrigin, theme, toggleTheme } = useAppStore();

  const handleSelect = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    setCareerOrigin('results'); // Track origin for back button
    setView(AppView.CAREER_DETAIL);
  };

  const isSaved = (id: string) => savedCareers.some(c => c.id === id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => setView(AppView.DASHBOARD)} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Menu
            </button>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
            >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        </div>

        <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Top Matches</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Based on your unique profile, here are the paths where you'd thrive.</p>
        </div>

        <div className="space-y-6">
            {recommendations.map((career) => (
                <div 
                    key={career.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all duration-300 flex flex-col md:flex-row gap-6 md:items-center group shadow-sm"
                >
                    {/* Match Score */}
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center relative bg-white dark:bg-slate-900 group-hover:border-blue-500 transition-colors">
                             <svg className="absolute inset-0 w-full h-full -rotate-90 text-blue-500" viewBox="0 0 36 36">
                                <path
                                    className="stroke-current"
                                    strokeDasharray={`${career.matchScore}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    strokeWidth="3"
                                />
                             </svg>
                             <span className="text-xl font-bold text-slate-800 dark:text-white">{career.matchScore}%</span>
                        </div>
                    </div>

                    <div className="flex-grow">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {career.tags.map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{t}</span>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{career.title}</h3>
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleSavedCareer(career); }}
                                className={`p-2 rounded-full transition-colors ${isSaved(career.id) ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 dark:text-slate-600 hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Heart size={20} fill={isSaved(career.id) ? "currentColor" : "none"} />
                            </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-4">{career.summary}</p>
                        
                        <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-green-500 dark:text-green-400" />
                                {career.salaryRange}
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-blue-500 dark:text-blue-400" />
                                {career.growth} Growth
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 pt-4 md:pt-0">
                        <Button 
                            onClick={() => handleSelect(career)} 
                            variant="outline" 
                            className="w-full md:w-auto border-slate-300 text-slate-900 dark:text-slate-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:border-slate-600"
                        >
                            Explore Path <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};