"use client";

import Image from "next/image";
import { MapPin, Calendar, Package, Send, Pencil, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PriceDisplay } from "@/components/currency/price-display";
import type { ListingFormSchema } from "@/lib/validation/listing";

// EUR to RSD conversion rate (same as in wizard-context)
const EUR_TO_RSD = 117;

interface ListingPreviewProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  formData: Partial<ListingFormSchema>;
  photos: string[];
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Kao novo",
  EXCELLENT: "Odlično",
  VERY_GOOD: "Vrlo dobro",
  GOOD: "Dobro",
  FAIR: "Zadovoljavajuće",
};

const BOX_PAPERS_LABELS: Record<string, string> = {
  FULL_SET: "Kompletan set",
  BOX_ONLY: "Samo kutija",
  PAPERS_ONLY: "Samo papiri",
  NONE: "Bez kutije i papira",
};

const GENDER_LABELS: Record<string, string> = {
  MENS: "Muški",
  WOMENS: "Ženski",
  UNISEX: "Unisex",
};

export function ListingPreview({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  formData,
  photos,
}: ListingPreviewProps) {
  // Calculate price in EUR cents for PriceDisplay
  const priceInEur = formData.currency === "EUR"
    ? Number(formData.priceEurCents || 0)
    : Number(formData.priceEurCents || 0) / EUR_TO_RSD;
  const priceEurCents = Math.round(priceInEur * 100);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Pregled pre objavljivanja
          </DialogTitle>
          <DialogDescription>
            Proverite kako će vaš oglas izgledati kupcima.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Photo gallery preview */}
          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 5).map((url, i) => (
                <div
                  key={url}
                  className={`relative rounded-lg overflow-hidden bg-muted ${
                    i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes={i === 0 ? "300px" : "150px"}
                  />
                  {i === 4 && photos.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">+{photos.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Listing info */}
          <div className="space-y-4">
            {/* Title and reference */}
            <div>
              <h3 className="text-xl font-semibold">
                {formData.brand} {formData.model}
              </h3>
              {formData.reference && (
                <p className="text-sm text-muted-foreground">Ref. {formData.reference}</p>
              )}
            </div>

            {/* Price */}
            <div className="text-2xl font-bold">
              <PriceDisplay amountEurCents={priceEurCents} />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {formData.condition && (
                <Badge variant="secondary">
                  {CONDITION_LABELS[formData.condition] || formData.condition}
                </Badge>
              )}
              {formData.boxPapers && (
                <Badge variant="outline">
                  <Package className="h-3 w-3 mr-1" />
                  {BOX_PAPERS_LABELS[formData.boxPapers] || formData.boxPapers}
                </Badge>
              )}
              {formData.year && (
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formData.year}
                </Badge>
              )}
              {formData.gender && (
                <Badge variant="outline">
                  {GENDER_LABELS[formData.gender] || formData.gender}
                </Badge>
              )}
              {formData.location && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {formData.location}
                </Badge>
              )}
            </div>

            {/* Technical specs preview */}
            {(formData.caseDiameterMm || formData.movement || formData.caseMaterial) && (
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="text-sm font-medium">Tehničke karakteristike</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.caseDiameterMm && (
                    <div>
                      <span className="text-muted-foreground">Prečnik:</span>{" "}
                      {formData.caseDiameterMm}mm
                    </div>
                  )}
                  {formData.caseMaterial && (
                    <div>
                      <span className="text-muted-foreground">Materijal:</span>{" "}
                      {formData.caseMaterial}
                    </div>
                  )}
                  {formData.movement && (
                    <div>
                      <span className="text-muted-foreground">Mehanizam:</span>{" "}
                      {formData.movement}
                    </div>
                  )}
                  {formData.dialColor && (
                    <div>
                      <span className="text-muted-foreground">Boja brojčanika:</span>{" "}
                      {formData.dialColor}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description preview */}
            {formData.description && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">Opis</h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {formData.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Izmeni
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Slanje..." : "Objavi oglas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
