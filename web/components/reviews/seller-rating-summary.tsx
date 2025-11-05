"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "./rating-stars";

interface SellerRatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  className?: string;
}

export function SellerRatingSummary({
  averageRating,
  totalReviews,
  className,
}: SellerRatingSummaryProps) {
  if (totalReviews === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Nema ocena</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <RatingStars rating={averageRating} size="sm" className="justify-center mt-1" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Na osnovu {totalReviews} {totalReviews === 1 ? "ocene" : "ocena"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

