"use client";

import { ReviewCard } from "./review-card";
import { Card, CardContent } from "@/components/ui/card";

interface Review {
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
}

interface ReviewListProps {
  reviews: Review[];
  showListing?: boolean;
  currentUserId?: string;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewList({
  reviews,
  showListing = false,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Nema ocena za prikaz</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showListing={showListing}
          canEdit={currentUserId === review.reviewer.id}
          onEdit={onEdit ? () => onEdit(review.id) : undefined}
          onDelete={onDelete ? () => onDelete(review.id) : undefined}
        />
      ))}
    </div>
  );
}

