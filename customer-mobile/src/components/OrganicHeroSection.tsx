'use client'

import React, { useState, useEffect } from 'react';
import { Leaf, Award, Clock, Truck, ShoppingCart } from 'lucide-react';
import { ImageSlider } from './ImageSlider';
import { useTheme } from '@/contexts/ThemeContext';

interface OrganicHeroSectionProps {
  slides?: Array<{
    type?: 'image' | 'video';
    url: string;
    alt?: string;
    thumbnail?: string;
    link?: string;
    buttonText?: string;
    showButton?: boolean;
  }>;
}

export function OrganicHeroSection({ slides = [] }: OrganicHeroSectionProps) {
  const CUTOFF_HOUR = 16; // 4 PM - configurable cutoff time
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [isPastCutoff, setIsPastCutoff] = useState(false);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const cutoffTime = new Date();
      cutoffTime.setHours(CUTOFF_HOUR, 0, 0, 0);

      if (now >= cutoffTime) {
        setIsPastCutoff(true);
        setTimeLeft({ hours: 0, minutes: 0 });
      } else {
        setIsPastCutoff(false);
        const diff = cutoffTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ hours, minutes });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const scrollToProductGrid = () => {
    const productGrid = document.querySelector('[data-section="product-grid"]');
    productGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToFarmFresh = () => {
    const farmFresh = document.querySelector('[data-category="Farm Fresh"]');
    if (farmFresh) {
      farmFresh.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      scrollToProductGrid();
    }
  };

  // Use theme-specific hero images or fallback to slides prop
  const organicSlides = slides.length > 0 ? slides : currentTheme.heroImages.map((url, index) => ({
    url,
    alt: `${currentTheme.name} - ${index + 1}`
  }));

  return (
    <div className="relative" data-hero-section="organic-hero">
      {/* Hero Image Slider */}
      <div className="relative">
        <ImageSlider 
          slides={organicSlides}
          className="mb-0"
          autoplay={true}
          autoplayDelay={5000}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
        
        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
            {currentTheme.icon} {currentTheme.heroTagline}
          </h2>
          <p className="text-sm md:text-base opacity-90 drop-shadow-md mb-4 md:mb-6">
            Từ farm đến bàn ăn - Tươi ngon, an toàn, dinh dưỡng
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-row gap-2 sm:gap-4 items-center justify-center md:justify-start">
            <button
              onClick={scrollToProductGrid}
              className="flex-1 sm:flex-none sm:w-auto bg-sunrise-leaf hover:bg-sunrise-leaf/90 text-white py-2.5 px-4 sm:py-3 sm:px-8 text-sm sm:text-lg font-bold rounded-xl 
                         hover:scale-105 hover:shadow-lg transition-all duration-300 
                         flex items-center justify-center gap-1.5 sm:gap-2 drop-shadow-md"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="whitespace-nowrap">Mua Tươi Ngay</span>
            </button>
            
            <button
              onClick={scrollToFarmFresh}
              className="flex-1 sm:flex-none sm:w-auto bg-warm-sun text-gray-900 py-2.5 px-4 sm:py-3 sm:px-8 text-sm sm:text-lg font-bold rounded-xl 
                         hover:scale-105 hover:shadow-lg transition-all duration-300 
                         flex items-center justify-center gap-1.5 sm:gap-2 drop-shadow-md hover:bg-warm-sun/90"
            >
              <Leaf className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="whitespace-nowrap">Khám Phá Farm Fresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Freshness Countdown Banner */}
      <div 
        className="text-gray-900 py-3 transition-colors duration-300"
        style={{ backgroundColor: currentTheme.secondary }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 transition-colors duration-300" style={{ color: currentTheme.primary }} />
            <span className="font-semibold text-sm md:text-base">
              {isPastCutoff ? 'Giao hàng:' : 'Giao hàng trong ngày:'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPastCutoff ? (
              <span 
                className="text-sm md:text-base font-semibold transition-colors duration-300"
                style={{ color: currentTheme.primary }}
              >
                Đặt hàng giao sáng mai ☀️
              </span>
            ) : (
              <>
                <span 
                  className="text-lg md:text-xl font-bold transition-colors duration-300"
                  style={{ color: currentTheme.primary }}
                >
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-xs md:text-sm">còn lại</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Certification Badges Carousel */}
      <div className="bg-white border-b border-gray-100 py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-around gap-6 md:gap-8">
            <CertificationBadge 
              icon={<Leaf className="h-6 w-6 md:h-7 md:w-7 text-sunrise-leaf" />}
              title="100% Organic"
              subtitle="Chứng nhận"
            />
            <CertificationBadge 
              icon={<Award className="h-6 w-6 md:h-7 md:w-7 text-category-fruits" />}
              title="Farm Fresh"
              subtitle="Thu hoạch hôm nay"
            />
            <CertificationBadge 
              icon={<Truck className="h-6 w-6 md:h-7 md:w-7 text-category-pantry" />}
              title="Giao Nhanh 2H"
              subtitle="Nội thành"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CertificationBadgeProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

function CertificationBadge({ icon, title, subtitle }: CertificationBadgeProps) {
  return (
    <div className="flex flex-col items-center text-center min-w-[80px] md:min-w-[100px]">
      <div className="mb-2">
        {icon}
      </div>
      <div className="font-semibold text-xs md:text-sm text-gray-900">
        {title}
      </div>
      <div className="text-xs text-gray-500">
        {subtitle}
      </div>
    </div>
  );
}
