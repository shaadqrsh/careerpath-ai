import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { AppView, Slide } from '../types';
import { generateStorySlides } from '../services/geminiService';
import { uploadCareerImages, saveCareerToDb, getUserProfile } from '../services/supabaseService';
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { GeminiBadge } from '../components/GeminiBadge';

export const Slideshow: React.FC = () => {
  const { selectedCareer, setView, user, setUser, updateCareerImages, savedCareers, showModal, hideModal, showToast } = useAppStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [allFailed, setAllFailed] = useState(false);
  
  const [loadingText, setLoadingText] = useState("Initializing...");

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (quotaError) {
        const limit = user?.limits?.dailyImageLimit ?? 3;
        showModal({
            variant: 'danger',
            title: "Daily Limit Reached",
            description: <>You've used all <strong>{limit}</strong> free visualizations for today. Please return in 24 hours to generate more career scenes.</>,
            buttonText: "Return to Career",
            onButtonClick: () => {
                hideModal();
                setView(AppView.CAREER_DETAIL);
            }
        });
    }
  }, [quotaError, showModal, hideModal, setView, user]);

  useEffect(() => {
      if (allFailed) {
          showModal({
            variant: 'warning',
            title: "Visualizations are not available",
            description: "We couldn't generate the scenes for this career right now. Please try again later.",
            buttonText: "Close",
            onButtonClick: () => {
                hideModal();
                setView(AppView.CAREER_DETAIL);
            }
          });
      }
  }, [allFailed, showModal, hideModal, setView]);

  useEffect(() => {
    const texts = [
        "Dreaming up possibilities...",
        "Sketching the scene...",
        "Rendering light and shadow...",
        "Adding final touches..."
    ];
    let i = 0;
    
    if (isGenerating) {
        setLoadingText(texts[0]);
        const interval = setInterval(() => {
            i = (i + 1) % texts.length;
            setLoadingText(texts[i]);
        }, 2500);
        return () => clearInterval(interval);
    } else {
        setLoadingText("Loading images...");
    }
  }, [isGenerating]);

  useEffect(() => {
    if (slides.length > 0) {
        slides.forEach((slide, index) => {
            if (slide.imageUrl) {
                const img = new Image();
                img.src = slide.imageUrl;
                
                const markLoaded = () => {
                    setLoadedIndices(prev => new Set(prev).add(index));
                };
                
                img.onload = markLoaded;
                img.onerror = markLoaded; 
            } else {
                setLoadedIndices(prev => new Set(prev).add(index));
            }
        });
    }
  }, [slides]);

  useEffect(() => {
    let isMounted = true;
    
    const loadSlides = async () => {
      if (selectedCareer && !hasStartedRef.current) {
        
        const targetCount = user?.limits?.slideshowImageCount ?? 3;
        const existingImages = selectedCareer.slideImages || [];
        const validCount = existingImages.filter(img => img && img.length > 5).length;
        const needsGeneration = validCount < targetCount;

        if (needsGeneration && user) {
            const lastDateStr = user.lastImageGenerationDate;
            const dailyLimit = user.limits?.dailyImageLimit ?? 3;
            let remaining = dailyLimit;
            
            if (lastDateStr) {
                const lastDate = new Date(lastDateStr);
                const now = new Date();
                const isSameDay = lastDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
                if (isSameDay) {
                    remaining = Math.max(0, dailyLimit - (user.dailyImageGenerationsCount || 0));
                }
            }
            
            if (remaining <= 0) {
                if (isMounted) {
                    const prompts = selectedCareer.dayInLifePrompts || [];
                    while (prompts.length < targetCount) {
                         prompts.push("Working in a professional environment");
                    }
                    const simpleSlides = prompts.slice(0, targetCount).map((text, i) => ({
                        id: i,
                        text: text,
                        imageUrl: existingImages[i] || ""
                    }));
                    setSlides(simpleSlides);
                    setLoading(false);
                }
                hasStartedRef.current = true;
                return;
            }
        }

        if (isMounted) {
            setIsGenerating(needsGeneration);
        }

        hasStartedRef.current = true;
        
        try {
            const generatedSlides = await generateStorySlides(selectedCareer, user);
            const imageUrls = generatedSlides.map(s => s.imageUrl || null);
            const validGeneratedCount = generatedSlides.filter(s => s.imageUrl && s.imageUrl.length > 5).length;
            
            if (validGeneratedCount === 0 && generatedSlides.length > 0) {
                if (isMounted) {
                    setAllFailed(true);
                }
                return;
            }

            updateCareerImages(selectedCareer.id, imageUrls);
            if (isMounted) {
                setSlides(generatedSlides);
            }
            
            if (needsGeneration && user) {
                getUserProfile(user.id).then(u => {
                    if (u) setUser(u);
                });
            }

            const isSaved = savedCareers.some(c => c.id === selectedCareer.id);
            if (isSaved && user && needsGeneration) {
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
      } else if (hasStartedRef.current && !loading && slides.length === 0) {
           const existingImages = selectedCareer?.slideImages || [];
           if (existingImages.length > 0) {
              const simpleSlides = existingImages.map((img, i) => ({
                  id: i,
                  text: selectedCareer?.dayInLifePrompts?.[i] || "Career Visualization",
                  imageUrl: img || ""
              }));
              setSlides(simpleSlides);
           }
      }
    };

    loadSlides();

    return () => {
        isMounted = false;
    };
  }, [selectedCareer, user, updateCareerImages, savedCareers, setUser, showToast]);

  const handleNext = () => {
    setCurrentSlide(curr => Math.min(curr + 1, slides.length - 1));
  };

  const handlePrev = () => {
    setCurrentSlide(curr => Math.max(curr - 1, 0));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    lastTouchTime.current = Date.now();

    if (touchStartX.current === null) return;
    
    if (touchEndX.current === null) {
        const x = touchStartX.current;
        const width = window.innerWidth;
        
        if (x < width * 0.35) {
            handlePrev();
        } else if (x > width * 0.65) {
            handleNext();
        }
        
        touchStartX.current = null;
        return;
    }
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
        handleNext();
    } else if (isRightSwipe) {
        handlePrev();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (Date.now() - lastTouchTime.current < 500) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width * 0.35) {
        e.stopPropagation();
        handlePrev();
    } else if (x > width * 0.65) {
        e.stopPropagation();
        handleNext();
    }
  };

  if (quotaError || allFailed) {
      return null;
  }

  const allImagesLoaded = slides.length > 0 && slides.every((s, i) => !s.imageUrl || loadedIndices.has(i));
  const showLoadingScreen = loading || !allImagesLoaded;

  if (showLoadingScreen) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center animate-fade-in">
        <div className="relative animate-fade-in-up opacity-0" style={{ animationDelay: '0ms' }}>
            {isGenerating ? (
               <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            ) : null}
            
            {isGenerating ? (
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
            ) : (
               <ImageIcon className="w-12 h-12 text-slate-500 animate-pulse relative z-10" />
            )}
        </div>
        
        <div className="mt-8 flex flex-col items-center animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <p className="text-white text-lg font-medium animate-pulse min-h-[1.75rem] transition-opacity duration-500 mb-4">
                {loadingText}
            </p>
            
            {isGenerating && (
                <GeminiBadge variant="banana" />
            )}
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div 
        className={`fixed inset-0 bg-black z-[60] flex items-center justify-center overflow-hidden px-0 md:px-4 md:py-8 touch-none transition-opacity duration-700 ease-out ${showLoadingScreen ? 'opacity-0' : 'opacity-100'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleContainerClick}
    >
      
      <div 
         key={`bg-${currentSlide}`}
         className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 transition-all duration-1000"
         style={{ backgroundImage: `url(${slide.imageUrl || ''})` }}
      />
      
      <button 
        onClick={(e) => { e.stopPropagation(); setView(AppView.CAREER_DETAIL); }}
        className="absolute top-6 right-6 z-[70] text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
      >
        <X size={24} />
      </button>

      <div className="md:hidden absolute inset-x-0 bottom-[45%] flex justify-between px-4 pointer-events-none z-50">
         {currentSlide > 0 && (
             <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm animate-pulse">
                 <ArrowLeft className="w-8 h-8 text-white" />
             </div>
         )}
         <div className="flex-1"></div>
         {currentSlide < slides.length - 1 && (
             <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm animate-pulse">
                 <ArrowRight className="w-8 h-8 text-white" />
             </div>
         )}
      </div>

      <div className="relative z-10 w-full h-full max-w-md md:max-w-6xl flex flex-col md:flex-row bg-slate-900/80 backdrop-blur-md rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl m-4 md:m-8 max-h-[90vh] md:h-[85vh] group" onClick={(e) => e.stopPropagation()}>
        
        <div className="h-[50%] md:h-full md:w-[70%] relative bg-black flex items-center justify-center overflow-hidden" onClick={handleContainerClick}>
             {slides.map((s, idx) => {
                 return (
                    <div 
                        key={idx}
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                         {s.imageUrl ? (
                             <img 
                                 src={s.imageUrl} 
                                 alt="Day in life" 
                                 className="w-full h-full object-cover"
                             />
                         ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/50 w-full h-full">
                                <ImageOff size={64} className="mb-4 opacity-40" />
                                <p className="text-lg font-medium text-slate-400">Image not available</p>
                            </div>
                         )}
                    </div>
                 );
             })}

             <div className="absolute top-0 left-0 right-0 p-4 flex gap-1.5 md:hidden z-20 bg-gradient-to-b from-black/60 to-transparent">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1 flex-1 rounded-full transition-colors shadow-sm ${idx === currentSlide ? 'bg-white' : 'bg-white/30'}`} 
                    />
                ))}
            </div>
        </div>

        <div className="h-[50%] md:h-full md:w-[30%] p-6 md:p-10 flex flex-col bg-slate-950 border-t md:border-t-0 md:border-l border-white/10 relative animate-fade-in" onClick={handleContainerClick}>
            
            <div className="mb-4 pt-2 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <h3 className="text-blue-400 font-bold tracking-widest text-xs uppercase">
                        Day in the Life
                    </h3>
                </div>
                <h2 className="text-white text-xl md:text-2xl font-bold leading-tight mb-1 whitespace-normal">
                    {selectedCareer?.title}
                </h2>
                <div className="w-10 h-1 bg-blue-600 rounded-full mt-4 mb-2 opacity-80"></div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                 <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-light italic relative z-10 whitespace-normal break-words">
                    "{slide.text}"
                </p>
            </div>

            <div className="mt-4 pt-4 hidden md:flex justify-between items-center shrink-0 border-t border-slate-800">
                <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={currentSlide === 0}
                    className="p-4 rounded-full border border-slate-700 text-white disabled:opacity-30 hover:bg-white/10 hover:border-white/50 transition-all active:scale-95"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <span className="text-sm font-mono text-slate-500 tracking-widest">
                    {currentSlide + 1} / {slides.length}
                </span>

                <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
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