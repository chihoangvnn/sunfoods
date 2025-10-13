'use client'

import React, { useState } from 'react';
import { Home, Search, ShoppingCart, Bell, User, LogIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LoginModal from './LoginModal';
import { SunFoodsLogo } from './SunFoodsLogo';

interface Category {
  id: string;
  name: string;
  IconComponent?: any;
  color?: string;
}

interface MobileHeaderProps {
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  cartCount?: number;
  storeName?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: Category[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function MobileHeader({ 
  onSearchClick, 
  onCartClick, 
  onProfileClick,
  cartCount = 0, 
  storeName = "SunFoods.vn",
  searchQuery = '',
  onSearchChange,
  categories = [],
  selectedCategory = 'all',
  onCategorySelect
}: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchClick = () => {
    setIsSearchSheetOpen(true);
    setLocalSearchQuery(searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  const handleCloseSheet = () => {
    setIsSearchSheetOpen(false);
  };

  return (
    <div 
      className="sticky top-0 z-50 bg-sunrise-leaf border-b border-sunrise-leaf shadow-sm lg:hidden"
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        {/* Left: SunFoods Logo as home button */}
        <Button 
          variant="ghost" 
          className="p-2 text-warm-sun hover:text-warm-sun/80"
          onClick={() => window.location.href = '/'}
        >
          <SunFoodsLogo size="sm" showText={true} variant="default" />
        </Button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* User Profile/Login */}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/profile'}
              className="p-2 text-warm-sun hover:text-warm-sun/80"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-5 h-5 rounded-full object-cover border border-warm-sun/30"
                />
              ) : (
                <User size={18} />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/login'}
              className="p-2 text-warm-sun hover:text-warm-sun/80"
            >
              <LogIn size={18} />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-warm-sun hover:text-warm-sun/80"
          >
            <Bell size={20} />
          </Button>

          {/* Search Icon */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearchClick}
            className="p-2 text-warm-sun hover:text-warm-sun/80"
          >
            <Search size={20} />
          </Button>

          {/* Cart with count */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCartClick}
            className="p-2 relative text-warm-sun hover:text-warm-sun/80"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warm-sun text-sunrise-leaf text-xs flex items-center justify-center p-0 min-w-0"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onGuestLogin={() => setIsLoginModalOpen(false)}
      />

      {/* Search Sheet/Modal */}
      <Dialog open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-0 gap-0 fixed bottom-0 left-0 right-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:bottom-auto data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]">
          <DialogHeader className="p-4 pb-3 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Tìm kiếm sản phẩm
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseSheet}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm organic..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 h-12 text-base border-2 border-gray-200 focus:border-sunrise-leaf focus:ring-sunrise-leaf rounded-xl"
                autoFocus
              />
            </div>

            {/* Category Filter Chips */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Danh mục</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isActive = selectedCategory === category.id;
                  const IconComponent = category.IconComponent;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-sunrise-leaf text-white shadow-md' 
                          : 'bg-gray-50 text-gray-700 hover:bg-sunrise-leaf hover:text-white'
                        }
                      `}
                    >
                      {IconComponent && (
                        <IconComponent 
                          size={16} 
                          className={isActive ? 'text-white' : category.color || 'text-gray-600'}
                        />
                      )}
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Info */}
            {(localSearchQuery || selectedCategory !== 'all') && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  {localSearchQuery && (
                    <span>Tìm kiếm: <span className="font-medium text-gray-900">{localSearchQuery}</span></span>
                  )}
                  {localSearchQuery && selectedCategory !== 'all' && <span className="mx-2">•</span>}
                  {selectedCategory !== 'all' && (
                    <span>
                      Danh mục: <span className="font-medium text-gray-900">
                        {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                      </span>
                    </span>
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSearchChange('');
                    handleCategorySelect('all');
                  }}
                  className="mt-2 text-sunrise-leaf hover:text-sunrise-leaf hover:bg-sunrise-leaf/10"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
