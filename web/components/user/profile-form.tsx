"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const profileSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera").optional().or(z.literal("")),
  email: z.string().email("Neispravan email format").optional(),
  locationCountry: z.string().optional().or(z.literal("")),
  locationCity: z.string().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: {
    name?: string | null;
    email?: string;
    locationCountry?: string | null;
    locationCity?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      locationCountry: initialData?.locationCountry || "",
      locationCity: initialData?.locationCity || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        locationCountry: initialData.locationCountry || "",
        locationCity: initialData.locationCity || "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      // Only send fields that have values
      const payload: any = {};
      if (data.name) payload.name = data.name;
      if (data.email) payload.email = data.email;
      if (data.locationCountry) payload.locationCountry = data.locationCountry;
      if (data.locationCity) payload.locationCity = data.locationCity;

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      router.refresh();
      toast.success("Profil je uspešno ažuriran!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moj Profil</CardTitle>
        <CardDescription>
          Ažurirajte svoje lične informacije
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ime</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Vaše ime"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-muted-foreground">(opciono)</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@example.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Promena emaila zahteva potvrdu putem novog emaila
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locationCountry">Država</Label>
              <Input
                id="locationCountry"
                {...register("locationCountry")}
                placeholder="npr. Srbija"
                disabled={loading}
              />
              {errors.locationCountry && (
                <p className="text-sm text-destructive">{errors.locationCountry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationCity">Grad</Label>
              <Input
                id="locationCity"
                {...register("locationCity")}
                placeholder="npr. Beograd"
                disabled={loading}
              />
              {errors.locationCity && (
                <p className="text-sm text-destructive">{errors.locationCity.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Čuvanje..." : "Sačuvaj promene"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

