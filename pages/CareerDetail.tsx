import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppView } from '../types';
import { Button } from '../components/Button';
import { ChevronLeft, PlayCircle, Heart, MapPin, Briefcase, GraduationCap, Loader2, ArrowRightCircle, Shuffle, Sun, Moon, Star } from 'lucide-react';

export const CareerDetail: React.FC = () => {
  const { selectedCareer, setView, careerOrigin, user, toggleSavedCareer, savedCareers, isSavingCareer, theme, toggleTheme, recommendations } = useAppStore();

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

  return (
    // Added pb-32 for extra bottom padding on mobile
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pb-32 transition-colors">
      {/* Header */}
      <div className="relative h-64 bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
                <button 
                    onClick={() => setView(backTarget)}
                    disabled={isSavingCareer}
                    className="text-white/80 hover:text-white flex items-center gap-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} /> {backLabel}
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-white/70 hover:text-white transition-colors rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40"
                >
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </div>
            
            <div className="flex justify-between items-end">
                <div className="flex-1 min-w-0 mr-4">
                    {isBestMatch && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
                            <Star size={12} fill="currentColor" />
                            Best Match
                        </div>
                    )}
                    
                    {/* Scrolling Text for Title */}
                    <div className="overflow-hidden relative w-full">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white whitespace-nowrap animate-marquee md:animate-none">
                            {selectedCareer.title}
                        </h1>
                    </div>

                    {/* Scrolling Text for Stats */}
                    <div className="overflow-hidden relative w-full">
                        <div className="flex items-center gap-4 text-slate-300 whitespace-nowrap animate-marquee md:animate-none text-sm md:text-base">
                            <span>{selectedCareer.salaryRange}</span>
                            <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                            <span>{selectedCareer.growth} Growth</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3 shrink-0">
                     <button 
                        onClick={handleSave}
                        disabled={isSavingCareer}
                        className={`p-3 rounded-full backdrop-blur border transition-colors ${
                            isSaved 
                            ? 'bg-pink-500/20 border-pink-500/50 text-pink-500' 
                            : 'bg-white/10 dark:bg-slate-800/50 border-white/20 dark:border-slate-600 hover:bg-white/20 dark:hover:bg-slate-700 text-white'
                        }`}
                     >
                        {isSavingCareer ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Heart className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} />
                        )}
                     </button>
                     <Button 
                        onClick={() => setView(AppView.SLIDESHOW)}
                        disabled={isSavingCareer} 
                        className="shadow-xl shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <PlayCircle className="w-5 h-5 mr-2" />
                        {isSavingCareer ? "Saving..." : "View Day in Life"}
                     </Button>
                </div>
            </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* Job Details Section */}
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6 text-slate-800 dark:text-white">
                <Briefcase className="text-blue-600 dark:text-blue-400" size={28} />
                <h2 className="text-2xl font-bold">About this Role</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
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

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
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
            </div>
        </section>

        {/* Roadmap Section */}
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6 text-slate-800 dark:text-white">
                <GraduationCap className="text-green-600 dark:text-green-400" size={28} />
                <h2 className="text-2xl font-bold">Your Education Roadmap</h2>
            </div>
            
            <div className="space-y-8 relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 ml-4">
                
                {/* Pivot / Progression Logic Box */}
                <div className={`mb-6 p-4 rounded-lg border flex gap-4 ${
                    selectedCareer.isPivot 
                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-100' 
                    : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-900 dark:text-green-100'
                }`}>
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

                {selectedCareer.roadmap.map((step, idx) => (
                    <div key={idx} className="relative group">
                        <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-green-500 group-hover:bg-green-500 transition-colors z-10"></div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 tracking-wider uppercase mb-1 block">{step.duration}</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">{step.description}</p>
                            
                            {/* Split View for Locations */}
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
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </div>
  );
};