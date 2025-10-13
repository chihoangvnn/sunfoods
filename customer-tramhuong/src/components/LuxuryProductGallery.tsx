'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface LuxuryProductGalleryProps {
  images: string[];
  productName: string;
  videos?: string[];
}

export default function LuxuryProductGallery({ images, productName, videos = [] }: LuxuryProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  const validImages = images.filter(img => img && img.trim() !== '');
  const allMedia = [...validImages, ...videos];
  const selectedMedia = allMedia[selectedIndex] || validImages[0];
  const isVideo = videos.includes(selectedMedia);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Main Image/Video Display */}
      <div className="relative bg-white rounded-lg overflow-hidden shadow-sm group">
        <div 
          className="relative min-h-[400px] lg:min-h-[600px] cursor-zoom-in"
          onMouseEnter={() => !isVideo && setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {isVideo ? (
            <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px] bg-black flex items-center justify-center">
              <video 
                src={selectedMedia} 
                controls 
                className="max-w-full max-h-full"
                poster={validImages[0]}
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : (
            <Image
              src={selectedMedia}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              priority={selectedIndex === 0}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className={`object-contain transition-all duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }
                  : {}
              }
              quality={90}
            />
          )}
        </div>

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {selectedIndex + 1}/{allMedia.length}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {allMedia.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allMedia.map((media, index) => {
            const isVideoThumb = videos.includes(media);
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-gold shadow-lg ring-2 ring-gold/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isVideoThumb ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <Play className="h-8 w-8 text-white absolute z-10" />
                    <Image
                      src={validImages[0]}
                      alt="Video thumbnail"
                      fill
                      sizes="100px"
                      className="object-cover opacity-70"
                    />
                  </div>
                ) : (
                  <Image
                    src={media}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
