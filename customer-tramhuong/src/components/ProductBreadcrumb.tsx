'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface ProductBreadcrumbProps {
  productName: string;
  categoryName?: string;
}

export default function ProductBreadcrumb({ productName, categoryName = 'Sản phẩm' }: ProductBreadcrumbProps) {
  return (
    <nav className="hidden lg:flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center gap-1 text-foreground/60 hover:text-gold transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Trang chủ</span>
      </Link>
      
      <ChevronRight className="h-4 w-4 text-foreground/40" />
      
      <Link 
        href="/products" 
        className="text-foreground/60 hover:text-gold transition-colors"
      >
        {categoryName}
      </Link>
      
      <ChevronRight className="h-4 w-4 text-foreground/40" />
      
      <span className="text-gold font-medium truncate max-w-[300px]">
        {productName}
      </span>
    </nav>
  );
}
