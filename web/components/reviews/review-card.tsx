"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "./rating-stars";
import { formatTimeAgo } from "@/lib/format-time";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    createdAt: Date | string;
    reviewer: {
      id: string;
      name: string | null;
      image: string | null;
    };
    listing?: {
      id: string;
      title: string;
    } | null;
  };
  showListing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function ReviewCard({
  review,
  showListing = false,
  onEdit,
  onDelete,
  canEdit = false,
}: ReviewCardProps) {
  const initials = review.reviewer.name
    ? review.reviewer.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const timeAgo = formatTimeAgo(review.createdAt);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.reviewer.image || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">
                    {review.reviewer.name || "Anonimni korisnik"}
                  </h4>
                  {showListing && review.listing && (
                    <span className="text-xs text-muted-foreground">
                      za {review.listing.title}
                    </span>
                  )}
                </div>
                <RatingStars rating={review.rating} size="sm" />
              </div>
              {canEdit && (onEdit || onDelete) && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Izmeni
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="text-xs text-destructive hover:text-destructive/80"
                    >
                      Obriši
                    </button>
                  )}
                </div>
              )}
            </div>
            {review.title && (
              <h5 className="font-medium text-sm mt-2">{review.title}</h5>
            )}
            {review.comment && (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {review.comment}
              </p>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {timeAgo}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

