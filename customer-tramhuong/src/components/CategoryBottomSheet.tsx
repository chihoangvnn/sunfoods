'use client';

import { useEffect } from 'react';
import { X, Palette, Circle, Sparkles, Flame } from 'lucide-react';

interface CategoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (path: string) => void;
}

const categories = [
  {
    id: 'tram-huong-my-nghe',
    name: 'Trầm Hương Mỹ Nghệ',
    icon: <Palette className="w-8 h-8 text-tramhuong-accent" />,
    path: '/tram-huong-my-nghe',
    description: 'Nghệ thuật trầm hương thủ công'
  },
  {
    id: 'chuoi-hat-tram-huong',
    name: 'Chuỗi Hạt Trầm Hương',
    icon: <Circle className="w-8 h-8 text-tramhuong-accent" />,
    path: '/chuoi-hat-tram-huong',
    description: 'Vòng tay chuỗi hạt thiên nhiên'
  },
  {
    id: 'nhang-tram-huong',
    name: 'Nhang Trầm Hương',
    icon: <Sparkles className="w-8 h-8 text-tramhuong-accent" />,
    path: '/nhang-tram-huong',
    description: 'Nhang trầm hương cao cấp'
  },
  {
    id: 'tram-huong-xong-dot',
    name: 'Trầm Hương Xông Đốt',
    icon: <Flame className="w-8 h-8 text-tramhuong-accent" />,
    path: '/tram-huong-xong-dot',
    description: 'Trầm hương xông đốt nguyên chất'
  }
];

export default function CategoryBottomSheet({ 
  isOpen, 
  onClose, 
  onCategorySelect 
}: CategoryBottomSheetProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCategoryClick = (path: string) => {
    onCategorySelect(path);
    onClose();
  };

  return (
    <div>
      {/* Backdrop Overlay - fade in/out */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet Container - slide up/down */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[101] transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white/60 backdrop-blur-md rounded-t-3xl border-t border-tramhuong-accent/20 shadow-[0_-8px_32px_rgba(193,168,117,0.3)]">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <h2 className="font-playfair text-2xl font-bold text-tramhuong-primary text-center">
              Danh Mục Sản Phẩm
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-tramhuong-accent/60 hover:text-tramhuong-accent transition-colors duration-300"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Category Cards Grid */}
          <div className="px-6 pb-8 pt-2">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.path)}
                  className="bg-white/80 backdrop-blur-sm border border-tramhuong-accent/20 rounded-2xl p-5 text-center transition-all duration-300 hover:scale-105 hover:border-tramhuong-accent/40 shadow-[0_4px_16px_rgba(193,168,117,0.3)] hover:shadow-[0_8px_24px_rgba(193,168,117,0.4)] active:scale-95"
                >
                  <div className="mb-3">{category.icon}</div>
                  <h3 className="font-playfair font-semibold text-tramhuong-primary mb-2 text-base">
                    {category.name}
                  </h3>
                  <p className="font-nunito text-sm text-tramhuong-primary/70 leading-relaxed">
                    {category.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
