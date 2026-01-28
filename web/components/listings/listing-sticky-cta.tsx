"use client";

import { useCallback } from "react";
import { Share2, ShieldCheck, UserCheck } from "lucide-react";
import { PriceDisplay } from "@/components/currency/price-display";
import { Button } from "@/components/ui/button";
import { TrustBadgesInline } from "@/components/listings/trust-badges";

interface ListingStickyCTAProps {
  priceEurCents: number;
  currency?: "EUR" | "RSD";
  contactTargetId: string;
  isOwner: boolean;
  isSold?: boolean;
  listingId?: string;
  listingTitle?: string;
  sellerBadge?: { label: string; type: "verified" | "authenticated" } | null;
}

export function ListingStickyCTA({
  priceEurCents,
  currency = "EUR",
  contactTargetId,
  isOwner,
  isSold = false,
  listingId,
  listingTitle,
  sellerBadge,
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      {/* Trust badges row */}
      <div className="container mx-auto flex items-center justify-center gap-2 py-1.5 border-b border-border/50">
        <TrustBadgesInline />
        <span className="text-[10px] text-muted-foreground">Zaštićena kupovina</span>
      </div>

      {/* Main CTA row */}
      <div className="container mx-auto flex items-center justify-between gap-3 pt-2.5 pb-1">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cena
            </span>
            {sellerBadge && (
              <span className="flex items-center">
                {sellerBadge.type === "verified" ? (
                  <ShieldCheck className="h-3 w-3 text-[#D4AF37]" aria-label="Verifikovani prodavac" />
                ) : (
                  <UserCheck className="h-3 w-3 text-neutral-600" aria-label="Autentifikovani korisnik" />
                )}
              </span>
            )}
          </div>
          <span className="text-lg font-semibold truncate">
            <PriceDisplay amountEurCents={priceEurCents} currency={currency} />
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


