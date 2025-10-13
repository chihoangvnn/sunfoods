'use client'

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Award, Sparkles, Play, Pause } from 'lucide-react';
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

interface VideoProductCardProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  price: number;
  specs?: LuxurySpecs;
  onClick?: () => void;
}

export const VideoProductCard: React.FC<VideoProductCardProps> = ({
  videoUrl,
  posterUrl,
  title,
  price,
  specs,
  onClick
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [showSpecsOverlay, setShowSpecsOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const specsTimeoutRef = useRef<NodeJS.Timeout>();

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
      setShouldLoadVideo(true);
    }
  }, [isIntersecting]);

  useEffect(() => {
    return () => {
      if (specsTimeoutRef.current) {
        clearTimeout(specsTimeoutRef.current);
      }
    };
  }, []);


  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // BOTH mobile AND desktop: first click plays, second click opens modal
    if (!isPlaying) {
      // First click: play video
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
      
      // Mobile: also show specs overlay
      if (isMobile && specs) {
        setShowSpecsOverlay(true);
        specsTimeoutRef.current = setTimeout(() => {
          setShowSpecsOverlay(false);
        }, 2000);
      }
    } else {
      // Second click: open modal
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
      className="group relative overflow-hidden rounded-xl will-change-transform transition-all duration-300 bg-[#FFFFFF]/85 backdrop-blur-xl border border-tramhuong-accent/20 shadow-[0_2px_8px_rgba(193,168,117,0.1),0_8px_24px_rgba(193,168,117,0.15)]
      hover:-translate-y-2 hover:border-tramhuong-accent/40 hover:shadow-[0_4px_16px_rgba(193,168,117,0.2),0_12px_32px_rgba(193,168,117,0.25)] cursor-pointer"
      style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-tramhuong-primary/5">
        <div className="absolute inset-0 border border-tramhuong-accent/30" />
        
        {shouldLoadVideo ? (
          <>
            {!isVideoLoaded && posterUrl && (
              <div className="absolute inset-0">
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-tramhuong-bg/50 animate-pulse">
                  <div className="w-12 h-12 rounded-full border-4 border-tramhuong-accent/30 border-t-tramhuong-accent animate-spin" />
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onLoadedMetadata={() => setIsVideoLoaded(true)}
              style={{ transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </>
        ) : posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-nunito text-tramhuong-accent">Mỹ nghệ</span>
          </div>
        )}

        {shouldLoadVideo && (
          <button
            onClick={handlePlayPause}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-tramhuong-primary/70 backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
              isMobile 
                ? 'opacity-90 hover:opacity-100' 
                : 'opacity-70 group-hover:opacity-90 hover:opacity-100'
            } hover:scale-110 hover:bg-tramhuong-primary/80 shadow-[0_4px_16px_rgba(193,168,117,0.5)]`}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-tramhuong-accent/90" />
            ) : (
              <Play className="h-8 w-8 text-tramhuong-accent/90 ml-1" />
            )}
          </button>
        )}

        {specs && (
          <div
            className={`absolute inset-0 bg-tramhuong-primary/95 backdrop-blur-md p-6 flex flex-col justify-center space-y-4 transition-opacity duration-300 ${
              showSpecsOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
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

        <div className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-tramhuong-accent/20 backdrop-blur-lg border-2 border-tramhuong-accent/50 shadow-[0_4px_12px_rgba(193,168,117,0.4)] z-10">
          <p className="font-playfair text-2xl font-bold text-tramhuong-accent">
            {formatVietnamPrice(price)}
          </p>
        </div>
      </div>

      <h3 className="font-playfair text-tramhuong-primary text-lg text-center mt-3 px-3 pb-4 leading-tight line-clamp-2 font-semibold">
        {title}
      </h3>
    </div>
  );
};
