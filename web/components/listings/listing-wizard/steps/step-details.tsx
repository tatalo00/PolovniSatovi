"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, Cog, Palette, Watch, MapPin, SkipForward } from "lucide-react";
import { useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWizard } from "../wizard-context";
import { WizardNavigation } from "../wizard-navigation";
import { CollapsibleSection } from "../components/collapsible-section";
import { stepDetailsSchema, type StepDetailsData } from "@/lib/validation/listing-wizard";

const MOVEMENT_TYPE_OPTIONS = [
  { value: "Automatic", label: "Automatski" },
  { value: "Manual", label: "Ručni navoj" },
  { value: "Quartz", label: "Kvarc" },
  { value: "Spring Drive", label: "Spring Drive" },
  { value: "Tourbillon", label: "Tourbillon" },
  { value: "Other", label: "Ostalo" },
] as const;

const DIAL_COLOR_OPTIONS = [
  { value: "Black", label: "Crna" },
  { value: "White", label: "Bela" },
  { value: "Blue", label: "Plava" },
  { value: "Silver", label: "Srebrna" },
  { value: "Champagne", label: "Šampanj" },
  { value: "Green", label: "Zelena" },
  { value: "Brown", label: "Braon" },
  { value: "Gray", label: "Siva" },
  { value: "Other", label: "Ostalo" },
] as const;

const DATE_DISPLAY_OPTIONS = [
  { value: "No Date", label: "Bez datuma" },
  { value: "Date", label: "Datum" },
  { value: "Day-Date", label: "Dan i datum" },
  { value: "GMT", label: "GMT" },
  { value: "Other", label: "Ostalo" },
] as const;

const BEZEL_TYPE_OPTIONS = [
  { value: "Fixed", label: "Fiksni" },
  { value: "Rotating", label: "Rotirajući" },
  { value: "GMT", label: "GMT" },
  { value: "Tachymeter", label: "Tahimetar" },
  { value: "Countdown", label: "Odbrojavanje" },
  { value: "Other", label: "Ostalo" },
] as const;

const STRAP_TYPE_OPTIONS = [
  { value: "Metal Bracelet", label: "Metalna narukvica" },
  { value: "Leather", label: "Kožni kaiš" },
  { value: "Rubber", label: "Gumeni kaiš" },
  { value: "NATO", label: "NATO kaiš" },
  { value: "Fabric", label: "Platneni kaiš" },
  { value: "Other", label: "Ostalo" },
] as const;

const DESCRIPTION_MAX = 2000;

