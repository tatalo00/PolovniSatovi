"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const profileSchema = z.object({
  storeName: z.string().min(2, "Naziv prodavnice mora imati najmanje 2 karaktera"),
  description: z.string().optional(),
  locationCountry: z.string().min(2, "Unesite državu"),
  locationCity: z.string().min(2, "Unesite grad"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function SellerProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/seller/profile");
        if (response.ok) {
          const profile = await response.json();
          if (profile) {
            setExistingProfile(profile);
            setValue("storeName", profile.storeName);
            setValue("description", profile.description || "");
            setValue("locationCountry", profile.locationCountry);
            setValue("locationCity", profile.locationCity);
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

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const url = "/api/seller/profile";
      const method = existingProfile ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Došlo je do greške");
        return;
      }

      router.refresh();
      alert(existingProfile ? "Profil je ažuriran!" : "Profil je kreiran!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
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
        <CardContent className="space-y-4">
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
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Čuvanje..." : existingProfile ? "Ažuriraj Profil" : "Kreiraj Profil"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

