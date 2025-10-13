import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'wouter';
import { Search, Plus, Tag, X, Package, CheckCircle, Target, BarChart } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

// Product Category Types
interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: number;
  sortOrder: number;
  description: string | null;
  icon: string | null;
  color: string;
  productCount: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductCategoryFormData {
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

const DEFAULT_FORM_DATA: ProductCategoryFormData = {
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

// Category Form Modal Component (extracted to prevent re-render on keystroke)
interface CategoryFormModalProps {
  show: boolean;
  editingCategory: ProductCategory | null;
  categoryFormData: ProductCategoryFormData;
  categories: ProductCategory[];
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  setCategoryFormData: React.Dispatch<React.SetStateAction<ProductCategoryFormData>>;
}

const CategoryFormModal = React.memo<CategoryFormModalProps>(({
  show,
  editingCategory,
  categoryFormData,
  categories,
  error,
  onClose,
  onSave,
  setCategoryFormData
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Danh Mục *</label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="VD: Nến thơm, Quà tặng, Trang trí"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={categoryFormData.slug}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Tự động tạo từ tên nếu để trống"
            />
            <p className="text-xs text-gray-500 mt-1">URL thân thiện (VD: nen-thom, qua-tang)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh Mục Cha</label>
            <select
              value={categoryFormData.parentId}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, parentId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Không có (Danh mục gốc)</option>
              {categories
                .filter(cat => cat.id !== editingCategory?.id)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {'  '.repeat(cat.level)}{cat.name} (Cấp {cat.level})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Mô tả danh mục..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input
                type="text"
                value={categoryFormData.icon}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="🕯️"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
              <input
                type="color"
                value={categoryFormData.color}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={categoryFormData.isActive}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Kích hoạt</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={categoryFormData.isFeatured}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Nổi bật</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
            <input
              type="text"
              value={categoryFormData.metaTitle}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Tiêu đề SEO cho trang danh mục"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
            <textarea
              value={categoryFormData.metaDescription}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Mô tả SEO cho trang danh mục"
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
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {editingCategory ? 'Cập Nhật' : 'Tạo Mới'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function GeneralCategoriesAdmin() {
  // State Management
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(''); // Direct search without debounce
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  
  // Form States
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<ProductCategoryFormData>(DEFAULT_FORM_DATA);
  
  // Tree States
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  // Fetch all categories once (no search filter on API)
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        includeStats: 'true'
      });
      
      const response = await fetch(`/api/general-categories?${params}`);
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

  useEffect(() => {
    fetchCategories();
  }, []); // Load once on mount

  // Client-side filtering with useMemo (prevents re-render on every keystroke)
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      let matches = true;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(query);
        const matchesDesc = cat.description?.toLowerCase().includes(query) ?? false;
        matches = matches && (matchesName || matchesDesc);
      }
      
      // Level filter
      if (levelFilter !== 'all') {
        matches = matches && cat.level === Number(levelFilter);
      }
      
      // Status filter
      if (statusFilter === 'active') {
        matches = matches && cat.isActive === true;
      } else if (statusFilter === 'inactive') {
        matches = matches && cat.isActive === false;
      }
      
      return matches;
    });
  }, [categories, searchQuery, levelFilter, statusFilter]);

  // CategoryTreeNode Component
  const CategoryTreeNode: React.FC<{
    category: ProductCategory;
    level: number;
    expanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onDelete: () => void;
    allCategories: ProductCategory[];
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
                className="p-1 hover:bg-gray-200 rounded text-gray-500"
              >
                {expanded ? '▼' : '▶'}
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
                {category.slug} • {category.productCount} sản phẩm
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Sửa"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
              title="Xóa"
            >
              🗑️
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
  const handleEditCategory = (category: ProductCategory) => {
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

  const handleDeleteCategory = async (category: ProductCategory) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
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
    avgProducts: categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.productCount, 0) / categories.length) : 0
  };

  // Get root categories with useMemo (prevents re-render)
  // Support null, undefined, and empty string for root categories (strict check to avoid falsy ID "0")
  const rootCategories = useMemo(() => {
    return filteredCategories.filter(cat => 
      cat.parentId === null || cat.parentId === undefined || cat.parentId === ""
    );
  }, [filteredCategories]);

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
              <h1 className="text-2xl font-bold text-gray-900">Danh Mục Sản Phẩm</h1>
              <p className="text-gray-600 mt-1">Quản lý danh mục sản phẩm chính (nến, quà tặng, trang trí...)</p>
            </div>
            <Link href="/admin">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Về Admin
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
                <h2 className="text-xl font-semibold text-gray-900">Quản Lý Danh Mục</h2>
                <p className="text-sm text-gray-600 mt-1">Quản lý danh mục sản phẩm theo cấu trúc phân cấp</p>
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
                  Thêm Danh Mục
                </button>
              </div>
            </div>
            
            {/* Search & Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm danh mục..."
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
                <option value="all">Tất cả cấp</option>
                <option value="0">Danh mục gốc</option>
                <option value="1">Cấp 1</option>
                <option value="2">Cấp 2</option>
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
              
              <button
                onClick={toggleExpandAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {expandAll ? 'Thu gọn' : 'Mở rộng'}
              </button>
            </div>
          </div>

          {/* Category Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng Danh Mục</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Danh Mục Gốc</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.root}</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đang Hoạt Động</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">TB Sản Phẩm/Danh Mục</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgProducts}</p>
                </div>
                <BarChart className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Category Tree */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cây Danh Mục</h3>
            
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có danh mục nào</p>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryFormData(DEFAULT_FORM_DATA);
                    setShowCategoryForm(true);
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Tạo danh mục đầu tiên
                </button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy danh mục phù hợp</p>
              </div>
            ) : (
              <div className="space-y-1">
                {rootCategories.map((category) => (
                  <CategoryTreeNode
                    key={category.id}
                    category={category}
                    level={0}
                    expanded={expandedCategories.has(category.id)}
                    onToggleExpand={() => toggleExpandedCategory(category.id)}
                    onEdit={() => handleEditCategory(category)}
                    onDelete={() => handleDeleteCategory(category)}
                    allCategories={filteredCategories}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        show={showCategoryForm}
        editingCategory={editingCategory}
        categoryFormData={categoryFormData}
        categories={categories}
        error={error}
        onClose={() => setShowCategoryForm(false)}
        onSave={handleSaveCategory}
        setCategoryFormData={setCategoryFormData}
      />
    </div>
  );
}
