
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { AppView, Slide } from '../types';
import { generateStorySlides } from '../services/geminiService';
import { uploadCareerImages, saveCareerToDb } from '../services/supabaseService';
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff, AlertOctagon } from 'lucide-react';
import { DAILY_GENERATION_LIMIT } from '../constants';

export const Slideshow: React.FC = () => {
  const { selectedCareer, setView, user, updateCareerImages, savedCareers } = useAppStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [quotaError, setQuotaError] = useState(false);
  const [allFailed, setAllFailed] = useState(false);
  
  // Refs for safety checks
  const hasStartedRef = useRef(false);
  const loadingRef = useRef(true); // Track loading state in ref for timeout closure

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    
    const loadSlides = async () => {
      if (selectedCareer && !hasStartedRef.current) {
        hasStartedRef.current = true;
        
        try {
            console.log("Loading slides for:", selectedCareer.title);
            
            // This service method now handles checking for existing images and only generating missing ones
            // It throws "QUOTA_EXCEEDED" if backend rejects the request
            const generatedSlides = await generateStorySlides(selectedCareer, user);
            
            // Extract URLs (some might be empty strings if failed)
            const imageUrls = generatedSlides.map(s => s.imageUrl || null);
            
            // Check if ALL images failed (are empty strings/nulls)
            const validCount = generatedSlides.filter(s => s.imageUrl && s.imageUrl.length > 5).length;
            
            if (validCount === 0 && generatedSlides.length > 0) {
                if (isMounted) {
                    setAllFailed(true);
                    setLoading(false);
                }
                return;
            }

            // Update Store locally
            updateCareerImages(selectedCareer.id, imageUrls);
            
            const isSaved = savedCareers.some(c => c.id === selectedCareer.id);
            if (isSaved && user) {
                 try {
                     const processedUrls = await uploadCareerImages(user.id, selectedCareer.id, imageUrls);
                     updateCareerImages(selectedCareer.id, processedUrls);
                     const updatedCareer = { ...selectedCareer, slideImages: processedUrls };
                     await saveCareerToDb(user.id, updatedCareer);
                     
                     if (isMounted) {
                        setSlides(generatedSlides.map((s, i) => ({ ...s, imageUrl: processedUrls[i] || "" })));
                     }
                 } catch (saveErr) {
                     console.error("Failed to persist generated images", saveErr);
                     if (isMounted) setSlides(generatedSlides);
                 }
            } else {
                 if (isMounted) setSlides(generatedSlides);
            }

            if (isMounted) {
                setLoading(false);
            }
        } catch (e: any) {
            console.error("Slideshow Error:", e);
            if (isMounted) {
                setLoading(false);
                if (e.message === "QUOTA_EXCEEDED") {
                    setQuotaError(true);
                } else {
                    setAllFailed(true);
                }
            }
        }
      }
    };

    // Safety Timeout using Ref to avoid stale closure issues
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loadingRef.current && !quotaError) {
            console.warn("Slideshow generation timed out.");
            setLoading(false);
            setAllFailed(true);
        }
    }, 50000); 

    loadSlides();

    return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
    };
  }, [selectedCareer, user, updateCareerImages, savedCareers, quotaError]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  // --- ERROR STATES ---

  if (quotaError) {
      return (
        <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in duration-300">
            <div className="bg-slate-900 p-8 rounded-2xl border border-red-900/50 max-w-md shadow-2xl">
                <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-3">Daily Limit Reached</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    You've used all <strong>{DAILY_GENERATION_LIMIT}</strong> free visualizations for today. 
                    Please return in 24 hours to generate more career scenes.
                </p>
                <button 
                    onClick={() => setView(AppView.CAREER_DETAIL)} 
                    className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-colors font-bold"
                >
                    Return to Career
                </button>
            </div>
        </div>
      );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
        </div>
        <p className="text-white text-lg font-medium mt-6 animate-pulse">Visualizing your future...</p>
        <p className="text-slate-500 text-sm mt-2">AI is painting the scene</p>
      </div>
    );
  }

  if (allFailed || slides.length === 0) {
      return (
        <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in duration-300">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md shadow-2xl">
                <ImageOff className="w-12 h-12 text-slate-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-3">Visualizations are not available</h3>
                <p className="text-slate-400 mb-8">
                    We couldn't generate the scenes for this career right now. Please try again later.
                </p>
                <button 
                    onClick={() => setView(AppView.CAREER_DETAIL)} 
                    className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-colors font-bold"
                >
                    Close
                </button>
            </div>
        </div>
      );
  }

  // --- MAIN SLIDESHOW UI ---

  const slide = slides[currentSlide];
  const hasImage = slide.imageUrl && slide.imageUrl.length > 5;

  return (
    <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center overflow-hidden animate-in fade-in duration-500">
      
      {/* Background Blur Effect */}
      {hasImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 transition-all duration-1000"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
      )}
      
      {/* Close Button */}
      <button 
        onClick={() => setView(AppView.CAREER_DETAIL)}
        className="absolute top-6 right-6 z-[70] text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
      >
        <X size={24} />
      </button>

      <div className="relative z-10 w-full h-full max-w-md md:max-w-6xl flex flex-col md:flex-row bg-slate-900/80 backdrop-blur-md md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl m-0 md:m-8 md:h-[85vh]">
        
        {/* Image Section */}
        <div className="h-[60%] md:h-full md:w-[70%] relative bg-black flex items-center justify-center overflow-hidden group">
            {hasImage ? (
                <img 
                    src={slide.imageUrl} 
                    alt="Day in life" 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] ease-in-out group-hover:scale-105"
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/50 w-full h-full">
                    <ImageOff size={64} className="mb-4 opacity-40" />
                    <p className="text-lg font-medium text-slate-400">Image not available</p>
                    <p className="text-sm opacity-60 mt-2">We couldn't generate this specific scene.</p>
                </div>
            )}

             {/* Mobile Progress Bar */}
             <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 md:hidden z-20 bg-gradient-to-b from-black/80 to-transparent">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1 flex-1 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/20'}`} 
                    />
                ))}
            </div>
        </div>

        {/* Content Section */}
        <div className="h-[40%] md:h-full md:w-[30%] p-6 md:p-10 flex flex-col justify-center bg-slate-950 border-t md:border-t-0 md:border-l border-white/10 relative">
            
            <div className="mb-auto pt-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <h3 className="text-blue-400 font-bold tracking-widest text-xs uppercase">
                        Day in the Life
                    </h3>
                </div>
                <h2 className="text-white text-xl md:text-2xl font-bold leading-tight mb-1">
                    {selectedCareer?.title}
                </h2>
                <div className="w-10 h-1 bg-blue-600 rounded-full mt-4 mb-6 opacity-80"></div>
            </div>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-light italic relative z-10">
                "{slide.text}"
            </p>

            <div className="mt-auto pt-8 flex justify-between items-center">
                <button 
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="p-4 rounded-full border border-slate-700 text-white disabled:opacity-30 hover:bg-white/10 hover:border-white/50 transition-all active:scale-95"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <span className="text-sm font-mono text-slate-500 tracking-widest">
                    {currentSlide + 1} / {slides.length}
                </span>

                <button 
                    onClick={handleNext}
                    disabled={currentSlide === slides.length - 1}
                    className="p-4 rounded-full border border-slate-700 text-white disabled:opacity-30 hover:bg-white/10 hover:border-white/50 transition-all active:scale-95"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
