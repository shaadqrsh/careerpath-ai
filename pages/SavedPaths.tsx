import React from 'react';
import { useAppStore } from '../store';
import { AppView, CareerRecommendation } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, Trash2, ArrowRight } from 'lucide-react';

export const SavedPaths: React.FC = () => {
  const { savedCareers, setView, toggleSavedCareer, setSelectedCareer, setCareerOrigin } = useAppStore();

  const handleSelect = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    setCareerOrigin('saved'); // Track origin for back button
    setView(AppView.CAREER_DETAIL);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
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

        <div className="space-y-4">
            {savedCareers.map((career) => (
                <div 
                    key={career.id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group shadow-sm transition-colors"
                >
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{career.title}</h3>
                        <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400">
                             <span>{career.matchScore}% Match</span>
                             <span>•</span>
                             <span>{career.salaryRange}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                         <Button 
                            variant="secondary" 
                            className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                            onClick={() => toggleSavedCareer(career)}
                         >
                            <Trash2 size={18} className="text-slate-400 hover:text-red-500 transition-colors" />
                         </Button>
                         <Button 
                            variant="outline" 
                            className="flex-1 sm:flex-none border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            onClick={() => handleSelect(career)}
                         >
                            View Details <ArrowRight size={18} className="ml-2" />
                         </Button>
                    </div>
                </div>
            ))}
        </div>
        
        {savedCareers.length === 0 && (
             <div className="mt-8 p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center">
                <p className="text-slate-500 dark:text-slate-400">Go explore some quizzes to find your dream job!</p>
                <Button className="mt-4" onClick={() => setView(AppView.DASHBOARD)}>Explore Careers</Button>
             </div>
        )}
      </div>
    </div>
  );
};