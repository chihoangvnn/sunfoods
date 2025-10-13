import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const VegetablesIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 2C12 2 8 4 8 8C8 10 9 11 9 11L7 13C7 13 5 12 3 14C1 16 2 20 2 20C2 20 6 21 8 19C10 17 9 15 9 15L11 13C11 13 12 14 14 14C18 14 20 10 20 10C20 10 18 6 16 4C14 2 12 2 12 2Z" 
      fill={color} 
      opacity="0.9"
    />
    <path 
      d="M12 2L12 8M9 11L11 9M12 8C12 8 10 10 8 12" 
      stroke={color === 'currentColor' ? '#6CC24A' : color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const FruitsIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="14" r="7" fill={color} opacity="0.9" />
    <path 
      d="M12 7C12 7 10 8 10 10C10 11 11 12 12 12C13 12 14 11 14 10C14 8 12 7 12 7Z" 
      fill={color === 'currentColor' ? '#FF7043' : color}
    />
    <path 
      d="M12 7C12 7 12 3 15 2C15 2 13 5 12 7Z" 
      stroke={color === 'currentColor' ? '#4CAF50' : color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

export const PantryIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="8" width="16" height="12" rx="1" fill={color} opacity="0.9" />
    <path 
      d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <circle cx="12" cy="14" r="1.5" fill={color === 'currentColor' ? '#F2C94C' : color} />
    <path 
      d="M7 12H17M7 16H17" 
      stroke={color === 'currentColor' ? '#F2C94C' : color} 
      strokeWidth="0.5" 
      opacity="0.5"
    />
  </svg>
);

export const WellnessIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 21C12 21 20 16 20 10C20 6 17 4 14 4C13 4 12 5 12 5C12 5 11 4 10 4C7 4 4 6 4 10C4 16 12 21 12 21Z" 
      fill={color} 
      opacity="0.9"
    />
    <path 
      d="M12 10V14M10 12H14" 
      stroke={color === 'currentColor' ? '#7F8C8D' : color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

export const ProteinIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M6 8C6 8 4 10 4 13C4 16 6 18 6 18L10 14L14 18C14 18 16 16 16 13C16 10 14 8 14 8L10 12L6 8Z" 
      fill={color} 
      opacity="0.9"
    />
    <circle cx="10" cy="10" r="2" fill={color === 'currentColor' ? '#8BC34A' : color} />
  </svg>
);

export const HerbsIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 20V8M12 8C12 8 10 6 8 6C6 6 4 8 4 10C4 12 6 14 8 14M12 8C12 8 14 6 16 6C18 6 20 8 20 10C20 12 18 14 16 14M8 14C8 14 10 12 12 12M16 14C16 14 14 12 12 12" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const OrganicCertIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <path 
      d="M8 12L11 15L16 9" 
      stroke={color === 'currentColor' ? '#1F7A4D' : color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12 3V5M12 19V21M3 12H5M19 12H21" 
      stroke={color} 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

export const FreshnessIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" />
    <path 
      d="M12 6V12L16 14" 
      stroke={color === 'currentColor' ? '#FFC145' : color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const FarmOriginIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '',
  color = 'currentColor' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 2L20 8V20H4V8L12 2Z" 
      fill={color} 
      opacity="0.9"
    />
    <rect x="9" y="14" width="6" height="6" fill={color === 'currentColor' ? '#6B4F1D' : color} />
    <path 
      d="M8 10H16M10 8V10M14 8V10" 
      stroke={color === 'currentColor' ? '#FFF9EB' : color} 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);
