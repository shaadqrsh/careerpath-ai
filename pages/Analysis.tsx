import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { generateCareerRecommendations } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

export const Analysis: React.FC = () => {
  const { user, quizAnswers, setRecommendations, setView } = useAppStore();
  const [loadingText, setLoadingText] = useState("Initializing neural networks...");

  useEffect(() => {
    const texts = [
      "Analyzing your responses...",
      "Mapping global market trends...",
      "Identifying high-growth sectors...",
      "Synthesizing your personalized roadmap..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 1200);

    const performAnalysis = async () => {
      if (user) {
        try {
            const results = await generateCareerRecommendations(user, quizAnswers);
            setRecommendations(results);
            // Slight delay to ensure user sees the "Complete" state if API is too fast
            setTimeout(() => setView(AppView.RESULTS), 500);
        } catch (e) {
            console.error("Failed to generate", e);
            // Fallback handled in service, but safety navigation here
            setView(AppView.RESULTS);
        }
      }
    };

    performAnalysis();

    return () => clearInterval(interval);
  }, [user, quizAnswers, setRecommendations, setView]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse-slow"></div>
        <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-500 animate-spin relative z-10" />
      </div>
      
      <h2 className="mt-8 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">
        AI is crafting your path
      </h2>
      <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg animate-pulse min-h-[1.75rem]">
        {loadingText}
      </p>

      {/* Mock Terminal Output for visual effect - Kept dark for hacker aesthetic but adjusted borders */}
      <div className="mt-12 w-full max-w-md bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-xs text-green-400 border border-slate-200 dark:border-slate-800 opacity-90 shadow-lg">
        <p>> User.profile loaded</p>
        <p>> Context: {user?.educationLevel} / {user?.preferredWorkCountry}</p>
        <p>> Location: {user?.residenceCountry}</p>
        <p>> Vectorizing aptitude scores...</p>
        <p className="animate-pulse">> Querying Gemini Pro 1.5...</p>
      </div>
    </div>
  );
};