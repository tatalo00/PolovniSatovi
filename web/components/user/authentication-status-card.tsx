"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { BadgeCheck, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type AuthenticationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "NONE";

interface AuthenticationStatusCardProps {
  isVerifiedSeller: boolean;
  authentication: {
    id: string;
    status: AuthenticationStatus;
    diditSessionUrl?: string | null;
    diditVerificationId?: string | null;
    rejectionReason?: string | null;
    statusDetail?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
  } | null;
}

const statusCopy: Record<AuthenticationStatus, { label: string; description: string }> = {
  NONE: {
    label: "Nije autentifikovan",
    description:
      "Autentifikacija preko Didit platforme potvrđuje da ste vi zaista osoba koja prodaje ili kupuje sat. Potrebno je da završite brz KYC proces (dokument + selfie).",
  },
  PENDING: {
    label: "U toku",
    description:
      "Autentifikacija je u toku na Didit platformi. Obavestićemo vas čim Didit završi proveru.",
  },
  APPROVED: {
    label: "Autentifikovan",
    description:
      "Vaš identitet je potvrđen. Oznaka 'Autentifikovani korisnik' sada je istaknuta na vašim oglasima i profilu.",
  },
  REJECTED: {
    label: "Odbijeno",
    description:
      "Didit nije uspeo da potvrdi vaš identitet. Pogledajte razlog i pokušajte ponovo sa jasnim fotografijama i dobrim osvetljenjem.",
  },
  CANCELED: {
    label: "Otkazano",
    description:
      "Autentifikacija je otkazana na Didit platformi. Pokrenite novi zahtev da biste dovršili proces.",
  },
};

function formatDate(value?: string | null) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString("sr-RS");
  } catch {
    return null;
  }
}

export function AuthenticationStatusCard({
  isVerifiedSeller,
  authentication,
}: AuthenticationStatusCardProps) {
  const [isPending, startTransition] = useTransition();
  const [sessionUrl, setSessionUrl] = useState<string | null>(authentication?.diditSessionUrl ?? null);
  const [status, setStatus] = useState<AuthenticationStatus>(
    authentication?.status ?? (isVerifiedSeller ? "APPROVED" : "NONE")
  );
  const [rejectionReason, setRejectionReason] = useState<string | null>(
    authentication?.rejectionReason ?? null
  );
  const [statusDetail, setStatusDetail] = useState<string | null>(
    authentication?.statusDetail ?? null
  );

  const copy = useMemo(() => statusCopy[status], [status]);
  const updatedAtReadable = formatDate(authentication?.updatedAt ?? authentication?.createdAt ?? null);

  const handleStartAuthentication = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/authentication/session", {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error ?? "Neuspešno pokretanje autentifikacije.");
        }

        const data = await response.json();
        setStatus(data.status ?? "PENDING");
        setSessionUrl(data.url ?? null);
        setRejectionReason(null);
        setStatusDetail(null);

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.success("Autentifikacija je pokrenuta. Proverite e-mail za instrukcije.");
        }
      } catch (error) {
        console.error("Failed to start authentication", error);
        toast.error(error instanceof Error ? error.message : "Greška pri pokretanju autentifikacije.");
      }
    });
  };

  const renderIcon = () => {
    if (status === "APPROVED") {
      return <ShieldCheck className="h-10 w-10 text-emerald-500" aria-hidden />;
    }
    if (status === "PENDING") {
      return <BadgeCheck className="h-10 w-10 text-primary" aria-hidden />;
    }
    if (status === "REJECTED") {
      return <ShieldAlert className="h-10 w-10 text-destructive" aria-hidden />;
    }
    return <UserCheck className="h-10 w-10 text-muted-foreground" aria-hidden />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {renderIcon()}
          <div>
            <CardTitle>Autentifikacija naloga</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
        </div>
        <Badge variant={status === "APPROVED" ? "default" : "secondary"}>{copy.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "REJECTED" && rejectionReason && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Razlog odbijanja: {rejectionReason}
          </div>
        )}

        {statusDetail && (
          <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
            {statusDetail}
          </div>
        )}

        {updatedAtReadable && (
          <p className="text-sm text-muted-foreground">
            Poslednje ažuriranje: {updatedAtReadable}
          </p>
        )}

        {status !== "APPROVED" && (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleStartAuthentication} disabled={isPending}>
              {isPending
                ? "Pokretanje..."
                : status === "NONE"
                ? "Započni autentifikaciju"
                : "Ponovi autentifikaciju"}
            </Button>
            {sessionUrl && status === "PENDING" && (
              <Button asChild variant="outline">
                <Link href={sessionUrl} prefetch={false}>
                  Nastavi proces
                </Link>
              </Button>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Po završetku procesa Didit nas obaveštava o rezultatu i automatski ažurira status vaše autentifikacije.
        </p>
      </CardContent>
    </Card>
  );
}
