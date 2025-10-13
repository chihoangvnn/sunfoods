'use client'

import { useState } from 'react';
import { HeroVideoSection } from '@/components/HeroVideoSection';
import { FullScreenVideoModal } from '@/components/FullScreenVideoModal';

export default function DemoHeroVideoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = () => {
    console.log('View Details clicked');
    setIsModalOpen(true);
  };

  const handleContactConsultation = () => {
    console.log('Contact Consultation clicked');
    alert('Liên hệ tư vấn: 0123 456 789');
  };

  const handleAddToCart = () => {
    console.log('Add to cart clicked');
    alert('Đã thêm vào giỏ hàng!');
  };

  return (
    <div className="min-h-screen bg-tramhuong-bg">
      <HeroVideoSection
        videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
        posterUrl="https://www.w3schools.com/html/pic_trulli.jpg"
        productName="Tượng Phật Di Lặc Gỗ Trầm Hương"
        price={15000000}
        onViewDetails={handleViewDetails}
        onContactConsultation={handleContactConsultation}
      />
      
      <FullScreenVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
        productName="Tượng Phật Di Lặc Gỗ Trầm Hương"
        price={15000000}
        description="Tượng Phật Di Lặc được chạm khắc tinh xảo từ gỗ trầm hương quý hiếm, toát lên vẻ uy nghiêm và thanh tịnh. Sản phẩm mang đậm nét văn hóa truyền thống, phù hợp để thờ cúng hoặc làm quà tặng sang trọng."
        specs={{
          origin: 'Khánh Hòa',
          grade: 'AAA',
          fragrance: 'Ngọt nhẹ, thanh tao',
          dimensions: '30cm x 15cm x 12cm',
          weight: '2.5kg',
          age: 50
        }}
        onAddToCart={handleAddToCart}
        onContactConsultation={handleContactConsultation}
      />
      
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <h2 className="font-playfair text-2xl font-bold text-tramhuong-primary">
          Video Components Demo
        </h2>
        
        <div className="bg-white/70 backdrop-blur-lg border border-tramhuong-accent/20 rounded-lg p-6 space-y-4">
          <h3 className="font-playfair text-xl font-semibold text-tramhuong-primary">
            HeroVideoSection Features:
          </h3>
          
          <ul className="space-y-2 font-nunito text-tramhuong-primary/80">
            <li>✓ Auto-detect video orientation on metadata load</li>
            <li>✓ Click anywhere on video to play/pause</li>
            <li>✓ Bronze play/pause button overlay on hover</li>
            <li>✓ Muted by default with loop enabled</li>
            <li>✓ Lazy loading with IntersectionObserver</li>
            <li>✓ Full-width hero section at 70vh height</li>
            <li>✓ Luxury bronze glass overlay at bottom</li>
            <li>✓ Product name in Playfair Display</li>
            <li>✓ Price in Playfair Display (text-5xl, bold)</li>
            <li>✓ CTA buttons with bronze styling</li>
            <li>✓ 100% bronze/brown color palette (#C1A875 & #3D2B1F)</li>
            <li>✓ Glass morphism with backdrop-blur-lg</li>
            <li>✓ 300ms cubic-bezier transitions</li>
          </ul>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-tramhuong-accent/20 rounded-lg p-6 space-y-4">
          <h3 className="font-playfair text-xl font-semibold text-tramhuong-primary">
            FullScreenVideoModal Features:
          </h3>
          
          <ul className="space-y-2 font-nunito text-tramhuong-primary/80">
            <li>✓ Full-screen overlay with backdrop (bg-black/80)</li>
            <li>✓ Desktop: Split layout - Video 60% left, Sidebar 40% right</li>
            <li>✓ Mobile: Full-screen video + swipe-up bottom sheet</li>
            <li>✓ Custom bronze controls: Play/Pause, Mute/Unmute, Fullscreen</li>
            <li>✓ Progress bar with bronze accent (#C1A875)</li>
            <li>✓ Auto-detect video orientation (landscape/portrait/square)</li>
            <li>✓ Click outside video area to close modal</li>
            <li>✓ Bronze glass sidebar: bg-white/80 backdrop-blur-xl</li>
            <li>✓ Luxury specs with icons (Origin, Grade, Fragrance, etc.)</li>
            <li>✓ Grade badges: AAA (gradient), AA+ (solid), A+ (outline)</li>
            <li>✓ CTA buttons: "Thêm Vào Giỏ" & "Liên Hệ Tư Vấn"</li>
            <li>✓ 100% bronze/brown palette compliance</li>
            <li>✓ Smooth 300ms cubic-bezier animations</li>
          </ul>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-tramhuong-accent/20 rounded-lg p-6 space-y-4">
          <h3 className="font-playfair text-xl font-semibold text-tramhuong-primary">
            Video Orientation Detection:
          </h3>
          
          <p className="font-nunito text-tramhuong-primary/80">
            Both components automatically detect video orientation:
          </p>
          
          <ul className="space-y-2 font-nunito text-tramhuong-primary/80 ml-4">
            <li>• <strong>Landscape</strong> (width &gt; height): 16:9 aspect ratio with object-contain</li>
            <li>• <strong>Portrait</strong> (height &gt; width): 9:16 aspect ratio with object-cover (auto-crop)</li>
            <li>• <strong>Square</strong> (width = height): 1:1 aspect ratio</li>
          </ul>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-tramhuong-accent/20 rounded-lg p-6 space-y-4">
          <h3 className="font-playfair text-xl font-semibold text-tramhuong-primary">
            Try It Out:
          </h3>
          
          <button
            onClick={handleViewDetails}
            className="px-6 py-3 bg-tramhuong-accent text-white font-nunito font-semibold rounded-lg hover:bg-tramhuong-accent/90 transition-all duration-300 shadow-[0_4px_12px_rgba(193,168,117,0.3)] hover:shadow-[0_6px_16px_rgba(193,168,117,0.4)] hover:-translate-y-0.5"
            style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            Open Full-Screen Modal
          </button>
        </div>
      </div>
    </div>
  );
}
