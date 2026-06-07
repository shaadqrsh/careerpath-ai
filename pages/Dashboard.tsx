import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppView, CareerDomain } from '../types';
import { LogOut, User, Heart, ArrowRight, Zap, Image, Menu, X } from 'lucide-react';
import { APP_NAME } from '../constants';
import { GeminiBadge } from '../components/GeminiBadge';
import { DomainIcon } from '../components/DomainIcon';

export const Dashboard: React.FC = () => {
  const { setView, setDomain, savedCareers, hasViewedSavedPaths, user, logout, showModal, hideModal } = useAppStore();

  const [careerQuota, setCareerQuota] = useState(0);
  const [imageQuota, setImageQuota] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
        const getRemaining = (count: number | undefined, lastDateStr: string | undefined, limit: number) => {
            if (!lastDateStr) return limit;

            const lastDate = new Date(lastDateStr);
            const now = new Date();

            const isSameDay = lastDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];

            if (!isSameDay) return limit;
            return Math.max(0, limit - (count || 0));
        };

        const careerLimit = user.limits?.dailyCareerLimit ?? 5;
        const imageLimit = user.limits?.dailyImageLimit ?? 3;
        setCareerQuota(getRemaining(user.dailyCareerGenerationsCount, user.lastCareerGenerationDate, careerLimit));
        setImageQuota(getRemaining(user.dailyImageGenerationsCount, user.lastImageGenerationDate, imageLimit));
    }
  }, [user]);

  useEffect(() => {
      if (isMobileMenuOpen) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = 'unset';
      }
      return () => {
          document.body.style.overflow = 'unset';
      };
  }, [isMobileMenuOpen]);

  const handleStartQuiz = (domain: CareerDomain) => {
    if (domain === 'general') {
        const generalQuizLimit = user?.limits?.dailyGeneralQuizLimit ?? 20;
        if (user && (user.dailyGeneralQuizCount || 0) >= generalQuizLimit) {
            showModal({
                variant: 'danger',
                title: "Too many quizzes today",
                description: "You have started the general quiz too many times today. Try again tomorrow, or pick a specific field instead.",
                buttonText: "Got it",
                onButtonClick: hideModal
            });
            return;
        }
    } else {
        if (careerQuota <= 0) {
            const limit = user?.limits?.dailyCareerLimit ?? 5;
            showModal({
                variant: 'danger',
                title: "No quizzes left today",
                description: <>You have used all <strong>{limit}</strong> of your career quizzes for today. Try again in 24 hours.</>,
                buttonText: "Got it",
                onButtonClick: hideModal
            });
            return;
        }
    }

    setDomain(domain);
    setView(AppView.QUIZ);
  };

  const handleLogout = async () => {
      await logout();
      setView(AppView.LANDING);
  };

  const categories: { id: CareerDomain, no: string, title: string, desc: string }[] = [
    { id: 'science', no: 'I', title: 'Science & Tech', desc: 'Engineering · Medicine · Research' },
    { id: 'commerce', no: 'II', title: 'Commerce', desc: 'Business · Finance · Law' },
    { id: 'arts', no: 'III', title: 'Arts & Creative', desc: 'Design · Media · Humanities' },
  ];

  // Quota chip color: pine when available, vermillion when spent.
  const quotaTone = (current: number) =>
    current === 0
      ? "border-vermillion text-vermillion-600 dark:text-vermillion"
      : "border-ink dark:border-paper/60 text-ink dark:text-paper";

  const displayCareerLimit = user?.limits?.dailyCareerLimit ?? 5;
  const displayImageLimit = user?.limits?.dailyImageLimit ?? 3;

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14130f] text-ink dark:text-paper transition-colors duration-300">
      <nav className="border-b-2 border-ink dark:border-paper/70 bg-paper/95 dark:bg-[#14130f]/95 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-lg sm:text-xl text-ink dark:text-paper tracking-tight">
                {APP_NAME}
              </h1>
              <span className="hidden md:inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45 dark:text-paper/45 border-l-2 border-ink/20 dark:border-paper/20 pl-3">
                Career guidance
              </span>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 font-mono text-[11px] font-bold uppercase tracking-wide ${quotaTone(careerQuota)}`} title="Career quizzes left today">
                <Zap size={13} strokeWidth={2.25} />
                <span>{careerQuota}/{displayCareerLimit} quizzes</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 font-mono text-[11px] font-bold uppercase tracking-wide ${quotaTone(imageQuota)}`} title="Day-in-the-life image sets left today">
                <Image size={13} strokeWidth={2.25} />
                <span>{imageQuota}/{displayImageLimit} images</span>
              </div>

              <div className="h-6 w-0.5 bg-ink/20 dark:bg-paper/20 mx-1" />

              <button
                onClick={() => setView(AppView.SAVED_PATHS)}
                className="p-2 border-2 border-transparent text-ink/70 dark:text-paper/70 hover:text-paper hover:bg-vermillion hover:border-vermillion hover:-translate-y-[2px] hover:shadow-stamp-sm dark:hover:shadow-stamp-light transition-all relative"
                title="Saved Paths"
              >
                <Heart size={20} strokeWidth={2.25} />
                {savedCareers.length > 0 && !hasViewedSavedPaths && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-vermillion group-hover:bg-paper border border-paper dark:border-[#14130f]"></span>
                )}
              </button>
              <button
                onClick={() => setView(AppView.PROFILE)}
                className="p-2 border-2 border-transparent text-ink/70 dark:text-paper/70 hover:text-paper hover:bg-cobalt hover:border-cobalt hover:-translate-y-[2px] hover:shadow-stamp-sm dark:hover:shadow-stamp-light transition-all"
                title="Edit Profile"
              >
                <User size={20} strokeWidth={2.25} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 border-2 border-transparent text-ink/70 dark:text-paper/70 hover:text-paper dark:hover:text-ink hover:bg-ink dark:hover:bg-paper hover:border-ink dark:hover:border-paper hover:-translate-y-[2px] hover:shadow-stamp-sm dark:hover:shadow-stamp-light transition-all"
                title="Logout"
              >
                <LogOut size={20} strokeWidth={2.25} />
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 border-2 border-ink dark:border-paper text-ink dark:text-paper transition-all hover:bg-vermillion hover:text-paper hover:border-vermillion active:translate-x-[2px] active:translate-y-[2px]"
              >
                <Menu size={22} strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-paper dark:bg-[#14130f] animate-fade-in flex flex-col h-[100dvh]">
          <div className="p-4 border-b-2 border-ink dark:border-paper flex justify-between items-center shrink-0">
            <h2 className="font-display text-lg">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 border-2 border-ink dark:border-paper transition-all hover:bg-vermillion hover:text-paper hover:border-vermillion active:translate-x-[2px] active:translate-y-[2px]">
              <X size={22} strokeWidth={2.25} />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setView(AppView.SAVED_PATHS); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 font-display text-lg border-2 border-ink dark:border-paper p-3 hover:bg-vermillion hover:text-paper hover:border-vermillion transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp dark:hover:shadow-stamp-light active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <div className="relative">
                  <Heart size={22} strokeWidth={2.25} />
                  {savedCareers.length > 0 && !hasViewedSavedPaths && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-vermillion"></span>
                  )}
                </div>
                Saved Paths
              </button>
              <button
                onClick={() => { setView(AppView.PROFILE); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 font-display text-lg border-2 border-ink dark:border-paper p-3 hover:bg-cobalt hover:text-paper hover:border-cobalt transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp dark:hover:shadow-stamp-light active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <User size={22} strokeWidth={2.25} />
                Profile Settings
              </button>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 font-display text-lg border-2 border-ink dark:border-paper p-3 hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp dark:hover:shadow-stamp-light active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <LogOut size={22} strokeWidth={2.25} />
                Logout
              </button>
            </div>

            <div className="rule-dash text-ink/40 dark:text-paper/40"></div>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 border-2 font-mono uppercase tracking-wide text-sm ${quotaTone(careerQuota)}`}>
                <div className="flex items-center gap-3">
                  <Zap size={18} strokeWidth={2.25} />
                  <span>Quizzes left</span>
                </div>
                <span className="font-bold">{careerQuota}/{displayCareerLimit}</span>
              </div>
              <div className={`flex items-center justify-between p-3 border-2 font-mono uppercase tracking-wide text-sm ${quotaTone(imageQuota)}`}>
                <div className="flex items-center gap-3">
                  <Image size={18} strokeWidth={2.25} />
                  <span>Image sets left</span>
                </div>
                <span className="font-bold">{imageQuota}/{displayImageLimit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/55 dark:text-paper/55">
            {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Dashboard'}
          </span>
          <h2 className="mt-2 font-display text-5xl md:text-6xl leading-[0.92] max-w-3xl">
            Start a career quiz
          </h2>
          <p className="mt-4 font-serif text-lg text-ink/70 dark:text-paper/70 max-w-2xl">
            Pick a field below to take a focused quiz, or take the general quiz if you are not sure which field fits you.
          </p>
        </div>

        {careerQuota === 0 && (
          <div className="mb-10 p-4 border-2 border-vermillion bg-vermillion/10 text-vermillion-600 dark:text-vermillion flex flex-col sm:flex-row justify-between sm:items-center gap-2 animate-fade-in-up opacity-0 w-full" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3">
              <Zap className="shrink-0" size={20} strokeWidth={2.25} />
              <span className="font-bold uppercase tracking-wide text-sm">No quizzes left today</span>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest opacity-80">Resets in 24 hours</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {categories.map((cat, index) => (
            <div key={cat.id} style={{ animationDelay: `${200 + index * 100}ms` }} className="animate-fade-in-up opacity-0 h-full">
              <div
                className="group relative bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper p-7 cursor-pointer h-full flex flex-col shadow-stamp dark:shadow-stamp-light transition-all duration-150 hover:border-vermillion hover:bg-vermillion/[0.07] dark:hover:bg-vermillion/10 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                onClick={() => handleStartQuiz(cat.id)}
              >
                <div className="flex items-start justify-between mb-6">
                  <DomainIcon domain={cat.id} />
                  <span className="font-display text-5xl leading-none text-ink/15 dark:text-paper/15">{cat.no}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl mb-2">{cat.title}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-ink/55 dark:text-paper/55">{cat.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t-2 border-dashed border-ink/30 dark:border-paper/30 flex items-center justify-between font-bold uppercase tracking-wide text-sm text-vermillion">
                  <span>Take quiz</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ animationDelay: '500ms' }} className="animate-fade-in-up opacity-0">
          <div
            onClick={() => handleStartQuiz('general')}
            className="group relative w-full bg-ink dark:bg-paper text-paper dark:text-ink border-2 border-ink dark:border-paper p-7 md:p-8 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-stamp dark:shadow-stamp-light transition-all duration-150 hover:bg-vermillion hover:text-paper hover:border-vermillion dark:hover:border-vermillion hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <div className="flex items-center gap-5">
              <DomainIcon domain="general" />
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">Not sure which to pick?</span>
                <h3 className="font-display text-2xl md:text-3xl mt-1">Take the general quiz</h3>
              </div>
            </div>
            <span className="font-bold uppercase tracking-wide text-sm inline-flex items-center gap-2 whitespace-nowrap">
              Take quiz <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <GeminiBadge />
        </div>
      </main>
    </div>
  );
};
