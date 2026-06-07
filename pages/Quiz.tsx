import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AppView, CareerDomain } from '../types';
import { QUESTIONS } from '../constants';
import { Button } from '../components/Button';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { generateDomainSuggestion } from '../services/geminiService';

export const Quiz: React.FC = () => {
  const { 
    setView, 
    addQuizAnswer, 
    selectedDomain, 
    setDomain, 
    quizAnswers, 
    showConfirm, 
    hideConfirm,
    resetQuiz 
  } = useAppStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [showGeneralResult, setShowGeneralResult] = useState(false);
  const [suggestedDomain, setSuggestedDomain] = useState<CareerDomain | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const domainQuestions = QUESTIONS.filter(q => q.domain === selectedDomain);
  
  const currentQuestion = domainQuestions[currentIndex];
  const progress = ((currentIndex) / domainQuestions.length) * 100;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentIndex]);

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
        showConfirm({
            title: "Exit the quiz?",
            description: "Your answers so far will be lost. This will not use up one of your daily quizzes.",
            confirmText: "Exit quiz",
            cancelText: "Keep going",
            variant: "info",
            onConfirm: () => {
                hideConfirm();
                resetQuiz();
                setView(AppView.DASHBOARD);
            }
        });
    } else {
        resetQuiz();
        setView(AppView.DASHBOARD);
    }
  };

  if (isCalculating) {
      return <FullScreenLoader text="Checking your answers..." />;
  }

  if (showGeneralResult && suggestedDomain) {
      return (
        <div className="min-h-screen bg-paper dark:bg-[#14130f] flex items-center justify-center px-4 transition-colors duration-300 tex-grid">
            <div className="max-w-lg w-full bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper shadow-stamp-lg dark:shadow-stamp-light animate-fade-in-up">
                <div className="border-b-2 border-ink dark:border-paper px-7 py-3 bg-ink dark:bg-paper text-paper dark:text-ink flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Quiz result</span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Suggested field</span>
                </div>
                <div className="p-8 text-center">
                    <div className="w-14 h-14 bg-pine text-paper border-2 border-ink dark:border-paper shadow-stamp-sm dark:shadow-stamp-light flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={28} strokeWidth={2.25} />
                    </div>
                    <h2 className="font-display text-3xl text-ink dark:text-paper mb-3 leading-tight">Your answers fit {suggestedDomain}</h2>
                    <p className="font-serif text-lg text-ink/70 dark:text-paper/70 mb-8">
                        Take the <span className="text-vermillion font-bold capitalize">{suggestedDomain}</span> quiz next to get your career matches.
                    </p>
                    <div className="space-y-3">
                        <Button fullWidth size="lg" onClick={handleContinueToDomain}>
                            Take the {suggestedDomain} quiz
                        </Button>
                        <Button fullWidth variant="outline" onClick={handleExit}>
                            Back to dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (!currentQuestion) return null;

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14130f] flex flex-col items-center pt-24 px-4 transition-colors duration-300 tex-grid">
      <div className="w-full max-w-3xl fixed top-0 left-0 right-0 mx-auto px-4 z-10 bg-paper/95 dark:bg-[#14130f]/95 backdrop-blur-sm border-b-2 border-ink dark:border-paper/70 transition-colors">
        <div className="max-w-3xl mx-auto pt-4 pb-3">
          <div className="flex justify-between font-mono text-[11px] font-bold text-ink/60 dark:text-paper/60 mb-2 uppercase tracking-[0.18em]">
            <span className="capitalize">{selectedDomain} quiz</span>
            <span>Question {currentIndex + 1} of {domainQuestions.length}</span>
          </div>
          <div className="h-2 border-2 border-ink dark:border-paper/70 overflow-hidden">
            <div className="h-full bg-vermillion transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div key={currentQuestion.id} className="w-full max-w-3xl mt-8 pb-12">
        <span className="inline-block border-2 border-ink dark:border-paper/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/70 dark:text-paper/70 mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          {currentQuestion.category}
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-ink dark:text-paper mb-9 leading-[1.05] animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const active = selectedOption === option;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                style={{ animationDelay: `${200 + idx * 90}ms` }}
                className={`w-full text-left p-5 border-2 transition-all duration-150 flex items-center gap-4 group animate-fade-in-up opacity-0 ${
                  active
                    ? 'border-ink dark:border-paper bg-vermillion text-paper shadow-stamp-sm dark:shadow-stamp-light -translate-x-[1px] -translate-y-[1px]'
                    : 'border-ink dark:border-paper/70 bg-paper dark:bg-[#1c1a17] text-ink dark:text-paper hover:border-vermillion hover:bg-vermillion/[0.07] dark:hover:bg-vermillion/10 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp-sm dark:hover:shadow-stamp-light'
                }`}
              >
                <span className={`shrink-0 w-8 h-8 flex items-center justify-center border-2 font-display text-sm transition-colors ${active ? 'border-paper bg-paper/10 text-paper' : 'border-ink dark:border-paper/70 text-ink dark:text-paper group-hover:border-vermillion group-hover:text-vermillion'}`}>
                  {letters[idx] || idx + 1}
                </span>
                <span className="text-lg font-medium flex-1">{option}</span>
                {active && <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>

        <div className="mt-9 flex flex-col-reverse sm:flex-row gap-4 justify-between items-stretch sm:items-center animate-fade-in-up opacity-0" style={{ animationDelay: '600ms' }}>
          <Button variant="ghost" onClick={handleExit} className="w-full sm:w-auto">
            Exit quiz
          </Button>
          <Button size="lg" onClick={handleNext} disabled={!selectedOption} className="w-full sm:w-auto group">
            {currentIndex === domainQuestions.length - 1 ? (selectedDomain === 'general' ? 'See result' : 'See my matches') : 'Next question'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};