import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CatalogClientPage from '../catalog/[categoryId]/CatalogClientPage';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_ID = process.env.FRONTEND_ID || 'frontend-a';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  media?: string;
  category_id: string;
  stock: number;
  short_description?: string;
  status: string;
  benefits?: string | string[];
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const timestamp = Date.now();
    const res = await fetch(`${BACKEND_URL}/api/categories/filter?frontendId=${FRONTEND_ID}&t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
      return null;
    }
    const categories: Category[] = await res.json();
    const category = categories.find(cat => cat.slug === slug && cat.isActive) || null;
    return category;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

async function getProducts(categoryId: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/products?categoryId=${categoryId}&limit=50&sortBy=newest&sortOrder=desc`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  return {
    title: category ? `${category.name} - Sun Foods` : 'Danh mục - Sun Foods',
    description: category?.description || 'Khám phá sản phẩm chất lượng',
  };
}

export default async function CategorySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts(category.id);

  return (
    <CatalogClientPage 
      category={category}
      initialProducts={products}
    />
  );
}
