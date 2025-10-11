'use client'

import React from 'react';
import { Clock, User, BookOpen } from 'lucide-react';
import { BlogPost, MOCK_BLOG_POSTS } from './BlogTab';

interface BlogFeaturedSectionProps {
  onPostClick?: (post: BlogPost) => void;
}

export function BlogFeaturedSection({ onPostClick }: BlogFeaturedSectionProps) {
  const featuredPosts = MOCK_BLOG_POSTS.filter(post => post.isFeatured).slice(0, 3);

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="hidden lg:block w-full bg-gradient-to-b from-gray-50 to-white py-8 mt-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onPostClick?.(post)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 hover:border-green-200"
            >
              <div className="flex h-36">
                {post.imageUrl && (
                  <div className="w-36 flex-shrink-0 relative overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-3 group-hover:text-green-600 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 self-start">
                    {post.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
