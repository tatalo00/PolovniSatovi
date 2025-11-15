"use client";

import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SpecItem {
  label: string;
  value: string | null | undefined;
  icon?: ReactNode;
  emphasis?: boolean;
}

interface ListingSpecsTableProps {
  specs: SpecItem[];
  boxPapersStatus?: string | null;
}

const boxPapersVariants: Record<string, { label: string; tone: "default" | "success" | "warn" | "neutral" }> = {
  "Full Set": { label: "Komplet (box + papiri)", tone: "success" },
  "Papers Only": { label: "Samo papiri", tone: "neutral" },
  "Box Only": { label: "Samo box", tone: "neutral" },
  "No Box or Papers": { label: "Bez boxa i papira", tone: "warn" },
};

function resolveBadgeTone(tone: "default" | "success" | "warn" | "neutral") {
  switch (tone) {
    case "success":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100";
    case "warn":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100";
    case "neutral":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
}

export function ListingSpecsTable({ specs, boxPapersStatus }: ListingSpecsTableProps) {
  const resolvedBoxPapers =
    boxPapersStatus && boxPapersVariants[boxPapersStatus]
      ? boxPapersVariants[boxPapersStatus]
      : boxPapersStatus
      ? { label: boxPapersStatus, tone: "neutral" as const }
      : null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="grid grid-cols-1 border-b last:border-b-0 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex flex-col gap-1 px-4 py-3.5 sm:px-6 sm:py-5 min-h-[60px] sm:min-h-0"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {spec.label}
            </span>
            <span
              className={cn(
                "text-sm sm:text-base font-medium text-foreground",
                !spec.value && "text-muted-foreground"
              )}
            >
              {spec.value ?? "—"}
            </span>
          </div>
        ))}
      </div>
      {resolvedBoxPapers && (
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Box &amp; papiri
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              Status originalne opreme
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "whitespace-nowrap px-3 py-1 text-sm font-medium",
              resolveBadgeTone(resolvedBoxPapers.tone)
            )}
          >
            {resolvedBoxPapers.label}
          </Badge>
        </div>
      )}
    </div>
  );
}


