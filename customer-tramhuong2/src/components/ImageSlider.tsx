'use client'

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SlideItem {
  url: string;
  link?: string;
  buttonText?: string;
  showButton?: boolean;
  type?: 'image' | 'video';
  alt?: string;
}

interface ImageSliderProps {
  images?: string[]; // Backward compatibility
  slides?: SlideItem[]; // New prop with full slide data
  className?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
}

// Helper to detect if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export const ImageSlider = memo(function ImageSlider({ 
  images, 
  slides,
  className = '', 
  autoplay = false, 
  autoplayDelay = 5000 
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const mouseStartX = useRef<number>(0);
  const mouseEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<number | null>(null);

  // Convert images array to slides format for backward compatibility
  const processedSlides: SlideItem[] = slides || (images || []).map(url => ({ url }));

  // Auto-play functionality - pauses during user interaction
  useEffect(() => {
    if (!autoplay || processedSlides.length <= 1 || isInteracting) {
      if (autoplayIntervalRef.current !== null) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
      return;
    }

    autoplayIntervalRef.current = window.setInterval(() => {
      nextSlide();
    }, autoplayDelay) as unknown as number;

    return () => {
      if (autoplayIntervalRef.current !== null) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
  }, [currentIndex, autoplay, autoplayDelay, processedSlides.length, isInteracting]);

  // Clamp currentIndex when slides array changes
  useEffect(() => {
    if (processedSlides.length > 0 && currentIndex >= processedSlides.length) {
      setCurrentIndex(Math.max(0, processedSlides.length - 1));
    }
  }, [processedSlides.length, currentIndex]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % processedSlides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + processedSlides.length) % processedSlides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Enhanced touch handlers for mobile swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsInteracting(true);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (touchStartX.current !== null && touchEndX.current !== null && 
        Math.abs(touchStartX.current - touchEndX.current) > 10) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;

    if (isLeftSwipe && !isTransitioning) {
      nextSlide();
    } else if (isRightSwipe && !isTransitioning) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
    setIsInteracting(false);
  }, [isTransitioning]);

  // Mouse drag handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsInteracting(true);
    setIsDragging(true);
    mouseStartX.current = e.clientX;
    mouseEndX.current = e.clientX;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    mouseEndX.current = e.clientX;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const distance = mouseStartX.current - mouseEndX.current;
    const isLeftDrag = distance > 50;
    const isRightDrag = distance < -50;

    if (isLeftDrag && !isTransitioning) {
      nextSlide();
    } else if (isRightDrag && !isTransitioning) {
      prevSlide();
    }

    mouseStartX.current = 0;
    mouseEndX.current = 0;
    setIsInteracting(false);
  }, [isDragging, isTransitioning]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      mouseStartX.current = 0;
      mouseEndX.current = 0;
      setIsInteracting(false);
    }
  }, [isDragging]);

  const handleSlideClick = (link?: string) => {
    if (link && !isDragging) {
      window.location.href = link;
    }
  };

  if (!processedSlides || processedSlides.length === 0) {
    return null;
  }

  const currentSlide = processedSlides[currentIndex];

  return (
    <div className={`relative w-full overflow-hidden bg-gray-100 ${className}`}>
      {/* Slider Container with responsive aspect ratios - 16:9 mobile, 21:7 desktop */}
      <div
        ref={sliderRef}
        className={`relative w-full aspect-[16/9] lg:aspect-[21/7] select-none touch-pan-y ${
          isDragging ? 'cursor-grabbing' : currentSlide?.link ? 'cursor-pointer' : 'cursor-grab'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Images & Videos */}
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {processedSlides.map((slide, index) => {
            const isVideo = slide.type === 'video' || isVideoUrl(slide.url);
            const slideContent = (
              <div 
                key={index} 
                className={`w-full h-full flex-shrink-0 relative ${isVideo ? 'bg-[#3D2B1F]/90' : ''}`}
                onClick={() => handleSlideClick(slide.link)}
              >
                {isVideo ? (
                  <video
                    src={slide.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain object-center pointer-events-none"
                    preload="metadata"
                    onError={(e) => {
                      console.error('Video load error:', slide.url);
                    }}
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <img
                      src={slide.url}
                      alt={slide.alt || `Slide ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      draggable={false}
                      loading="lazy"
                      onError={(e) => {
                        // Hide broken image and show gradient fallback
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.classList.add('gradient-incense-gold');
                        }
                      }}
                    />
                  </div>
                )}
                
                {/* CTA Buttons Overlay - Only show for current slide */}
                {index === currentIndex && slide.showButton !== false && slide.link && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20 pointer-events-auto">
                    {/* Primary Button - Green */}
                    {slide.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slide.link) {
                            window.location.href = slide.link;
                          }
                        }}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
                      >
                        {slide.buttonText || 'Shop Now'}
                      </button>
                    )}
                    
                    {/* Secondary Button - White Outline */}
                    {slide.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slide.link) {
                            window.location.href = slide.link;
                          }
                        }}
                        className="px-6 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg shadow-lg transition-colors duration-200"
                      >
                        View Collection
                      </button>
                    )}
                  </div>
                )}
              </div>
            );

            return slideContent;
          })}
        </div>

        {/* Navigation Arrows - Only show if more than 1 slide */}
        {processedSlides.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators - Only show if more than 1 slide */}
      {processedSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {processedSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});
