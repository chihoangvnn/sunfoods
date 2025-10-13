'use client'

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Review } from "@/ride-sharing/mockData";

interface RatingStatsProps {
  reviews: Review[];
}

export default function RatingStats({ reviews }: RatingStatsProps) {
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Chưa có đánh giá</p>
        </div>
      </Card>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: (reviews.filter(r => r.rating === star).length / totalReviews) * 100
  }));

  return (
    <Card className="p-6">
      <div className="grid md:grid-cols-[auto_1fr] gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{totalReviews} đánh giá</p>
        </div>

        <div className="space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
