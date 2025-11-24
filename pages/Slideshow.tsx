
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { AppView, Slide } from '../types';
import { generateStorySlides } from '../services/geminiService';
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';

export const Slideshow: React.FC = () => {
  const { selectedCareer, setView, user, updateCareerImages, debugImageGenerationEnabled } = useAppStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Ref to prevent double-firing in Strict Mode
  const hasStartedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadSlides = async () => {
      if (selectedCareer && !hasStartedRef.current) {
        hasStartedRef.current = true;
        console.log("Initializing Slideshow for:", selectedCareer.title);
        
        // --- CHECK FOR EXISTING IMAGES ---
        // If images are already generated/loaded (length > 0), use them immediately.
        if (selectedCareer.slideImages && selectedCareer.slideImages.length > 0) {
            console.log("Using existing images from store/DB");
            const existingSlides = selectedCareer.dayInLifePrompts?.map((text, index) => ({
                id: index,
                text: text || "Experiencing the role",
                imageUrl: selectedCareer.slideImages![index] || `https://picsum.photos/seed/${selectedCareer.id}-${index}/1280/720`
            })) || [];
            
            // If for some reason prompts are missing but images exist
            if (existingSlides.length === 0 && selectedCareer.slideImages.length > 0) {
                selectedCareer.slideImages.forEach((img, i) => {
                    existingSlides.push({
                        id: i,
                        text: "A glimpse into this career",
                        imageUrl: img
                    });
                });
            }

            if (isMounted) {
                setSlides(existingSlides);
                setLoading(false);
            }
            return; // EXIT EARLY
        }

        // --- GENERATE NEW IMAGES ---
        try {
            console.log("Generating new slides...");
            // Backend now handles the generation details, including debug logic if we wanted, 
            // but we pass the flag just in case the backend wants to short-circuit.
            const generated = await generateStorySlides(selectedCareer, user, debugImageGenerationEnabled);
            
            // CACHE IMMEDIATELY TO STORE
            const imageUrls = generated.map(s => s.imageUrl);
            if (imageUrls.length > 0) {
                updateCareerImages(selectedCareer.id, imageUrls);
            }

            if (isMounted) {
                setSlides(generated);
                setLoading(false);
            }
        } catch (e) {
            console.error("Failed to load slides", e);
            if (isMounted) setLoading(false);
        }
      }
    };

    // Safety Timeout in case generation hangs
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) {
            console.warn("Slideshow generation timed out - forcing fallback.");
            setLoading(false);
        }
    }, 45000); // Increased to 45 seconds

    loadSlides();

    return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
    };
  }, [selectedCareer, user, updateCareerImages, debugImageGenerationEnabled]);

  const handleNext = () => {
    setImageError(false); // Reset error state for next slide
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const handlePrev = () => {
    setImageError(false); // Reset error state for prev slide
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg animate-pulse font-medium">Visualizing your future...</p>
        <p className="text-white/50 text-sm mt-2">AI is painting the scene</p>
      </div>
    );
  }

  if (slides.length === 0) {
      return (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center text-white p-4 text-center">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 max-w-md">
                <ImageOff className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Visualization Unavailable</h3>
                <p className="text-slate-400 mb-6">We couldn't generate the scenes for this career right now.</p>
                <button 
                    onClick={() => setView(AppView.CAREER_DETAIL)} 
                    className="px-6 py-2 bg-white text-black rounded-full hover:bg-slate-200 transition-colors font-medium"
                >
                    Close
                </button>
            </div>
        </div>
      );
  }

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center overflow-hidden">
      {/* Background Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110 transition-all duration-700"
        style={{ 
            backgroundImage: `url(${slide.imageUrl})`,
            backgroundColor: '#111' // Fallback if image fails
        }}
      />
      
      {/* Close Button */}
      <button 
        onClick={() => setView(AppView.CAREER_DETAIL)}
        className="absolute top-6 right-6 z-[70] text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all"
      >
        <X size={24} />
      </button>

      <div className="relative z-10 w-full h-full max-w-md md:max-w-5xl flex flex-col md:flex-row bg-black/60 backdrop-blur-sm md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl m-0 md:m-8 md:h-[80vh]">
        
        {/* Image Section */}
        <div className="h-2/3 md:h-full md:w-2/3 relative bg-slate-900 flex items-center justify-center overflow-hidden">
            {!imageError ? (
                <img 
                    src={slide.imageUrl} 
                    alt="Day in life" 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-in-out hover:scale-105"
                    onError={(e) => {
                        console.warn(`Image load failed for slide ${currentSlide}. Switching to fallback.`);
                        e.currentTarget.onerror = null; // Prevent loop
                        e.currentTarget.src = `https://picsum.photos/seed/err-${selectedCareer?.id}-${currentSlide}/1280/720`;
                        setImageError(true);
                    }}
                />
            ) : (
                // Explicit Fallback UI if even the replacement fails or while switching
                <div className="flex flex-col items-center justify-center text-slate-500">
                    <ImageOff size={48} className="mb-2 opacity-50" />
                    <p className="text-sm">Image unavailable</p>
                </div>
            )}

             {/* Mobile Progress Bar */}
             <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 md:hidden z-20 bg-gradient-to-b from-black/50 to-transparent">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1 flex-1 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/30'}`} 
                    />
                ))}
            </div>
        </div>

        {/* Content Section */}
        <div className="h-1/3 md:h-full md:w-1/3 p-6 md:p-10 flex flex-col justify-center bg-slate-900/90 md:bg-black/80 border-t md:border-t-0 md:border-l border-white/10">
            <div className="mb-auto pt-2">
                <h3 className="text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                   Day in the Life
                </h3>
                <h2 className="text-white text-xl md:text-3xl font-light leading-snug">
                    {selectedCareer?.title}
                </h2>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed italic relative">
                <span className="text-4xl text-slate-600 absolute -top-4 -left-2 opacity-50">"</span>
                {slide.text}
                <span className="text-4xl text-slate-600 absolute -bottom-6 -right-2 opacity-50">"</span>
            </p>

            <div className="mt-auto pt-8 flex justify-between items-center">
                <button 
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="p-4 rounded-full border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 hover:border-white/30 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <span className="text-sm font-mono text-slate-500">
                    {currentSlide + 1} <span className="mx-1 opacity-50">/</span> {slides.length}
                </span>

                <button 
                    onClick={handleNext}
                    disabled={currentSlide === slides.length - 1}
                    className="p-4 rounded-full border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 hover:border-white/30 transition-all"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
