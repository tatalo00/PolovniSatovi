"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "./rating-stars";

interface ReviewFormProps {
  sellerId: string;
  listingId?: string;
  initialData?: {
    id: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
  };
  onSubmit: (data: {
    rating: number;
    title?: string;
    comment?: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({
  sellerId,
  listingId,
  initialData,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || "");
  const [comment, setComment] = useState(initialData?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Molimo izaberite ocenu");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Došlo je do greške");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Ocena *</Label>
        <RatingStars
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Naslov (opciono)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kratak naslov vaše ocene"
          maxLength={100}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Komentar (opciono)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Podelite svoje mišljenje..."
          rows={4}
          maxLength={2000}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          {comment.length} / 2000 karaktera
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || rating === 0}>
          {loading ? "Čuvanje..." : initialData ? "Sačuvaj izmene" : "Pošalji ocenu"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Otkaži
          </Button>
        )}
      </div>
    </form>
  );
}

