import React from 'react';

/**
 * FilterOption - Represents a single filter option
 */
export interface FilterOption {
  value: string;
  label: string;
  emoji?: string;
}

/**
 * FilterGroup - Represents a group of related filter options
 */
export interface FilterGroup {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

/**
 * CatalogFilterHeader - Reusable catalog page header with filters
 * 
 * Features:
 * - Title and subtitle display
 * - CTA button (e.g., size guide, help)
 * - Sticky filter bar with glass morphism effect
 * - Bronze gradient active states
 * - Responsive 1-row vs 2-row layout
 * - Support for emoji icons in filter options
 * 
 * @example
 * ```tsx
 * const filterGroups: FilterGroup[] = [
 *   {
 *     label: 'Chất liệu',
 *     options: [
 *       { value: 'all', label: 'Tất cả' },
 *       { value: 'wood', label: 'Gỗ trầm' },
 *     ],
 *     selectedValue: selectedMaterial,
 *     onChange: setSelectedMaterial,
 *   },
 * ];
 * 
 * <CatalogFilterHeader
 *   title="Sản Phẩm Trầm Hương"
 *   subtitle="Bộ sưu tập cao cấp"
 *   ctaText="Hướng dẫn"
 *   onCtaClick={() => setShowGuide(true)}
 *   filterGroups={filterGroups}
 * />
 * ```
 */
export interface CatalogFilterHeaderProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
  filterGroups: FilterGroup[];
}

const FilterChip: React.FC<{
  option: FilterOption;
  isSelected: boolean;
  onClick: () => void;
}> = ({ option, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg font-nunito text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        isSelected
          ? 'bg-gradient-to-r from-[#8E6C3A] to-[#C1A875] text-white shadow-[0_2px_8px_rgba(193,168,117,0.4)]'
          : 'bg-white/60 backdrop-blur-sm text-tramhuong-primary border border-tramhuong-accent/30 hover:border-tramhuong-accent/60 hover:shadow-[0_2px_8px_rgba(193,168,117,0.25)]'
      }`}
    >
      {option.emoji && <span className="mr-1.5">{option.emoji}</span>}
      {option.label}
    </button>
  );
};

export const CatalogFilterHeader: React.FC<CatalogFilterHeaderProps> = ({
  title,
  subtitle,
  ctaText,
  onCtaClick,
  filterGroups,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-playfair font-bold text-tramhuong-primary mb-2">
            {title}
          </h1>
          <p className="text-base md:text-lg font-nunito text-tramhuong-primary/70">
            {subtitle}
          </p>
        </div>
        <button
          onClick={onCtaClick}
          className="mt-4 md:mt-0 px-6 py-3 rounded-lg font-nunito font-medium bg-tramhuong-accent text-white shadow-[0_4px_16px_rgba(193,168,117,0.4)] hover:shadow-[0_6px_20px_rgba(193,168,117,0.5)] transition-all duration-200"
        >
          {ctaText}
        </button>
      </div>

      <div className="sticky top-[88px] z-30 bg-white/80 backdrop-blur-lg border-b border-tramhuong-primary/10 -mx-3 md:-mx-6 lg:-mx-12 xl:-mx-16 px-3 md:px-6 lg:px-12 xl:px-16 py-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-4 md:gap-6">
            {filterGroups.map((group, index) => (
              <div key={index}>
                <span className="text-sm font-nunito font-semibold text-tramhuong-primary/60 uppercase tracking-wide">
                  {group.label}:
                </span>
                <div className="flex flex-wrap gap-2 mt-2 md:inline-flex md:ml-3 md:mt-0">
                  {group.options.map((option) => (
                    <FilterChip
                      key={option.value}
                      option={option}
                      isSelected={group.selectedValue === option.value}
                      onClick={() => group.onChange(option.value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
