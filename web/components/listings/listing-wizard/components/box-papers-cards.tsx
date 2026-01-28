"use client";

import { Package, FileText, PackageX, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BOX_PAPERS_VALUES } from "@/lib/validation/listing";

type BoxPapersValue = (typeof BOX_PAPERS_VALUES)[number];

interface BoxPapersOption {
  value: BoxPapersValue;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BOX_PAPERS_OPTIONS: BoxPapersOption[] = [
  { value: "Full Set", label: "Komplet", description: "Box + svi papiri", icon: Gift },
  { value: "Box Only", label: "Samo box", description: "Bez papira", icon: Package },
  { value: "Papers Only", label: "Samo papiri", description: "Bez kutije", icon: FileText },
  { value: "No Box or Papers", label: "Bez dodataka", description: "Samo sat", icon: PackageX },
];

interface BoxPapersCardsProps {
  value?: BoxPapersValue;
  onChange: (value: BoxPapersValue) => void;
  error?: string;
}

export function BoxPapersCards({ value, onChange, error }: BoxPapersCardsProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BOX_PAPERS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "min-h-[80px]",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
