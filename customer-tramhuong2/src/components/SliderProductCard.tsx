'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Award, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export interface LuxurySpecs {
  origin?: string;
  grade?: string;
  fragrance?: string;
  dimensions?: string;
  weight?: string;
  age?: number;
}

interface SliderProductCardProps {
  images: string[];
  posterUrl?: string;
  title: string;
  price: number;
  specs?: LuxurySpecs;
  onClick?: () => void;
}

export const SliderProductCard: React.FC<SliderProductCardProps> = ({
  images,
  posterUrl,
  title,
  price,
  specs,
  onClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldLoadImages, setShouldLoadImages] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [showSpecsOverlay, setShowSpecsOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const specsTimeoutRef = useRef<NodeJS.Timeout>();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isIntersecting) {
      setShouldLoadImages(true);
    }
  }, [isIntersecting]);

  useEffect(() => {
    return () => {
      if (specsTimeoutRef.current) {
        clearTimeout(specsTimeoutRef.current);
      }
    };
  }, []);

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

  const goToSlide = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

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
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      } else {
        setCurrentIndex((prevIndex) => 
          prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isMobile && specs && !showSpecsOverlay) {
      setShowSpecsOverlay(true);
      specsTimeoutRef.current = setTimeout(() => {
        setShowSpecsOverlay(false);
      }, 2000);
    } else {
      if (specsTimeoutRef.current) {
        clearTimeout(specsTimeoutRef.current);
      }
      setShowSpecsOverlay(false);
      onClick?.();
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && specs) {
      setShowSpecsOverlay(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowSpecsOverlay(false);
    }
  };

  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;

    const badgeStyles = {
      'AAA': 'bg-tramhuong-accent text-tramhuong-primary',
      'AA+': 'bg-tramhuong-accent text-tramhuong-primary',
      'A+': 'border-2 border-tramhuong-accent bg-transparent text-tramhuong-accent'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-nunito font-semibold ${badgeStyles[grade as keyof typeof badgeStyles] || badgeStyles['A+']}`}>
        {grade}
      </span>
    );
  };

  return (
    <div
      ref={elementRef}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="group relative overflow-hidden rounded-xl transition-all duration-200 bg-[#FFFFFF]/85 lg:backdrop-blur-xl border border-tramhuong-accent/20 shadow-[0_4px_12px_rgba(193,168,117,0.15)]
      lg:hover:-translate-y-2 lg:hover:border-tramhuong-accent/40 lg:hover:shadow-[0_6px_20px_rgba(193,168,117,0.25)] cursor-pointer"
      style={{ transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-tramhuong-primary/5">
        <div className="absolute inset-0 border border-tramhuong-accent/30" />
        
        {shouldLoadImages ? (
          <>
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-opacity duration-200"
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
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="eager"
                      />
                    )}
                    <div className="relative w-12 h-12 rounded-full border-4 border-tramhuong-accent/30 border-t-tramhuong-accent animate-spin" />
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={`${title} - ${index + 1}`}
                  className="w-full h-full object-cover lg:group-hover:scale-105"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onLoad={() => handleImageLoad(index)}
                  style={{ 
                    opacity: loadedImages.has(index) ? 1 : 0,
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform'
                  }}
                />
              </div>
            ))}
          </>
        ) : posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 lg:group-hover:scale-105"
            loading="lazy"
            style={{ transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-nunito text-tramhuong-accent">Mỹ nghệ</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 bottom-2 w-8 h-8 rounded-full bg-tramhuong-accent/30 border border-tramhuong-accent/40 flex items-center justify-center transition-transform duration-200 hover:bg-tramhuong-accent/40 hover:scale-105 z-10"
              style={{ transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-tramhuong-accent" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-tramhuong-accent/30 border border-tramhuong-accent/40 flex items-center justify-center transition-transform duration-200 hover:bg-tramhuong-accent/40 hover:scale-105 z-10"
              style={{ transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 text-tramhuong-accent" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(e, index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentIndex === index
                    ? 'bg-tramhuong-accent w-6'
                    : 'bg-tramhuong-accent/30 hover:bg-tramhuong-accent/50'
                }`}
                style={{ transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Specs Overlay */}
        {specs && (
          <div
            className={`absolute inset-0 bg-tramhuong-primary/95 lg:backdrop-blur-md p-6 flex flex-col justify-center space-y-4 transition-opacity duration-200 ${
              showSpecsOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'opacity' }}
          >
            {specs.origin && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-tramhuong-accent flex-shrink-0" />
                <div>
                  <p className="font-nunito text-xs text-tramhuong-accent/70 mb-1">Nguồn gốc</p>
                  <p className="font-nunito font-semibold text-tramhuong-accent/90">{specs.origin}</p>
                </div>
              </div>
            )}

            {specs.grade && (
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-tramhuong-accent flex-shrink-0" />
                <div>
                  <p className="font-nunito text-xs text-tramhuong-accent/70 mb-1">Độ quý hiếm</p>
                  {getGradeBadge(specs.grade)}
                </div>
              </div>
            )}

            {specs.fragrance && (
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-tramhuong-accent flex-shrink-0" />
                <div>
                  <p className="font-nunito text-xs text-tramhuong-accent/70 mb-1">Hương thơm</p>
                  <p className="font-nunito font-semibold text-tramhuong-accent/90">{specs.fragrance}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-tramhuong-accent/20 lg:backdrop-blur-lg border-2 border-tramhuong-accent/50 shadow-[0_4px_12px_rgba(193,168,117,0.4)] z-10">
          <p className="font-playfair text-2xl font-bold text-tramhuong-accent">
            {formatVietnamPrice(price)}
          </p>
        </div>
      </div>

      {/* Product Name - OUTSIDE image container */}
      <h3 className="font-playfair text-tramhuong-primary text-lg text-center mt-3 px-3 pb-4 leading-tight line-clamp-2 font-semibold">
        {title}
      </h3>
    </div>
  );
};
