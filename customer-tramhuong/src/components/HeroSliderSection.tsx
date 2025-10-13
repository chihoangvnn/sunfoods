'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface HeroSliderSectionProps {
  images: string[];
  posterUrl?: string;
  productName: string;
  price: number;
  onViewDetails?: () => void;
  onContactConsultation?: () => void;
}

export const HeroSliderSection: React.FC<HeroSliderSectionProps> = ({
  images,
  posterUrl,
  productName,
  price,
  onViewDetails,
  onContactConsultation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldLoadImages, setShouldLoadImages] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  useEffect(() => {
    if (isIntersecting) {
      setShouldLoadImages(true);
    }
  }, [isIntersecting]);

  // Auto-advance interval
  useEffect(() => {
    if (!isHovering && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, images.length]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  // Touch handlers for swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      } else {
        // Swiped right - go to previous
        setCurrentIndex((prevIndex) => 
          prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div 
      ref={elementRef} 
      className="relative w-full h-[35vh] overflow-hidden bg-tramhuong-primary/5"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Container */}
      <div className="relative w-full h-full">
        {shouldLoadImages ? (
          <>
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-200`}
                style={{
                  opacity: currentIndex === index ? 1 : 0,
                  transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  pointerEvents: currentIndex === index ? 'auto' : 'none',
                  willChange: currentIndex === index ? 'opacity' : 'auto'
                }}
              >
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-tramhuong-bg/50 animate-pulse">
                    {posterUrl && index === 0 && (
                      <img
                        src={posterUrl}
                        alt={productName}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="eager"
                      />
                    )}
                    <div className="relative w-16 h-16 rounded-full border-4 border-tramhuong-accent/30 border-t-tramhuong-accent animate-spin" />
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={`${productName} - Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onLoad={() => handleImageLoad(index)}
                  style={{ opacity: loadedImages.has(index) ? 1 : 0 }}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="relative w-full h-full">
            {posterUrl && (
              <img
                src={posterUrl}
                alt={productName}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-tramhuong-primary/90 border-2 border-tramhuong-accent/40 flex items-center justify-center transition-all duration-200 shadow-[0_4px_12px_rgba(193,168,117,0.25)] hover:bg-tramhuong-primary hover:scale-105 z-10"
            style={{ transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-tramhuong-accent" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-tramhuong-primary/90 border-2 border-tramhuong-accent/40 flex items-center justify-center transition-all duration-200 shadow-[0_4px_12px_rgba(193,168,117,0.25)] hover:bg-tramhuong-primary hover:scale-105 z-10"
            style={{ transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-tramhuong-accent" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentIndex === index
                  ? 'bg-tramhuong-accent w-8'
                  : 'bg-tramhuong-accent/30 hover:bg-tramhuong-accent/50'
              }`}
              style={{ transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bronze Gradient Overlay with Product Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-tramhuong-primary/95 via-tramhuong-primary/85 to-transparent border-t-2 border-tramhuong-accent/40 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <h1 className="font-playfair text-3xl text-tramhuong-primary font-semibold leading-tight">
                Bộ Sưu Tập Trầm Hương Quý Hiếm
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={onViewDetails}
                className="px-6 py-3 bg-tramhuong-accent text-tramhuong-primary font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/90 transition-all duration-200 shadow-[0_4px_12px_rgba(193,168,117,0.3)] hover:shadow-[0_6px_16px_rgba(193,168,117,0.4)] hover:-translate-y-0.5"
                style={{ transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform, box-shadow, background-color' }}
              >
                Xem Chi Tiết
              </button>
              <button
                onClick={onContactConsultation}
                className="px-6 py-3 bg-transparent border-2 border-tramhuong-accent text-tramhuong-accent font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-200 hover:-translate-y-0.5"
                style={{ transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform, background-color' }}
              >
                Liên Hệ Tư Vấn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
