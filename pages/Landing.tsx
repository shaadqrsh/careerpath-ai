import React from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';

export const Landing: React.FC = () => {
  const { setView, theme, toggleTheme } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
        >
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
      </div>

      <div className="z-10 text-center max-w-4xl px-6">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-sm font-medium shadow-sm">
            <Sparkles size={16} />
            <span>Powered by Gemini Pro 1.5</span>
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Find Your Future <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Powered by AI
          </span>
        </h1>

        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop guessing. Let our AI analyze your personality, skills, and global trends to build a personalized career roadmap just for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => setView(AppView.AUTH)}
            className="group"
          >
            Get Started 
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => alert("Demo Mode: Click Get Started to bypass login.")}
            className="bg-white hover:bg-slate-50 text-slate-7