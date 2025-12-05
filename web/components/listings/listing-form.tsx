"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, BarChart3, Palette, Watch, ShieldCheck, DollarSign, Image, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  MIN_LISTING_PHOTOS,
  MAX_LISTING_PHOTOS,
} from "@/lib/listing-constants";
import {
  listingFormSchema,
  type ListingFormSchema,
  CONDITION_VALUES,
  BOX_PAPERS_VALUES,
  SUPPORTED_CURRENCIES,
  GENDER_VALUES,
} from "@/lib/validation/listing";

type ListingFormData = ListingFormSchema;

type EditableListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  reference: string | null;
  year: number | null;
  caseDiameterMm: number | null;
  caseMaterial: string | null;
  movement: string | null;
  condition: (typeof CONDITION_VALUES)[number];
  gender: (typeof GENDER_VALUES)[number];
  priceEurCents: number;
  currency: (typeof SUPPORTED_CURRENCIES)[number];
  boxPapers: (typeof BOX_PAPERS_VALUES)[number] | null;
  description: string | null;
  location: string | null;
  status?: string;
  photos: Array<{ url: string }>;
};

interface ListingFormProps {
  listing?: EditableListing;
}

export function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(listing?.photos?.map((p) => p.url) || []);

const CONDITION_LABELS: Record<(typeof CONDITION_VALUES)[number], string> = {
  New: "Novo",
  "Like New": "Kao novo",
  Excellent: "Odlično",
  "Very Good": "Vrlo dobro",
  Good: "Dobro",
  Fair: "Zadovoljavajuće",
};

const BOX_PAPERS_LABELS: Record<(typeof BOX_PAPERS_VALUES)[number], string> = {
  "Full Set": "Komplet (box + papiri)",
  "Box Only": "Samo box",
  "Papers Only": "Samo papiri",
  "No Box or Papers": "Nema boxa ni papira",
};

const GENDER_LABELS: Record<(typeof GENDER_VALUES)[number], string> = {
  MALE: "Muški",
  FEMALE: "Ženski",
  UNISEX: "Uniseks",
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  Automatic: "Automatski",
  Manual: "Ručni navoj",
  Quartz: "Kvarc",
  "Spring Drive": "Spring Drive",
  Tourbillon: "Tourbillon",
  Other: "Ostalo",
};

const DIAL_COLOR_LABELS: Record<string, string> = {
  Black: "Crna",
  White: "Bela",
  Blue: "Plava",
  Silver: "Srebrna",
  Champagne: "Šampanjac",
  Green: "Zelena",
  Brown: "Braon",
  Gray: "Siva",
  Other: "Ostalo",
};

const DATE_DISPLAY_LABELS: Record<string, string> = {
  "No Date": "Bez datuma",
  Date: "Datum",
  "Day-Date": "Dan i datum",
  GMT: "GMT",
  Other: "Ostalo",
};

const BEZEL_TYPE_LABELS: Record<string, string> = {
  Fixed: "Fiksni",
  Rotating: "Rotirajući",
  GMT: "GMT",
  Tachymeter: "Tahimetar",
  Countdown: "Odbrojavanje",
  Other: "Ostalo",
};

const STRAP_TYPE_LABELS: Record<string, string> = {
  "Metal Bracelet": "Metalna narukvica",
  Leather: "Kožna",
  Rubber: "Gumena",
  NATO: "NATO",
  Fabric: "Tkanina",
  Other: "Ostalo",
};

const WARRANTY_LABELS: Record<string, string> = {
  "Active Warranty": "Aktivna garancija",
  "Expired Warranty": "Istekla garancija",
  "No Warranty": "Bez garancije",
};

