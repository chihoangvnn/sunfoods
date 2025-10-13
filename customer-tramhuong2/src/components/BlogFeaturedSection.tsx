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
    <section className="hidden lg:block w-full bg-white/60 backdrop-blur-md py-8 mt-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onPostClick?.(post)}
              className="bg-white/60 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(193,168,117,0.3)] hover:shadow-[0_12px_48px_rgba(193,168,117,0.4)] transition-all duration-300 overflow-hidden cursor-pointer group border border-tramhuong-accent/20"
            >
              <div className="flex h-36">
                {post.imageUrl && (
                  <div className="w-36 flex-shrink-0 relative overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <h3 className="text-sm font-semibold font-playfair text-tramhuong-primary line-clamp-3 group-hover:text-tramhuong-accent transition-all duration-300 leading-snug">
                    {post.title}
                  </h3>
                  
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-tramhuong-accent/10 text-tramhuong-accent border border-tramhuong-accent/20 self-start">
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
