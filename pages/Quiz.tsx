import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, CareerDomain } from '../types';
import { QUESTIONS } from '../constants';
import { Button } from '../components/Button';
import { CheckCircle2, ChevronRight, Loader2, AlertOctagon } from 'lucide-react';
import { generateDomainSuggestion } from '../services/geminiService';
import { ConfirmModal } from '../components/ConfirmModal';

export const Quiz: React.FC = () => {
  const { setView, addQuizAnswer, selectedDomain, setDomain, quizAnswers, user, showModal, hideModal, resetQuiz } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [showGeneralResult, setShowGeneralResult] = useState(false);
  const [suggestedDomain, setSuggestedDomain] = useState<CareerDomain | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const domainQuestions = QUESTIONS.filter(q => q.domain === selectedDomain);
  
  const currentQuestion = domainQuestions[currentIndex];
  const progress = ((currentIndex) / domainQuestions.length) * 100;

  useEffect(() => {
    if (user) {
        const lastDateStr = user.lastCareerGenerationDate;
        const dailyLimit = user.limits?.dailyCareerLimit ?? 5;
        let remaining = dailyLimit;
        
        if (lastDateStr) {
            const lastDate = new Date(lastDateStr);
            const now = new Date();
            const isSameDay = lastDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
            
            if (isSameDay) {
                remaining = Math.max(0, dailyLimit - (user.dailyCareerGenerationsCount || 0));
            }
        }
        if (selectedDomain !== 'general' && remaining <= 0) {
            setQuotaExceeded(true);
        }
    }
  }, [user, selectedDomain]);

  useEffect(() => {
    if (quotaExceeded) {
        const dailyLimit = user?.limits?.dailyCareerLimit ?? 5;
        showModal({
            icon: <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-6" />,
            title: "Daily Limit Reached",
            description: <>You've reached your daily limit of <strong>{dailyLimit}</strong> career assessments. Please return in 24 hours to explore more paths.</>,
            buttonText: "Return to Dashboard",
            onButtonClick: () => {
                hideModal();
                setView(AppView.DASHBOARD);
            }
        });
    }
  }, [quotaExceeded, showModal, hideModal, setView, user]);

  useEffect(() => {
    if (domainQuestions.length === 0 && !showGeneralResult) {
        setView(AppView.DASHBOARD);
    }
  }, [domainQuestions, setView, showGeneralResult]);

  const calculateSuggestion = async () => {
    setIsCalculating(true);
    try {
        const domain = await generateDomainSuggestion(quizAnswers);
        setSuggestedDomain(domain);
    } catch (e) {
        console.error("Failed to get suggestion", e);
        setSuggestedDomain('general');
    } finally {
        setIsCalculating(false);
        setShowGeneralResult(true);
    }
  };

  const handleNext = () => {
    if (selectedOption && currentQuestion) {
      addQuizAnswer({
        questionId: currentQuestion.id,
        answer: selectedOption,
        domain: selectedDomain
      });

      if (currentIndex < domainQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        if (selectedDomain === 'general') {
            calculateSuggestion();
        } else {
            setView(AppView.ANALYSIS);
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && selectedOption) {
            e.preventDefault(); 
            handleNext();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, currentIndex]); 

  const handleContinueToDomain = () => {
    if (suggestedDomain) {
        setDomain(suggestedDomain);
        setCurrentIndex(0); 
        setSelectedOption(null);
        setShowGeneralResult(false);
    }
  };

  const handleExit = () => {
    if (showGeneralResult || quizAnswers.length > 0) {
        setShowExitConfirm(true);
    } else {
        resetQuiz();
        setView(AppView.DASHBOARD);
    }
  };
  
  const confirmExit = () => {
    resetQuiz();
    setView(AppView.DASHBOARD);
  };

  if (quotaExceeded) {
      return null;
  }

  if (isCalculating) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center transition-colors duration-300">
             <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
             <p className="text-slate-600 dark:text-slate-300 text-lg animate-pulse">Analyzing your preferences...</p>
        </div>
      );
  }

  if (showGeneralResult && suggestedDomain) {
      return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 transition-colors duration-300">
                <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center animate-fade-in-up shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Initial Analysis Complete</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
                        Based on your general preferences, AI suggests you explore <span className="text-blue-600 dark:text-blue-400 font-bold capitalize">{suggestedDomain}</span>.
                    </p>
                    <div className="space-y-4">
                        <Button fullWidth size="lg" onClick={handleContinueToDomain}>
                            Continue to {suggestedDomain.charAt(0).toUpperCase() + suggestedDomain.slice(1)} Quiz
                        </Button>
                        <Button fullWidth variant="outline" onClick={handleExit}>
                            Back to Main Menu
                        </Button>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={showExitConfirm}
                onClose={() => setShowExitConfirm(false)}
                onConfirm={confirmExit}
                title="Exit Assessment?"
                description="If you exit now, your quiz progress will be lost. This will not use up a career assessment credit."
                confirmText="Yes, Exit"
                cancelText="Stay Here"
                variant="info"
            />
        </>
      );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center pt-20 px-4 transition-colors duration-300">
      <div className="w-full max-w-3xl fixed top-0 left-0 right-0 mx-auto pt-8 px-4 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm pb-4 transition-colors">
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
          <span>{selectedDomain} Assessment</span>
          <span>{currentIndex + 1} / {domainQuestions.length}</span>
        </div>
        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div 
        key={currentQuestion.id} 
        className="w-full max-w-3xl mt-8 pb-10"
      >
        <span className="text-blue-600 dark:text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-2 block animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          {currentQuestion.category}
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 leading-tight transition-colors animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          {currentQuestion.text}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(option)}
              style={{ animationDelay: `${200 + (idx * 100)}ms` }}
              className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group animate-fade-in-up opacity-0 ${
                selectedOption === option 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-white shadow-md' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-lg font-medium">{option}</span>
              {selectedOption === option && (
                <CheckCircle2 className="text-blue-500 w-6 h-6 animate-[scaleIn_0.2s_ease-out]" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse sm:flex-row gap-4 justify-between animate-fade-in-up opacity-0" style={{ animationDelay: '600ms' }}>
            <Button 
                variant="ghost" 
                onClick={handleExit}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 w-full sm:w-auto"
            >
                Exit Quiz
            </Button>
            <Button 
                size="lg" 
                onClick={handleNext} 
                disabled={!selectedOption}
                className="w-full sm:w-auto"
            >
                {currentIndex === domainQuestions.length - 1 ? (selectedDomain === 'general' ? 'See Recommendation' : 'Finish Analysis') : 'Next Question'}
                <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
      </div>
    </div>
  );
};