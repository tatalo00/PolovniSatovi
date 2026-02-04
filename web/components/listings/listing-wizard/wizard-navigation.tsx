"use client";

import { ArrowLeft, ArrowRight, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizard } from "./wizard-context";
import { AutosaveIndicator } from "./components/autosave-indicator";

interface WizardNavigationProps {
  onNext?: () => Promise<boolean> | boolean;
  nextLabel?: string;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function WizardNavigation({
  onNext,
  nextLabel = "Sledeći korak",
  showSkip = false,
  onSkip,
}: WizardNavigationProps) {
  const {
    currentStep,
    totalSteps,
    prevStep,
    nextStep,
    canGoPrev,
    isSubmitting,
    submitListing,
    isEditMode,
    saveDraftManually,
    lastSavedAt,
    isSaving,
  } = useWizard();

  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = async () => {
    if (onNext) {
      const canProceed = await onNext();
      if (!canProceed) return;
    }
    nextStep();
  };

  const handleSubmit = () => {
    submitListing();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side - Back button and Save Draft */}
        <div className="flex items-center gap-2">
          {canGoPrev && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad
            </Button>
          )}
          {!isEditMode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={saveDraftManually}
              disabled={isSubmitting || isSaving}
              className="text-muted-foreground hover:text-foreground"
            >
              <Save className="mr-1.5 h-4 w-4" />
              Sačuvaj nacrt
            </Button>
          )}
        </div>

        {/* Right side - Next/Submit buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* Skip button for optional steps */}
          {showSkip && onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Preskoči detalje
            </Button>
          )}

          {/* Main action button */}
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Slanje..." : isEditMode ? "Sačuvaj izmene" : "Objavi oglas"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {nextLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Autosave indicator */}
      <div className="flex justify-end">
        <AutosaveIndicator
          lastSavedAt={lastSavedAt}
          isSaving={isSaving}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
}
