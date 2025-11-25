import React from 'react';
import { useAppStore } from '../store';
import { AppView, CareerRecommendation } from '../types';
import { TrendingUp, DollarSign, ArrowRight, ArrowLeft, Heart, Star } from 'lucide-react';

export const Results: React.FC = () => {
  const { recommendations, setSelectedCareer, setView, savedCareers, setCareerOrigin } = useAppStore();

  const handleSelect = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    setCareerOrigin('results'); 
    setView(AppView.CAREER_DETAIL);
  };

  const isSaved = (id: string) => savedCareers.some(c => c.id === id);

  const formatGrowth = (growth: string) => {
    const match = growth.match(/^([^(]+)(\s*\(.*\))?$/);
    if (match) {
        const magnitude = match[1].trim();
        const details = match[2] ? match[2].trim() : '';
        if (magnitude.toLowerCase().includes('growth')) return growth; 
        return `${magnitude} Growth ${details}`;
    }
    return `${growth} Growth`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-32 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <button 
                onClick={() => setView(AppView.DASHBOARD)} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Menu
            </button>
        </div>

        <div className="mb-12 text-center animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Top Matches</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Based on your unique profile, here are the paths where you'd thrive.</p>
        </div>

        <div className="space-y-6">
            {recommendations.map((career, index) => {
                const isBestMatch = index === 0;

                return (
                <div 
                    key={career.id}
                    onClick={() => handleSelect(career)}
                    style={{ animationDelay: `${200 + (index * 150)}ms` }}
                    className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border transition-all duration-300 flex flex-col md:flex-row gap-6 md:items-center shadow-sm cursor-pointer hover:shadow-xl hover:border-blue-500 dark:hover:border-slate-500 hover:scale-[1.02] dark:hover:bg-slate-750 overflow-hidden animate-fade-in-up opacity-0 ${isBestMatch ? 'border-green-500/50 dark:border-green-500/50 ring-1 ring-green-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    
                    {isSaved(career.id) && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 text-pink-500 z-10 animate-[fadeIn_0.3s_ease-out]">
                            <Heart size={16} fill="currentColor" />
                            <span className="text-xs font-bold uppercase tracking-wide">Career Saved</span>
                        </div>
                    )}

                    {isBestMatch && !isSaved(career.id) && (
                         <div className="absolute top-4 right-4 md:right-auto md:left-4 flex items-center gap-1.5 text-green-600 dark:text-green-400 z-10 animate-[fadeIn_0.3s_ease-out] bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                            <Star size={14} fill="currentColor" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Best Match</span>
                        </div>
                    )}

                    <div className="flex-shrink-0 relative z-10 mt-6 md:mt-0">
                        <div className="w-20 h-20 flex items-center justify-center relative bg-transparent">
                             <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    fill="none" 
                                    stroke={isBestMatch ? '#22c55e' : '#3b82f6'} 
                                    strokeWidth="8" 
                                    strokeLinecap="round"
                                    strokeDasharray={`${(2 * Math.PI * 45) * (career.matchScore / 100)} ${(2 * Math.PI * 45)}`}
                                    className="transition-all duration-1000 ease-out opacity-90"
                                />
                             </svg>
                             <span className="text-xl font-bold text-slate-800 dark:text-white relative z-10">{career.matchScore}%</span>
                        </div>
                    </div>

                    <div className="flex-grow relative z-10">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {career.tags.map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{t}</span>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{career.title}</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-4 max-w-2xl line-clamp-3">{career.summary}</p>
                        
                        <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-green-500 dark:text-green-400" />
                                {career.salaryRange}
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-blue-500 dark:text-blue-400" />
                                {formatGrowth(career.growth)}
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 self-end relative z-10 mt-4 md:mt-0">
                        <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
                            Explore Path <ArrowRight className="ml-1 w-4 h-4" />
                        </span>
                    </div>
                </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};