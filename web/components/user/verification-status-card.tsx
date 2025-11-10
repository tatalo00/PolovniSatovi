"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { BadgeCheck, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "NONE";

interface VerificationStatusCardProps {
  isVerified: boolean;
  verification: {
    id: string;
    status: VerificationStatus;
    diditSessionUrl?: string | null;
    diditVerificationId?: string | null;
    rejectionReason?: string | null;
    statusDetail?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
  } | null;
}

const statusCopy: Record<VerificationStatus, { label: string; description: string }> = {
  NONE: {
    label: "Nije verifikovan",
    description:
      "Verifikacija preko Didit platforme pomaže da izgradite poverenje kod drugih članova. Potrebno je da dostavite selfie i fotografiju važećeg dokumenta.",
  },
  PENDING: {
    label: "U toku",
    description:
      "Verifikacija je u toku na Didit platformi. Obaveštenje o ishodu stiže čim Didit završi proveru.",
  },
  APPROVED: {
    label: "Verifikovan",
    description: "Vaš nalog je verifikovan. Kupci i prodavci će videti oznaku poverenja na vašem profilu.",
  },
  REJECTED: {
    label: "Odbijeno",
    description:
      "Didit nije mogao da potvrdi identitet. Proverite razlog i pokrenite novi pokušaj sa jasnim fotografijama dokumenta i selfija.",
  },
  CANCELED: {
    label: "Otkazano",
    description:
      "Verifikacija je otkazana na Didit platformi. Pokrenite novi zahtev da biste završili proces.",
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

export function VerificationStatusCard({
  isVerified,
  verification,
}: VerificationStatusCardProps) {
  const [isPending, startTransition] = useTransition();
  const [sessionUrl, setSessionUrl] = useState<string | null>(verification?.diditSessionUrl ?? null);
  const [status, setStatus] = useState<VerificationStatus>(
    verification?.status ?? (isVerified ? "APPROVED" : "NONE")
  );
  const [rejectionReason, setRejectionReason] = useState<string | null>(
    verification?.rejectionReason ?? null
  );
  const [statusDetail, setStatusDetail] = useState<string | null>(
    verification?.statusDetail ?? null
  );

  const copy = useMemo(() => statusCopy[status], [status]);
  const updatedAtReadable = formatDate(verification?.updatedAt ?? verification?.createdAt ?? null);

  const handleStartVerification = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/verification/session", {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error ?? "Neuspešno pokretanje verifikacije.");
        }

        const data = await response.json();
        setStatus(data.status ?? "PENDING");
        setSessionUrl(data.url ?? null);
        setRejectionReason(null);
        setStatusDetail(null);

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.success("Verifikacija je pokrenuta. Proverite e-mail za instrukcije.");
        }
      } catch (error) {
        console.error("Failed to start verification", error);
        toast.error(error instanceof Error ? error.message : "Greška pri pokretanju verifikacije.");
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
            <CardTitle>Verifikacija naloga</CardTitle>
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
            <Button onClick={handleStartVerification} disabled={isPending}>
              {isPending ? "Pokretanje..." : status === "NONE" ? "Započni verifikaciju" : "Ponovi verifikaciju"}
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
          Po završetku procesa Didit nas obaveštava o rezultatu i automatski ažurira status vašeg naloga.
        </p>
      </CardContent>
    </Card>
  );
}

