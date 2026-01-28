"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Watch, User } from "lucide-react";
import { useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizard } from "../wizard-context";
import { WizardNavigation } from "../wizard-navigation";
import { BrandCombobox } from "../components/brand-combobox";
import { ConditionCards } from "../components/condition-cards";
import { stepIdentitySchema, type StepIdentityData } from "@/lib/validation/listing-wizard";
import { cn } from "@/lib/utils";
import type { GENDER_VALUES } from "@/lib/validation/listing";

type GenderValue = (typeof GENDER_VALUES)[number];

const GENDER_OPTIONS: Array<{ value: GenderValue; label: string }> = [
  { value: "MALE", label: "Muški" },
  { value: "FEMALE", label: "Ženski" },
  { value: "UNISEX", label: "Uniseks" },
];

export function StepIdentity() {
  const { formData, updateFormData } = useWizard();

  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<StepIdentityData>({
    resolver: zodResolver(stepIdentitySchema),
    defaultValues: {
      brand: formData.brand || "",
      model: formData.model || "",
      reference: formData.reference || "",
      condition: formData.condition,
      gender: formData.gender,
    },
  });

  const brand = watch("brand");
  const condition = watch("condition");
  const gender = watch("gender");

  // Sync form changes to wizard context
  useEffect(() => {
    const subscription = watch((data) => {
      updateFormData(data as Partial<StepIdentityData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const handleNext = async (): Promise<boolean> => {
    const isValid = await trigger();
    return isValid;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Watch className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Osnovni podaci o satu</h2>
        </div>
        <p className="text-muted-foreground">
          Unesite osnovne informacije o vašem satu. Ovi podaci su obavezni.
        </p>
      </div>

      <form className="space-y-6">
        {/* Brand & Model */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand">
              Marka <span className="text-destructive">*</span>
            </Label>
            <BrandCombobox
              value={brand}
              onChange={(value) => setValue("brand", value, { shouldValidate: true })}
              error={errors.brand?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">
              Model <span className="text-destructive">*</span>
            </Label>
            <Input
              id="model"
              placeholder="npr. Submariner, Speedmaster..."
              {...register("model")}
              aria-invalid={!!errors.model}
            />
            {errors.model && (
              <p className="text-sm text-destructive">{errors.model.message}</p>
            )}
          </div>
        </div>

        {/* Reference */}
        <div className="space-y-2">
          <Label htmlFor="reference">
            Referenca <span className="text-muted-foreground text-sm">(opciono)</span>
          </Label>
          <Input
            id="reference"
            placeholder="npr. 126610LN, 311.30.42.30.01.005..."
            {...register("reference")}
            aria-invalid={!!errors.reference}
          />
          {errors.reference && (
            <p className="text-sm text-destructive">{errors.reference.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Referentni broj se obično nalazi na pozadini kućišta ili u dokumentaciji
          </p>
        </div>

        {/* Condition */}
        <div className="space-y-3">
          <Label>
            Stanje sata <span className="text-destructive">*</span>
          </Label>
          <ConditionCards
            value={condition}
            onChange={(value) => setValue("condition", value, { shouldValidate: true })}
            error={errors.condition?.message}
          />
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label>
            Namenjeno <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={gender === option.value}
                onClick={() => setValue("gender", option.value, { shouldValidate: true })}
                className={cn(
                  "flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all",
                  "hover:border-primary/50 hover:bg-accent/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  gender === option.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground"
                )}
              >
                <User className={cn(
                  "h-4 w-4",
                  gender === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                {option.label}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender.message}</p>
          )}
        </div>
      </form>

      {/* Navigation */}
      <WizardNavigation onNext={handleNext} />
    </div>
  );
}
