"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";
import { SellerRatingSummary } from "./seller-rating-summary";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface ListingReviewsSectionProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
}

export function ListingReviewsSection({
  listingId,
  sellerId,
  sellerName,
}: ListingReviewsSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    fetchReviews();
  }, [listingId, sellerId]);

  const fetchReviews = async () => {
    try {
      // Fetch seller reviews (includes all reviews for the seller)
      const response = await fetch(`/api/reviews/seller/${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter to only show reviews for this listing if they have listingId
        const listingReviews = data.reviews.filter((r: any) => r.listingId === listingId || !r.listingId);
        setReviews(listingReviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (data: { rating: number; title?: string; comment?: string }) => {
    try {
      const url = editingReview
        ? `/api/reviews/${editingReview}`
        : "/api/reviews";
      const method = editingReview ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          sellerId,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Greška pri čuvanju ocene");
      }

      setShowForm(false);
      setEditingReview(null);
      fetchReviews();
      toast.success(editingReview ? "Ocena je ažurirana!" : "Ocena je dodata!");
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

  const userReview = reviews.find((r) => r.reviewer.id === currentUserId);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ocene i komentari</CardTitle>
          {session && !userReview && sellerId !== currentUserId && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm">Oceni prodavca</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ocenite prodavca</DialogTitle>
                </DialogHeader>
                <ReviewForm
                  sellerId={sellerId}
                  listingId={listingId}
                  onSubmit={handleSubmitReview}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingReview(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <SellerRatingSummary
          averageRating={averageRating}
          totalReviews={totalReviews}
        />

        {reviews.length > 0 ? (
          <ReviewList
            reviews={reviews}
            currentUserId={currentUserId}
            onEdit={handleEditReview}
            onDelete={handleDeleteClick}
          />
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
      </CardContent>
    </Card>
  );
}

