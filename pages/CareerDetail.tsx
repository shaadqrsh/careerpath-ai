import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ChevronLeft, PlayCircle, Heart, MapPin, Briefcase, GraduationCap, Loader2, ArrowRightCircle, Shuffle, Star, DollarSign, TrendingUp, AlertTriangle, ShieldAlert, Compass } from 'lucide-react';
import { generateCareerDetails } from '../services/geminiService';

export const CareerDetail: React.FC = () => {
  const { selectedCareer, setView, careerOrigin, user, toggleSavedCareer, savedCareers, isSavingCareer, recommendations, updateCareerDetails, showToast, showModal, hideModal } = useAppStore();
  
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    if (selectedCareer && !selectedCareer.detailsLoaded && user) {
        const fetchDetails = async () => {
            if (isMounted) setLoadingDetails(true);
            try {
                const details = await generateCareerDetails(user, selectedCareer);
                if (isMounted) {
                    updateCareerDetails(selectedCareer.id, details);
                }
            } catch (error: any) {
                console.error("Failed to load career details", error);
                if (error.message && error.message.includes("Usage limit reached")) {
                     showModal({
                        variant: 'danger',
                        title: "Usage Limit Reached",
                        description: "You have viewed too many career details today. Please come back tomorrow.",
                        buttonText: "Back to Dashboard",
                        onButtonClick: () => {
                            hideModal();
                            setView(AppView.DASHBOARD);
                        }
                    });
                } else {
                    showToast("Failed to load in-depth details. Please try refreshing.", 'error');
                }
            } finally {
                if (isMounted) setLoadingDetails(false);
            }
        };
        fetchDetails();
    }

    return () => { isMounted = false; };
  }, [selectedCareer, user, updateCareerDetails, showToast, showModal, hideModal, setView]);

  if (!selectedCareer) {
    setView(AppView.DASHBOARD);
    return null;
  }

  const targetCountryDisplay = user?.preferredWorkCountry === 'Undecided' ? 'USA' : user?.preferredWorkCountry;
  const isSameLocation = user?.residenceCountry === user?.preferredWorkCountry;
  const isSaved = savedCareers.some(c => c.id === selectedCareer.id);

  const backTarget = careerOrigin === 'saved' ? AppView.SAVED_PATHS : AppView.RESULTS;
  const backLabel = careerOrigin === 'saved' ? "Back to Saved Paths" : "Back to Results";

  const isBestMatch = careerOrigin === 'results' && recommendations.length > 0 && recommendations[0].id === selectedCareer.id;

  const handleSave = async () => {
    await toggleSavedCareer(selectedCareer);
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
    <div className="min-h-screen bg-paper dark:bg-[#14130f] text-ink dark:text-paper pb-20 md:pb-10 transition-colors">
      <div className="relative bg-ink dark:bg-[#0d0c0a] text-paper overflow-hidden py-8 border-b-2 border-ink dark:border-paper/70 tex-grid">
        <Compass className="absolute -right-16 -top-10 w-72 h-72 text-paper/[0.06] animate-spin-slow pointer-events-none" strokeWidth={0.5} />

        <div className="relative max-w-5xl mx-auto px-4 flex flex-col gap-6">
          <div className="flex justify-between items-center z-10 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <button
              onClick={() => setView(backTarget)}
              disabled={isSavingCareer || loadingDetails}
              className="font-mono text-[11px] uppercase tracking-widest text-paper/70 hover:text-paper flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-paper/40 px-3 py-1.5"
            >
              <ChevronLeft size={14} /> {backLabel}
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 hidden sm:block">Entry / Detail</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-2 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <div className="flex-1 min-w-0 pr-4">
              {isBestMatch && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pine text-paper border-2 border-paper text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
                  <Star size={11} fill="currentColor" /> Best match
                </div>
              )}

              <h1 className="font-display text-4xl md:text-6xl text-paper leading-[0.95] mb-4">
                {selectedCareer.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wide">
                <div className="flex items-center gap-1.5 border-2 border-paper/40 px-3 py-1.5 text-paper/90">
                  <DollarSign size={14} className="text-marigold shrink-0" strokeWidth={2.25} />
                  <span>{selectedCareer.salaryRange}</span>
                </div>
                <div className="flex items-center gap-1.5 border-2 border-paper/40 px-3 py-1.5 text-paper/90">
                  <TrendingUp size={14} className="text-marigold shrink-0" strokeWidth={2.25} />
                  <span>{formatGrowth(selectedCareer.growth)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleSave}
                disabled={isSavingCareer || loadingDetails}
                className={`p-3 border-2 transition-colors group ${
                  isSaved
                    ? 'bg-vermillion border-paper text-paper'
                    : 'border-paper/40 text-paper hover:bg-paper/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isSaved ? "Remove from collection" : "Save to collection"}
              >
                {isSavingCareer ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : 'fill-none'}`} strokeWidth={2.25} />
                )}
              </button>
              <Button
                variant="primary"
                onClick={() => setView(AppView.SLIDESHOW)}
                disabled={isSavingCareer || loadingDetails}
                className="whitespace-nowrap"
                title="View a day in life visualization"
              >
                <PlayCircle className="w-5 h-5" strokeWidth={2.25} />
                {isSavingCareer ? "Saving..." : (loadingDetails ? "Building route..." : "Day in the life")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-10">

        <section className="mb-14 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 bg-cobalt text-paper border-2 border-ink dark:border-paper shadow-stamp-sm dark:shadow-stamp-light flex items-center justify-center">
              <Briefcase size={18} strokeWidth={2.25} />
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-ink dark:text-paper">About this role</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-paper dark:bg-[#1c1a17] p-6 border-2 border-ink dark:border-paper shadow-stamp dark:shadow-stamp-light flex flex-col h-full animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
              <h3 className="font-display text-lg text-ink dark:text-paper mb-4">Why this fits you</h3>

              <div className="mb-4">
                <p className="font-mono text-[10px] font-bold text-ink/50 dark:text-paper/50 uppercase tracking-widest mb-2">Best suited for profiles with</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCareer.tags.map(t => (
                    <Badge key={t} variant="blue">{t}</Badge>
                  ))}
                </div>
              </div>

              <p className="font-serif text-ink/75 dark:text-paper/75 leading-relaxed text-lg border-t-2 border-dashed border-ink/30 dark:border-paper/30 pt-4 mt-auto">
                {selectedCareer.summary}
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-paper dark:bg-[#1c1a17] p-6 border-2 border-ink dark:border-paper shadow-stamp dark:shadow-stamp-light h-full animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
                <h3 className="font-display text-lg text-ink dark:text-paper mb-4">Key skills required</h3>
                {selectedCareer.skills && selectedCareer.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.skills.map(skill => (
                      <Badge key={skill} variant="slate">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-7 bg-ink/10 dark:bg-paper/10 w-24"></div>
                    ))}
                  </div>
                )}

                <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-ink/45 dark:text-paper/45">
                  Based on current market requirements in {targetCountryDisplay}.
                </p>
              </div>

              {selectedCareer.entryBarriers && (
                <div className="bg-marigold/10 p-6 border-2 border-marigold-600 animate-fade-in-up opacity-0" style={{ animationDelay: '450ms' }}>
                  <div className="flex items-center gap-2 mb-3 text-marigold-700 dark:text-marigold">
                    <ShieldAlert size={20} strokeWidth={2.25} />
                    <h3 className="font-mono font-bold uppercase tracking-widest text-xs">Potential barriers</h3>
                  </div>
                  <p className="font-serif text-ink/80 dark:text-paper/80 text-base leading-relaxed">
                    {selectedCareer.entryBarriers}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '500ms' }}>
            <span className="w-9 h-9 bg-pine text-paper border-2 border-ink dark:border-paper shadow-stamp-sm dark:shadow-stamp-light flex items-center justify-center">
              <GraduationCap size={18} strokeWidth={2.25} />
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-ink dark:text-paper">Your route ahead</h2>
          </div>

          {loadingDetails ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-ink/10 dark:bg-paper/10 border-2 border-ink/20 dark:border-paper/20"></div>
              <div className="h-40 bg-ink/10 dark:bg-paper/10 border-2 border-ink/20 dark:border-paper/20"></div>
              <div className="h-40 bg-ink/10 dark:bg-paper/10 border-2 border-ink/20 dark:border-paper/20"></div>
            </div>
          ) : (
            <div className="space-y-7 relative pl-8 ml-3 border-l-2 border-dashed border-ink dark:border-paper">

              <div className={`p-4 border-2 flex gap-4 animate-fade-in-up opacity-0 ${
                selectedCareer.isPivot
                  ? 'bg-marigold/10 border-marigold-600 text-ink dark:text-paper'
                  : 'bg-pine/10 border-pine text-ink dark:text-paper'
              }`} style={{ animationDelay: '600ms' }}>
                <div className="shrink-0 mt-0.5">
                  {selectedCareer.isPivot ? <Shuffle size={20} strokeWidth={2.25} /> : <ArrowRightCircle size={20} strokeWidth={2.25} />}
                </div>
                <div>
                  <h4 className="font-display text-base mb-1">
                    {selectedCareer.isPivot ? "Major pivot detected" : "Natural progression"}
                  </h4>
                  <p className="font-serif text-base opacity-90 leading-relaxed">
                    {selectedCareer.pivotAnalysis || `This route guides you from your background in ${user?.specialization || 'General Studies'} directly to your goal.`}
                  </p>
                </div>
              </div>

              {selectedCareer.roadmap?.map((step, idx) => {
                const hasLocalPath = step.localPath && step.localPath !== 'NA';
                const hasTargetPath = !isSameLocation && step.targetPath && step.targetPath !== 'NA';
                const pathCount = (hasLocalPath ? 1 : 0) + (hasTargetPath ? 1 : 0);
                return (
                  <div key={idx} className="relative group animate-fade-in-up opacity-0" style={{ animationDelay: `${700 + idx * 150}ms` }}>
                    <div className="absolute -left-[42px] top-6 w-6 h-6 bg-paper dark:bg-[#14130f] border-2 border-pine flex items-center justify-center font-mono text-[10px] font-bold text-pine z-10 group-hover:bg-pine group-hover:text-paper transition-colors">
                      {idx + 1}
                    </div>
                    <div className="bg-paper dark:bg-[#1c1a17] p-6 border-2 border-ink dark:border-paper shadow-stamp dark:shadow-stamp-light">
                      <span className="font-mono text-[10px] font-bold text-pine dark:text-pine tracking-widest uppercase mb-1 block">{step.duration}</span>
                      <h3 className="font-display text-xl text-ink dark:text-paper mb-2">{step.title}</h3>
                      <p className="font-serif text-ink/70 dark:text-paper/70 mb-4 text-lg leading-relaxed">{step.description}</p>

                      <div className={`grid grid-cols-1 ${pathCount === 2 ? 'md:grid-cols-2' : ''} gap-4 border-t-2 border-dashed border-ink/30 dark:border-paper/30 pt-4`}>
                        {hasLocalPath && (
                          <div className="bg-cobalt/5 dark:bg-cobalt/10 p-4 border-2 border-cobalt/40">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin size={13} className="text-cobalt" strokeWidth={2.25} />
                              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cobalt-600 dark:text-cobalt">
                                {isSameLocation ? `Path in ${user?.residenceCountry}` : `Option in ${user?.residenceCountry}`}
                              </span>
                            </div>
                            <p className="font-serif text-base text-ink/75 dark:text-paper/75 leading-relaxed">{step.localPath}</p>
                          </div>
                        )}

                        {hasTargetPath && (
                          <div className="bg-pine/5 dark:bg-pine/10 p-4 border-2 border-pine/40">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin size={13} className="text-pine" strokeWidth={2.25} />
                              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-pine dark:text-pine">
                                Option in {targetCountryDisplay}
                              </span>
                            </div>
                            <p className="font-serif text-base text-ink/75 dark:text-paper/75 leading-relaxed">{step.targetPath}</p>
                          </div>
                        )}
                      </div>

                      {step.challenges && (
                        <div className="mt-4 p-3 bg-vermillion/10 border-2 border-vermillion flex gap-3">
                          <AlertTriangle className="text-vermillion shrink-0 w-5 h-5" strokeWidth={2.25} />
                          <div>
                            <span className="block font-mono text-[10px] font-bold text-vermillion-600 dark:text-vermillion uppercase tracking-widest">Potential challenge</span>
                            <p className="font-serif text-base text-ink/80 dark:text-paper/80 mt-1">{step.challenges}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};