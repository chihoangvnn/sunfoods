'use client'

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomBanner {
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
  position: 'top' | 'middle' | 'bottom';
  isActive: boolean;
}

interface ShopSettings {
  customBanners?: CustomBanner[];
}

interface CustomBannerProps {
  position: 'top' | 'middle' | 'bottom';
}

export function CustomBanner({ position }: CustomBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch shop settings to get custom banners
  const { data: shopSettings, isLoading } = useQuery<{ data: ShopSettings }>({
    queryKey: ['shop-info'],
    queryFn: async () => {
      const res = await fetch('/api/shop-info');
      if (!res.ok) throw new Error('Failed to fetch shop settings');
      return res.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Filter banners by position and isActive
  const banners = shopSettings?.data?.customBanners?.filter(
    (banner) => banner.position === position && banner.isActive === true
  ) || [];

  // Auto-advance carousel every 5 seconds if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Don't render if loading or no active banners for this position
  if (isLoading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const BannerContent = () => (
    <div className="relative w-full overflow-hidden rounded-none md:rounded-2xl group">
      {/* Responsive Aspect Ratio Container */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/9]">
        <Image
          src={currentBanner.imageUrl}
          alt={currentBanner.title || 'Custom Banner'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="100vw"
          priority={position === 'top'}
        />
        
        {/* Bronze Glass Morphism Overlay on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'rgba(193, 168, 117, 0.15)',
            backdropFilter: 'blur(4px)'
          }}
        />
        
        {/* Text Overlay - Only if title or description exists */}
        {(currentBanner.title || currentBanner.description) && (
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12">
            <div 
              className="backdrop-blur-sm rounded-2xl p-4 md:p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(61, 43, 31, 0.7) 0%, rgba(193, 168, 117, 0.6) 100%)'
              }}
            >
              {currentBanner.title && (
                <h3 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {currentBanner.title}
                </h3>
              )}
              {currentBanner.description && (
                <p 
                  className="text-sm md:text-base lg:text-lg text-white/90"
                  style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                >
                  {currentBanner.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Carousel Navigation - Only show if multiple banners */}
      {banners.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#3D2B1F] rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#3D2B1F] rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="transition-all duration-300"
                style={{
                  width: currentIndex === index ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentIndex === index ? '#C1A875' : 'rgba(255, 255, 255, 0.5)'
                }}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <section className="w-full px-0 md:px-4 lg:px-8 xl:px-12 py-0 md:py-4 lg:py-6">
      <div className="max-w-7xl mx-auto">
        {currentBanner.link ? (
          <Link 
            href={currentBanner.link}
            className="block"
          >
            <BannerContent />
          </Link>
        ) : (
          <BannerContent />
        )}
      </div>
    </section>
  );
}
