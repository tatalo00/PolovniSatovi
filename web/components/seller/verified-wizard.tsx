"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Define enums locally to avoid importing from @prisma/client in client components
enum SellerApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum SellerType {
  OFFICIAL = "OFFICIAL",
  INDEPENDENT = "INDEPENDENT",
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SELLER_TYPES = [
  { value: SellerType.OFFICIAL, label: "Oficijalni butik / registrovana firma" },
  { value: SellerType.INDEPENDENT, label: "Nezavisni časovničar / online shop" },
] as const;

const STEP_FIELDS: Array<(keyof ApplicationFormValues)[]> = [
  ["storeName", "sellerType", "shortDescription"],
  ["locationCountry", "locationCity", "instagramHandle", "proofUrl"],
];

const applicationSchema = z
  .object({
    storeName: z.string().min(2, "Unesite naziv prodavnice"),
    sellerType: z.nativeEnum(SellerType),
    shortDescription: z
      .string()
      .min(10, "Napišite bar 10 karaktera")
      .max(320, "Kratak opis može imati najviše 320 karaktera"),
    locationCountry: z.string().min(2, "Unesite državu"),
    locationCity: z.string().min(2, "Unesite grad"),
    instagramHandle: z.string().optional(),
    proofUrl: z.string().url("Link mora biti validan URL").optional(),
  })
  .refine(
    (data) => {
      const hasHandle = data.instagramHandle?.trim();
      return hasHandle || data.proofUrl;
    },
    {
      message: "Navedite Instagram profil ili otpremite fotografiju kao dokaz",
      path: ["instagramHandle"],
    }
  );

type ApplicationFormValues = z.infer<typeof applicationSchema>;

type ApplicationClient = {
  id: string;
  status: SellerApplicationStatus;
  sellerType: SellerType;
  storeName: string;
  shortDescription: string;
  locationCountry: string;
  locationCity: string;
  instagramHandle: string;
  proofUrl: string;
  updatedAt: string;
};

interface SellerVerifiedWizardProps {
  initialApplication: ApplicationClient | null;
}

export function SellerVerifiedWizard({ initialApplication }: SellerVerifiedWizardProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState<ApplicationClient | null>(initialApplication);
  const [proofImages, setProofImages] = useState<string[]>(
    initialApplication?.proofUrl ? [initialApplication.proofUrl] : []
  );

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      storeName: initialApplication?.storeName ?? "",
      sellerType: initialApplication?.sellerType ?? SellerType.OFFICIAL,
      shortDescription: initialApplication?.shortDescription ?? "",
      locationCountry: initialApplication?.locationCountry ?? "",
      locationCity: initialApplication?.locationCity ?? "",
      instagramHandle: initialApplication?.instagramHandle ?? "",
      proofUrl: initialApplication?.proofUrl ?? "",
    },
  });

  const instagramValue = form.watch("instagramHandle") ?? "";

  const isReadOnly =
    application && application.status !== SellerApplicationStatus.REJECTED
      ? true
      : false;

  const currentStepInfo = useMemo(() => {
    switch (step) {
      case 0:
        return {
          title: "Osnovne informacije",
          description: "Recite nam ko ste i kako se zove vaša prodavnica.",
        };
      case 1:
        return {
          title: "Profil radnje",
          description: "Lokacija, kontakt i makar jedan dokaz prisustva.",
        };
      default:
        return {
          title: "Potvrda i sledeći koraci",
          description: "Pregledajte podatke i završite prijavu.",
        };
    }
  }, [step]);

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    if (!fields) {
      setStep((prev) => prev + 1);
      return;
    }
    const isValid = await form.trigger(fields);
    if (!isValid) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleProofChange = (urls: string[]) => {
    const next = urls.slice(0, 1);
    setProofImages(next);
    form.setValue("proofUrl", next[0] ?? "");
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload: ApplicationFormValues = {
        ...values,
        instagramHandle: values.instagramHandle?.trim() || undefined,
        proofUrl: values.proofUrl?.trim() || undefined,
      };
      const response = await fetch("/api/seller/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error ?? "Prijava nije uspela");
      }

      const result = (await response.json()) as ApplicationClient;
      setApplication(result);
      toast.success("Prijava je poslata. Tim će je uskoro pregledati.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Prijava nije uspela";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isReadOnly && application) {
    return <ApplicationStatusCard application={application} />;
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Korak {step + 1} od 3
        </p>
        <CardTitle className="text-2xl font-semibold">{currentStepInfo.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{currentStepInfo.description}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="storeName">Naziv prodavnice</Label>
              <Input id="storeName" placeholder="MVP Watch Boutique" {...form.register("storeName")} />
              <FormError message={form.formState.errors.storeName?.message} />
            </div>
            <div className="space-y-2">
              <Label>Tip prodavnice</Label>
              <Select
                value={form.watch("sellerType")}
                onValueChange={(value) =>
                  form.setValue("sellerType", value as SellerType, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberite" />
                </SelectTrigger>
                <SelectContent>
                  {SELLER_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Kratak opis</Label>
              <Textarea
                id="shortDescription"
                rows={3}
                maxLength={320}
                placeholder="Specijalizovani za Rolex i Omega modele sa potpunom dokumentacijom."
                {...form.register("shortDescription")}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{form.formState.errors.shortDescription?.message}</span>
                <span>{(form.watch("shortDescription")?.length ?? 0)}/320</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="locationCountry">Država</Label>
                <Input id="locationCountry" placeholder="Srbija" {...form.register("locationCountry")} />
                <FormError message={form.formState.errors.locationCountry?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationCity">Grad</Label>
                <Input id="locationCity" placeholder="Beograd" {...form.register("locationCity")} />
                <FormError message={form.formState.errors.locationCity?.message} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram / web link</Label>
              <Input
                id="instagramHandle"
                placeholder="@mywatchstore"
                {...form.register("instagramHandle")}
              />
              <div className="text-xs text-muted-foreground">
                Ako nemate zvanični profil, otpremite fotografiju radnje ili vitrine.
              </div>
              <FormError message={form.formState.errors.instagramHandle?.message} />
            </div>
            <div className="space-y-2">
              <Label>Fotografija radnje / logotip</Label>
              <ImageUpload value={proofImages} onChange={handleProofChange} maxImages={1} folder="seller-proof" />
              <FormError message={form.formState.errors.proofUrl?.message} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Pregled prijave</p>
              <ul className="mt-3 space-y-1.5">
                <li>
                  <span className="text-foreground">Prodavnica:</span> {form.watch("storeName")}
                </li>
                <li>
                  <span className="text-foreground">Tip:</span>{" "}
                  {SELLER_TYPES.find((s) => s.value === form.watch("sellerType"))?.label}
                </li>
                <li>
                  <span className="text-foreground">Lokacija:</span>{" "}
                  {[form.watch("locationCity"), form.watch("locationCountry")].filter(Boolean).join(", ")}
                </li>
                <li>
                  <span className="text-foreground">Instagram / link:</span>{" "}
                  {instagramValue?.trim() || "Nije uneto"}
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Šta sledi?</p>
              <ol className="mt-2 space-y-1">
                <li>1. Potvrdite identitet kroz Didit link koji ćemo poslati.</li>
                <li>2. Tim proverava dostavljene informacije (obično 1-2 radna dana).</li>
                <li>3. Dobijate verified badge i javni profil.</li>
              </ol>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Nazad
            </Button>
          )}
          {step < 2 && (
            <Button type="button" onClick={handleNext}>
              Sledeći korak
            </Button>
          )}
          {step === 2 && (
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Slanje..." : "Pošalji prijavu"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function ApplicationStatusCard({ application }: { application: ApplicationClient }) {
  const formattedDate = new Intl.DateTimeFormat("sr-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(application.updatedAt));

  const statusCopy = {
    [SellerApplicationStatus.PENDING]: {
      title: "Prijava je u obradi",
      description:
        "Naš tim proverava dostavljene informacije. Obično odgovaramo u roku od 1-2 radna dana.",
    },
    [SellerApplicationStatus.APPROVED]: {
      title: "Čestitamo! Postali ste verified prodavac",
      description:
        "Badge i javni profil biće aktivirani čim završimo finalne korake i potvrdimo identitet.",
    },
    [SellerApplicationStatus.REJECTED]: {
      title: "Prijava je odbijena",
      description:
        "Možete poslati novu prijavu kada pripremite dodatne informacije. Kontaktirajte tim ako vam je potrebna pomoć.",
    },
  }[application.status];

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>{statusCopy.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{statusCopy.description}</p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="rounded-lg bg-muted px-4 py-3 text-foreground">
          <p className="font-semibold">{application.storeName}</p>
          <p>{application.locationCity}, {application.locationCountry}</p>
          <p className="text-xs text-muted-foreground">Poslednja izmena {formattedDate}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Potrebna pomoć? Pišite nam na{" "}
          <a className="font-medium text-foreground underline" href="mailto:info@polovnisatovi.net">
            info@polovnisatovi.net
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}

