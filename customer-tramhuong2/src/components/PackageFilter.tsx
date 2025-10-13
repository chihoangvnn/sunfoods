'use client'

import React from 'react';

interface PackageFilterProps {
  selected: string[];
  onSelect: (packages: string[]) => void;
}

export const PackageFilter: React.FC<PackageFilterProps> = ({ selected, onSelect }) => {
  const packages = ['10', '20', '50', '100'];

  const togglePackage = (pkg: string) => {
    if (selected.includes(pkg)) {
      onSelect(selected.filter(p => p !== pkg));
    } else {
      onSelect([...selected, pkg]);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-playfair font-semibold text-tramhuong-primary mb-4">
        Số lượng que
      </h2>
      <div className="flex flex-wrap gap-2">
        {packages.map((pkg) => {
          const isSelected = selected.includes(pkg);
          return (
            <button
              key={pkg}
              onClick={() => togglePackage(pkg)}
              className={`px-4 py-2 rounded-lg font-nunito font-medium transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white shadow-[0_4px_16px_rgba(193,168,117,0.4)]'
                  : 'bg-white/60 backdrop-blur-md text-tramhuong-primary border border-tramhuong-accent/30 hover:border-tramhuong-accent/60 hover:shadow-[0_2px_12px_rgba(193,168,117,0.3)]'
              }`}
            >
              {pkg} que
            </button>
          );
        })}
      </div>
    </div>
  );
};
