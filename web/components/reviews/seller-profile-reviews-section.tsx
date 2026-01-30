"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";
import { SellerRatingSummary } from "./seller-rating-summary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: Date | string;
  reviewer: { id: string; name: string | null; image: string | null };
  listing?: { id: string; title: string } | null;
}

interface SellerProfileReviewsSectionProps {
  sellerId: string;
  sellerName: string;
  initialReviews: ReviewData[];
  initialAvgRating: number;
  initialTotalReviews: number;
  initialDistribution: RatingDistribution;
}

export function SellerProfileReviewsSection({
  sellerId,
  sellerName,
  initialReviews,
  initialAvgRating,
  initialTotalReviews,
  initialDistribution,
}: SellerProfileReviewsSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAvgRating);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);
  const [distribution, setDistribution] =
    useState<RatingDistribution>(initialDistribution);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const currentUserId = (session?.user as any)?.id;

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/seller/${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        // Recompute distribution from fetched reviews
        const dist: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.reviews.forEach((r: ReviewData) => {
          if (r.rating >= 1 && r.rating <= 5)
            dist[r.rating as keyof RatingDistribution]++;
        });
        setDistribution(dist);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async (data: {
    rating: number;
    title?: string;
    comment?: string;
  }) => {
    try {
      const url = editingReview
        ? `/api/reviews/${editingReview}`
        : "/api/reviews";
      const method = editingReview ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Greška pri čuvanju ocene");
      }

      setShowForm(false);
      setEditingReview(null);
      fetchReviews();
      toast.success(
        editingReview ? "Ocena je ažurirana!" : "Ocena je dodata!"
      );
    } catch (error: any) {
      toast.error(error.message || "Došlo je do greške");
      throw error;
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      const response = await fetch(`/api/reviews/${reviewToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Greška pri brisanju ocene");
      }
      toast.success("Ocena je obrisana");
      fetchReviews();
      setDeleteConfirmOpen(false);
      setReviewToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Došlo je do greške");
    }
  };

  const handleEditReview = (reviewId: string) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      setEditingReview(reviewId);
      setShowForm(true);
    }
  };

  const userReview = reviews.find(
    (r) => r.reviewer.id === currentUserId
  );
  const editingReviewData = editingReview
    ? reviews.find((r) => r.id === editingReview)
    : null;
  const visibleReviews = showAll ? reviews : reviews.slice(0, 10);

  return (
    <section className="space-y-6 pt-8 border-t">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ocene i komentari</h2>
        <div className="flex items-center gap-3">
          {totalReviews > 0 && (
            <span className="text-sm text-muted-foreground">
              {totalReviews}{" "}
              {totalReviews === 1
                ? "ocena"
                : totalReviews < 5
                  ? "ocene"
                  : "ocena"}
            </span>
          )}
          {session && !userReview && sellerId !== currentUserId && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm">Oceni prodavca</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Ocenite prodavca {sellerName}
                  </DialogTitle>
                </DialogHeader>
                <ReviewForm
                  sellerId={sellerId}
                  onSubmit={handleSubmitReview}
                  initialData={
                    editingReviewData
                      ? {
                          id: editingReviewData.id,
                          rating: editingReviewData.rating,
                          title: editingReviewData.title || "",
                          comment: editingReviewData.comment || "",
                        }
                      : undefined
                  }
                  onCancel={() => {
                    setShowForm(false);
                    setEditingReview(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <SellerRatingSummary
        averageRating={averageRating}
        totalReviews={totalReviews}
        distribution={distribution}
        showDistribution={true}
      />

      {reviews.length > 0 ? (
        <>
          <ReviewList
            reviews={visibleReviews}
            showListing={true}
            currentUserId={currentUserId}
            onEdit={handleEditReview}
            onDelete={handleDeleteClick}
          />
          {totalReviews > 10 && !showAll && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAll(true)}
            >
              Prikaži sve ocene ({totalReviews})
            </Button>
          )}
        </>
      ) : (
        <div className="py-8 text-center">
          <EmptyState
            iconType="reviews"
            title="Nema ocena još"
            description={
              session && sellerId !== currentUserId
                ? "Budite prvi koji će oceniti ovog prodavca. Vaša ocena pomaže drugim kupcima."
                : "Još nema ocena za ovog prodavca."
            }
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Obriši ocenu"
        description="Da li ste sigurni da želite da obrišete ovu ocenu? Ova akcija se ne može poništiti."
        confirmText="Obriši"
        cancelText="Otkaži"
        variant="destructive"
        onConfirm={handleDeleteReview}
      />
    </section>
  );
}
