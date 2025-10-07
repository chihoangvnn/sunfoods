import React, { useState, useEffect } from "react";
import { Link } from 'wouter';
import { Search, Plus, ChevronDown, ChevronRight, Tag, Edit, Trash2, X, Package, TrendingUp, Users, Star, AlertTriangle, CheckCircle, Target, BarChart3 } from "lucide-react";

// Book Category Types
interface BookCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: number;
  sortOrder: number;
  description: string | null;
  icon: string | null;
  color: string;
  bookCount: number; // Changed from productCount to bookCount
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookCategoryFormData {
  name: string;
  slug: string;
  parentId: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
}

const DEFAULT_FORM_DATA: BookCategoryFormData = {
  name: '',
  slug: '',
  parentId: '',
  description: '',
  icon: '',
  color: '#10b981',
  isActive: true,
  isFeatured: false,
  metaTitle: '',
  metaDescription: ''
};

export default function BookCategoriesAdmin() {
  // State Management
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  
  // Form States
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BookCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<BookCategoryFormData>(DEFAULT_FORM_DATA);
  
  // Tree States
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        includeStats: 'true',
        search: searchQuery,
        level: levelFilter === 'all' ? '' : levelFilter,
        isActive: statusFilter === 'all' ? 'all' : (statusFilter === 'active' ? 'true' : 'false')
      });
      
      const response = await fetch(`/api/general-categories?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchQuery, levelFilter, statusFilter]);

  // CategoryTreeNode Component
  const CategoryTreeNode: React.FC<{
    category: BookCategory;
    level: number;
    expanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onDelete: () => void;
    allCategories: BookCategory[];
  }> = ({ category, level, expanded, onToggleExpand, onEdit, onDelete, allCategories }) => {
    const children = allCategories.filter(cat => cat.parentId === category.id);
    const hasChildren = children.length > 0;

    return (
      <div className="select-none">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 ${!category.isActive ? 'opacity-60' : ''}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={onToggleExpand}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className={`p-2 rounded-lg ${category.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Tag className={`w-4 h-4 ${category.isActive ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Level {category.level}
                </span>
                {category.isFeatured && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Featured
                  </span>
                )}
                {!category.isActive && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {category.slug} • {category.bookCount} books
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Edit Category"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete Category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Render children recursively */}
        {expanded && hasChildren && (
          <div>
            {children.map((child) => (
              <CategoryTreeNode
                key={child.id}
                category={child}
                level={level + 1}
                expanded={expandedCategories.has(child.id)}
                onToggleExpand={() => toggleExpandedCategory(child.id)}
                onEdit={() => handleEditCategory(child)}
                onDelete={() => handleDeleteCategory(child)}
                allCategories={allCategories}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Tree utility functions
  const toggleExpandedCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedCategories(new Set());
    } else {
      const allIds = new Set(categories.map(cat => cat.id));
      setExpandedCategories(allIds);
    }
    setExpandAll(!expandAll);
  };

  // Category operations
  const handleEditCategory = (category: BookCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || '',
      description: category.description || '',
      icon: category.icon || '',
      color: category.color,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || ''
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (category: BookCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/general-categories/${category.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleSaveCategory = async () => {
    try {
      const isEditing = !!editingCategory;
      const url = isEditing 
        ? `/api/general-categories/${editingCategory.id}`
        : '/api/general-categories';
      
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
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  // Calculate stats
  const stats = {
    total: categories.length,
    active: categories.filter(cat => cat.isActive).length,
    root: categories.filter(cat => cat.level === 0).length,
    avgBooks: categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.bookCount, 0) / categories.length) : 0
  };

  // Filter and sort categories for display
  const rootCategories = categories.filter(cat => cat.parentId === null);

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
                placeholder="e.g., Fiction, Non-fiction, Academic"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select
                value={categoryFormData.parentId}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, parentId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">No Parent (Root Category)</option>
                {categories
                  .filter(cat => cat.id !== editingCategory?.id) // Don't allow self as parent
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'  '.repeat(cat.level)}{cat.name} (Level {cat.level})
                    </option>
                  ))}
              </select>
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
                  className="w-full h-10 border rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryFormData.isActive}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryFormData.isFeatured}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isFeatured: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
              <input
                type="text"
                value={categoryFormData.metaTitle}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, metaTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="SEO title for category page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
              <textarea
                value={categoryFormData.metaDescription}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, metaDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows={2}
                placeholder="SEO description for category page"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 mt-6">
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/8"></div>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Book Categories</h1>
              <p className="text-gray-600 mt-1">Manage book categories for classification and organization</p>
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
          {/* Categories Header & Controls */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage book categories with hierarchical organization</p>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <select 
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Levels</option>
                <option value="0">Root Categories</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              
              <button
                onClick={toggleExpandAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {expandAll ? 'Collapse All' : 'Expand All'}
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
                  <p className="text-sm text-gray-600">Avg Books/Category</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgBooks}</p>
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
              {rootCategories.length === 0 ? (
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
                <div className="space-y-2">
                  {rootCategories.map((category) => (
                    <CategoryTreeNode
                      key={category.id}
                      category={category}
                      level={0}
                      expanded={expandedCategories.has(category.id)}
                      onToggleExpand={() => toggleExpandedCategory(category.id)}
                      onEdit={() => handleEditCategory(category)}
                      onDelete={() => handleDeleteCategory(category)}
                      allCategories={categories}
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

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}