const RUNNING_CONDITION_LABELS: Record<string, string> = {
  "Running Perfectly": "Radi savršeno",
  "Minor Issues": "Manji problemi",
  "Needs Service": "Potreban servis",
  "Not Running": "Ne radi",
};

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
} = useForm<ListingFormData>({
  resolver: zodResolver(listingFormSchema),
  defaultValues: listing
    ? {
        brand: listing.brand,
        model: listing.model,
        reference: listing.reference || "",
        year: listing.year?.toString() || "",
        caseDiameterMm: listing.caseDiameterMm
          ? listing.caseDiameterMm.toString()
          : "",
        caseThicknessMm: (listing as any).caseThicknessMm?.toString() || "",
        caseMaterial: listing.caseMaterial || "",
        waterResistanceM: (listing as any).waterResistanceM?.toString() || "",
        movement: listing.movement || "",
        movementType: (listing as any).movementType || undefined,
        caliber: (listing as any).caliber || "",
        dialColor: (listing as any).dialColor || undefined,
        dateDisplay: (listing as any).dateDisplay || undefined,
        bezelType: (listing as any).bezelType || undefined,
        bezelMaterial: (listing as any).bezelMaterial || "",
        strapType: (listing as any).strapType || undefined,
        braceletMaterial: (listing as any).braceletMaterial || "",
        strapWidthMm: (listing as any).strapWidthMm?.toString() || "",
        warranty: (listing as any).warranty || undefined,
        warrantyCard: (listing as any).warrantyCard ?? undefined,
        originalOwner: (listing as any).originalOwner ?? undefined,
        runningCondition: (listing as any).runningCondition || undefined,
        condition: (listing.condition as ListingFormData["condition"]) ?? CONDITION_VALUES[0],
        gender: (listing.gender as ListingFormData["gender"]) ?? "UNISEX",
        priceEurCents: listing.currency === "RSD" 
          ? ((listing.priceEurCents * 117) / 100).toFixed(2) // Convert EUR cents to RSD for display
          : (listing.priceEurCents / 100).toFixed(2),
        currency: (listing.currency as ListingFormData["currency"]) ?? SUPPORTED_CURRENCIES[0],
        boxPapers: (listing.boxPapers as ListingFormData["boxPapers"]) ?? undefined,
        description: listing.description || "",
        location: listing.location || "",
      }
    : {
        currency: SUPPORTED_CURRENCIES[0],
        caseDiameterMm: "",
        caseThicknessMm: "",
        caseMaterial: "",
        waterResistanceM: "",
        movement: "",
        movementType: undefined,
        caliber: "",
        dialColor: undefined,
        dateDisplay: undefined,
        bezelType: undefined,
        bezelMaterial: "",
        strapType: undefined,
        braceletMaterial: "",
        strapWidthMm: "",
        warranty: undefined,
        warrantyCard: undefined,
        originalOwner: undefined,
        runningCondition: undefined,
        condition: CONDITION_VALUES[0],
        gender: "UNISEX",
        boxPapers: undefined,
      },
});

  // Watch brand and model to auto-generate title
  const brand = watch("brand");
  const model = watch("model");

  const onSubmit = async (data: ListingFormData) => {
    if (photos.length < MIN_LISTING_PHOTOS) {
      toast.error(`Oglas mora imati najmanje ${MIN_LISTING_PHOTOS} fotografije`);
      return;
    }
    setLoading(true);
    try {
      const priceValue = parseFloat(data.priceEurCents);
      const priceCents = Math.round(priceValue * 100);
      
      // Convert to EUR cents if currency is RSD
      // 1 EUR = 117 RSD, so RSD cents / 117 = EUR cents
      const priceEurCents = data.currency === "RSD" 
        ? Math.round(priceCents / 117)
        : priceCents;

      // Generate title from brand and model
      const generatedTitle = `${data.brand.trim()} ${data.model.trim()}`.trim();

      const payload = {
        ...data,
        title: generatedTitle, // Auto-generated from brand + model
        brand: data.brand.trim(),
        model: data.model.trim(),
        reference: data.reference?.trim() || undefined,
        priceEurCents,
        currency: data.currency,
        year: data.year ? parseInt(data.year, 10) : null,
        caseDiameterMm: data.caseDiameterMm
          ? parseInt(data.caseDiameterMm, 10)
          : null,
        caseThicknessMm: data.caseThicknessMm
          ? parseFloat(data.caseThicknessMm)
          : null,
        caseMaterial: data.caseMaterial?.trim()
          ? data.caseMaterial.trim()
          : undefined,
        waterResistanceM: data.waterResistanceM
          ? parseInt(data.waterResistanceM, 10)
          : null,
        movement: data.movement?.trim() ? data.movement.trim() : undefined,
        movementType: data.movementType || null,
        caliber: data.caliber?.trim() || null,
        dialColor: data.dialColor || null,
        dateDisplay: data.dateDisplay || null,
        bezelType: data.bezelType || null,
        bezelMaterial: data.bezelMaterial?.trim() || null,
        strapType: data.strapType || null,
        braceletMaterial: data.braceletMaterial?.trim() || null,
        strapWidthMm: data.strapWidthMm
          ? parseFloat(data.strapWidthMm)
          : null,
        warranty: data.warranty || null,
        warrantyCard: data.warrantyCard ?? null,
        originalOwner: data.originalOwner ?? null,
        runningCondition: data.runningCondition || null,
        description: data.description?.trim() || undefined,
        location: data.location?.trim() || undefined,
        boxPapers: data.boxPapers ?? undefined,
        photos,
      };

      const url = listing ? `/api/listings/${listing.id}` : "/api/listings";
      const method = listing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      const result = await response.json();
      toast.success(listing ? "Oglas je ažuriran!" : "Oglas je kreiran!");
      router.push(`/dashboard/listings`);
      router.refresh();
    } catch (error) {
      console.error("Error saving listing:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!listing) return;

    if (!photos || photos.length < MIN_LISTING_PHOTOS) {
      toast.error(`Oglas mora imati najmanje ${MIN_LISTING_PHOTOS} fotografije`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listing.id}/submit`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success("Oglas je poslat na odobrenje!");
      router.push("/dashboard/listings");
      router.refresh();
    } catch (error) {
      console.error("Error submitting listing:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-border/60 bg-white/70 backdrop-blur-sm shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8 p-6 sm:p-8">
          {/* Basic Information */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/50">
                <FileText className="h-4 w-4 text-blue-600" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Osnovne informacije</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Osnovni podaci o satu <span className="text-destructive">*</span> obavezno
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">
                  Marka <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brand"
                  {...register("brand")}
                  placeholder="Rolex"
                  disabled={loading}
                />
                {errors.brand && (
                  <p className="text-sm text-destructive">{errors.brand.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">
                  Model <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="model"
                  {...register("model")}
                  placeholder="Submariner"
                  disabled={loading}
                />
                {errors.model && (
                  <p className="text-sm text-destructive">{errors.model.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reference">Referenca</Label>
                <Input
                  id="reference"
                  {...register("reference")}
                  placeholder="116610LN"
                  disabled={loading}
                />
                {errors.reference && (
                  <p className="text-sm text-destructive">{errors.reference.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Godina proizvodnje</Label>
                <Input
                  id="year"
                  type="number"
                  {...register("year")}
                  placeholder="2018"
                  disabled={loading}
                />
                {errors.year && (
                  <p className="text-sm text-destructive">{errors.year.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100/50">
                <BarChart3 className="h-4 w-4 text-emerald-600" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Tehničke specifikacije</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detaljne tehničke karakteristike (opciono)
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="caseDiameterMm">Prečnik kućišta (mm)</Label>
                <Input
                  id="caseDiameterMm"
                  type="number"
                  min={10}
                  max={70}
                  {...register("caseDiameterMm")}
                  placeholder="41"
                  disabled={loading}
                />
                {errors.caseDiameterMm && (
                  <p className="text-sm text-destructive">
                    {errors.caseDiameterMm.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseThicknessMm">Debljina kućišta (mm)</Label>
                <Input
                  id="caseThicknessMm"
                  type="number"
                  step="0.1"
                  min={3}
                  max={30}
                  {...register("caseThicknessMm")}
                  placeholder="12.5"
                  disabled={loading}
                />
                {errors.caseThicknessMm && (
                  <p className="text-sm text-destructive">
                    {errors.caseThicknessMm.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterResistanceM">Vodootpornost (m)</Label>
                <Input
                  id="waterResistanceM"
                  type="number"
                  {...register("waterResistanceM")}
                  placeholder="300"
                  disabled={loading}
                />
                {errors.waterResistanceM && (
                  <p className="text-sm text-destructive">
                    {errors.waterResistanceM.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caseMaterial">Materijal kućišta</Label>
                <Input
                  id="caseMaterial"
                  {...register("caseMaterial")}
                  placeholder="Nerđajući čelik, titanijum..."
                  disabled={loading}
                />
                {errors.caseMaterial && (
                  <p className="text-sm text-destructive">{errors.caseMaterial.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement">Mehanizam (opciono)</Label>
                <Input
                  id="movement"
                  {...register("movement")}
                  placeholder="Automatski, kvarc, ručni navoj..."
                  disabled={loading}
                />
                {errors.movement && (
                  <p className="text-sm text-destructive">{errors.movement.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="movementType">Tip mehanizma</Label>
                <Controller
                  control={control}
                  name="movementType"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite tip" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.movementType && (
                  <p className="text-sm text-destructive">{errors.movementType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="caliber">Kalibar</Label>
                <Input
                  id="caliber"
                  {...register("caliber")}
                  placeholder="3135, ETA 2824-2..."
                  disabled={loading}
                />
                {errors.caliber && (
                  <p className="text-sm text-destructive">{errors.caliber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dial & Bezel */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100/50">
                <Palette className="h-4 w-4 text-purple-600" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Cifernik i bezel</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detalji o ciferniku i bezelu (opciono)
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dialColor">Boja cifernika</Label>
                <Controller
                  control={control}
                  name="dialColor"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite boju" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DIAL_COLOR_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.dialColor && (
                  <p className="text-sm text-destructive">{errors.dialColor.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateDisplay">Prikaz datuma</Label>
                <Controller
                  control={control}
                  name="dateDisplay"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DATE_DISPLAY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.dateDisplay && (
                  <p className="text-sm text-destructive">{errors.dateDisplay.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bezelType">Tip bezela</Label>
                <Controller
                  control={control}
                  name="bezelType"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite tip" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BEZEL_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.bezelType && (
                  <p className="text-sm text-destructive">{errors.bezelType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bezelMaterial">Materijal bezela</Label>
                <Input
                  id="bezelMaterial"
                  {...register("bezelMaterial")}
                  placeholder="Keramika, aluminijum..."
                  disabled={loading}
                />
                {errors.bezelMaterial && (
                  <p className="text-sm text-destructive">{errors.bezelMaterial.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Strap/Bracelet */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/50">
                <Watch className="h-4 w-4 text-amber-600" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Narukvica/Remen</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Informacije o narukvici ili remenu (opciono)
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="strapType">Tip narukvice/remena</Label>
                <Controller
                  control={control}
                  name="strapType"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite tip" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STRAP_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.strapType && (
                  <p className="text-sm text-destructive">{errors.strapType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="braceletMaterial">Materijal narukvice</Label>
                <Input
                  id="braceletMaterial"
                  {...register("braceletMaterial")}
                  placeholder="Oystersteel, zlato..."
                  disabled={loading}
                />
                {errors.braceletMaterial && (
                  <p className="text-sm text-destructive">{errors.braceletMaterial.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="strapWidthMm">Širina narukvice (mm)</Label>
                <Input
                  id="strapWidthMm"
                  type="number"
                  step="0.1"
                  min={10}
                  max={30}
                  {...register("strapWidthMm")}
                  placeholder="20"
                  disabled={loading}
                />
                {errors.strapWidthMm && (
                  <p className="text-sm text-destructive">{errors.strapWidthMm.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Condition & Details */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100/50">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Stanje i detalji</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Opšte stanje i dodatne informacije <span className="text-destructive">*</span> obavezno
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="condition">
                  Stanje <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ListingFormData["condition"])
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite stanje" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_VALUES.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {CONDITION_LABELS[condition]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.condition && (
                  <p className="text-sm text-destructive">{errors.condition.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Namenjeno <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ListingFormData["gender"])
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite namenu" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_VALUES.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {GENDER_LABELS[gender]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="runningCondition">Radno stanje</Label>
                <Controller
                  control={control}
                  name="runningCondition"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RUNNING_CONDITION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.runningCondition && (
                  <p className="text-sm text-destructive">{errors.runningCondition.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="boxPapers">Box i papiri</Label>
                <Controller
                  control={control}
                  name="boxPapers"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) =>
                        field.onChange(value as ListingFormData["boxPapers"])
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        {BOX_PAPERS_VALUES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {BOX_PAPERS_LABELS[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Garancija</Label>
                <Controller
                  control={control}
                  name="warranty"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WARRANTY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.warranty && (
                  <p className="text-sm text-destructive">{errors.warranty.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="warrantyCard">Garancijski list</Label>
                <Controller
                  control={control}
                  name="warrantyCard"
                  render={({ field }) => (
                    <Select
                      value={field.value === true ? "yes" : field.value === false ? "no" : undefined}
                      onValueChange={(value) => {
                        if (value === "yes") field.onChange(true);
                        else if (value === "no") field.onChange(false);
                        else field.onChange(null);
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Da</SelectItem>
                        <SelectItem value="no">Ne</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.warrantyCard && (
                  <p className="text-sm text-destructive">{errors.warrantyCard.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalOwner">Originalni vlasnik</Label>
                <Controller
                  control={control}
                  name="originalOwner"
                  render={({ field }) => (
                    <Select
                      value={field.value === true ? "yes" : field.value === false ? "no" : undefined}
                      onValueChange={(value) => {
                        if (value === "yes") field.onChange(true);
                        else if (value === "no") field.onChange(false);
                        else field.onChange(null);
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Da</SelectItem>
                        <SelectItem value="no">Ne</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.originalOwner && (
                  <p className="text-sm text-destructive">{errors.originalOwner.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/20">
                <DollarSign className="h-4 w-4 text-[#D4AF37]" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Cena</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cena prodaje <span className="text-destructive">*</span> obavezno
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">
                  Valuta <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ListingFormData["currency"])
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite valutu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="RSD">RSD (Srpski dinar)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currency && (
                  <p className="text-sm text-destructive">{errors.currency.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceEurCents">
                  Cena <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="priceEurCents"
                  type="number"
                  step="0.01"
                  {...register("priceEurCents")}
                  placeholder="10500.00"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Unesite cenu u izabranoj valuti
                </p>
                {errors.priceEurCents && (
                  <p className="text-sm text-destructive">{errors.priceEurCents.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100/50">
                <Image className="h-4 w-4 text-rose-600" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Fotografije</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dodajte najmanje {MIN_LISTING_PHOTOS} kvalitetne fotografije (maksimalno {MAX_LISTING_PHOTOS})
                </p>
              </div>
            </div>
            <ImageUpload
              value={photos}
              onChange={setPhotos}
              maxImages={MAX_LISTING_PHOTOS}
              folder="listings"
            />
            <p className="text-xs text-muted-foreground">
              Prva fotografija će biti glavna fotografija oglasa
            </p>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 rounded-lg border border-border/40 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100/50">
                <MapPin className="h-4 w-4 text-gray-600" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Dodatne informacije</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Opciono - dodatni detalji i lokacija
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detaljan opis sata, stanja, istorije..."
                rows={6}
                disabled={loading}
                className="resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokacija</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Beograd, Srbija"
                disabled={loading}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-border/40 bg-muted/20 px-6 sm:px-8 pb-6 sm:pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Otkaži
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900 font-semibold"
            >
              {loading ? "Čuvanje..." : listing ? "Ažuriraj" : "Sačuvaj kao nacrt"}
            </Button>
            {listing && listing.status === "DRAFT" && (
              <Button
                type="button"
                variant="default"
                onClick={handleSubmitForApproval}
                disabled={loading || photos.length === 0}
                className="w-full sm:w-auto"
              >
                Pošalji na odobrenje
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}