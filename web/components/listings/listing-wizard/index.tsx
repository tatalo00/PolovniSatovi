"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { WizardProvider, useWizard } from "./wizard-context";
import { WizardProgress } from "./wizard-progress";
import { StepPhotos } from "./steps/step-photos";
import { StepIdentity } from "./steps/step-identity";
import { StepPricing } from "./steps/step-pricing";
import { StepDetails } from "./steps/step-details";
import type { ListingFormSchema } from "@/lib/validation/listing";

const EUR_TO_RSD = 117;

interface ListingWizardProps {
  listing?: {
    id: string;
    brand: string;
    model: string;
    reference: string | null;
    year: number | null;
    caseDiameterMm: number | null;
    caseThicknessMm: number | null;
    caseMaterial: string | null;
    waterResistanceM: number | null;
    movement: string | null;
    movementType: string | null;
    caliber: string | null;
    dialColor: string | null;
    dateDisplay: string | null;
    bezelType: string | null;
    bezelMaterial: string | null;
    strapType: string | null;
    braceletMaterial: string | null;
    strapWidthMm: number | null;
    warranty: string | null;
    warrantyCard: boolean | null;
    originalOwner: boolean | null;
    runningCondition: string | null;
    condition: string;
    gender: string;
    priceEurCents: number;
    currency: string;
    boxPapers: string | null;
    description: string | null;
    location: string | null;
    photos: Array<{ url: string }>;
  };
}

function convertListingToFormData(listing: ListingWizardProps["listing"]): Partial<ListingFormSchema> {
  if (!listing) return {};

  // Convert price from cents to display value
  const priceValue = listing.currency === "EUR"
    ? (listing.priceEurCents / 100).toString()
    : Math.round((listing.priceEurCents / 100) * EUR_TO_RSD).toString();

  return {
    brand: listing.brand,
    model: listing.model,
    reference: listing.reference || undefined,
    year: listing.year?.toString() || undefined,
    caseDiameterMm: listing.caseDiameterMm?.toString() || undefined,
    caseThicknessMm: listing.caseThicknessMm?.toString() || undefined,
    caseMaterial: listing.caseMaterial || undefined,
    waterResistanceM: listing.waterResistanceM?.toString() || undefined,
    movement: listing.movement || undefined,
    movementType: listing.movementType as ListingFormSchema["movementType"],
    caliber: listing.caliber || undefined,
    dialColor: listing.dialColor as ListingFormSchema["dialColor"],
    dateDisplay: listing.dateDisplay as ListingFormSchema["dateDisplay"],
    bezelType: listing.bezelType as ListingFormSchema["bezelType"],
    bezelMaterial: listing.bezelMaterial || undefined,
    strapType: listing.strapType as ListingFormSchema["strapType"],
    braceletMaterial: listing.braceletMaterial || undefined,
    strapWidthMm: listing.strapWidthMm?.toString() || undefined,
    warranty: listing.warranty as ListingFormSchema["warranty"],
    warrantyCard: listing.warrantyCard || undefined,
    originalOwner: listing.originalOwner || undefined,
    runningCondition: listing.runningCondition as ListingFormSchema["runningCondition"],
    condition: listing.condition as ListingFormSchema["condition"],
    gender: listing.gender as ListingFormSchema["gender"],
    priceEurCents: priceValue,
    currency: listing.currency as ListingFormSchema["currency"],
    boxPapers: listing.boxPapers as ListingFormSchema["boxPapers"],
    description: listing.description || undefined,
    location: listing.location || undefined,
  };
}

function WizardContent() {
  const { currentStep, clearDraft, hasSavedDraft, loadSavedDraft } = useWizard();
  const [showDraftDialog, setShowDraftDialog] = useState(hasSavedDraft);

  const handleResumeDraft = () => {
    loadSavedDraft();
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPhotos />;
      case 1:
        return <StepIdentity />;
      case 2:
        return <StepPricing />;
      case 3:
        return <StepDetails />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Draft Recovery Dialog */}
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Nastavite gde ste stali?
            </DialogTitle>
            <DialogDescription>
              Pronašli smo nesačuvani oglas. Želite li da nastavite sa radom ili da počnete ispočetka?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleDiscardDraft}>
              Počni ispočetka
            </Button>
            <Button onClick={handleResumeDraft}>
              Nastavi sa nacrtom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Wizard Card */}
      <Card className="border-border/70">
        <CardHeader className="space-y-4 pb-6">
          <WizardProgress />
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </>
  );
}

export function ListingWizard({ listing }: ListingWizardProps) {
  const initialData = convertListingToFormData(listing);
  const initialPhotos = listing?.photos?.map((p) => p.url) || [];

  return (
    <WizardProvider
      initialData={initialData}
      initialPhotos={initialPhotos}
      listingId={listing?.id || null}
    >
      <WizardContent />
    </WizardProvider>
  );
}

export { WizardProvider, useWizard };
