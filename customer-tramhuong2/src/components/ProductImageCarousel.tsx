'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
}

export default function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  
  const validImages = images.filter(img => img && img.trim() !== '');

  useEffect(() => {
    if (!carouselApi) return;

    setTotalSlides(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());

    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  return (
    <div className="relative bg-tramhuong-primary/20 backdrop-blur-sm lg:rounded-lg lg:overflow-hidden">
      <Carousel setApi={setCarouselApi} className="w-full">
        <CarouselContent>
          {validImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[3/4] lg:aspect-square bg-tramhuong-primary/15 backdrop-blur-md">
                <Image
                  src={image}
                  alt={`${productName} - ${index + 1}`}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  quality={85}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Image counter */}
      <div className="absolute bottom-4 right-4 bg-tramhuong-accent/20 backdrop-blur-md border border-tramhuong-accent/30 text-tramhuong-primary px-3 py-1 rounded-full text-sm font-playfair shadow-[0_2px_12px_rgba(193,168,117,0.3)]">
        {currentSlide + 1}/{totalSlides}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-tramhuong-accent w-6 shadow-[0_0_8px_rgba(193,168,117,0.6)]'
                : 'bg-tramhuong-accent/40 backdrop-blur-sm w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
