"use client";

import { PriceDisplay } from "@/components/currency/price-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactSellerForm } from "@/components/listings/contact-seller-form";
import { ReportListingForm } from "@/components/listings/report-listing-form";
import { ShieldCheck, UserCheck } from "lucide-react";

interface ListingContactCardProps {
  priceEurCents: number;
  currency?: "EUR" | "RSD";
  listingId: string;
  listingTitle: string;
  sellerEmail: string;
  sellerId: string;
  isOwner: boolean;
  showReport?: boolean;
  className?: string;
  isSold?: boolean;
  sellerBadge?: { label: string; type: "verified" | "authenticated" } | null;
}

export function ListingContactCard({
  priceEurCents,
  currency = "EUR",
  listingId,
  listingTitle,
  sellerEmail,
  sellerId,
  isOwner,
  showReport = true,
  className,
  isSold = false,
  sellerBadge,
}: ListingContactCardProps) {
  const contactDisabled = isOwner || isSold;

  return (
    <Card className={className}>
      <CardHeader className="gap-1.5 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cena
            </span>
            <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl mt-0.5 sm:mt-1">
              <PriceDisplay amountEurCents={priceEurCents} currency={currency} />
            </CardTitle>
          </div>
          {sellerBadge && (
            <div className="flex-shrink-0 inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-full border border-neutral-200/70 bg-white/80 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-xs font-semibold text-neutral-700">
              {sellerBadge.type === "verified" ? (
                <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-[#D4AF37]" aria-hidden />
              ) : (
                <UserCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-neutral-900" aria-hidden />
              )}
              <span className="hidden sm:inline">{sellerBadge.label}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6 space-y-2.5 sm:space-y-3 md:space-y-4">
        {isOwner ? (
          <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 sm:p-4 text-xs sm:text-sm text-foreground">
            <p className="font-medium">Ovo je vaš oglas</p>
            <p className="text-muted-foreground mt-1">
              Kontakt forma je sakrivena na vašim oglasima. Svi potencijalni kupci će vas kontaktirati ovde.
            </p>
          </div>
        ) : isSold ? (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Oglas je prodat</p>
            <p className="mt-1">
              Ovaj sat je označen kao prodat i nije moguće poslati novu poruku prodavcu.
            </p>
          </div>
        ) : (
          <ContactSellerForm
            listingId={listingId}
            listingTitle={listingTitle}
            sellerEmail={sellerEmail}
            sellerId={sellerId}
          />
        )}
        {showReport && !contactDisabled && (
          <div className="border-t pt-3 sm:pt-4">
            <ReportListingForm listingId={listingId} listingTitle={listingTitle} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}


