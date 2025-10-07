import React, { useState, useEffect } from "react";
import { Link } from 'wouter';
import { Search, Plus, ChevronDown, ChevronRight, Tag, Edit, Trash2, X, Upload, Package, TrendingUp, Users, Star, AlertTriangle, CheckCircle, Target, BarChart3 } from "lucide-react";

// Category Types (for general products, industry-based)
interface Category {
  id: string;
  name: string;
  description?: string;
  industryId: string;
  industryName?: string;
  isActive: boolean;
  isVipOnly?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  // Stats (if available)
  stats?: {
    frontendAssignments: number;
    isAssigned: boolean;
  };
}

interface Industry {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  industryId: string;
  isActive: boolean;
  isVipOnly: boolean;
  sortOrder: number;
}

const DEFAULT_FORM_DATA: CategoryFormData = {
  name: '',
  description: '',
  industryId: '',
  isActive: true,
  isVipOnly: false,
  sortOrder: 0
};

export default function CategoriesAdmin() {
  // State Management
  const [categories, setCategories] = useState<Category[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [categoryActiveFilter, setCategoryActiveFilter] = useState('all');
  
  // Form States
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(DEFAULT_FORM_DATA);
  
  // Display States
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedCategories] = useState<Set<string>>(new Set()); // Temporary fix

  // Load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories?includeStats=true');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load industries from API
  const loadIndustries = async () => {
    try {
      const response = await fetch('/api/industries');
      if (!response.ok) {
        throw new Error('Failed to fetch industries');
      }
      const data = await response.json();
      setIndustries(data);
    } catch (err) {
      console.error('Error loading industries:', err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadIndustries();
  }, []);

  // Category filtering (industry-based, non-hierarchical)
  const getFilteredCategories = () => {
    return categories.filter(cat => {
      let matches = true;
      
      // Search filter
      if (categorySearchQuery) {
        matches = matches && cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase());
      }
      
      // Industry filter
      if (industryFilter !== 'all') {
        matches = matches && cat.industryId === industryFilter;
      }
      
      // Active status filter
      if (categoryActiveFilter !== 'all') {
        const isActive = categoryActiveFilter === 'active';
        matches = matches && cat.isActive === isActive;
      }
      
      return matches;
    });
  };

  // Get industry name by ID
  const getIndustryName = (industryId: string) => {
    const industry = industries.find(ind => ind.id === industryId);
    return industry ? industry.name : 'Unknown Industry';
  };

  // Get category stats summary
  const getCategoryStats = () => {
    const total = categories.length;
    const active = categories.filter(cat => cat.isActive).length;
    const assigned = categories.filter(cat => cat.stats?.isAssigned).length;
    return { total, active, assigned };
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      industryId: category.industryId,
      isActive: category.isActive,
      isVipOnly: category.isVipOnly || false,
      sortOrder: category.sortOrder || 0
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    try {
      const isEditing = !!editingCategory;
      const url = isEditing 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      setShowCategoryForm(false);
      setCategoryFormData(DEFAULT_FORM_DATA);
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadCategories();
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  // CategoryListItem Component (flat industry-based structure)
  const CategoryListItem: React.FC<{
    category: Category;
    onEdit: () => void;
    onDelete: () => void;
  }> = ({ category, onEdit, onDelete }) => {
    return (
      <div className={`flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm ${!category.isActive ? 'opacity-60' : ''}`}>
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-2 rounded-lg ${category.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Tag className={`w-5 h-5 ${category.isActive ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h4 className="font-semibold text-gray-900">{category.name}</h4>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {getIndustryName(category.industryId)}
              </span>
              {!category.isActive && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                  Inactive
                </span>
              )}
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                {category.stats?.isAssigned ? 'Assigned' : 'Not Assigned'}
              </span>
              {category.stats?.frontendAssignments && (
                <span className="flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  {category.stats.frontendAssignments} frontend(s)
                </span>
              )}
              <span className="text-xs">ID: {category.id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Calculate stats (industry-based)
  const stats = {
    total: categories.length,
    active: categories.filter(cat => cat.isActive).length,
    assigned: categories.filter(cat => cat.stats?.isAssigned).length,
    byIndustry: industries.reduce((acc, industry) => {
      acc[industry.name] = categories.filter(cat => cat.industryId === industry.id).length;
      return acc;
    }, {} as Record<string, number>)
  };

  // Filter categories for display
  const filteredRootCategories = getFilteredCategories();

  // Category Form Modal
  const CategoryFormModal = () => (
    showCategoryForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button 
              onClick={() => setShowCategoryForm(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Hương nến, Phụ kiện, Trang trí"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={categoryFormData.slug}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Auto-generated from name if empty"
              />
              <p className="text-xs text-gray-500 mt-1">URL-friendly version (e.g., huong-nen)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
              <select
                value={categoryFormData.industryId}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, industryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select an industry...</option>
                {industries.map(industry => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Categories are grouped by industry</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Category description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="🕯️"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  className="w-full h-10 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryFormData.isActive}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryFormData.isFeatured}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryFormData.isVipOnly}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isVipOnly: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">👑 VIP Only</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCategoryForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCategory}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
              <p className="text-gray-600 mt-1">Manage product categories for incense, candles, and accessories</p>
            </div>
            <Link href="/admin">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Back to Admin
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Categories Header & Controls */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage product categories with hierarchical organization</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryFormData(DEFAULT_FORM_DATA);
                    setShowCategoryForm(true);
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </button>
              </div>
            </div>
            
            {/* Search & Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <select 
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
              
              <select 
                value={categoryActiveFilter}
                onChange={(e) => setCategoryActiveFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {viewMode === 'list' ? 'Grid View' : 'List View'}
              </button>
            </div>
          </div>

          {/* Category Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Root Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.root}</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Products/Category</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgProducts}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Category Tree */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Category Hierarchy</h3>
            </div>
            
            <div className="p-6">
              {filteredRootCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first category</p>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryFormData(DEFAULT_FORM_DATA);
                      setShowCategoryForm(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Category
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRootCategories.map((category) => (
                    <CategoryListItem
                      key={category.id}
                      category={category}
                      onEdit={() => handleEditCategory(category)}
                      onDelete={() => handleDeleteCategory(category)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal />
    </div>
  );
}