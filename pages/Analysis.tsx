import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { generateCareerRecommendations } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

// Simple UUID generator for browsers that might not support crypto.randomUUID securely in all contexts
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const Analysis: React.FC = () => {
  const { user, quizAnswers, setRecommendations, setView, savedCareers } = useAppStore();
  const [loadingText, setLoadingText] = useState("Initializing neural networks...");
  
  // Typing Effect State
  const [displayLog, setDisplayLog] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Define the target logs based on user data
  const targetLogs = React.useMemo(() => {
    if (!user) return [];
    
    // Explicitly formatting location string
    const locationString = user.residenceCountry === user.preferredWorkCountry 
        ? `> Location Context: ${user.residenceCountry} (Local)`
        : `> Location Context: ${user.residenceCountry} -> ${user.preferredWorkCountry}`;

    return [
      `> Initializing session for: ${user.fullName}`,
      `> Demographics: ${user.age} yrs / ${user.gender}`,
      `> Education: ${user.educationLevel}`,
      `> Specialization: ${user.specialization || 'General'}`,
      locationString 
    ];
  }, [user]);

  // Typing Effect Logic
  useEffect(() => {
    if (currentLineIndex >= targetLogs.length) return;

    const currentLineText = targetLogs[currentLineIndex];
    let typeSpeed = 25; // Slower typing as requested
    
    const timeout = setTimeout(() => {
      if (currentCharIndex < currentLineText.length) {
        setDisplayLog(prevLogs => {
          const newLogs = [...prevLogs];
          if (newLogs[currentLineIndex] === undefined) {
            newLogs[currentLineIndex] = currentLineText[currentCharIndex];
          } else {
            newLogs[currentLineIndex] = newLogs[currentLineIndex] + currentLineText[currentCharIndex];
          }
          return newLogs;
        });
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, typeSpeed); 
    
    // Auto-scroll to bottom
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    return () => clearTimeout(timeout);
  }, [currentLineIndex, currentCharIndex, targetLogs]);


  useEffect(() => {
    // Rotating loading text
    const texts = [
      "Analyzing your responses...",
      "Mapping global market trends...",
      "Identifying high-growth sectors...",
      "Constructing personalized roadmaps..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 1500);

    // Actual Analysis Call
    const performAnalysis = async () => {
      if (user) {
        try {
            const results = await generateCareerRecommendations(user, quizAnswers);
            
            // MERGE & UUID LOGIC: 
            const mergedResults = results.map(rec => {
                // Check if we already have this career saved (by title match)
                const existing = savedCareers.find(s => s.title.trim().toLowerCase() === rec.title.trim().toLowerCase());
                
                // If it exists, use the saved version (preserves the DB UUID and Images)
                if (existing) return existing;
                
                // If it is NEW, overwrite the ID with a proper UUID.
                // This ensures that when we save it later, we use a clean UUID for the DB and Storage Folder,
                // avoiding issues with titles containing spaces/special chars.
                return {
                    ...rec,
                    id: generateUUID()
                };
            });

            // SORT LOGIC: Sort by Match Score Descending
            const sortedResults = [...mergedResults].sort((a, b) => b.matchScore - a.matchScore);

            setRecommendations(sortedResults);
            
            // Buffer to show completion
            setTimeout(() => setView(AppView.RESULTS), 2000);
        } catch (e) {
            console.error("Failed to generate", e);
            setView(AppView.RESULTS);
        }
      }
    };

    const startDelay = setTimeout(() => {
        performAnalysis();
    }, 1500);

    return () => {
        clearInterval(interval);
        clearTimeout(startDelay);
    };
  }, [user, quizAnswers, setRecommendations, setView, savedCareers]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse-slow"></div>
        <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-500 animate-spin relative z-10" />
      </div>
      
      <h2 className="mt-8 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">
        Generating a career path for you
      </h2>
      
      {/* Updated Gemini Badge - Matching Landing/Dashboard style */}
      <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
            <path d="M12 24C12 24 10 14 0 12C10 10 12 0 12 0C12 0 14 10 24 12C14 14 12 24 12 24Z" />
         </svg>
         <span className="text-xs font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Powered by Gemini
         </span>
      </div>
      
      <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg animate-pulse min-h-[1.75rem]">
        {loadingText}
      </p>

      {/* Terminal Output */}
      <div ref={scrollRef} className="mt-12 w-full max-w-lg bg-white dark:bg-slate-950 rounded-lg p-6 font-mono text-xs md:text-sm text-slate-800 dark:text-green-400 border border-slate-300 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[350px] min-h-[280px] relative transition-colors scroll-smooth">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-slate-400 text-xs">console --active</span>
        </div>
        
        <div className="space-y-1">
            {displayLog.map((line, idx) => (
                <p key={idx} className="break-words font-semibold">
                    {line}
                    {idx === currentLineIndex && <span className="inline-block w-2 h-4 bg-slate-800 dark:bg-green-400 ml-1 animate-pulse align-middle"></span>}
                </p>
            ))}
        </div>
      </div>
    </div>
  );
};