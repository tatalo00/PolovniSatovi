"use client";

import { Camera, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { useWizard } from "../wizard-context";
import { WizardNavigation } from "../wizard-navigation";
import { MIN_LISTING_PHOTOS, MAX_LISTING_PHOTOS } from "@/lib/listing-constants";

export function StepPhotos() {
  const { photos, updatePhotos } = useWizard();

  const isValid = photos.length >= MIN_LISTING_PHOTOS;

  const handleNext = (): boolean => {
    if (!isValid) {
      toast.error(`Potrebno je dodati najmanje ${MIN_LISTING_PHOTOS} fotografije`);
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Fotografije</h2>
        </div>
        <p className="text-muted-foreground">
          Dodajte {MIN_LISTING_PHOTOS}-{MAX_LISTING_PHOTOS} fotografija vašeg sata. Prva slika će biti prikazana kao glavna.
        </p>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Saveti za bolje fotografije:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Fotografišite sat na neutralnoj pozadini</li>
              <li>Koristite dobro osvetljenje (dnevno svetlo je idealno)</li>
              <li>Snimite sat iz više uglova (prednja strana, poleđina, bočno)</li>
              <li>Prikažite sve eventualne ogrebotine ili oštećenja</li>
              <li>Dodajte fotografiju serijske oznake ako je vidljiva</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <ImageUpload
          value={photos}
          onChange={updatePhotos}
          maxImages={MAX_LISTING_PHOTOS}
          folder="listings"
        />

        {/* Validation message */}
        {photos.length < MIN_LISTING_PHOTOS ? (
          <p className="text-sm text-muted-foreground">
            Dodajte još {MIN_LISTING_PHOTOS - photos.length} {MIN_LISTING_PHOTOS - photos.length === 1 ? "fotografiju" : "fotografije"} (minimum {MIN_LISTING_PHOTOS})
          </p>
        ) : (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Minimum fotografija dostignut ({photos.length}/{MAX_LISTING_PHOTOS})
          </p>
        )}
      </div>

      {/* Navigation */}
      <WizardNavigation onNext={handleNext} />
    </div>
  );
}
