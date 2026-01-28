"use client";

import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ListingFormSchema } from "@/lib/validation/listing";

// EUR to RSD conversion rate
const EUR_TO_RSD = 117;

const DRAFT_STORAGE_KEY = "listing-wizard-draft";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export interface WizardDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  formData: Partial<ListingFormSchema>;
  photos: string[];
}

interface WizardContextValue {
  // Step management
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;

  // Form data
  formData: Partial<ListingFormSchema>;
  updateFormData: (data: Partial<ListingFormSchema>) => void;

  // Photos
  photos: string[];
  updatePhotos: (photos: string[]) => void;

  // Draft management
  isDirty: boolean;
  draftId: string | null;
  saveDraft: () => void;
  clearDraft: () => void;
  hasSavedDraft: boolean;
  loadSavedDraft: () => void;

  // Edit mode
  isEditMode: boolean;
  listingId: string | null;

  // Submit
  isSubmitting: boolean;
  submitListing: () => Promise<void>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}

function generateDraftId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface WizardProviderProps {
  children: ReactNode;
  initialData?: Partial<ListingFormSchema>;
  initialPhotos?: string[];
  listingId?: string | null;
}

export function WizardProvider({
  children,
  initialData = {},
  initialPhotos = [],
  listingId = null,
}: WizardProviderProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ListingFormSchema>>(initialData);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [isDirty, setIsDirty] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for saved draft during initialization (not in useEffect to avoid setState in effect)
  const [hasSavedDraft, setHasSavedDraft] = useState(() => {
    if (typeof window === "undefined") return false;
    if (listingId) return false; // Don't show draft prompt in edit mode

    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft: WizardDraft = JSON.parse(savedDraft);
        // Only show draft prompt if draft has meaningful data
        return draft.photos.length > 0 || !!draft.formData.brand;
      } catch {
        // Invalid draft, clear it
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return false;
      }
    }
    return false;
  });

  const totalSteps = 4;
  const isEditMode = !!listingId;

  const saveDraftToStorage = useCallback(() => {
    if (isEditMode) return;

    const currentDraftId = draftId || generateDraftId();
    if (!draftId) {
      setDraftId(currentDraftId);
    }

    const draft: WizardDraft = {
      id: currentDraftId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStep,
      formData,
      photos,
    };

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setIsDirty(false);
  }, [draftId, currentStep, formData, photos, isEditMode]);

  // Auto-save draft periodically
  useEffect(() => {
    if (isEditMode || !isDirty) return;

    const timer = setInterval(() => {
      saveDraftToStorage();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [isDirty, isEditMode, saveDraftToStorage]);

  const loadSavedDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft: WizardDraft = JSON.parse(savedDraft);
        setFormData(draft.formData);
        setPhotos(draft.photos);
        setCurrentStep(draft.currentStep);
        setDraftId(draft.id);
        setHasSavedDraft(false);
      } catch {
        // Invalid draft
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftId(null);
    setHasSavedDraft(false);
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      saveDraftToStorage();
    }
  }, [currentStep, totalSteps, saveDraftToStorage]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const updateFormData = useCallback((data: Partial<ListingFormSchema>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setIsDirty(true);
  }, []);

  const updatePhotos = useCallback((newPhotos: string[]) => {
    setPhotos(newPhotos);
    setIsDirty(true);
  }, []);

  const submitListing = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Convert form data to API format
      const priceInEur = formData.currency === "EUR"
        ? Number(formData.priceEurCents)
        : Number(formData.priceEurCents) / EUR_TO_RSD;
      const priceEurCents = Math.round(priceInEur * 100);

      const payload = {
        brand: formData.brand,
        model: formData.model,
        reference: formData.reference || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        caseDiameterMm: formData.caseDiameterMm ? Number(formData.caseDiameterMm) : undefined,
        caseThicknessMm: formData.caseThicknessMm ? Number(formData.caseThicknessMm) : undefined,
        caseMaterial: formData.caseMaterial || undefined,
        waterResistanceM: formData.waterResistanceM ? Number(formData.waterResistanceM) : undefined,
        movement: formData.movement || undefined,
        movementType: formData.movementType || undefined,
        caliber: formData.caliber || undefined,
        dialColor: formData.dialColor || undefined,
        dateDisplay: formData.dateDisplay || undefined,
        bezelType: formData.bezelType || undefined,
        bezelMaterial: formData.bezelMaterial || undefined,
        strapType: formData.strapType || undefined,
        braceletMaterial: formData.braceletMaterial || undefined,
        strapWidthMm: formData.strapWidthMm ? Number(formData.strapWidthMm) : undefined,
        warranty: formData.warranty || undefined,
        warrantyCard: formData.warrantyCard ?? undefined,
        originalOwner: formData.originalOwner ?? undefined,
        runningCondition: formData.runningCondition || undefined,
        condition: formData.condition,
        gender: formData.gender,
        priceEurCents,
        currency: formData.currency,
        boxPapers: formData.boxPapers || undefined,
        description: formData.description || undefined,
        location: formData.location || undefined,
        photos,
        // Submit directly for review (not as draft)
        status: isEditMode ? undefined : "PENDING",
      };

      const url = isEditMode ? `/api/listings/${listingId}` : "/api/listings";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Greška pri čuvanju oglasa");
      }

      // Clear draft on successful save
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftId(null);

      toast.success(isEditMode ? "Oglas je uspešno ažuriran" : "Oglas je poslat na pregled");
      router.push("/dashboard/listings");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Greška pri čuvanju oglasa";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, photos, isEditMode, listingId, router]);

  const value: WizardContextValue = {
    currentStep,
    totalSteps,
    goToStep,
    nextStep,
    prevStep,
    canGoNext: currentStep < totalSteps - 1,
    canGoPrev: currentStep > 0,
    formData,
    updateFormData,
    photos,
    updatePhotos,
    isDirty,
    draftId,
    saveDraft: saveDraftToStorage,
    clearDraft,
    hasSavedDraft,
    loadSavedDraft,
    isEditMode,
    listingId,
    isSubmitting,
    submitListing,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}
