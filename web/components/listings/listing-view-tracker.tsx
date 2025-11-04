"use client";

import { useEffect } from "react";
import { trackListingView } from "@/lib/analytics";

interface ListingViewTrackerProps {
  listingId: string;
  listingTitle: string;
}

export function ListingViewTracker({ listingId, listingTitle }: ListingViewTrackerProps) {
  useEffect(() => {
    trackListingView(listingId, listingTitle);
  }, [listingId, listingTitle]);

  return null;
}

