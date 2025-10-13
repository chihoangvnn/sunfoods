'use client'

import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, MapPin, Award, Sparkles, Ruler, Scale, Clock } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';

interface LuxurySpecs {
  origin?: string;
  grade?: string;
  fragrance?: string;
  dimensions?: string;
  weight?: string;
  age?: number;
}

interface FullScreenVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  productName: string;
  price: number;
  description?: string;
  specs?: LuxurySpecs;
  onAddToCart?: () => void;
  onContactConsultation?: () => void;
}

type VideoOrientation = 'landscape' | 'portrait' | 'square';

export const FullScreenVideoModal: React.FC<FullScreenVideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  productName,
  price,
  description,
  specs,
  onAddToCart,
  onContactConsultation,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoOrientation, setVideoOrientation] = useState<VideoOrientation>('landscape');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsPlaying(false);
      setCurrentTime(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
      
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY.current;
    
    if (deltaY < -50 && !isBottomSheetExpanded) {
      setIsBottomSheetExpanded(true);
    } else if (deltaY > 50 && isBottomSheetExpanded) {
      setIsBottomSheetExpanded(false);
    }
  };

  const getObjectFitClass = () => {
    return videoOrientation === 'portrait' ? 'object-cover' : 'object-contain';
  };

  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;

    const badgeStyles = {
      'AAA': 'bg-tramhuong-accent text-tramhuong-primary',
      'AA+': 'bg-tramhuong-accent text-tramhuong-primary',
      'A+': 'bg-transparent border-2 border-tramhuong-accent text-tramhuong-accent'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeStyles[grade as keyof typeof badgeStyles] || badgeStyles['A+']}`}>
        {grade}
      </span>
    );
  };

  if (!isOpen) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-tramhuong-primary/90 flex items-center justify-center animate-in fade-in duration-300"
      onClick={handleBackdropClick}
      style={{ transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[60] w-12 h-12 rounded-full bg-tramhuong-accent/20 backdrop-blur-lg border-2 border-tramhuong-accent/40 flex items-center justify-center hover:bg-tramhuong-accent/30 transition-all duration-300 shadow-[0_4px_12px_rgba(193,168,117,0.3)] hover:scale-110"
        style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        aria-label="Close modal"
      >
        <X className="h-6 w-6 text-tramhuong-accent" />
      </button>

      <div className="w-full h-full flex flex-col md:flex-row">
        <div className="relative flex-1 md:w-[60%] flex items-center justify-center bg-tramhuong-primary">
          <video
            ref={videoRef}
            src={videoUrl}
            muted={isMuted}
            loop
            playsInline
            className={`w-full h-full ${getObjectFitClass()} cursor-pointer`}
            onLoadedMetadata={handleVideoMetadataLoaded}
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-tramhuong-primary/80 to-transparent p-6">
            <div 
              className="w-full h-1 bg-tramhuong-accent/30 rounded-full cursor-pointer mb-4"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-tramhuong-accent rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-tramhuong-primary/70 backdrop-blur-lg border border-tramhuong-accent/40 flex items-center justify-center hover:bg-tramhuong-primary/80 transition-all duration-300"
                  style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-tramhuong-accent/90" />
                  ) : (
                    <Play className="h-5 w-5 text-tramhuong-accent/90 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-tramhuong-primary/70 backdrop-blur-lg border border-tramhuong-accent/40 flex items-center justify-center hover:bg-tramhuong-primary/80 transition-all duration-300"
                  style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-tramhuong-accent/90" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-tramhuong-accent/90" />
                  )}
                </button>
              </div>

              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full bg-tramhuong-primary/70 backdrop-blur-lg border border-tramhuong-accent/40 flex items-center justify-center hover:bg-tramhuong-primary/80 transition-all duration-300"
                style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                aria-label="Fullscreen"
              >
                <Maximize className="h-5 w-5 text-tramhuong-accent/90" />
              </button>
            </div>
          </div>
        </div>

        {isMobile ? (
          <div
            className={`fixed bottom-0 left-0 right-0 bg-tramhuong-accent/15 backdrop-blur-xl rounded-t-3xl transition-all duration-300 ${
              isBottomSheetExpanded ? 'h-[70vh]' : 'h-[30vh]'
            }`}
            style={{ transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div className="w-12 h-1.5 bg-tramhuong-accent/40 rounded-full mx-auto my-4" />
            
            <div className="px-6 pb-6 overflow-y-auto h-[calc(100%-6rem)]">
              <h2 className="font-playfair text-3xl text-tramhuong-accent font-semibold mb-3">
                {productName}
              </h2>
              <p className="font-playfair text-4xl font-bold text-tramhuong-accent mb-6">
                {formatVietnamPrice(price)}
              </p>

              {description && (
                <p className="font-nunito text-tramhuong-primary/70 mb-6 leading-relaxed">
                  {description}
                </p>
              )}

              {specs && (
                <div className="space-y-4 mb-6">
                  {specs.origin && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-tramhuong-accent" />
                      <div>
                        <span className="font-nunito text-sm text-tramhuong-primary/60">Nguồn gốc:</span>
                        <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.origin}</span>
                      </div>
                    </div>
                  )}

                  {specs.grade && (
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-tramhuong-accent" />
                      <div className="flex items-center gap-2">
                        <span className="font-nunito text-sm text-tramhuong-primary/60">Độ quý hiếm:</span>
                        {getGradeBadge(specs.grade)}
                      </div>
                    </div>
                  )}

                  {specs.fragrance && (
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-tramhuong-accent" />
                      <div>
                        <span className="font-nunito text-sm text-tramhuong-primary/60">Hương thơm:</span>
                        <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.fragrance}</span>
                      </div>
                    </div>
                  )}

                  {specs.dimensions && (
                    <div className="flex items-center gap-3">
                      <Ruler className="h-5 w-5 text-tramhuong-accent" />
                      <div>
                        <span className="font-nunito text-sm text-tramhuong-primary/60">Kích thước:</span>
                        <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.dimensions}</span>
                      </div>
                    </div>
                  )}

                  {specs.weight && (
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-tramhuong-accent" />
                      <div>
                        <span className="font-nunito text-sm text-tramhuong-primary/60">Trọng lượng:</span>
                        <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.weight}</span>
                      </div>
                    </div>
                  )}

                  {specs.age && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-tramhuong-accent" />
                      <div>
                        <span className="font-nunito text-sm text-tramhuong-primary/60">Tuổi đời:</span>
                        <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.age} năm</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-tramhuong-accent/20 backdrop-blur-xl border-t border-tramhuong-accent/20 flex gap-3">
              {onAddToCart && (
                <button
                  onClick={onAddToCart}
                  className="flex-1 px-6 py-3 bg-tramhuong-accent text-tramhuong-primary font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/90 transition-all duration-300 shadow-[0_4px_12px_rgba(193,168,117,0.3)]"
                  style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  Thêm Vào Giỏ
                </button>
              )}
              {onContactConsultation && (
                <button
                  onClick={onContactConsultation}
                  className="flex-1 px-6 py-3 bg-transparent border-2 border-tramhuong-accent text-tramhuong-accent font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-300"
                  style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  Liên Hệ Tư Vấn
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full md:w-[40%] bg-tramhuong-accent/15 backdrop-blur-xl overflow-y-auto">
            <div className="p-8 h-full flex flex-col">
              <div className="flex-1">
                <h2 className="font-playfair text-3xl text-tramhuong-accent font-semibold mb-3">
                  {productName}
                </h2>
                <p className="font-playfair text-4xl font-bold text-tramhuong-accent mb-8">
                  {formatVietnamPrice(price)}
                </p>

                {description && (
                  <p className="font-nunito text-tramhuong-primary/70 mb-8 leading-relaxed">
                    {description}
                  </p>
                )}

                {specs && (
                  <div className="space-y-5 mb-8">
                    <h3 className="font-playfair text-xl text-tramhuong-primary font-semibold mb-4">
                      Thông Số Sản Phẩm
                    </h3>

                    {specs.origin && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-tramhuong-accent mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Nguồn gốc</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.origin}</p>
                        </div>
                      </div>
                    )}

                    {specs.grade && (
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-tramhuong-accent mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Độ quý hiếm</p>
                          {getGradeBadge(specs.grade)}
                        </div>
                      </div>
                    )}

                    {specs.fragrance && (
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-tramhuong-accent mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Hương thơm</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.fragrance}</p>
                        </div>
                      </div>
                    )}

                    {specs.dimensions && (
                      <div className="flex items-start gap-3">
                        <Ruler className="h-5 w-5 text-tramhuong-accent mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Kích thước</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.dimensions}</p>
                        </div>
                      </div>
                    )}

                    {specs.weight && (
                      <div className="flex items-start gap-3">
                        <Scale className="h-5 w-5 text-tramhuong-accent mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Trọng lượng</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.weight}</p>
                        </div>
                      </div>
                    )}

                    {specs.age && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-tramhuong-accent mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Tuổi đời</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.age} năm</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-tramhuong-accent/20">
                {onAddToCart && (
                  <button
                    onClick={onAddToCart}
                    className="w-full px-6 py-3 bg-tramhuong-accent text-tramhuong-primary font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/90 transition-all duration-300 shadow-[0_4px_12px_rgba(193,168,117,0.3)] hover:shadow-[0_6px_16px_rgba(193,168,117,0.4)] hover:-translate-y-0.5"
                    style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                  >
                    Thêm Vào Giỏ
                  </button>
                )}
                {onContactConsultation && (
                  <button
                    onClick={onContactConsultation}
                    className="w-full px-6 py-3 bg-transparent border-2 border-tramhuong-accent text-tramhuong-accent font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                  >
                    Liên Hệ Tư Vấn
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
