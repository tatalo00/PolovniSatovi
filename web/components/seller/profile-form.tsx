"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { ImageUpload } from "@/components/ui/image-upload";

const optionalUrlSchema = z.union([
  z.string().url("URL mora biti validan"),
  z.literal(""),
  z.undefined(),
]);

const slugValueSchema = z
  .string()
  .min(3, "Slug mora imati najmanje 3 karaktera")
  .max(60, "Slug ne može biti duži od 60 karaktera")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug može sadržati samo mala slova, brojeve i crtice");

const profileSchema = z.object({
  storeName: z.string().min(2, "Naziv prodavnice mora imati najmanje 2 karaktera"),
  slug: slugValueSchema.optional().or(z.literal("")),
  shortDescription: z
    .string()
    .max(320, "Kratak opis može imati najviše 320 karaktera")
    .optional(),
  description: z.string().optional(),
  returnPolicy: z
    .string()
    .max(2000, "Politika povraćaja može imati najviše 2000 karaktera")
    .optional(),
  locationCountry: z.string().min(2, "Unesite državu"),
  locationCity: z.string().min(2, "Unesite grad"),
  logoUrl: optionalUrlSchema,
  heroImageUrl: optionalUrlSchema,
});

type ProfileFormData = z.infer<typeof profileSchema>;

type SellerProfileResponse = {
  storeName: string;
  description?: string | null;
  shortDescription?: string | null;
  returnPolicy?: string | null;
  locationCountry: string;
  locationCity: string;
  slug?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
};

export function SellerProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<SellerProfileResponse | null>(null);
  const [fetching, setFetching] = useState(true);
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>("https://polovnisatovi.net");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      storeName: "",
      slug: "",
      description: "",
      shortDescription: "",
      returnPolicy: "",
      locationCountry: "",
      locationCity: "",
      logoUrl: "",
      heroImageUrl: "",
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/seller/profile");
        if (response.ok) {
          const profile = (await response.json()) as SellerProfileResponse;
          if (profile) {
            setExistingProfile(profile);
            setValue("storeName", profile.storeName || "");
            setValue("description", profile.description || "");
            setValue("shortDescription", profile.shortDescription || "");
            setValue("returnPolicy", profile.returnPolicy || "");
            setValue("locationCountry", profile.locationCountry || "");
            setValue("locationCity", profile.locationCity || "");
            setValue("slug", profile.slug || "");
            setValue("logoUrl", profile.logoUrl || "");
            setValue("heroImageUrl", profile.heroImageUrl || "");
            setLogoImages(profile.logoUrl ? [profile.logoUrl] : []);
            setHeroImages(profile.heroImageUrl ? [profile.heroImageUrl] : []);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setFetching(false);
      }
    }

    fetchProfile();
  }, [setValue]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const slugValue = watch("slug") || "";
  const shortDescriptionValue = watch("shortDescription") || "";
  const returnPolicyValue = watch("returnPolicy") || "";

  const previewUrl = useMemo(() => {
    const slugPreview = slugValue || "vas-slug";
    return `${baseUrl}/sellers/${slugPreview}`;
  }, [baseUrl, slugValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const url = "/api/seller/profile";
      const method = existingProfile ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          slug: data.slug?.trim() || undefined,
          logoUrl: logoImages[0] || undefined,
          heroImageUrl: heroImages[0] || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      router.refresh();
      toast.success(existingProfile ? "Profil je ažuriran!" : "Profil je kreiran!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Učitavanje...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingProfile ? "Ažuriraj Prodavac Profil" : "Kreiraj Prodavac Profil"}
        </CardTitle>
        <CardDescription>
          {existingProfile
            ? "Ažurirajte informacije o vašoj prodavnici"
            : "Popunite informacije o vašoj prodavnici da biste mogli da objavljujete oglase"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">
              Naziv Prodavnice <span className="text-destructive">*</span>
            </Label>
            <Input
              id="storeName"
              {...register("storeName")}
              placeholder="Moja Prodavnica Satova"
              disabled={loading}
            />
            {errors.storeName && (
              <p className="text-sm text-destructive">{errors.storeName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Opisite vašu prodavnicu, iskustvo, specijalnosti..."
              rows={4}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnPolicy">Politika povraćaja i reklamacija</Label>
            <Textarea
              id="returnPolicy"
              {...register("returnPolicy")}
              placeholder="Opišite vašu politiku povraćaja, garanciju, i način rešavanja reklamacija..."
              rows={3}
              maxLength={2000}
              disabled={loading}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Prikazuje se na vašoj javnoj stranici.</span>
              <span>{returnPolicyValue.length}/2000</span>
            </div>
            {errors.returnPolicy && (
              <p className="text-sm text-destructive">{errors.returnPolicy.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Kratak opis (javna stranica)</Label>
            <Textarea
              id="shortDescription"
              {...register("shortDescription")}
              placeholder="Specijalizovani za Rolex i Patek sa potpunom dokumentacijom."
              rows={2}
              maxLength={320}
              disabled={loading}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Ovaj tekst se prikazuje uz vaš logo.</span>
              <span>{shortDescriptionValue.length}/320</span>
            </div>
            {errors.shortDescription && (
              <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Javni URL (slug)</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="mvp-watch-boutique"
                disabled={loading}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              <p className="text-xs text-muted-foreground break-words">{previewUrl}</p>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <ImageUpload
                value={logoImages}
                onChange={(urls) => {
                  const next = urls.slice(0, 1);
                  setLogoImages(next);
                  setValue("logoUrl", next[0] || "");
                }}
                maxImages={1}
                folder="seller-logos"
              />
              {errors.logoUrl && (
                <p className="text-sm text-destructive">{errors.logoUrl.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hero fotografija</Label>
            <p className="text-xs text-muted-foreground">
              Preporučena dimenzija: 1600x600px. Biće prikazana u zaglavlju javne stranice.
            </p>
            <ImageUpload
              value={heroImages}
              onChange={(urls) => {
                const next = urls.slice(0, 1);
                setHeroImages(next);
                setValue("heroImageUrl", next[0] || "");
              }}
              maxImages={1}
              folder="seller-hero"
            />
            {errors.heroImageUrl && (
              <p className="text-sm text-destructive">{errors.heroImageUrl.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locationCountry">
                Država <span className="text-destructive">*</span>
              </Label>
              <Input
                id="locationCountry"
                {...register("locationCountry")}
                placeholder="RS"
                disabled={loading}
              />
              {errors.locationCountry && (
                <p className="text-sm text-destructive">{errors.locationCountry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationCity">
                Grad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="locationCity"
                {...register("locationCity")}
                placeholder="Beograd"
                disabled={loading}
              />
              {errors.locationCity && (
                <p className="text-sm text-destructive">{errors.locationCity.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Nakon verifikacije, vaš profil će biti javno dostupan na gore navedenom linku.
          </p>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Čuvanje..." : existingProfile ? "Ažuriraj Profil" : "Kreiraj Profil"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}