export function StepDetails() {
  const { formData, updateFormData, saveDraft } = useWizard();

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StepDetailsData>({
    resolver: zodResolver(stepDetailsSchema),
    defaultValues: {
      year: formData.year || "",
      caseDiameterMm: formData.caseDiameterMm || "",
      caseThicknessMm: formData.caseThicknessMm || "",
      caseMaterial: formData.caseMaterial || "",
      waterResistanceM: formData.waterResistanceM || "",
      movement: formData.movement || "",
      movementType: formData.movementType,
      caliber: formData.caliber || "",
      dialColor: formData.dialColor,
      dateDisplay: formData.dateDisplay,
      bezelType: formData.bezelType,
      bezelMaterial: formData.bezelMaterial || "",
      strapType: formData.strapType,
      braceletMaterial: formData.braceletMaterial || "",
      strapWidthMm: formData.strapWidthMm || "",
      description: formData.description || "",
      location: formData.location || "",
    },
  });

  const description = watch("description") || "";
  const movementType = watch("movementType");
  const dialColor = watch("dialColor");
  const dateDisplay = watch("dateDisplay");
  const bezelType = watch("bezelType");
  const strapType = watch("strapType");

  // Sync form changes to wizard context
  useEffect(() => {
    const subscription = watch((data) => {
      updateFormData(data as Partial<StepDetailsData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const handleSkip = () => {
    saveDraft();
    // Navigation will happen via the wizard submit
  };

  return (
    <div className="space-y-6">
      {/* Header with Skip option */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Detalji sata</h2>
            </div>
            <p className="text-muted-foreground">
              Dodatne specifikacije povećavaju šanse za prodaju. Sva polja su opciona.
            </p>
          </div>
        </div>

        {/* Skip button - prominent placement */}
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/30 p-4">
          <SkipForward className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Želite da preskočite detalje?</p>
            <p className="text-xs text-muted-foreground">
              Možete ih dodati kasnije uređivanjem oglasa
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSkip}>
            Preskoči
          </Button>
        </div>
      </div>

      <form className="space-y-4">
        {/* Case & Movement Section */}
        <CollapsibleSection title="Kućište i mehanizam" icon={Cog}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Godina proizvodnje</Label>
              <Input
                id="year"
                type="text"
                inputMode="numeric"
                placeholder="npr. 2020"
                maxLength={4}
                {...register("year")}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            {/* Movement Type */}
            <div className="space-y-2">
              <Label htmlFor="movementType">Tip mehanizma</Label>
              <Select
                value={movementType}
                onValueChange={(value) =>
                  setValue("movementType", value as StepDetailsData["movementType"])
                }
              >
                <SelectTrigger id="movementType">
                  <SelectValue placeholder="Izaberite tip" />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Case Diameter */}
            <div className="space-y-2">
              <Label htmlFor="caseDiameterMm">Prečnik kućišta (mm)</Label>
              <Input
                id="caseDiameterMm"
                type="text"
                inputMode="numeric"
                placeholder="npr. 40"
                {...register("caseDiameterMm")}
              />
              {errors.caseDiameterMm && (
                <p className="text-sm text-destructive">{errors.caseDiameterMm.message}</p>
              )}
            </div>

            {/* Case Thickness */}
            <div className="space-y-2">
              <Label htmlFor="caseThicknessMm">Debljina kućišta (mm)</Label>
              <Input
                id="caseThicknessMm"
                type="text"
                inputMode="decimal"
                placeholder="npr. 12.5"
                {...register("caseThicknessMm")}
              />
              {errors.caseThicknessMm && (
                <p className="text-sm text-destructive">{errors.caseThicknessMm.message}</p>
              )}
            </div>

            {/* Case Material */}
            <div className="space-y-2">
              <Label htmlFor="caseMaterial">Materijal kućišta</Label>
              <Input
                id="caseMaterial"
                placeholder="npr. Nerđajući čelik"
                {...register("caseMaterial")}
              />
            </div>

            {/* Water Resistance */}
            <div className="space-y-2">
              <Label htmlFor="waterResistanceM">Vodootpornost (m)</Label>
              <Input
                id="waterResistanceM"
                type="text"
                inputMode="numeric"
                placeholder="npr. 100"
                {...register("waterResistanceM")}
              />
              {errors.waterResistanceM && (
                <p className="text-sm text-destructive">{errors.waterResistanceM.message}</p>
              )}
            </div>

            {/* Movement */}
            <div className="space-y-2">
              <Label htmlFor="movement">Naziv mehanizma</Label>
              <Input
                id="movement"
                placeholder="npr. Caliber 3235"
                {...register("movement")}
              />
            </div>

            {/* Caliber */}
            <div className="space-y-2">
              <Label htmlFor="caliber">Kalibar</Label>
              <Input
                id="caliber"
                placeholder="npr. 3235"
                {...register("caliber")}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Dial & Bezel Section */}
        <CollapsibleSection title="Cifernik i bezel" icon={Palette}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dial Color */}
            <div className="space-y-2">
              <Label htmlFor="dialColor">Boja cifernika</Label>
              <Select
                value={dialColor}
                onValueChange={(value) =>
                  setValue("dialColor", value as StepDetailsData["dialColor"])
                }
              >
                <SelectTrigger id="dialColor">
                  <SelectValue placeholder="Izaberite boju" />
                </SelectTrigger>
                <SelectContent>
                  {DIAL_COLOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Display */}
            <div className="space-y-2">
              <Label htmlFor="dateDisplay">Prikaz datuma</Label>
              <Select
                value={dateDisplay}
                onValueChange={(value) =>
                  setValue("dateDisplay", value as StepDetailsData["dateDisplay"])
                }
              >
                <SelectTrigger id="dateDisplay">
                  <SelectValue placeholder="Izaberite prikaz" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_DISPLAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bezel Type */}
            <div className="space-y-2">
              <Label htmlFor="bezelType">Tip bezela</Label>
              <Select
                value={bezelType}
                onValueChange={(value) =>
                  setValue("bezelType", value as StepDetailsData["bezelType"])
                }
              >
                <SelectTrigger id="bezelType">
                  <SelectValue placeholder="Izaberite tip" />
                </SelectTrigger>
                <SelectContent>
                  {BEZEL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bezel Material */}
            <div className="space-y-2">
              <Label htmlFor="bezelMaterial">Materijal bezela</Label>
              <Input
                id="bezelMaterial"
                placeholder="npr. Keramika"
                {...register("bezelMaterial")}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Strap/Bracelet Section */}
        <CollapsibleSection title="Narukvica / kaiš" icon={Watch}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Strap Type */}
            <div className="space-y-2">
              <Label htmlFor="strapType">Tip narukvice/kaiša</Label>
              <Select
                value={strapType}
                onValueChange={(value) =>
                  setValue("strapType", value as StepDetailsData["strapType"])
                }
              >
                <SelectTrigger id="strapType">
                  <SelectValue placeholder="Izaberite tip" />
                </SelectTrigger>
                <SelectContent>
                  {STRAP_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bracelet Material */}
            <div className="space-y-2">
              <Label htmlFor="braceletMaterial">Materijal</Label>
              <Input
                id="braceletMaterial"
                placeholder="npr. Nerđajući čelik"
                {...register("braceletMaterial")}
              />
            </div>

            {/* Strap Width */}
            <div className="space-y-2">
              <Label htmlFor="strapWidthMm">Širina narukvice (mm)</Label>
              <Input
                id="strapWidthMm"
                type="text"
                inputMode="numeric"
                placeholder="npr. 20"
                {...register("strapWidthMm")}
              />
              {errors.strapWidthMm && (
                <p className="text-sm text-destructive">{errors.strapWidthMm.message}</p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Additional Info Section */}
        <CollapsibleSection title="Dodatne informacije" icon={MapPin} defaultOpen>
          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Opis</Label>
                <span className="text-xs text-muted-foreground">
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <Textarea
                id="description"
                rows={4}
                maxLength={DESCRIPTION_MAX}
                placeholder="Opišite sat detaljnije - istorija, servisiranje, posebne karakteristike..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Lokacija</Label>
              <Input
                id="location"
                placeholder="npr. Beograd, Srbija"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mesto gde se sat nalazi (za kupce koji preferiraju lično preuzimanje)
              </p>
            </div>
          </div>
        </CollapsibleSection>
      </form>

      {/* Navigation - this is the last step, so it shows submit */}
      <WizardNavigation />
    </div>
  );
}
