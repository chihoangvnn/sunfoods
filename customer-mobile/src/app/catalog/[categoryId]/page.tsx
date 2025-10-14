import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CatalogClientPage from './CatalogClientPage';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
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

async function getCategory(categoryId: string): Promise<Category | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/categories/${categoryId}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) return null;
    return res.json();
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
  params: { categoryId: string } 
}): Promise<Metadata> {
  const category = await getCategory(params.categoryId);
  
  return {
    title: category ? `${category.name} - Sun Foods` : 'Danh mục - Sun Foods',
    description: category?.description || 'Khám phá sản phẩm chất lượng',
  };
}

export default async function CatalogPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const [category, products] = await Promise.all([
    getCategory(params.categoryId),
    getProducts(params.categoryId),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <CatalogClientPage 
      category={category}
      initialProducts={products}
    />
  );
}
