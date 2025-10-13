'use client'

import React, { useState, useMemo } from 'react';
import { Search, Clock, User, Tag, ChevronRight, Home, Bell, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  readingTime: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface BlogTabProps {
  onPostClick: (post: BlogPost) => void;
  searchQuery?: string;
  selectedCategory?: string;
  onSearchChange?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  cartCount?: number;
  onCartClick?: () => void;
  onHomeClick?: () => void;
}

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Cách chọn nhang trầm hương chất lượng cho gia đình',
    excerpt: 'Hướng dẫn chi tiết cách nhận biết và lựa chọn nhang trầm hương tự nhiên, không hóa chất để mang lại bình an cho tổ ấm.',
    content: 'Nhang trầm hương được biết đến là loại hương có mùi thơm thanh tao, giúp tĩnh tâm và mang lại năng lượng tích cực...',
    author: 'Thầy Minh An',
    publishedAt: '2025-09-20',
    category: 'Nhang Trầm',
    tags: ['nhang trầm', 'chất lượng', 'gia đình'],
    readingTime: 5,
    isFeatured: true,
    isNew: true
  },
  {
    id: '2',
    title: 'Phong thủy đặt bàn thờ gia tiên theo tuổi gia chủ',
    excerpt: 'Nguyên tắc vàng trong việc bố trí bàn thờ gia tiên phù hợp với mệnh tuổi để thu hút tài lộc và bình an.',
    content: 'Việc đặt bàn thờ gia tiên đúng phong thủy không chỉ thể hiện lòng thành kính mà còn ảnh hưởng đến vận khí gia đình...',
    author: 'Cô Lan Hương',
    publishedAt: '2025-09-18',
    category: 'Phong Thủy',
    tags: ['phong thủy', 'bàn thờ', 'gia tiên'],
    imageUrl: '/images/ban-tho-phong-thuy.jpg',
    readingTime: 8,
    isFeatured: false,
    isNew: true
  },
  {
    id: '3',
    title: 'Tinh dầu sả chanh - Công dụng và cách sử dụng đúng cách',
    excerpt: 'Khám phá những lợi ích tuyệt vời của tinh dầu sả chanh trong việc thư giãn, khử trùng và tạo không gian sống trong lành.',
    content: 'Tinh dầu sả chanh là một trong những loại tinh dầu thiên nhiên được ưa chuộng nhất hiện nay...',
    author: 'Chị Mai Phương',
    publishedAt: '2025-09-15',
    category: 'Tinh Dầu',
    tags: ['tinh dầu', 'sả chanh', 'thư giãn'],
    readingTime: 6,
    isFeatured: true,
    isNew: false
  },
  {
    id: '4',
    title: 'Cách cúng rằm tháng 7 đúng cách theo truyền thống',
    excerpt: 'Hướng dẫn đầy đủ nghi lễ cúng rằm tháng 7, từ chuẩn bị lễ vật đến thời gian cúng phù hợp nhất.',
    content: 'Rằm tháng 7 âm lịch là một trong những ngày lễ quan trọng trong văn hóa tâm linh Việt Nam...',
    author: 'Thầy Đức Minh',
    publishedAt: '2025-09-12',
    category: 'Tâm Linh',
    tags: ['cúng rằm', 'tháng 7', 'truyền thống'],
    readingTime: 10,
    isFeatured: true,
    isNew: false
  },
  {
    id: '5',
    title: 'Đá phong thủy nào phù hợp với mệnh Kim, Mộc, Thủy, Hỏa, Thổ',
    excerpt: 'Tìm hiểu cách chọn đá phong thủy phù hợp với ngũ hành mệnh số để tăng cường vận khí và sức khỏe.',
    content: 'Mỗi mệnh số trong ngũ hành đều có những viên đá phong thủy riêng giúp cân bằng năng lượng...',
    author: 'Thầy Hải Nam',
    publishedAt: '2025-09-10',
    category: 'Phong Thủy',
    tags: ['đá phong thủy', 'ngũ hành', 'mệnh số'],
    imageUrl: '/images/da-phong-thuy.jpg',
    readingTime: 12,
    isFeatured: false,
    isNew: false
  },
  {
    id: '6',
    title: 'Lợi ích của việc thắp nhang khi thiền định',
    excerpt: 'Khám phá tác dụng của hương thơm tự nhiên trong việc hỗ trợ thiền định, tĩnh tâm và nâng cao năng lượng tích cực.',
    content: 'Thiền định kết hợp với hương nhang tự nhiên đã được thực hành từ hàng ngàn năm trong văn hóa Á Đông...',
    author: 'Sư Thích Minh Tâm',
    publishedAt: '2025-09-08',
    category: 'Tâm Linh',
    tags: ['thiền định', 'nhang', 'tâm linh'],
    imageUrl: '/images/thien-dinh-nhang.jpg',
    readingTime: 7,
    isFeatured: false,
    isNew: false
  }
];

