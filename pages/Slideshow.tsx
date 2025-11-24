import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppView, Slide } from '../types';
import { generateStorySlides } from '../services/geminiService';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export const Slideshow: React.FC = () => {
  const { selectedCareer, setView, user, updateCareerImages } = useAppStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadSlides = async () => {
      if (selectedCareer) {
        try {
            // Pass the full career object AND user for personalized generation
            // If selectedCareer already has images (cached or saved), generateStorySlides uses them.
            const generated = await generateStorySlides(selectedCareer, user);
            
            if (isMounted) {
                setSlides(generated);
                setLoading(false);

                // Cache the images back to the store immediately.
                const imageUrls = generated.map(s => s.imageUrl);
                updateCareerImages(selectedCareer.id, imageUrls);
            }
        } catch (e) {
            console.error("Failed to load slides", e);
            if (isMounted) setLoading(false); // Ensure we exit loading state even on error
        }
      }
    };

    // Safety Timeout: If generation takes > 15s, stop loading to prevent hanging
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) {
            console.warn("Slideshow generation timed out.");
            setLoading(false);
        }
    }, 15000);

    loadSlides();

    return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
    };
  }, [selectedCareer, user, updateCareerImages]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
        <p className="text-white text-lg animate-pulse">Generating personalized visualization...</p>
        <p className="text-white/50 text-sm mt-2">This may take a few seconds.</p>
      </div>
    );
  }

  // Fallback if slides failed to generate or empty
  if (slides.length === 0) {
      return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
            <p>Unable to load visualization.</p>
            <button onClick={() => setView(AppView.CAREER_DETAIL)} className="mt-4 px-4 py-2 bg-white/20 rounded-lg">Close</button>
        </div>
      );
  }

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      {/* Background Image (Blurred) */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-110 transition-all duration-700"
        style={{ backgroundImage: `url(${slide.imageUrl})` }}
      />
      
      {/* Close Button */}
      <button 
        onClick={() => setView(AppView.CAREER_DETAIL)}
        className="absolute top-6 right-6 z-50 text-white/70 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md"
      >
        <X size={24} />
      </button>

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full max-w-md md:max-w-4xl flex flex-col md:flex-row bg-black/40 backdrop-blur-sm md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Image Section */}
        <div className="h-2/3 md:h-full md:w-2/3 relative bg-black">
            <img 
                src={slide.imageUrl} 
                alt="Day in life" 
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
            />
             {/* Progress Indicators (Mobile Overlay) */}
             <div className="absolute top-4 left-0 right-0 px-4 flex gap-1 md:hidden">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1 flex-1 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-white/30'}`} 
                    />
                ))}
            </div>
        </div>

        {/* Text Section */}
        <div className="h-1/3 md:h-full md:w-1/3 p-8 flex flex-col justify-center bg-gradient-to-t from-black via-black/80 to-transparent md:bg-black/60 md:backdrop-blur-xl">
            <h3 className="text-blue-400 font-bold tracking-wider text-xs uppercase mb-2">
                A Day in the Life — {selectedCareer?.title}
            </h3>
            <p className="text-white text-xl md:text-2xl font-light leading-relaxed">
                "{slide.text}"
            </p>

            {/* Navigation Controls */}
            <div className="mt-8 flex justify-between items-center">
                <button 
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="p-3 rounded-full border border-white/20 text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <span className="text-sm text-slate-400">
                    {currentSlide + 1} / {slides.length}
                </span>

                <button 
                    onClick={handleNext}
                    disabled={currentSlide === slides.length - 1}
                    className="p-3 rounded-full border border-white/20 text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};