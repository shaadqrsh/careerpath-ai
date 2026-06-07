import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { generateCareerRecommendations } from '../services/geminiService';
import { getUserProfile } from '../services/supabaseService';
import { GeminiBadge } from '../components/GeminiBadge';
import { CompassMark } from '../components/FullScreenLoader';

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
  const { user, setUser, quizAnswers, setRecommendations, setView, savedCareers, showToast, showModal, hideModal } = useAppStore();
  const [loadingText, setLoadingText] = useState("Initializing neural networks...");
  
  const [displayLog, setDisplayLog] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [canStartTyping, setCanStartTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const hasStartedAnalysis = useRef(false);

  const targetLogs = React.useMemo(() => {
    if (!user) return [];
    
    const locationString = user.residenceCountry === user.preferredWorkCountry
        ? `> Location: ${user.residenceCountry}`
        : `> Location: ${user.residenceCountry} to ${user.preferredWorkCountry}`;

    return [
      `> Reading profile for ${user.fullName}`,
      `> Age ${user.age}, ${user.gender}`,
      `> Education: ${user.educationLevel}`,
      `> Field of study: ${user.specialization || 'General'}`,
      locationString
    ];
  }, [user]);

  useEffect(() => {
      const timer = setTimeout(() => {
          setCanStartTyping(true);
      }, 800);
      return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canStartTyping) return;
    if (currentLineIndex >= targetLogs.length) return;

    const currentLineText = targetLogs[currentLineIndex];
    let typeSpeed = 25; 
    
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
    
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    return () => clearTimeout(timeout);
  }, [currentLineIndex, currentCharIndex, targetLogs, canStartTyping]);


  useEffect(() => {
    const texts = [
      "Reading your responses...",
      "Mapping global market trends...",
      "Charting high-growth sectors...",
      "Plotting personalized routes..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 3000); 

    const performAnalysis = async () => {
      if (user) {
        if (hasStartedAnalysis.current) return;
        hasStartedAnalysis.current = true;

        try {
            const results = await generateCareerRecommendations(user, quizAnswers);
            
            const mergedResults = results.map(rec => {
                const existing = savedCareers.find(s => s.title.trim().toLowerCase() === rec.title.trim().toLowerCase());
                if (existing) return { ...existing, matchScore: rec.matchScore };
                return { ...rec, id: generateUUID() };
            });

            const sortedResults = [...mergedResults].sort((a, b) => b.matchScore - a.matchScore);
            setRecommendations(sortedResults);
            
            try {
                const updatedProfile = await getUserProfile(user.id);
                if (updatedProfile) setUser(updatedProfile);
            } catch (err) {
                console.warn("Failed to refresh quota", err);
            }

            setTimeout(() => setView(AppView.RESULTS), 2000);
        } catch (e: any) {
            hasStartedAnalysis.current = false;
            if (e.message === "QUOTA_EXCEEDED") {
                const limit = user.limits?.dailyCareerLimit ?? 5;
                showModal({
                    variant: 'danger',
                    title: "Daily Limit Reached",
                    description: <>You have used all <strong>{limit}</strong> of your career quizzes for today. Try again in 24 hours.</>,
                    buttonText: "Return to Dashboard",
                    onButtonClick: () => {
                        hideModal();
                        setView(AppView.DASHBOARD);
                    }
                });
            } else {
                showModal({
                    variant: 'warning',
                    title: "Analysis Failed",
                    description: "We encountered an issue while generating your career path. Please try again.",
                    buttonText: "Return to Dashboard",
                    onButtonClick: () => {
                        hideModal();
                        setView(AppView.DASHBOARD);
                    }
                });
            }
        }
      }
    };

    const startDelay = setTimeout(() => {
        if (!hasStartedAnalysis.current) {
            performAnalysis();
        }
    }, 1500);

    return () => {
        clearInterval(interval);
        clearTimeout(startDelay);
    };
  }, [user, quizAnswers, setRecommendations, setView, savedCareers, showToast, setUser, showModal, hideModal]);

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14130f] flex flex-col items-center justify-center p-4 transition-colors duration-300 tex-grid">
      <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
        <CompassMark size={56} className="text-vermillion mx-auto" />
      </div>

      <div className="animate-fade-in-up opacity-0 text-center" style={{ animationDelay: '150ms' }}>
        <h2 className="mt-8 font-display text-3xl md:text-4xl text-ink dark:text-paper leading-tight">
          Finding your career matches
        </h2>

        <div className="mt-4 flex justify-center">
          <GeminiBadge />
        </div>

        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-ink/60 dark:text-paper/60 animate-ticker min-h-[1.5rem]">
          {loadingText}
        </p>
      </div>

      <div ref={scrollRef} className="mt-10 w-full max-w-lg bg-ink dark:bg-[#0d0c0a] p-5 font-mono text-xs md:text-sm text-marigold border-2 border-ink dark:border-paper/70 shadow-stamp dark:shadow-stamp-light overflow-y-auto max-h-[330px] min-h-[260px] relative scroll-smooth animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-paper/30 pb-2 sticky top-0 bg-ink dark:bg-[#0d0c0a] z-10">
          <span className="text-paper/50 uppercase tracking-[0.2em] text-[10px]">Working</span>
          <span className="flex items-center gap-1.5 text-pine">
            <span className="w-2 h-2 bg-pine animate-pulse"></span>
            <span className="uppercase tracking-widest text-[10px]">live</span>
          </span>
        </div>

        <div className="space-y-1">
          {displayLog.map((line, idx) => (
            <p key={idx} className="break-words">
              {line}
              {idx === currentLineIndex && <span className="inline-block w-2 h-4 bg-marigold ml-1 animate-pulse align-middle"></span>}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};