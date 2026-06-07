import React from 'react';
import { useAppStore } from '../store';
import { AppView, CareerRecommendation } from '../types';
import { TrendingUp, DollarSign, ArrowRight, ArrowLeft, Heart, Star } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Results: React.FC = () => {
  const { 
    recommendations, 
    setSelectedCareer, 
    setView, 
    savedCareers, 
    setCareerOrigin, 
    user, 
    showModal, 
    hideModal,
    showConfirm,
    hideConfirm 
  } = useAppStore();

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
    setCareerOrigin('results'); 
    setView(AppView.CAREER_DETAIL);
  };

  const isSaved = (id: string) => savedCareers.some(c => c.id === id);

  const handleBackAttempt = () => {
    const hasUnsavedCareers = recommendations.some(rec => !isSaved(rec.id));

    if (hasUnsavedCareers) {
      showConfirm({
        title: "Discard Results?",
        description: "You have unsaved career recommendations. If you go back now, these results will be lost forever.",
        confirmText: "Yes, Discard",
        cancelText: "Stay Here",
        variant: 'danger',
        onConfirm: () => {
            hideConfirm();
            setView(AppView.DASHBOARD);
        }
      });
    } else {
      setView(AppView.DASHBOARD);
    }
  };

  const formatGrowth = (growth: string) => {
    const match = growth.match(/^([^(]+)(\s*\(.*\))?$/);
    if (match) {
        const magnitude = match[1].trim();
        const details = match[2] ? match[2].trim() : '';
        if (magnitude.toLowerCase().includes('growth')) return growth; 
        return `${magnitude} Growth ${details}`;
    }
    return `${growth} Growth`;
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14130f] py-8 px-4 sm:px-6 lg:px-8 pb-32 transition-colors tex-grid">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
          <button
            onClick={handleBackAttempt}
            className="group font-mono text-[11px] font-bold uppercase tracking-widest border-2 border-ink dark:border-paper text-ink dark:text-paper bg-paper dark:bg-[#1c1a17] px-3 py-1.5 flex items-center gap-2 transition-all duration-150 hover:bg-vermillion hover:text-paper hover:border-vermillion hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp-sm dark:hover:shadow-stamp-light"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to dashboard
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/45 dark:text-paper/45">
            {recommendations.length} matches
          </span>
        </div>

        <div className="mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display text-5xl md:text-6xl text-ink dark:text-paper leading-[0.92]">Your top matches.</h2>
          <p className="mt-4 font-serif text-lg text-ink/70 dark:text-paper/70 max-w-2xl">Based on your survey, here are the paths where you would genuinely thrive. Tap any entry to explore the full route.</p>
        </div>

        <div className="space-y-5">
          {recommendations.map((career, index) => {
            const isBestMatch = index === 0;
            const saved = isSaved(career.id);

            return (
              <div key={career.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${200 + index * 120}ms` }}>
                <div
                  onClick={() => handleSelect(career)}
                  className={`group relative bg-paper dark:bg-[#1c1a17] border-2 p-6 md:p-7 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center shadow-stamp dark:shadow-stamp-light transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${isBestMatch ? 'border-pine' : 'border-ink dark:border-paper'}`}
                >
                  {/* rank numeral */}
                  <span className="absolute top-3 right-4 font-display text-5xl leading-none text-ink/10 dark:text-paper/10 select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* score stamp */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className={`w-20 h-20 flex flex-col items-center justify-center border-2 border-ink dark:border-paper ${isBestMatch ? 'bg-pine text-paper' : 'bg-paper dark:bg-[#14130f] text-ink dark:text-paper'}`}>
                      <span className="font-display text-2xl leading-none">{career.matchScore}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest mt-0.5 opacity-70">match</span>
                    </div>
                  </div>

                  <div className="flex-grow relative z-10 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {isBestMatch && (
                        <span className="inline-flex items-center gap-1 bg-pine text-paper px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest">
                          <Star size={11} fill="currentColor" /> Best match
                        </span>
                      )}
                      {saved && (
                        <span className="inline-flex items-center gap-1 text-vermillion font-mono text-[9px] font-bold uppercase tracking-widest">
                          <Heart size={11} fill="currentColor" /> Saved
                        </span>
                      )}
                      {career.tags.map(t => (
                        <Badge key={t} variant={isBestMatch ? 'green' : 'slate'}>{t}</Badge>
                      ))}
                    </div>
                    <h3 className="font-display text-2xl text-ink dark:text-paper mb-2 group-hover:text-vermillion transition-colors">{career.title}</h3>
                    <p className="font-serif text-ink/70 dark:text-paper/70 mb-4 max-w-2xl line-clamp-2 text-base md:text-lg">{career.summary}</p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wide text-ink/60 dark:text-paper/60">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-pine" strokeWidth={2.25} />
                        {career.salaryRange}
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-cobalt" strokeWidth={2.25} />
                        {formatGrowth(career.growth)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-end md:self-center relative z-10">
                    <span className="font-bold uppercase tracking-wide text-sm text-vermillion inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};