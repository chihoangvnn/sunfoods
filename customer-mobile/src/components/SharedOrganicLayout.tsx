import React from 'react';

interface SharedOrganicLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'full' | '7xl' | '6xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function SharedOrganicLayout({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = 'md'
}: SharedOrganicLayoutProps) {
  const maxWidthClass = {
    'full': 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl'
  }[maxWidth];

  const paddingClass = {
    'none': '',
    'sm': 'px-4 sm:px-6',
    'md': 'px-6 sm:px-8 lg:px-12',
    'lg': 'px-8 sm:px-12 lg:px-16'
  }[padding];

  return (
    <div className={`${maxWidthClass} mx-auto ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}
