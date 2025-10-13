import React from 'react';

interface SunFoodsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'white';
}

const sizes = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 40, text: 'text-lg' },
  xl: { icon: 48, text: 'text-xl' },
};

export const SunFoodsLogo: React.FC<SunFoodsLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'default',
}) => {
  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;
  
  const leafColor = variant === 'white' ? '#FFFFFF' : '#1F7A4D';
  const sunColor = variant === 'white' ? '#FFF9EB' : '#FFC145';
  const textColor = variant === 'white' ? 'text-white' : 'text-sunrise-leaf';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Sun rays */}
        <circle cx="24" cy="16" r="12" fill={sunColor} opacity="0.9" />
        
        {/* Sun rays accent */}
        <path
          d="M24 6v-4M24 30v4M14 16l-3-3M34 16l3-3M11 20H7M41 20h-4M14 24l-3 3M34 24l3 3"
          stroke={sunColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Leaf shape - elegant and organic */}
        <path
          d="M24 20C24 20 18 22 16 28C14 34 16 42 16 42C16 42 18 40 20 38C22 36 24 32 24 32C24 32 26 36 28 38C30 40 32 42 32 42C32 42 34 34 32 28C30 22 24 20 24 20Z"
          fill={leafColor}
        />
        
        {/* Leaf vein detail */}
        <path
          d="M24 22C24 22 22 26 22 30C22 34 23 38 23 38M24 22C24 22 26 26 26 30C26 34 25 38 25 38"
          stroke={variant === 'white' ? '#E8F5EE' : '#47AF83'}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${textSize} ${textColor}`}>
            SunFoods.vn
          </span>
          <span className={`text-[0.6em] ${variant === 'white' ? 'text-white/80' : 'text-warm-sun'} font-medium tracking-wide`}>
            TINH HOA THIÊN NHIÊN
          </span>
        </div>
      )}
    </div>
  );
};
