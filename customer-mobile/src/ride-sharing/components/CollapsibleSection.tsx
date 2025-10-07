'use client'

import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  badge?: string;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  badge,
}: CollapsibleSectionProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 pb-2 border-b transition-colors hover:opacity-80"
      >
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
        {badge && (
          <span className="text-sm text-muted-foreground ml-auto mr-2">{badge}</span>
        )}
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ml-auto ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={isOpen ? "pb-0" : ""}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
