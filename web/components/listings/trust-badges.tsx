"use client";

import { ShieldCheck, Lock, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TrustBadge {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TRUST_BADGES: TrustBadge[] = [
  {
    id: "buyer_protection",
    label: "Zaštita kupca",
    description: "Escrow plaćanje i mogućnost prigovora",
    icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
  },
  {
    id: "secure_messaging",
    label: "Sigurna poruka",
    description: "Šifrovana komunikacija između kupca i prodavca",
    icon: <Lock className="h-4 w-4" aria-hidden />,
  },
  {
    id: "verified_listing",
    label: "Proveren oglas",
    description: "Oglas je pregledan i odobren od strane tima",
    icon: <CheckCircle className="h-4 w-4" aria-hidden />,
  },
];

interface TrustBadgesProps {
  badges?: ("buyer_protection" | "secure_messaging" | "verified_listing")[];
  layout?: "horizontal" | "vertical" | "compact";
  showLabels?: boolean;
  className?: string;
}

export function TrustBadges({
  badges = ["buyer_protection", "secure_messaging", "verified_listing"],
  layout = "horizontal",
  showLabels = true,
  className,
}: TrustBadgesProps) {
  const displayBadges = TRUST_BADGES.filter((badge) => badges.includes(badge.id as typeof badges[number]));

  if (layout === "compact") {
    return (
      <TooltipProvider delayDuration={300}>
        <div className={cn("flex items-center gap-1.5", className)}>
          {displayBadges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                  aria-label={badge.label}
                >
                  {badge.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="font-medium">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }

  if (layout === "vertical") {
    return (
      <div className={cn("space-y-2", className)}>
        {displayBadges.map((badge) => (
          <div key={badge.id} className="flex items-start gap-2.5">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {badge.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{badge.label}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: horizontal
  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-xs"
        >
          <span className="text-primary">{badge.icon}</span>
          {showLabels && (
            <span className="font-medium text-foreground">{badge.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Compact inline version for sticky CTA
export function TrustBadgesInline({ className }: { className?: string }) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center gap-1", className)}>
        {TRUST_BADGES.slice(0, 2).map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <span className="text-primary/70 hover:text-primary transition-colors cursor-help">
                {badge.icon}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[180px]">
              <p className="text-xs font-medium">{badge.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
