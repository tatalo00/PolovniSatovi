"use client";

import { useCallback } from "react";
import { PriceDisplay } from "@/components/currency/price-display";
import { Button } from "@/components/ui/button";

interface ListingStickyCTAProps {
  priceEurCents: number;
  contactTargetId: string;
  isOwner: boolean;
  isSold?: boolean;
}

export function ListingStickyCTA({
  priceEurCents,
  contactTargetId,
  isOwner,
  isSold = false,
}: ListingStickyCTAProps) {
  const handleClick = useCallback(() => {
    const target = document.getElementById(contactTargetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus?.();
    }
  }, [contactTargetId]);

  if (isOwner || isSold) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:hidden">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cena
          </span>
          <span className="text-lg font-semibold">
            <PriceDisplay amountEurCents={priceEurCents} />
          </span>
        </div>
        <Button size="lg" className="min-w-[160px]" onClick={handleClick}>
          Kontaktiraj prodavca
        </Button>
      </div>
    </div>
  );
}


