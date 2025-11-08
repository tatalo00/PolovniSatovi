"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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

const listingSchema = z.object({
  title: z.string().min(5, "Naziv mora imati najmanje 5 karaktera"),
  brand: z.string().min(2, "Marka je obavezna"),
  model: z.string().min(2, "Model je obavezan"),
  reference: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^[A-Za-z0-9\-./]{2,30}$/.test(value.trim()),
      "Referenca može sadržati samo slova, brojeve i - . / (2-30 karaktera)"
    ),
  year: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const parsed = parseInt(value, 10);
      const currentYear = new Date().getFullYear() + 1;
      return parsed >= 1900 && parsed <= currentYear;
    }, "Godina mora biti između 1900. i sledeće kalendarske godine"),
  caseDiameterMm: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d{1,3}$/.test(value),
      "Prečnik mora biti broj (maks. 3 cifre)"
    ),
  caseMaterial: z.string().optional(),
  movement: z.string().optional(),
  condition: z.string().min(1, "Stanje je obavezno"),
  priceEurCents: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Cena mora biti validan broj")
    .refine((value) => parseFloat(value) > 0, "Cena mora biti veća od 0"),
  currency: z.string(),
  boxPapers: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  listing?: any;
}

export function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(listing?.photos?.map((p: any) => p.url) || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing
      ? {
          title: listing.title,
          brand: listing.brand,
          model: listing.model,
          reference: listing.reference || "",
          year: listing.year?.toString() || "",
          caseDiameterMm: listing.caseDiameterMm
            ? listing.caseDiameterMm.toString()
            : "",
          caseMaterial: listing.caseMaterial || "",
          movement: listing.movement || "",
          condition: listing.condition,
          priceEurCents: (listing.priceEurCents / 100).toFixed(2),
          currency: listing.currency || "EUR",
          boxPapers: listing.boxPapers || "",
          description: listing.description || "",
          location: listing.location || "",
        }
      : {
          currency: "EUR",
          caseDiameterMm: "",
          caseMaterial: "",
          movement: "",
          condition: "",
          boxPapers: "",
        },
  });

  const onSubmit = async (data: ListingFormData) => {
    if (photos.length < MIN_LISTING_PHOTOS) {
      toast.error(`Oglas mora imati najmanje ${MIN_LISTING_PHOTOS} fotografije`);
      return;
    }
    setLoading(true);
    try {
      const priceInEur = parseFloat(data.priceEurCents);
      const priceEurCents = Math.round(priceInEur * 100);

      const payload = {
        ...data,
        title: data.title.trim(),
        brand: data.brand.trim(),
        model: data.model.trim(),
        reference: data.reference?.trim() || undefined,
        priceEurCents,
        year: data.year ? parseInt(data.year, 10) : null,
        caseDiameterMm: data.caseDiameterMm
          ? parseInt(data.caseDiameterMm, 10)
          : null,
        caseMaterial: data.caseMaterial?.trim()
          ? data.caseMaterial.trim()
          : undefined,
        movement: data.movement?.trim() ? data.movement.trim() : undefined,
        description: data.description?.trim() || undefined,
        location: data.location?.trim() || undefined,
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
    <Card>
      <CardHeader>
        <CardTitle>{listing ? "Izmeni Oglas" : "Kreiraj Novi Oglas"}</CardTitle>
        <CardDescription>
          Popunite informacije o satu koji prodajete
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("currency")} />
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Osnovne informacije</h3>

            <div className="space-y-2">
              <Label htmlFor="title">
                Naziv oglasa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="npr. Rolex Submariner Date 2018"
                disabled={loading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
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
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="caseDiameterMm">Prečnik kućišta (mm)</Label>
                <Input
                  id="caseDiameterMm"
                  type="number"
                  min={0}
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
                <Label htmlFor="caseMaterial">Materijal kućišta</Label>
                <Input
                  id="caseMaterial"
                  {...register("caseMaterial")}
                  placeholder="Nerđajući čelik, titanijum..."
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement">Mehanizam</Label>
                <Input
                  id="movement"
                  {...register("movement")}
                  placeholder="Automatski, kvarc, ručni navoj..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cena i stanje</h3>

            <div className="grid gap-4 md:grid-cols-2">
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
                      onValueChange={(value) => field.onChange(value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite stanje" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">Novo</SelectItem>
                        <SelectItem value="Like New">Kao novo</SelectItem>
                        <SelectItem value="Excellent">Odlično</SelectItem>
                        <SelectItem value="Very Good">Vrlo dobro</SelectItem>
                        <SelectItem value="Good">Dobro</SelectItem>
                        <SelectItem value="Fair">Zadovoljavajuće</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.condition && (
                  <p className="text-sm text-destructive">{errors.condition.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="boxPapers">Box i papiri</Label>
                <Controller
                  control={control}
                  name="boxPapers"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value || "")}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Set">Komplet (box + papiri)</SelectItem>
                        <SelectItem value="Box Only">Samo box</SelectItem>
                        <SelectItem value="Papers Only">Samo papiri</SelectItem>
                        <SelectItem value="No Box or Papers">Nema boxa ni papira</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priceEurCents">
                  Cena (EUR) <span className="text-destructive">*</span>
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
                  Unesite cenu u evrima (npr. 10500.00)
                </p>
                {errors.priceEurCents && (
                  <p className="text-sm text-destructive">{errors.priceEurCents.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fotografije</h3>
            <ImageUpload
              value={photos}
              onChange={setPhotos}
              maxImages={MAX_LISTING_PHOTOS}
              folder="listings"
            />
            <p className="text-sm text-muted-foreground">
              Dodajte najmanje {MIN_LISTING_PHOTOS} kvalitetne fotografije (maksimalno {MAX_LISTING_PHOTOS}).
            </p>
            <p className="text-xs text-muted-foreground">
              Prva fotografija će biti glavna fotografija oglasa
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dodatne informacije</h3>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detaljan opis sata, stanja, istorije..."
                rows={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokacija</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Beograd, Srbija"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Otkaži
          </Button>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Čuvanje..." : listing ? "Ažuriraj" : "Sačuvaj kao nacrt"}
            </Button>
            {listing && listing.status === "DRAFT" && (
              <Button
                type="button"
                variant="default"
                onClick={handleSubmitForApproval}
                disabled={loading || photos.length === 0}
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