'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Clock, User, Tag, Share2, BookOpen, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPost {
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
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface BlogPostProps {
  post: BlogPost;
  onBack: () => void;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (category: string) => void;
}

export function BlogPost({ post, onBack, onTagClick, onCategoryClick }: BlogPostProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);

  const generateTOC = (content: string): TableOfContentsItem[] => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const toc: TableOfContentsItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      
      toc.push({
        id,
        title,
        level
      });
    }

    return toc;
  };

  const parseContent = (content: string): string => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    
    return content.replace(headingRegex, (match, hashes, title) => {
      const level = hashes.length;
      const id = title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h${level} id="${id}" class="scroll-mt-4 font-playfair">${title.trim()}</h${level}>`;
    });
  };

  const parsedContent = useMemo(() => parseContent(post.content), [post.content]);

  useEffect(() => {
    const toc = generateTOC(post.content);
    setTableOfContents(toc);
  }, [post.content]);

  useEffect(() => {
    const headings = document.querySelectorAll('h1, h2, h3');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -80% 0%' }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [parsedContent]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.seoTitle || post.title,
    "description": post.seoDescription || post.excerpt,
    "image": post.imageUrl,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "NhangSach.Net",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nhangsach.net/blog/${post.id}`
    },
    "keywords": post.seoKeywords || post.tags,
    "wordCount": post.content.split(' ').length,
    "timeRequired": `PT${post.readingTime}M`,
    "articleSection": post.category,
    "about": {
      "@type": "Thing",
      "name": post.category
    }
  };

  return (
    <div className="min-h-screen bg-white/60 backdrop-blur-md">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-white/60 backdrop-blur-md border-b border-tramhuong-accent/20 py-3 px-4">
        <div className="w-full px-4 lg:px-8 xl:px-12 2xl:px-16">
          <nav className="flex items-center text-sm text-tramhuong-primary">
            <button
              onClick={onBack}
              className="flex items-center hover:text-tramhuong-accent transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1 text-tramhuong-accent" />
              Blog
            </button>
            <span className="mx-2 text-tramhuong-accent/40">/</span>
            <button
              onClick={() => onCategoryClick?.(post.category)}
              className="hover:text-tramhuong-accent transition-all duration-300"
            >
              {post.category}
            </button>
            <span className="mx-2 text-tramhuong-accent/40">/</span>
            <span className="text-tramhuong-primary truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 xl:px-12 2xl:px-16 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <article className="flex-1 max-w-4xl">
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                  onClick={() => onCategoryClick?.(post.category)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-tramhuong-accent/10 text-tramhuong-accent border border-tramhuong-accent/20 hover:bg-tramhuong-accent/20 transition-all duration-300"
                >
                  <Tag className="w-3 h-3 mr-1 text-tramhuong-accent" />
                  {post.category}
                </button>
                {post.isNew && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-tramhuong-accent/10 text-tramhuong-accent border border-tramhuong-accent/20">
                    Mới
                  </span>
                )}
                {post.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-tramhuong-accent/20 text-tramhuong-accent border border-tramhuong-accent/30">
                    Nổi bật
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-playfair text-tramhuong-primary mb-4 leading-tight">
                {post.title}
              </h1>

              <p className="text-lg text-tramhuong-primary/80 mb-6 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-tramhuong-primary/70 mb-6">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-tramhuong-accent" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-tramhuong-accent" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-tramhuong-accent" />
                  <span>{post.readingTime} phút đọc</span>
                </div>
                {post.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-tramhuong-accent" />
                    <span>{post.views.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                )}
              </div>

              {post.imageUrl && (
                <div className="mb-8">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg shadow-[0_8px_32px_rgba(193,168,117,0.3)]"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pb-6 border-b border-tramhuong-accent/20">
                <span className="text-sm font-medium text-tramhuong-primary">Chia sẻ:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-tramhuong-accent border-tramhuong-accent/30 hover:bg-tramhuong-accent/10 transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 mr-2 text-tramhuong-accent" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-tramhuong-accent border-tramhuong-accent/30 hover:bg-tramhuong-accent/10 transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 mr-2 text-tramhuong-accent" />
                  Copy Link
                </Button>
              </div>
            </header>

            <div 
              className="prose prose-lg max-w-none prose-headings:text-tramhuong-primary prose-headings:font-playfair prose-p:text-tramhuong-primary/80 prose-p:leading-relaxed prose-li:text-tramhuong-primary/80 prose-strong:text-tramhuong-primary prose-a:text-tramhuong-accent prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />

            <div className="mt-12 pt-6 border-t border-tramhuong-accent/20">
              <h3 className="text-lg font-semibold font-playfair text-tramhuong-primary mb-4">Thẻ bài viết</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick?.(tag)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-tramhuong-accent/10 text-tramhuong-accent border border-tramhuong-accent/20 hover:bg-tramhuong-accent/20 transition-all duration-300"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </article>

          <aside className="lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-6">
              {tableOfContents.length > 0 && (
                <div className="bg-white/60 backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_8px_32px_rgba(193,168,117,0.3)] border border-tramhuong-accent/20">
                  <h3 className="flex items-center text-lg font-semibold font-playfair text-tramhuong-primary mb-4">
                    <BookOpen className="w-5 h-5 mr-2 text-tramhuong-accent" />
                    Mục lục
                  </h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`
                          block w-full text-left text-sm py-2 px-3 rounded transition-all duration-300
                          ${item.level === 1 ? 'font-semibold' : 
                            item.level === 2 ? 'pl-6' : 'pl-9'}
                          ${activeHeading === item.id 
                            ? 'bg-tramhuong-accent/20 text-tramhuong-accent border-l-2 border-tramhuong-accent' 
                            : 'text-tramhuong-primary/70 hover:text-tramhuong-accent hover:bg-tramhuong-accent/10'
                          }
                        `}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              <div className="bg-white/60 backdrop-blur-md border border-tramhuong-accent/20 rounded-lg p-6 shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
                <h3 className="text-lg font-semibold font-playfair text-tramhuong-primary mb-4">Bài viết liên quan</h3>
                <div className="space-y-4 text-sm text-tramhuong-primary/70">
                  <p>Các bài viết liên quan sẽ được hiển thị ở đây...</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
