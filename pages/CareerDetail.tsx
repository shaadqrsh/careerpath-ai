import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { ChevronLeft, PlayCircle, Heart, MapPin, Briefcase, GraduationCap, Loader2, ArrowRightCircle, Shuffle, Star, DollarSign, TrendingUp, AlertOctagon, AlertTriangle, ShieldAlert } from 'lucide-react';
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
                        icon: <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-6" />,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pb-20 md:pb-10 transition-colors">
      <div className="relative min-h-[16rem] h-auto bg-slate-800 overflow-hidden py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col gap-6">
            <div className="flex justify-between items-center z-10 animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
                <button 
                    onClick={() => setView(backTarget)}
                    disabled={isSavingCareer || loadingDetails}
                    className="text-white/80 hover:text-white flex items-center gap-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
                >
                    <ChevronLeft size={20} /> {backLabel}
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4 mt-auto animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
                <div className="flex-1 min-w-0 pr-4">
                    {isBestMatch && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
                            <Star size={12} fill="currentColor" />
                            Best Match
                        </div>
                    )}
                    
                    <h1 className="text-4xl md:text-5xl font-bold text-white whitespace-normal mb-4 leading-tight">
                        {selectedCareer.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md text-white/90 shrink-0 max-w-full">
                            <DollarSign size={16} className="text-green-400 shrink-0" />
                            <span className="font-medium text-wrap">{selectedCareer.salaryRange}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md text-white/90 shrink-0 max-w-full">
                            <TrendingUp size={16} className="text-blue-400 shrink-0" />
                            <span className="font-medium text-wrap">{formatGrowth(selectedCareer.growth)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3 shrink-0">
                     <button 
                        onClick={handleSave}
                        disabled={isSavingCareer || loadingDetails}
                        className={`p-3 rounded-full backdrop-blur border transition-all duration-300 group hover:scale-110 active:scale-95 ${
                            isSaved 
                            ? 'bg-pink-500/20 border-pink-500/50 text-pink-500' 
                            : 'bg-white/10 dark:bg-slate-800/50 border-white/20 dark:border-slate-600 hover:bg-white/20 dark:hover:bg-slate-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={isSaved ? "Unsave Career" : "Save Career"}
                     >
                        {isSavingCareer ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Heart 
                                className={`w-6 h-6 transition-transform duration-300 ${isSaved ? 'scale-110 fill-current group-hover:fill-none' : 'fill-none'}`} 
                            />
                        )}
                     </button>
                     <Button 
                        onClick={() => setView(AppView.SLIDESHOW)}
                        disabled={isSavingCareer || loadingDetails} 
                        className="shadow-xl shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        title="View a day in life visualization"
                     >
                        <PlayCircle className="w-5 h-5 mr-2" />
                        {isSavingCareer ? "Saving..." : (loadingDetails ? "Generating Roadmap..." : "View Day in Life")}
                     </Button>
                </div>
            </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        
        <section className="mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6 text-slate-800 dark:text-white">
                <Briefcase className="text-blue-600 dark:text-blue-400" size={28} />
                <h2 className="text-2xl font-bold">About this Role</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Why this fits you</h3>
                        
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Best suited for profiles with:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedCareer.tags.map(t => (
                                    <span key={t} className="px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">{t}</span>
                                ))}
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg border-t border-slate-200 dark:border-slate-700 pt-4 mt-auto">
                            {selectedCareer.summary}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm h-full animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Key Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Strategic Thinking', 'Data Analysis', 'Communication', 'Project Management', 'Technical Proficiency'].map(skill => (
                                <span key={skill} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                                    {skill}
                                </span>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-slate-500">
                            * Based on current market requirements in {targetCountryDisplay}.
                        </p>
                    </div>

                    {selectedCareer.entryBarriers && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-6 border border-amber-200 dark:border-amber-800 shadow-sm animate-fade-in-up opacity-0" style={{ animationDelay: '450ms' }}>
                             <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-500">
                                <ShieldAlert size={20} />
                                <h3 className="font-bold uppercase tracking-wide text-sm">Potential Barriers</h3>
                             </div>
                             <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                                {selectedCareer.entryBarriers}
                             </p>
                        </div>
                    )}
                </div>
            </div>
        </section>

        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6 text-slate-800 dark:text-white animate-fade-in-up opacity-0" style={{ animationDelay: '500ms' }}>
                <GraduationCap className="text-green-600 dark:text-green-400" size={28} />
                <h2 className="text-2xl font-bold">Your Education Roadmap</h2>
            </div>
            
            {loadingDetails ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
            ) : (
                <div className="space-y-8 relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 ml-4">
                    
                    <div className={`mb-6 p-4 rounded-lg border flex gap-4 animate-fade-in-up opacity-0 ${
                        selectedCareer.isPivot 
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-100' 
                        : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-900 dark:text-green-100'
                    }`} style={{ animationDelay: '600ms' }}>
                        <div className="shrink-0 mt-1">
                            {selectedCareer.isPivot ? <Shuffle size={20} /> : <ArrowRightCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold mb-1">
                                {selectedCareer.isPivot ? "Major Pivot Detected" : "Natural Progression"}
                            </h4>
                            <p className="text-sm opacity-90">
                                {selectedCareer.pivotAnalysis || `This roadmap guides you from your background in ${user?.specialization || 'General Studies'} directly to your goal.`}
                            </p>
                        </div>
                    </div>

                    {selectedCareer.roadmap?.map((step, idx) => (
                        <div key={idx} className="relative group animate-fade-in-up opacity-0" style={{ animationDelay: `${700 + (idx * 150)}ms` }}>
                            <div className="absolute -left-[46px] top-6 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-green-500 group-hover:bg-green-500 transition-colors z-10"></div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 tracking-wider uppercase mb-1 block">{step.duration}</span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">{step.description}</p>
                                
                                <div className={`grid grid-cols-1 ${!isSameLocation && step.targetPath && step.targetPath !== 'NA' ? 'md:grid-cols-2' : ''} gap-4 border-t border-slate-200 dark:border-slate-700 pt-4`}>
                                    {step.localPath && step.localPath !== 'NA' && (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin size={14} className="text-blue-500" />
                                                <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                                                    {isSameLocation ? `Path in ${user?.residenceCountry}` : `Option in ${user?.residenceCountry}`}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.localPath}</p>
                                        </div>
                                    )}
                                    
                                    {!isSameLocation && step.targetPath && step.targetPath !== 'NA' && (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin size={14} className="text-green-500" />
                                                <span className="text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
                                                    Option in {targetCountryDisplay}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.targetPath}</p>
                                        </div>
                                    )}
                                </div>

                                {step.challenges && (
                                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg flex gap-3">
                                        <AlertTriangle className="text-red-500 shrink-0 w-5 h-5" />
                                        <div>
                                            <span className="block text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Potential Challenge</span>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{step.challenges}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
      </main>
    </div>
  );
};