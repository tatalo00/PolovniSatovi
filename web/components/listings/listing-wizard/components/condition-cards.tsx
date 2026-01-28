"use client";

import { Sparkles, Star, ThumbsUp, Check, Eye, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CONDITION_VALUES } from "@/lib/validation/listing";

type ConditionValue = (typeof CONDITION_VALUES)[number];

interface ConditionOption {
  value: ConditionValue;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CONDITIONS: ConditionOption[] = [
  { value: "New", label: "Novo", description: "Nikada nošen, sa etiketama", icon: Sparkles },
  { value: "Like New", label: "Kao novo", description: "Bez vidljivih tragova nošenja", icon: Star },
  { value: "Excellent", label: "Odlično", description: "Minimalni znaci korišćenja", icon: ThumbsUp },
  { value: "Very Good", label: "Vrlo dobro", description: "Manji znaci nošenja", icon: Check },
  { value: "Good", label: "Dobro", description: "Vidljivi znaci nošenja", icon: Eye },
  { value: "Fair", label: "Zadovoljavajuće", description: "Značajni znaci korišćenja", icon: AlertCircle },
];

interface ConditionCardsProps {
  value?: ConditionValue;
  onChange: (value: ConditionValue) => void;
  error?: string;
}

export function ConditionCards({ value, onChange, error }: ConditionCardsProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CONDITIONS.map((condition) => {
          const Icon = condition.icon;
          const isSelected = value === condition.value;

          return (
            <button
              key={condition.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(condition.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "min-h-[100px]",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 shrink-0",
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
                  {condition.label}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {condition.description}
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
