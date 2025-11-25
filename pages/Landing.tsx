
import React from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { ArrowRight } from 'lucide-react';
import { APP_NAME } from '../constants';

export const Landing: React.FC = () => {
  const { setView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-20 px-4">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
      </div>

      <div className="z-10 text-center w-full max-w-7xl px-2">
        <div className="mb-6 flex justify-center animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                <path d="M12 24C12 24 10 14 0 12C10 10 12 0 12 0C12 0 14 10 24 12C14 14 12 24 12 24Z" />
            </svg>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Powered by Gemini
            </span>
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
          Find Your Future with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {APP_NAME}
          </span>
        </h1>

        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
          Stop guessing. Let our AI analyze your personality, skills, and global trends to build a personalized career roadmap just for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0" style={{ animationDelay: '450ms' }}>
          <Button 
            size="lg" 
            onClick={() => setView(AppView.AUTH)}
            className="group"
          >
            Get Started 
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
           <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 backdrop-blur-sm animate-fade-in-up opacity-0" style={{ animationDelay: '600ms' }}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Holistic Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Deeply connects your personality, aptitude, and interests to real roles.</p>
           </div>
           <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 backdrop-blur-sm animate-fade-in-up opacity-0" style={{ animationDelay: '750ms' }}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Visual Pathways</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">See your future with AI-generated day-in-the-life scenes.</p>
           </div>
           <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 backdrop-blur-sm animate-fade-in-up opacity-0" style={{ animationDelay: '900ms' }}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Smart Roadmaps</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Step-by-step education plans from where you are now.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
