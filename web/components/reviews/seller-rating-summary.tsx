"use client";

import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./rating-stars";
import { cn } from "@/lib/utils";

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface SellerRatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  distribution?: RatingDistribution;
  showDistribution?: boolean;
  className?: string;
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-muted-foreground">{stars}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percentage > 0 ? "bg-amber-400" : "bg-transparent"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-muted-foreground text-right">{count}</span>
    </div>
  );
}

export function SellerRatingSummary({
  averageRating,
  totalReviews,
  distribution,
  showDistribution = true,
  className,
}: SellerRatingSummaryProps) {
  const isTopSeller = averageRating >= 4.5 && totalReviews >= 10;

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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Rating Score */}
          <div className="flex-shrink-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              {isTopSeller && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  <Award className="h-3 w-3 mr-1" aria-hidden />
                  Top
                </Badge>
              )}
            </div>
            <RatingStars rating={averageRating} size="sm" className="justify-center sm:justify-start mt-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {totalReviews} {totalReviews === 1 ? "ocena" : totalReviews < 5 ? "ocene" : "ocena"}
            </p>
          </div>

          {/* Distribution Chart */}
          {showDistribution && distribution && (
            <div className="flex-1 space-y-1 min-w-[120px]">
              {[5, 4, 3, 2, 1].map((stars) => (
                <RatingBar
                  key={stars}
                  stars={stars}
                  count={distribution[stars as keyof RatingDistribution]}
                  total={totalReviews}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

