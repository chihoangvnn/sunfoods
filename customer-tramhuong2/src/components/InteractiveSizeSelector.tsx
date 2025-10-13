'use client'

import React, { useState } from 'react';
import { Ruler } from 'lucide-react';

interface SizeOption {
  value: string;
  label: string;
  description?: string;
}

interface InteractiveSizeSelectorProps {
  sizes: SizeOption[];
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
  productType?: 'bracelet' | 'necklace' | 'pendant';
  className?: string;
}

export const InteractiveSizeSelector: React.FC<InteractiveSizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  productType = 'bracelet',
  className = ''
}) => {
  const [hoveredSize, setHoveredSize] = useState<string | null>(null);

  const handleSizeClick = (e: React.MouseEvent, sizeValue: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSizeSelect?.(sizeValue);
  };

  const getTypeLabel = () => {
    switch (productType) {
      case 'bracelet': return 'Chu vi cổ tay';
      case 'necklace': return 'Chiều dài dây';
      case 'pendant': return 'Kích thước mặt';
      default: return 'Kích thước';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Ruler className="h-3.5 w-3.5 text-tramhuong-accent" />
        <span className="text-xs font-nunito font-medium text-tramhuong-primary/70">
          {getTypeLabel()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size.value;
          const isHovered = hoveredSize === size.value;

          return (
            <button
              key={size.value}
              onClick={(e) => handleSizeClick(e, size.value)}
              onMouseEnter={() => setHoveredSize(size.value)}
              onMouseLeave={() => setHoveredSize(null)}
              className={`
                relative px-3 py-1.5 rounded-lg font-nunito text-xs font-medium
                transition-all duration-200
                ${isSelected 
                  ? 'bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white shadow-[0_4px_12px_rgba(193,168,117,0.4)] ring-2 ring-tramhuong-accent/50 ring-offset-1' 
                  : 'bg-white/60 text-tramhuong-primary border border-tramhuong-accent/30 hover:border-tramhuong-accent/60 hover:shadow-[0_2px_8px_rgba(193,168,117,0.25)]'
                }
              `}
              style={{
                willChange: 'transform, box-shadow',
                transform: isSelected || isHovered ? 'translateY(-1px)' : 'translateY(0)'
              }}
            >
              <span className="font-semibold">{size.label}</span>
              {size.description && (
                <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-white/90' : 'text-tramhuong-primary/60'}`}>
                  {size.description}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Size Guide Hint */}
      {hoveredSize && (
        <div className="mt-2 p-2 rounded-lg bg-tramhuong-accent/10 border border-tramhuong-accent/20">
          <p className="text-xs font-nunito text-tramhuong-primary/70 leading-relaxed">
            💡 {sizes.find(s => s.value === hoveredSize)?.description || 'Vừa vặn và thoải mái'}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to generate common size options
export const getBraceletSizes = (): SizeOption[] => [
  { value: 'S', label: 'S (14-15cm)', description: 'Cổ tay nhỏ' },
  { value: 'M', label: 'M (16-17cm)', description: 'Cổ tay trung bình' },
  { value: 'L', label: 'L (18-19cm)', description: 'Cổ tay lớn' },
  { value: 'XL', label: 'XL (20-21cm)', description: 'Cổ tay rất lớn' }
];

export const getNecklaceSizes = (): SizeOption[] => [
  { value: '40cm', label: '40cm', description: 'Sát cổ' },
  { value: '45cm', label: '45cm', description: 'Cổ điển' },
  { value: '50cm', label: '50cm', description: 'Dài vừa' },
  { value: '55cm', label: '55cm', description: 'Dài' }
];

export const getPendantSizes = (): SizeOption[] => [
  { value: 'small', label: '15x20mm', description: 'Nhỏ gọn' },
  { value: 'medium', label: '20x30mm', description: 'Vừa phải' },
  { value: 'large', label: '25x35mm', description: 'To nổi bật' }
];
