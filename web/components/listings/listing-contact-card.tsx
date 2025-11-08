"use client";

import { PriceDisplay } from "@/components/currency/price-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactSellerForm } from "@/components/listings/contact-seller-form";
import { ReportListingForm } from "@/components/listings/report-listing-form";

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


