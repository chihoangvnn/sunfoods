'use client'

import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Award, Sparkles, Ruler, Scale, Clock } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';

interface LuxurySpecs {
  origin?: string;
  grade?: string;
  fragrance?: string;
  dimensions?: string;
  weight?: string;
  age?: number;
}

interface FullScreenImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentImageIndex?: number;
  productName: string;
  price: number;
  description?: string;
  specs?: LuxurySpecs;
  onAddToCart?: () => void;
  onContactConsultation?: () => void;
}

export const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentImageIndex = 0,
  productName,
  price,
  description,
  specs,
  onAddToCart,
  onContactConsultation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(currentImageIndex);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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
      setCurrentIndex(currentImageIndex);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentImageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const handleTouchStartY = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMoveY = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY.current;
    
    if (deltaY < -50 && !isBottomSheetExpanded) {
      setIsBottomSheetExpanded(true);
    } else if (deltaY > 50 && isBottomSheetExpanded) {
      setIsBottomSheetExpanded(false);
    }
  };

  const handleTouchStartX = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMoveX = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
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

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-tramhuong-primary/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300"
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
        <div 
          className="relative flex-1 md:w-[60%] flex items-center justify-center bg-tramhuong-primary"
          onTouchStart={handleTouchStartX}
          onTouchMove={handleTouchMoveX}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{
                opacity: currentIndex === index ? 1 : 0,
                transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: currentIndex === index ? 'auto' : 'none'
              }}
            >
              <img
                src={imageUrl}
                alt={`${productName} - ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-tramhuong-accent/20 backdrop-blur-lg border-2 border-tramhuong-accent/40 flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(193,168,117,0.3)] hover:bg-tramhuong-accent/30 hover:scale-110 z-10"
                style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-tramhuong-accent" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-tramhuong-accent/20 backdrop-blur-lg border-2 border-tramhuong-accent/40 flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(193,168,117,0.3)] hover:bg-tramhuong-accent/30 hover:scale-110 z-10"
                style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-tramhuong-accent" />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'bg-tramhuong-accent w-8'
                      : 'bg-tramhuong-accent/40 hover:bg-tramhuong-accent/60'
                  }`}
                  style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {isMobile ? (
          <div
            className={`fixed bottom-0 left-0 right-0 bg-tramhuong-accent/15 backdrop-blur-xl rounded-t-3xl transition-all duration-300 ${
              isBottomSheetExpanded ? 'h-[70vh]' : 'h-[3rem]'
            }`}
            style={{ transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            onTouchStart={handleTouchStartY}
            onTouchMove={handleTouchMoveY}
          >
            <div className="w-12 h-1.5 bg-tramhuong-accent/40 rounded-full mx-auto my-4" />
            
            {!isBottomSheetExpanded ? (
              <div className="px-6 pb-4">
                <h2 className="font-playfair text-lg text-tramhuong-accent font-semibold truncate mb-1">
                  {productName}
                </h2>
                <p className="font-playfair text-2xl font-bold text-tramhuong-accent">
                  {formatVietnamPrice(price)}
                </p>
              </div>
            ) : (
              <>
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
                          <MapPin className="h-5 w-5 text-tramhuong-accent/70" />
                          <div>
                            <span className="font-nunito text-sm text-tramhuong-primary/60">Nguồn gốc:</span>
                            <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.origin}</span>
                          </div>
                        </div>
                      )}

                      {specs.grade && (
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-tramhuong-accent/70" />
                          <div className="flex items-center gap-2">
                            <span className="font-nunito text-sm text-tramhuong-primary/60">Độ quý hiếm:</span>
                            {getGradeBadge(specs.grade)}
                          </div>
                        </div>
                      )}

                      {specs.fragrance && (
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-tramhuong-accent/70" />
                          <div>
                            <span className="font-nunito text-sm text-tramhuong-primary/60">Hương thơm:</span>
                            <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.fragrance}</span>
                          </div>
                        </div>
                      )}

                      {specs.dimensions && (
                        <div className="flex items-center gap-3">
                          <Ruler className="h-5 w-5 text-tramhuong-accent/70" />
                          <div>
                            <span className="font-nunito text-sm text-tramhuong-primary/60">Kích thước:</span>
                            <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.dimensions}</span>
                          </div>
                        </div>
                      )}

                      {specs.weight && (
                        <div className="flex items-center gap-3">
                          <Scale className="h-5 w-5 text-tramhuong-accent/70" />
                          <div>
                            <span className="font-nunito text-sm text-tramhuong-primary/60">Trọng lượng:</span>
                            <span className="font-nunito font-semibold text-tramhuong-primary ml-2">{specs.weight}</span>
                          </div>
                        </div>
                      )}

                      {specs.age && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-tramhuong-accent/70" />
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
                      Thêm vào giỏ hàng
                    </button>
                  )}
                  {onContactConsultation && (
                    <button
                      onClick={onContactConsultation}
                      className="flex-1 px-6 py-3 bg-transparent border-2 border-tramhuong-accent text-tramhuong-accent font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-300"
                      style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      Liên hệ tư vấn
                    </button>
                  )}
                </div>
              </>
            )}
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
                        <MapPin className="h-5 w-5 text-tramhuong-accent/70 mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Nguồn gốc</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.origin}</p>
                        </div>
                      </div>
                    )}

                    {specs.grade && (
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-tramhuong-accent/70 mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Độ quý hiếm</p>
                          {getGradeBadge(specs.grade)}
                        </div>
                      </div>
                    )}

                    {specs.fragrance && (
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-tramhuong-accent/70 mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Hương thơm</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.fragrance}</p>
                        </div>
                      </div>
                    )}

                    {specs.dimensions && (
                      <div className="flex items-start gap-3">
                        <Ruler className="h-5 w-5 text-tramhuong-accent/70 mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Kích thước</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.dimensions}</p>
                        </div>
                      </div>
                    )}

                    {specs.weight && (
                      <div className="flex items-start gap-3">
                        <Scale className="h-5 w-5 text-tramhuong-accent/70 mt-0.5" />
                        <div>
                          <p className="font-nunito text-sm text-tramhuong-primary/60 mb-1">Trọng lượng</p>
                          <p className="font-nunito font-semibold text-tramhuong-primary">{specs.weight}</p>
                        </div>
                      </div>
                    )}

                    {specs.age && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-tramhuong-accent/70 mt-0.5" />
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
                    Thêm vào giỏ hàng
                  </button>
                )}
                {onContactConsultation && (
                  <button
                    onClick={onContactConsultation}
                    className="w-full px-6 py-3 bg-transparent border-2 border-tramhuong-accent text-tramhuong-accent font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                  >
                    Liên hệ tư vấn
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
