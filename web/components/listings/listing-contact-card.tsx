"use client";

import { PriceDisplay } from "@/components/currency/price-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactSellerForm } from "@/components/listings/contact-seller-form";
import { ReportListingForm } from "@/components/listings/report-listing-form";
import { ShieldCheck, UserCheck } from "lucide-react";

interface ListingContactCardProps {
  priceEurCents: number;
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
      <CardHeader className="gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cena
        </span>
        <CardTitle className="text-2xl md:text-3xl">
          <PriceDisplay amountEurCents={priceEurCents} showSwitcher />
        </CardTitle>
        {sellerBadge && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-200/70 bg-white/80 px-3 py-1 text-xs font-semibold text-neutral-700">
            {sellerBadge.type === "verified" ? (
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden />
            ) : (
              <UserCheck className="h-3.5 w-3.5 text-neutral-900" aria-hidden />
            )}
            <span>{sellerBadge.label}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner ? (
          <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-foreground">
            <p className="font-medium">Ovo je vaš oglas</p>
            <p className="text-muted-foreground">
              Kontakt forma je sakrivena na vašim oglasima. Svi potencijalni kupci će vas kontaktirati ovde.
            </p>
          </div>
        ) : isSold ? (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted px-4 py-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Oglas je prodat</p>
            <p>
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
          <div className="border-t pt-4">
            <ReportListingForm listingId={listingId} listingTitle={listingTitle} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}


