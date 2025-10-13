'use client'

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface JewelryCarouselProps {
  images: string[];
  productName: string;
  aspectRatio?: string;
}

export const JewelryCarousel: React.FC<JewelryCarouselProps> = ({
  images,
  productName,
  aspectRatio = 'aspect-square'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goToPrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToSlide = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

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
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (images.length === 0) {
    return (
      <div className={`${aspectRatio} bg-tramhuong-primary/5 flex items-center justify-center`}>
        <span className="text-sm font-nunito text-tramhuong-accent">Chưa có hình ảnh</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Image Container */}
      <div 
        className={`relative ${aspectRatio} overflow-hidden`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 border border-tramhuong-accent/30" />
        
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              opacity: currentIndex === index ? 1 : 0,
              pointerEvents: currentIndex === index ? 'auto' : 'none',
              willChange: currentIndex === index ? 'opacity' : 'auto'
            }}
          >
            {(loadedImages.has(index) || index === 0) && (
              <Image
                src={imageUrl}
                alt={`${productName} - Góc ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover lg:group-hover:scale-105"
                loading={index === 0 ? 'eager' : 'lazy'}
                onLoad={() => handleImageLoad(index)}
                style={{
                  opacity: loadedImages.has(index) ? 1 : 0,
                  transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-tramhuong-accent/30 border border-tramhuong-accent/40 flex items-center justify-center transition-transform duration-200 hover:bg-tramhuong-accent/40 hover:scale-105 z-10 opacity-0 group-hover:opacity-100"
            style={{ transition: 'opacity 200ms, transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-tramhuong-accent/30 border border-tramhuong-accent/40 flex items-center justify-center transition-transform duration-200 hover:bg-tramhuong-accent/40 hover:scale-105 z-10 opacity-0 group-hover:opacity-100"
            style={{ transition: 'opacity 200ms, transform 200ms cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform' }}
            aria-label="Ảnh tiếp"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(e, index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                currentIndex === index
                  ? 'bg-tramhuong-accent w-4'
                  : 'bg-tramhuong-accent/30 hover:bg-tramhuong-accent/50'
              }`}
              style={{ transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label={`Xem ảnh ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-tramhuong-primary/80 backdrop-blur-sm z-10">
          <span className="text-xs font-nunito text-white">
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      )}
    </div>
  );
};
