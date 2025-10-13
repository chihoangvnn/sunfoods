'use client'

import React from 'react';

interface ScentFilterProps {
  selected: string;
  onSelect: (scent: string) => void;
}

export const ScentFilter: React.FC<ScentFilterProps> = ({ selected, onSelect }) => {
  const scents = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Thơm nhẹ', label: 'Thơm nhẹ' },
    { value: 'Đậm đà', label: 'Đậm đà' },
    { value: 'Thanh khiết', label: 'Thanh khiết' },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-playfair font-semibold text-tramhuong-primary mb-4">
        Hương thơm
      </h2>
      <div className="flex flex-wrap gap-2">
        {scents.map((scent) => (
          <button
            key={scent.value}
            onClick={() => onSelect(scent.value)}
            className={`px-4 py-2 rounded-lg font-nunito font-medium transition-all duration-300 ${
              selected === scent.value
                ? 'bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white shadow-[0_4px_16px_rgba(193,168,117,0.4)]'
                : 'bg-white/60 backdrop-blur-md text-tramhuong-primary border border-tramhuong-accent/30 hover:border-tramhuong-accent/60 hover:shadow-[0_2px_12px_rgba(193,168,117,0.3)]'
            }`}
          >
            {scent.label}
          </button>
        ))}
      </div>
    </div>
  );
};
