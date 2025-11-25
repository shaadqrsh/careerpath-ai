
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { AppView, Slide } from '../types';
import { generateStorySlides } from '../services/geminiService';
import { uploadCareerImages, saveCareerToDb, getUserProfile } from '../services/supabaseService';
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff, AlertOctagon } from 'lucide-react';
import { DAILY_IMAGE_LIMIT } from '../constants';

const BananaIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5" />
        <path d="M5.15 17a9 9 0 1 0 17.77-2.88" />
    </svg>
);

export const Slideshow: React.FC = () => {
  const { selectedCareer, setView, user, setUser, updateCareerImages, savedCareers } = useAppStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [quotaError, setQuotaError] = useState(false);
  const [allFailed, setAllFailed] = useState(false);
  
  const [loadingText, setLoadingText] = useState("Dreaming up possibilities...");

  const hasStartedRef = useRef(false);

  // Cycling text effect for loading
  useEffect(() => {
    const texts = [
        "Dreaming up possibilities...",
        "Sketching the scene...",
        "Rendering light and shadow...",
        "Adding final touches..."
    ];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadSlides = async () => {
      // Pre-check quota locally if possible to avoid flash of loading
      if (user) {
          const lastDateStr = user.lastImageGenerationDate;
          let remaining = DAILY_IMAGE_LIMIT;
          
          if (lastDateStr) {
              const lastDate = new Date(lastDateStr);
              const now = new Date();
              const isSameDay = lastDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
              if (isSameDay) {
                  remaining = Math.max(0, DAILY_IMAGE_LIMIT - (user.dailyImageGenerationsCount || 0));
              }
          }
          
          if (remaining <= 0) {
              setQuotaError(true);
              setLoading(false);
              return;
          }
      }

      if (selectedCareer && !hasStartedRef.current) {
        hasStartedRef.current = true;
        
        try {
            console.log("Loading slides for:", selectedCareer.title);
            
            const generatedSlides = await generateStorySlides(selectedCareer, user);
            
            const imageUrls = generatedSlides.map(s => s.imageUrl || null);
            
            const validCount = generatedSlides.filter(s => s.imageUrl && s.imageUrl.length > 5).length;
            
            if (validCount === 0 && generatedSlides.length > 0) {
                if (isMounted) {
                    setAllFailed(true);
                }
                return;
            }

            updateCareerImages(selectedCareer.id, imageUrls);
            if (isMounted) {
                setSlides(generatedSlides);
            }
            
            if (user) {
                getUserProfile(user.id).then(u => {
                    if (u) setUser(u);
                });
            }

            const isSaved = savedCareers.some(c => c.id === selectedCareer.id);
            if (isSaved && user) {
                 uploadCareerImages(user.id, selectedCareer.id, imageUrls).then(async (processedUrls) => {
                     updateCareerImages(selectedCareer.id, processedUrls);
                     const updatedCareer = { ...selectedCareer, slideImages: processedUrls };
                     await saveCareerToDb(user.id, updatedCareer);
                     
                     if (isMounted) {
                        setSlides(generatedSlides.map((s, i) => ({ ...s, imageUrl: processedUrls[i] || "" })));
                     }
                 }).catch(err => {
                     console.error("Background upload failed:", err);
                 });
            }

        } catch (e: any) {
            console.error("Slideshow Error:", e);
            if (isMounted) {
                if (e.message === "QUOTA_EXCEEDED") {
                    setQuotaError(true);
                } else {
                    setAllFailed(true);
                }
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
      }
    };

    loadSlides();

    return () => {
        isMounted = false;
    };
  }, [selectedCareer, user, updateCareerImages, savedCareers, setUser]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  if (quotaError) {
      return (
        <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center text-white p-4 text-center">
            <div className="bg-slate-900 p-8 rounded-2xl border border-red-900/50 max-w-md shadow-2xl animate-fade-in-up">
                <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-3">Daily Limit Reached</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    You've used all <strong>{DAILY_IMAGE_LIMIT}</strong> free visualizations for today. 
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
        <div className="relative animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
        </div>
        
        <div className="mt-8 flex flex-col items-center animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <p className="text-white text-lg font-medium animate-pulse min-h-[1.75rem] transition-opacity duration-500 mb-4">
                {loadingText}
            </p>
            
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md">
                <BananaIcon className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-500">
                    Powered by Nano Banana
                </span>
            </div>
        </div>
      </div>
    );
  }

  if (allFailed || slides.length === 0) {
      return (
        <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center text-white p-4 text-center">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md shadow-2xl animate-fade-in-up">
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

  const slide = slides[currentSlide];
  const hasImage = slide.imageUrl && slide.imageUrl.length > 5;

  return (
    <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center overflow-hidden animate-in fade-in duration-500">
      
      {hasImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 transition-all duration-1000"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
      )}
      
      <button 
        onClick={() => setView(AppView.CAREER_DETAIL)}
        className="absolute top-6 right-6 z-[70] text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
      >
        <X size={24} />
      </button>

      <div className="relative z-10 w-full h-full max-w-md md:max-w-6xl flex flex-col md:flex-row bg-slate-900/80 backdrop-blur-md md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl m-0 md:m-8 md:h-[85vh]">
        
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

             <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 md:hidden z-20 bg-gradient-to-b from-black/80 to-transparent">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1 flex-1 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/20'}`} 
                    />
                ))}
            </div>
        </div>

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
