"use client";

import { useEffect, useState } from "react";
import { ListingGrid } from "./listing-grid";
import { EmptyState } from "@/components/ui/empty-state";
import type { ListingSummary } from "@/types/listing";

interface WishlistClientProps {
  initialListings: ListingSummary[];
  initialFavoriteIds: string[];
}

export function WishlistClient({
  initialListings,
  initialFavoriteIds,
}: WishlistClientProps) {
  const [listings, setListings] = useState<ListingSummary[]>(initialListings);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(initialFavoriteIds)
  );

  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);

  useEffect(() => {
    setFavoriteIds(new Set(initialFavoriteIds));
  }, [initialFavoriteIds]);

  const handleToggleFavorite = (listingId: string, nextValue: boolean) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (nextValue) {
        next.add(listingId);
      } else {
        next.delete(listingId);
      }
      return next;
    });

    if (!nextValue) {
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
    }
  };

  const hasListings = listings.length > 0;

  if (!hasListings) {
    return (
      <EmptyState
        iconType="listings"
        title="Lista želja je prazna"
        description="Dodajte satove koji vam se dopadaju kako biste ih lako pronašli kasnije."
        action={{
          label: "Pregledaj oglase",
          href: "/listings",
        }}
      />
    );
  }

  return (
    <ListingGrid
      listings={listings}
      columns={3}
      favoriteIds={favoriteIds}
      onToggleFavorite={handleToggleFavorite}
    />
  );
}

