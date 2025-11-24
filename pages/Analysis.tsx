import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { generateCareerRecommendations } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

export const Analysis: React.FC = () => {
  const { user, quizAnswers, setRecommendations, setView } = useAppStore();
  const [loadingText, setLoadingText] = useState("Initializing neural networks...");
  
  // Typing Effect State
  const [displayLog, setDisplayLog] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Define the target logs based on user data
  // We split the "Analyzing" line to simulate the pause before [OK]
  const targetLogs = React.useMemo(() => {
    if (!user) return [];
    return [
      `> Initializing session for: ${user.fullName}`,
      `> Demographics: ${user.age} yrs / ${user.gender}`,
      `> Education: ${user.educationLevel}`,
      `> Specialization: ${user.specialization || 'N/A'}`,
      `> Location Context: ${user.residenceCountry} -> ${user.preferredWorkCountry}`,
      `> Analyzing aptitude patterns...`, 
      `> ... [OK]`, // This line will appear after a pause
      `> AI Model: Active` // This will also have a slight pause before appearing
    ];
  }, [user]);

  // Typing Effect Logic
  useEffect(() => {
    if (currentLineIndex >= targetLogs.length || isPaused) return;

    const currentLineText = targetLogs[currentLineIndex];
    
    // determine typing speed
    let typeSpeed = 20;
    
    // If we are about to start typing the "[OK]" line or "AI Model" line, we want a pause first.
    // We handle this by checking if charIndex is 0.
    if (currentCharIndex === 0) {
        if (currentLineText.includes("[OK]")) {
            setIsPaused(true);
            setTimeout(() => setIsPaused(false), 800); // 800ms pause before showing OK
            return;
        }
        if (currentLineText.includes("AI Model")) {
            setIsPaused(true);
            setTimeout(() => setIsPaused(false), 600); // 600ms pause before activating model
            return;
        }
    }

    const timeout = setTimeout(() => {
      // If we haven't finished typing the current line
      if (currentCharIndex < currentLineText.length) {
        const nextChar = currentLineText[currentCharIndex];
        
        setDisplayLog(prevLogs => {
          const newLogs = [...prevLogs];
          if (newLogs[currentLineIndex] === undefined) {
            newLogs[currentLineIndex] = nextChar;
          } else {
            newLogs[currentLineIndex] = newLogs[currentLineIndex] + nextChar;
          }
          return newLogs;
        });
        
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // Line finished, move to next line
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, typeSpeed); 

    return () => clearTimeout(timeout);
  }, [currentLineIndex, currentCharIndex, targetLogs, isPaused]);


  useEffect(() => {
    // Rotating loading text
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

    // Actual Analysis Call
    const performAnalysis = async () => {
      if (user) {
        try {
            const results = await generateCareerRecommendations(user, quizAnswers);
            setRecommendations(results);
            // Ensure the typing animation has enough time to be seen before navigating
            // Wait for the last log line to potentially finish + buffer
            setTimeout(() => setView(AppView.RESULTS), 2500);
        } catch (e) {
            console.error("Failed to generate", e);
            setView(AppView.RESULTS);
        }
      }
    };

    // Small delay before starting the heavy API call to let UI settle
    const startDelay = setTimeout(() => {
        performAnalysis();
    }, 1000);

    return () => {
        clearInterval(interval);
        clearTimeout(startDelay);
    };
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

      {/* Terminal Output */}
      <div className="mt-12 w-full max-w-lg bg-gray-100 dark:bg-slate-950 rounded-lg p-6 font-mono text-xs md:text-sm text-slate-700 dark:text-green-400 border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden min-h-[250px] relative transition-colors">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-300 dark:border-gray-700 pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-slate-500 text-xs">console --active</span>
        </div>
        
        <div className="space-y-1">
            {displayLog.map((line, idx) => (
                <p key={idx} className="break-words">
                    {line}
                    {/* Blinking cursor only on the active line */}
                    {idx === currentLineIndex && <span className="inline-block w-2 h-4 bg-slate-700 dark:bg-green-400 ml-1 animate-pulse align-middle"></span>}
                </p>
            ))}
        </div>
      </div>
    </div>
  );
};