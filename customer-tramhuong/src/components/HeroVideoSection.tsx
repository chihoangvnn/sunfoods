'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface HeroVideoSectionProps {
  videoUrl: string;
  posterUrl?: string;
  productName: string;
  price: number;
  onViewDetails?: () => void;
  onContactConsultation?: () => void;
}

type VideoOrientation = 'landscape' | 'portrait' | 'square';

export const HeroVideoSection: React.FC<HeroVideoSectionProps> = ({
  videoUrl,
  posterUrl,
  productName,
  price,
  onViewDetails,
  onContactConsultation,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoOrientation, setVideoOrientation] = useState<VideoOrientation>('landscape');
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  useEffect(() => {
    if (isIntersecting) {
      setShouldLoadVideo(true);
    }
  }, [isIntersecting]);

  const handleVideoMetadataLoaded = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      
      if (videoWidth > videoHeight) {
        setVideoOrientation('landscape');
      } else if (videoHeight > videoWidth) {
        setVideoOrientation('portrait');
      } else {
        setVideoOrientation('square');
      }
      
      setIsVideoLoaded(true);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const getAspectRatioClass = () => {
    switch (videoOrientation) {
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[9/16]';
      case 'square':
        return 'aspect-square';
      default:
        return 'aspect-video';
    }
  };

  const getObjectFitClass = () => {
    return videoOrientation === 'portrait' ? 'object-cover' : 'object-contain';
  };

  return (
    <div ref={elementRef} className="relative w-full h-[70vh] overflow-hidden bg-tramhuong-primary/5">
      {shouldLoadVideo ? (
        <>
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-tramhuong-bg/50 animate-pulse">
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={productName}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="relative w-16 h-16 rounded-full border-4 border-tramhuong-accent/30 border-t-tramhuong-accent animate-spin" />
            </div>
          )}
          
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            muted
            loop
            playsInline
            className={`w-full h-full ${getObjectFitClass()} transition-all duration-300`}
            onLoadedMetadata={handleVideoMetadataLoaded}
            style={{ opacity: isVideoLoaded ? 1 : 0 }}
          />

          <button
            onClick={togglePlay}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="absolute inset-0 flex items-center justify-center bg-tramhuong-primary/0 hover:bg-tramhuong-primary/10 transition-all duration-300"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            <div 
              className={`w-20 h-20 rounded-full bg-tramhuong-primary/80 backdrop-blur-lg border-2 border-tramhuong-accent/40 flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(193,168,117,0.3)] ${
                isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-tramhuong-accent/90 ml-0.5" />
              ) : (
                <Play className="h-8 w-8 text-tramhuong-accent/90 ml-1" />
              )}
            </div>
          </button>
        </>
      ) : (
        <div className="relative w-full h-full">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-tramhuong-primary/20 backdrop-blur-sm">
            <Play className="h-16 w-16 text-tramhuong-accent drop-shadow-lg" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-tramhuong-accent/10 backdrop-blur-lg border-t-2 border-tramhuong-accent/40 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <h1 className="font-playfair text-3xl text-tramhuong-primary font-semibold leading-tight">
                {productName}
              </h1>
              <p className="font-playfair text-5xl font-bold text-tramhuong-accent">
                {formatVietnamPrice(price)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={onViewDetails}
                className="px-6 py-3 bg-tramhuong-accent text-tramhuong-primary font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/90 transition-all duration-300 shadow-[0_4px_12px_rgba(193,168,117,0.3)] hover:shadow-[0_6px_16px_rgba(193,168,117,0.4)] hover:-translate-y-0.5"
                style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                Xem Chi Tiết
              </button>
              <button
                onClick={onContactConsultation}
                className="px-6 py-3 bg-transparent border-2 border-tramhuong-accent text-tramhuong-accent font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-300 hover:-translate-y-0.5"
                style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
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
