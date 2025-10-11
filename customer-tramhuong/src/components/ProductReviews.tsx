'use client'

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, ThumbsUp, Verified, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductReview, ReviewSummary, ReviewFilters } from '@/types/review';
import { reviewService } from '@/services/reviewService';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filters, setFilters] = useState<ReviewFilters>({ sortBy: 'newest' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadReviewSummary();
  }, [productId]);

  useEffect(() => {
    if (showAllReviews) {
      loadReviews();
    }
  }, [showAllReviews, filters, page]);

  // Reset everything when productId changes
  useEffect(() => {
    const wasShowingReviews = showAllReviews;
    setReviews([]);
    setShowAllReviews(false);
    setPage(1);
    setHasMore(true);
    setSummary(null);
    
    // If reviews were expanded, reload them for the new product
    if (wasShowingReviews) {
      setTimeout(() => setShowAllReviews(true), 0);
    }
  }, [productId]);  // Only depend on productId, not showAllReviews

  const loadReviewSummary = async () => {
    try {
      const summaryData = await reviewService.getReviewSummary(productId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading review summary:', error);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getProductReviews(productId, filters, page, 5);
      
      // Use functional update to avoid stale closure
      setReviews(prev => page === 1 ? response.reviews : [...prev, ...response.reviews]);
      setHasMore(response.pagination.hasMore);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!summary) return null;

    const maxCount = Math.max(...Object.values(summary.ratingDistribution));

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution];
          const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 w-8">
                <span>{rating}</span>
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-gray-600 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!summary) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Đánh giá sản phẩm</div>
      
      {/* Review Summary */}
      <div className="mb-6">
        <div className="flex items-start gap-4">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {summary.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(summary.averageRating), 'md')}
            <div className="text-sm text-gray-600 mt-1">
              {summary.totalReviews} đánh giá
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            {renderRatingDistribution()}
          </div>
        </div>
      </div>

      {/* View All Reviews Button */}
      {!showAllReviews ? (
        <Button
          variant="outline"
          onClick={() => setShowAllReviews(true)}
          className="w-full mb-4"
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          Xem tất cả đánh giá ({summary.totalReviews})
        </Button>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-gray-600">Sắp xếp:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => {
                setFilters({ ...filters, sortBy: e.target.value as any });
                setPage(1);
                setReviews([]);
                setHasMore(true);
              }}
              className="border rounded px-2 py-1 text-xs"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="rating_high">Điểm cao</option>
              <option value="rating_low">Điểm thấp</option>
              <option value="helpful">Hữu ích nhất</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-shrink-0">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                        {review.userName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{review.userName}</span>
                      {review.verified && (
                        <Verified className="h-3 w-3 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="ml-11">
                  {review.title && (
                    <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    {review.comment}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      <ThumbsUp className="h-3 w-3" />
                      <span>Hữu ích ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="text-sm"
              >
                {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
              </Button>
            </div>
          )}

          {/* Collapse Button */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAllReviews(false);
                setReviews([]);
                setPage(1);
              }}
              className="text-sm text-gray-500"
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Ẩn đánh giá
            </Button>
          </div>
        </>
      )}
    </div>
  );
}