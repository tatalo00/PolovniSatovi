"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, MessageSquare, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyerProtectionInfoProps {
  variant?: "full" | "compact" | "inline";
  className?: string;
}

const PROTECTION_POINTS = [
  {
    icon: ShieldCheck,
    title: "Zaštita kupca",
    description: "Escrow plaćanje osigurava vašu kupovinu. Novac se isplaćuje prodavcu tek nakon što potvrdite prijem.",
  },
  {
    icon: Lock,
    title: "Sigurna komunikacija",
    description: "Sve poruke su šifrovane. Nikada ne delite lične podatke van platforme.",
  },
  {
    icon: MessageSquare,
    title: "Posredovanje u sporovima",
    description: "U slučaju problema, naš tim je tu da posreduje i pronađe rešenje.",
  },
];

export function BuyerProtectionInfo({ variant = "full", className }: BuyerProtectionInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
        <span>Zaštićena kupovina</span>
        <Link href="/faq#buyer-protection" className="text-primary hover:underline">
          Saznaj više
        </Link>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full rounded-lg border border-primary/20 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-sm font-medium">Zaštita kupca</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
            aria-hidden
          />
        </div>
        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            {PROTECTION_POINTS.map((point) => (
              <div key={point.title} className="flex items-start gap-2">
                <point.icon className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" aria-hidden />
                <p>{point.description}</p>
              </div>
            ))}
            <Link
              href="/faq#buyer-protection"
              className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Saznaj više
              <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        )}
      </button>
    );
  }

  // Full variant
  return (
    <div className={cn("rounded-lg border border-primary/20 bg-primary/5 p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <h3 className="font-semibold">Zaštita kupca</h3>
      </div>

      <div className="space-y-3">
        {PROTECTION_POINTS.map((point) => (
          <div key={point.title} className="flex items-start gap-3">
            <point.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-medium">{point.title}</p>
              <p className="text-xs text-muted-foreground">{point.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-primary/10">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Saveti za bezbednu kupovinu
        </h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Uvek komunicirajte preko platforme</li>
          <li>• Proverite fotografije i opis pre kupovine</li>
          <li>• Pitajte za dodatne slike ako je potrebno</li>
          <li>• Ne šaljite novac van platforme</li>
        </ul>
      </div>

      <Link
        href="/faq#buyer-protection"
        className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        Saznaj više o zaštiti
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