const BLOG_CATEGORIES = [
  { id: 'all', name: 'Tất cả', count: MOCK_BLOG_POSTS.length },
  { id: 'Nhang Trầm', name: 'Nhang Trầm', count: MOCK_BLOG_POSTS.filter(p => p.category === 'Nhang Trầm').length },
  { id: 'Phong Thủy', name: 'Phong Thủy', count: MOCK_BLOG_POSTS.filter(p => p.category === 'Phong Thủy').length },
  { id: 'Tinh Dầu', name: 'Tinh Dầu', count: MOCK_BLOG_POSTS.filter(p => p.category === 'Tinh Dầu').length },
  { id: 'Tâm Linh', name: 'Tâm Linh', count: MOCK_BLOG_POSTS.filter(p => p.category === 'Tâm Linh').length }
];

export function BlogTab({ 
  onPostClick, 
  searchQuery: externalSearchQuery = '', 
  selectedCategory: externalSelectedCategory = 'all',
  onSearchChange,
  onCategorySelect,
  cartCount = 0,
  onCartClick,
  onHomeClick 
}: BlogTabProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSelectedCategory, setInternalSelectedCategory] = useState('all');
  
  const searchQuery = onSearchChange ? externalSearchQuery : internalSearchQuery;
  const selectedCategory = onCategorySelect ? externalSelectedCategory : internalSelectedCategory;

  const filteredPosts = useMemo(() => {
    let posts = MOCK_BLOG_POSTS;

    if (selectedCategory !== 'all') {
      posts = posts.filter(post => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [searchQuery, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full min-h-screen bg-white/60 backdrop-blur-md">
      <div className="sticky top-0 z-50 bg-tramhuong-primary/95 backdrop-blur-md text-white shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <div className="w-full px-4 lg:px-8 xl:px-12 2xl:px-16 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onHomeClick}
                className="p-2 hover:bg-tramhuong-accent/20 rounded-lg transition-all duration-300"
              >
                <Home className="h-5 w-5 text-tramhuong-accent" />
              </button>
              <div>
                <h1 className="text-lg font-bold font-playfair whitespace-nowrap">BLOG - Nhang Sạch .Net</h1>
                <p className="text-tramhuong-accent/80 text-sm">Sản phẩm tự nhiên</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-tramhuong-accent/20 rounded-lg transition-all duration-300 relative">
                <Bell className="h-5 w-5 text-tramhuong-accent" />
              </button>
              <button 
                onClick={onCartClick}
                className="p-2 hover:bg-tramhuong-accent/20 rounded-lg transition-all duration-300 relative"
              >
                <ShoppingCart className="h-5 w-5 text-tramhuong-accent" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tramhuong-accent text-tramhuong-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 xl:px-12 2xl:px-16 py-6">
        <div className="mb-6">
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-tramhuong-accent" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => {
                const newQuery = e.target.value;
                if (onSearchChange) {
                  onSearchChange(newQuery);
                } else {
                  setInternalSearchQuery(newQuery);
                }
              }}
              className="block w-full pl-9 pr-3 py-3 border border-tramhuong-accent/20 rounded-lg text-sm bg-white/60 backdrop-blur-md placeholder-tramhuong-primary/50 focus:outline-none focus:placeholder-tramhuong-primary/40 focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (onCategorySelect) {
                    onCategorySelect(category.id);
                  } else {
                    setInternalSelectedCategory(category.id);
                  }
                }}
                className={`transition-all duration-300 ${selectedCategory === category.id 
                    ? 'bg-tramhuong-accent hover:bg-tramhuong-accent/90 text-tramhuong-primary' 
                    : 'text-tramhuong-accent border-tramhuong-accent/30 hover:bg-tramhuong-accent/10'
                  }
                `}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-xl font-bold font-playfair text-tramhuong-primary mb-6">Bài viết nổi bật</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPosts.filter(post => post.isFeatured).slice(0, 2).map((post) => (
                <div 
                  key={post.id}
                  onClick={() => onPostClick(post)}
                  className="bg-white/60 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(193,168,117,0.3)] hover:shadow-[0_12px_48px_rgba(193,168,117,0.4)] transition-all duration-300 overflow-hidden cursor-pointer group border border-tramhuong-accent/20"
                >
                  {post.imageUrl && (
                    <div className="h-48 bg-tramhuong-accent/10 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tramhuong-accent/10 text-tramhuong-accent border border-tramhuong-accent/20">
                        <Tag className="w-3 h-3 mr-1 text-tramhuong-accent" />
                        {post.category}
                      </span>
                      {post.isNew && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tramhuong-accent/20 text-tramhuong-accent border border-tramhuong-accent/30">
                          Mới
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold font-playfair text-tramhuong-primary mb-2 line-clamp-2 group-hover:text-tramhuong-accent transition-all duration-300">
                      {post.title}
                    </h3>
                    <p className="text-tramhuong-primary/80 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-tramhuong-primary/70">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-tramhuong-accent" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-tramhuong-accent" />
                          {post.readingTime} phút đọc
                        </span>
                      </div>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-playfair text-tramhuong-primary">
              {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : 
               selectedCategory === 'all' ? 'Tất cả bài viết' : `Danh mục: ${BLOG_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
            </h2>
            <span className="text-sm text-tramhuong-primary/70">
              {filteredPosts.length} bài viết
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-tramhuong-accent mb-4" />
              <h3 className="text-lg font-medium font-playfair text-tramhuong-primary mb-2">Không tìm thấy bài viết</h3>
              <p className="text-tramhuong-primary/70">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => onPostClick(post)}
                  className="bg-white/60 backdrop-blur-md rounded-lg shadow-[0_8px_32px_rgba(193,168,117,0.3)] hover:shadow-[0_12px_48px_rgba(193,168,117,0.4)] transition-all duration-300 overflow-hidden cursor-pointer group border border-tramhuong-accent/20"
                >
                  {post.imageUrl && (
                    <div className="h-40 bg-tramhuong-accent/10 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-tramhuong-accent/10 text-tramhuong-accent border border-tramhuong-accent/20">
                        {post.category}
                      </span>
                      {post.isNew && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-tramhuong-accent/20 text-tramhuong-accent border border-tramhuong-accent/30">
                          Mới
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold font-playfair text-tramhuong-primary mb-2 line-clamp-2 group-hover:text-tramhuong-accent transition-all duration-300">
                      {post.title}
                    </h3>
                    <p className="text-tramhuong-primary/80 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-tramhuong-primary/70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-tramhuong-accent" />
                        {post.readingTime} phút
                      </span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-tramhuong-accent/20">
                      <span className="text-xs text-tramhuong-primary/70">{post.author}</span>
                      <ChevronRight className="w-4 h-4 text-tramhuong-accent group-hover:text-tramhuong-accent/80 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
