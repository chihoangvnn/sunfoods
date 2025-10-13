'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CategoryTheme, getCategoryTheme } from '@/config/categoryThemes';

interface ThemeContextType {
  currentTheme: CategoryTheme;
  activeCategory: string;
  setTheme: (categoryId: string) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<string>('default');
  const [currentTheme, setCurrentTheme] = useState<CategoryTheme>(getCategoryTheme('default'));

  const setTheme = (categoryId: string) => {
    const newTheme = getCategoryTheme(categoryId);
    setCurrentTheme(newTheme);
    setActiveCategory(categoryId);
  };

  const resetTheme = () => {
    setCurrentTheme(getCategoryTheme('default'));
    setActiveCategory('default');
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, activeCategory, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
