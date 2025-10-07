import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  BookOpen, 
  DollarSign, 
  BarChart3, 
  Settings,
  Edit,
  Trash2,
  Download,
  Eye,
  Save,
  X
} from 'lucide-react';

interface Book {
  isbn: string;
  title: string;
  author: string;
  format: string;
  averageRating: number;
  reviewCount: number;
  lowestPrice: number;
  highestPrice: number;
  priceCount: number;
  primaryCategory: string;
  allCategories: string[];
  coverImageUrl?: string;
  ranking?: number;
  isTopSeller?: boolean;
}

// Category interface removed - now managed in separate CategoriesAdmin

// CategoryFormData interface removed - now managed in separate CategoriesAdmin

interface PriceRule {
  id: string;
  ruleName: string;
  categoryId: string;
  ruleType: 'discount' | 'markup' | 'fixed_price' | 'price_range';
  discountPercentage?: number;
  markupPercentage?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive: boolean;
  priority: number;
}

interface BookFormData {
  isbn: string;
  title: string;
  author: string;
  format: string;
  averageRating: number;
  reviewCount: number;
  coverImageUrl: string;
  ranking: number;
  isTopSeller: boolean;
}

const BookCatalogAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'pricing' | 'analytics'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  // Categories removed - now managed in separate CategoriesAdmin page
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('relevance');
  
  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // Categories tab state removed - now managed in separate CategoriesAdmin page
  // Amazon import state removed - now handled in Book Categories Admin
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [bookFormData, setBookFormData] = useState<BookFormData>({
    isbn: '',
    title: '',
    author: '',
    format: '',
    averageRating: 0,
    reviewCount: 0,
    coverImageUrl: '',
    ranking: 0,
    isTopSeller: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('Starting to load initial data...');
      await Promise.all([
        loadBooks(),
        loadPriceRules()
      ]);
      console.log('Initial data loaded successfully');
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        format: selectedCategory !== 'all' ? selectedCategory : '',
        page: '1',
        limit: '50'
      });
      
      const response = await fetch(`/api/books?${params}`);
      console.log('Books API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Books data received:', data.books?.length || 0, 'books');
        setBooks(data.books || []);
        setTotalBooks(data.total || data.books?.length || 0);
      } else if (response.status === 304) {
        console.log('Books: Using cached data, no changes needed');
      } else {
        console.error('Failed to load books:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  // loadCategories removed - categories now managed in separate CategoriesAdmin page

  const loadPriceRules = async () => {
    try {
      const response = await fetch('/api/price-filtering/rules');
      console.log('Price rules API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Price rules data received:', data?.length || 0, 'rules');
        setPriceRules(data || []);
      } else if (response.status === 304) {
        console.log('Price rules: Using cached data, no changes needed');
      } else {
        console.error('Failed to load price rules:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading price rules:', error);
    }
  };

  const handleSearch = () => {
    loadBooks();
  };

  const handleCreateBook = () => {
    setEditingBook(null);
    setBookFormData({
      isbn: '',
      title: '',
      author: '',
      format: '',
      averageRating: 0,
      reviewCount: 0,
      coverImageUrl: '',
      ranking: 0,
      isTopSeller: false
    });
    setShowBookForm(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookFormData({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      format: book.format,
      averageRating: book.averageRating || 0,
      reviewCount: book.reviewCount || 0,
      coverImageUrl: book.coverImageUrl || '',
      ranking: book.ranking || 0,
      isTopSeller: book.isTopSeller || false
    });
    setShowBookForm(true);
  };

  const handleSaveBook = async () => {
    try {
      const isEditing = !!editingBook;
      const url = isEditing ? `/api/books/${editingBook.isbn}` : '/api/books';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookFormData)
      });

      if (response.ok) {
        setShowBookForm(false);
        loadBooks();
        alert(isEditing ? 'Book updated successfully!' : 'Book created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save book');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert(`Error saving book: ${(error as Error).message}`);
    }
  };

  const handleDeleteBook = async (isbn: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`/api/books/${isbn}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadBooks();
        alert('Book deleted successfully!');
      } else {
        throw new Error('Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book. Please try again.');
    }
  };

  // Category management functions removed - now managed in separate CategoriesAdmin page

  // toggleCategoryExpansion removed - now managed in separate CategoriesAdmin page

  // handleEditCategory removed - categories now managed in separate CategoriesAdmin page

  // handleSaveCategory removed - categories now managed in separate CategoriesAdmin page

  // handleDeleteCategory removed - categories now managed in separate CategoriesAdmin page

  // handleAmazonImport removed - Amazon import functionality moved to CategoriesAdmin page

  // cancelAmazonImport removed - Amazon import functionality moved to CategoriesAdmin page

  // resetAmazonImport removed - Amazon import functionality moved to CategoriesAdmin page

  // CategoryTreeNode Component removed - categories now managed in separate CategoriesAdmin page

  const renderBooksTab = () => (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books, authors, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Formats</option>
              <option value="Hardcover">Hardcover</option>
              <option value="Paperback">Paperback</option>
              <option value="Kindle">Kindle</option>
              <option value="Audiobook">Audiobook</option>
            </select>
            
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          <button 
            onClick={handleCreateBook}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </button>
        </div>
      </div>

      {/* Books List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Books ({books.length})</h3>
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-2 text-sm border rounded hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading books...</p>
          </div>
        ) : (
          <div className="divide-y">
            {books.map(book => (
              <div key={book.isbn} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover rounded" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{book.title}</h4>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                        <p className="text-xs text-gray-500">ISBN: {book.isbn} • {book.format}</p>
                        {book.isTopSeller && (
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                            Top Seller
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ${book.lowestPrice ? Number(book.lowestPrice).toFixed(2) : 'N/A'}
                          {book.highestPrice && book.lowestPrice !== book.highestPrice && (
                            <span className="text-sm text-gray-500 ml-1">
                              - ${Number(book.highestPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {book.priceCount} price{book.priceCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        {book.averageRating > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="flex text-yellow-400">
                              {'★'.repeat(Math.floor(book.averageRating))}
                              {'☆'.repeat(5 - Math.floor(book.averageRating))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({book.reviewCount || 0} reviews)
                            </span>
                          </div>
                        )}
                        
                        <div className="text-sm text-blue-600">
                          {book.primaryCategory || 'Uncategorized'}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditBook(book)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Edit book"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book.isbn)}
                          className="p-2 hover:bg-red-100 rounded"
                          title="Delete book"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {books.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500">
                No books found. Try adjusting your search or add some books.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // renderCategoriesTab removed - categories now managed in separate CategoriesAdmin page

  const renderPricingTab = () => (
    <div className="bg-white p-6 rounded-lg border">
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Pricing Rules Management</h3>
        <p className="text-gray-600">Pricing rules functionality will be implemented here</p>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="bg-white p-6 rounded-lg border">
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-600">Analytics and reporting functionality will be implemented here</p>
      </div>
    </div>
  );

  // Amazon Import Modal
  // AmazonImportModal removed - Amazon import functionality moved to CategoriesAdmin page

  // Category Form Modal
  // CategoryFormModal removed - categories now managed in separate CategoriesAdmin page

  // Book Form Modal
  const BookFormModal = () => (
    showBookForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h3>
            <button 
              onClick={() => setShowBookForm(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                value={bookFormData.isbn}
                onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                readOnly={!!editingBook}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={bookFormData.title}
                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={bookFormData.author}
                onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={bookFormData.format}
                onChange={(e) => setBookFormData({ ...bookFormData, format: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Format</option>
                <option value="Hardcover">Hardcover</option>
                <option value="Paperback">Paperback</option>
                <option value="Kindle">Kindle</option>
                <option value="Audiobook">Audiobook</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input
                type="url"
                value={bookFormData.coverImageUrl}
                onChange={(e) => setBookFormData({ ...bookFormData, coverImageUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={bookFormData.averageRating}
                  onChange={(e) => setBookFormData({ ...bookFormData, averageRating: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Count</label>
                <input
                  type="number"
                  min="0"
                  value={bookFormData.reviewCount}
                  onChange={(e) => setBookFormData({ ...bookFormData, reviewCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ranking</label>
              <input
                type="number"
                min="1"
                value={bookFormData.ranking}
                onChange={(e) => setBookFormData({ ...bookFormData, ranking: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Amazon bestseller ranking"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isTopSeller"
                checked={bookFormData.isTopSeller}
                onChange={(e) => setBookFormData({ ...bookFormData, isTopSeller: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isTopSeller" className="text-sm text-gray-700">Top Seller</label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSaveBook}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingBook ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => setShowBookForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Book Catalog System...</p>
          <p className="text-sm text-gray-400 mt-2">Books: {books.length}, Price Rules: {priceRules.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Book Catalog Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-3 py-2 text-sm border rounded hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'books', label: 'Books', icon: BookOpen },
              { id: 'pricing', label: 'Pricing Rules', icon: DollarSign },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'books' && renderBooksTab()}
        {activeTab === 'pricing' && renderPricingTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      {/* Categories management moved to separate CategoriesAdmin page */}

      {/* Book Form Modal */}
      <BookFormModal />
    </div>
  );
};

export default BookCatalogAdmin;