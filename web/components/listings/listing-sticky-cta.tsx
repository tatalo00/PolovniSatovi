"use client";

import { useCallback } from "react";
import { Share2 } from "lucide-react";
import { PriceDisplay } from "@/components/currency/price-display";
import { Button } from "@/components/ui/button";

interface ListingStickyCTAProps {
  priceEurCents: number;
  contactTargetId: string;
  isOwner: boolean;
  isSold?: boolean;
  listingId?: string;
  listingTitle?: string;
}

export function ListingStickyCTA({
  priceEurCents,
  contactTargetId,
  isOwner,
  isSold = false,
  listingId,
  listingTitle,
}: ListingStickyCTAProps) {
  const handleClick = useCallback(() => {
    const target = document.getElementById(contactTargetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus?.();
    }
  }, [contactTargetId]);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined" || !listingId) return;
    
    const url = `${window.location.origin}/listing/${listingId}`;
    const shareData = {
      title: listingTitle || "PolovniSatovi - Oglas",
      text: listingTitle || "Pogledaj ovaj oglas",
      url,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        // You could show a toast here
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  }, [listingId, listingTitle]);

  if (isOwner || isSold) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:hidden safe-area-inset-bottom">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cena
          </span>
          <span className="text-lg font-semibold truncate">
            <PriceDisplay amountEurCents={priceEurCents} />
          </span>
        </div>
        {listingId && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="h-11 w-11 min-h-[44px] min-w-[44px] flex-shrink-0"
            aria-label="Podeli oglas"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        )}
        <Button size="lg" className="min-w-[140px] flex-shrink-0 min-h-[44px]" onClick={handleClick}>
          Kontaktiraj
        </Button>
      </div>
    </div>
  );
}


