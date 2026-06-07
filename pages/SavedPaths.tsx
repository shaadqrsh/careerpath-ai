import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppView, CareerRecommendation } from '../types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ArrowLeft, Trash2, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import { getSavedCareers } from '../services/supabaseService';

export const SavedPaths: React.FC = () => {
  const { savedCareers, setView, toggleSavedCareer, setSelectedCareer, setCareerOrigin, user, setSavedCareers, showToast, showModal, hideModal } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelect = (career: CareerRecommendation) => {
    const detailsLimit = user?.limits?.dailyDetailsViewLimit || 50;
    if (!career.detailsLoaded && user && (user.dailyDetailsViewCount || 0) >= detailsLimit) {
        showModal({
            variant: 'danger',
            title: "Usage Limit Reached",
            description: "You have viewed too many new career details today. Please stick to the careers you have already opened or come back tomorrow.",
            buttonText: "Okay",
            onButtonClick: hideModal
        });
        return;
    }

    setSelectedCareer(career);
    setCareerOrigin('saved'); 
    setView(AppView.CAREER_DETAIL);
  };

  const handleRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
        const saved = await getSavedCareers(user.id);
        setSavedCareers(saved);
        if (saved.length > 0) {
            // showToast("Careers refreshed", 'success');
        } else {
            // showToast("No saved careers found", 'success');
        }
    } catch(e) {
        // showToast("Failed to refresh careers", 'error');
    } finally {
        setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14130f] py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-10 transition-colors duration-300 tex-grid">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          <button
            onClick={() => setView(AppView.DASHBOARD)}
            className="group font-mono text-[11px] font-bold uppercase tracking-widest border-2 border-ink dark:border-paper text-ink dark:text-paper bg-paper dark:bg-[#1c1a17] px-3 py-1.5 flex items-center gap-2 transition-all duration-150 hover:bg-vermillion hover:text-paper hover:border-vermillion hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp-sm dark:hover:shadow-stamp-light"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to dashboard
          </button>
        </div>

        <div className="mb-10 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display text-5xl md:text-6xl text-ink dark:text-paper leading-[0.92]">Your collection.</h2>
          <p className="mt-4 font-serif text-lg text-ink/70 dark:text-paper/70">
            {savedCareers.length === 0
              ? "Nothing pressed into the almanac yet."
              : `${savedCareers.length} path${savedCareers.length === 1 ? '' : 's'} saved for later.`}
          </p>
        </div>

        <div className="space-y-5">
          {savedCareers.map((career, index) => (
            <div key={career.id} style={{ animationDelay: `${200 + index * 100}ms` }} className="flex items-stretch gap-4 relative animate-fade-in-up opacity-0">
              <div
                onClick={() => handleSelect(career)}
                className="group flex-1 relative bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper p-6 md:p-7 flex flex-col md:flex-row gap-6 md:items-center shadow-stamp dark:shadow-stamp-light cursor-pointer transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <div className="flex-grow relative z-10 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {career.tags.map(t => (
                      <Badge key={t} variant="slate">{t}</Badge>
                    ))}
                  </div>
                  <h3 className="font-display text-2xl text-ink dark:text-paper mb-2 group-hover:text-vermillion transition-colors">{career.title}</h3>
                  <p className="font-serif text-ink/70 dark:text-paper/70 mb-4 max-w-2xl line-clamp-2 text-base md:text-lg">{career.summary}</p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wide text-ink/60 dark:text-paper/60">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-cobalt" strokeWidth={2.25} />
                      {career.matchScore}% match
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-pine" strokeWidth={2.25} />
                      {career.salaryRange}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 self-end md:self-center relative z-10">
                  <span className="font-bold uppercase tracking-wide text-sm text-vermillion inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    View details <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); toggleSavedCareer(career); }}
                title="Remove from collection"
                className="group hidden md:flex flex-shrink-0 w-14 border-2 border-ink dark:border-paper bg-paper dark:bg-[#1c1a17] text-ink dark:text-paper hover:bg-vermillion hover:text-paper hover:border-vermillion items-center justify-center transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp dark:hover:shadow-stamp-light active:translate-x-[2px] active:translate-y-[2px] active:shadow-none z-20"
              >
                <Trash2 size={20} strokeWidth={2.25} className="transition-transform group-hover:scale-110" />
              </button>
            </div>
          ))}
        </div>

        {savedCareers.length === 0 && (
          <div className="mt-8 p-10 border-2 border-dashed border-ink/40 dark:border-paper/40 text-center animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
            <p className="font-serif text-lg text-ink/70 dark:text-paper/70">Run a survey to find paths worth keeping.</p>
            <div className="mt-5 flex justify-center">
              <Button onClick={() => setView(AppView.DASHBOARD)}>Explore careers</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};