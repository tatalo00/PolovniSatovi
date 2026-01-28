"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Euro } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWizard } from "../wizard-context";
import { WizardNavigation } from "../wizard-navigation";
import { BoxPapersCards } from "../components/box-papers-cards";
import { stepPricingSchema, type StepPricingData } from "@/lib/validation/listing-wizard";
import { cn } from "@/lib/utils";

const EUR_TO_RSD = 117;

const WARRANTY_OPTIONS = [
  { value: "Active Warranty", label: "Aktivna garancija" },
  { value: "Expired Warranty", label: "Istekla garancija" },
  { value: "No Warranty", label: "Bez garancije" },
] as const;

const RUNNING_CONDITION_OPTIONS = [
  { value: "Running Perfectly", label: "Radi savršeno" },
  { value: "Minor Issues", label: "Manji problemi" },
  { value: "Needs Service", label: "Potreban servis" },
  { value: "Not Running", label: "Ne radi" },
] as const;

export function StepPricing() {
  const { formData, updateFormData } = useWizard();

  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<StepPricingData>({
    resolver: zodResolver(stepPricingSchema),
    defaultValues: {
      currency: formData.currency || "EUR",
      priceEurCents: formData.priceEurCents || "",
      boxPapers: formData.boxPapers,
      warranty: formData.warranty,
      warrantyCard: formData.warrantyCard || false,
      originalOwner: formData.originalOwner || false,
      runningCondition: formData.runningCondition,
    },
  });

  const currency = watch("currency");
  const price = watch("priceEurCents");
  const boxPapers = watch("boxPapers");
  const warranty = watch("warranty");
  const warrantyCard = watch("warrantyCard");
  const originalOwner = watch("originalOwner");
  const runningCondition = watch("runningCondition");

  // Calculate converted price for display
  const convertedPrice = useMemo(() => {
    if (!price || isNaN(Number(price))) return null;
    const numericPrice = Number(price);
    if (currency === "EUR") {
      return { amount: Math.round(numericPrice * EUR_TO_RSD), currency: "RSD" };
    }
    return { amount: Math.round(numericPrice / EUR_TO_RSD * 100) / 100, currency: "EUR" };
  }, [price, currency]);

  // Sync form changes to wizard context
  useEffect(() => {
    const subscription = watch((data) => {
      updateFormData(data as Partial<StepPricingData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const handleNext = async (): Promise<boolean> => {
    const isValid = await trigger(["currency", "priceEurCents"]);
    return isValid;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Cena i stanje</h2>
        </div>
        <p className="text-muted-foreground">
          Odredite cenu i dodatne informacije o stanju sata.
        </p>
      </div>

      <form className="space-y-6">
        {/* Price Section */}
        <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4">
          <Label className="text-base font-medium">
            Cena <span className="text-destructive">*</span>
          </Label>

          {/* Currency Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={currency === "EUR"}
              onClick={() => setValue("currency", "EUR", { shouldValidate: true })}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                currency === "EUR"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              )}
            >
              <Euro className="h-4 w-4" />
              EUR
            </button>
            <button
              type="button"
              aria-pressed={currency === "RSD"}
              onClick={() => setValue("currency", "RSD", { shouldValidate: true })}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                currency === "RSD"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              )}
            >
              RSD
            </button>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                placeholder={currency === "EUR" ? "npr. 1500" : "npr. 175000"}
                {...register("priceEurCents")}
                className={cn(
                  "pl-12 text-lg",
                  errors.priceEurCents && "border-destructive"
                )}
                aria-invalid={!!errors.priceEurCents}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currency === "EUR" ? "€" : "RSD"}
              </div>
            </div>
            {errors.priceEurCents && (
              <p className="text-sm text-destructive">{errors.priceEurCents.message}</p>
            )}

            {/* Converted price hint */}
            {convertedPrice && (
              <p className="text-sm text-muted-foreground">
                ≈ {convertedPrice.amount.toLocaleString("sr-RS")} {convertedPrice.currency}
              </p>
            )}
          </div>
        </div>

        {/* Box & Papers */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Box i papiri
          </Label>
          <BoxPapersCards
            value={boxPapers}
            onChange={(value) => setValue("boxPapers", value)}
            error={errors.boxPapers?.message}
          />
        </div>

        {/* Warranty & Condition */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Warranty */}
          <div className="space-y-2">
            <Label htmlFor="warranty">Garancija</Label>
            <Select
              value={warranty}
              onValueChange={(value) =>
                setValue("warranty", value as StepPricingData["warranty"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="warranty">
                <SelectValue placeholder="Izaberite status garancije" />
              </SelectTrigger>
              <SelectContent>
                {WARRANTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Running Condition */}
          <div className="space-y-2">
            <Label htmlFor="runningCondition">Radno stanje</Label>
            <Select
              value={runningCondition}
              onValueChange={(value) =>
                setValue("runningCondition", value as StepPricingData["runningCondition"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="runningCondition">
                <SelectValue placeholder="Izaberite radno stanje" />
              </SelectTrigger>
              <SelectContent>
                {RUNNING_CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="warrantyCard"
              checked={warrantyCard}
              onCheckedChange={(checked) =>
                setValue("warrantyCard", checked === true)
              }
            />
            <Label htmlFor="warrantyCard" className="text-sm font-normal cursor-pointer">
              Imam garancijski list
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="originalOwner"
              checked={originalOwner}
              onCheckedChange={(checked) =>
                setValue("originalOwner", checked === true)
              }
            />
            <Label htmlFor="originalOwner" className="text-sm font-normal cursor-pointer">
              Ja sam originalni vlasnik
            </Label>
          </div>
        </div>
      </form>

      {/* Navigation */}
      <WizardNavigation onNext={handleNext} />
    </div>
  );
}
