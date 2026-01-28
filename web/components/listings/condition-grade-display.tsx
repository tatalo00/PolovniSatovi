"use client";

import { useState } from "react";
import { Sparkles, Star, ThumbsUp, Check, Eye, AlertCircle, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ConditionValue = "New" | "Like New" | "Excellent" | "Very Good" | "Good" | "Fair";

interface ConditionOption {
  value: ConditionValue;
  label: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  level: number; // 6 = best (New), 1 = lowest (Fair)
  color: string;
}

const CONDITIONS: ConditionOption[] = [
  {
    value: "New",
    label: "Novo",
    description: "Nikada nošen, sa etiketama",
    detailedDescription: "Sat nikada nije bio nošen. Dolazi sa svom originalnom ambalažom, etiketama i zaštitnim folijama. Potpuno nov stanje bez ikakvih tragova korišćenja.",
    icon: Sparkles,
    level: 6,
    color: "text-emerald-600"
  },
  {
    value: "Like New",
    label: "Kao novo",
    description: "Bez vidljivih tragova nošenja",
    detailedDescription: "Sat je možda bio probiran ili nošen samo nekoliko puta. Ne postoje vidljivi tragovi korišćenja golim okom. Praktično ne razlikuje se od novog.",
    icon: Star,
    level: 5,
    color: "text-green-600"
  },
  {
    value: "Excellent",
    label: "Odlično",
    description: "Minimalni znaci korišćenja",
    detailedDescription: "Sat pokazuje minimalne znake nošenja, vidljive samo pri detaljnom pregledu. Može imati sitne ogrebotine na kućištu ili narukvici koje su jedva primetne.",
    icon: ThumbsUp,
    level: 4,
    color: "text-teal-600"
  },
  {
    value: "Very Good",
    label: "Vrlo dobro",
    description: "Manji znaci nošenja",
    detailedDescription: "Sat je redovno nošen i ima vidljive ali manje znake korišćenja. Moguće su sitne ogrebotine na kućištu, staklu ili narukvici koje su primetne pri normalnom pregledu.",
    icon: Check,
    level: 3,
    color: "text-blue-600"
  },
  {
    value: "Good",
    label: "Dobro",
    description: "Vidljivi znaci nošenja",
    detailedDescription: "Sat ima očigledne znake nošenja i korišćenja. Vidljive ogrebotine i tragovi na kućištu i narukvici. Funkcionalno ispravan, ali kozmetički pokazuje svoje godine.",
    icon: Eye,
    level: 2,
    color: "text-amber-600"
  },
  {
    value: "Fair",
    label: "Zadovoljavajuće",
    description: "Značajni znaci korišćenja",
    detailedDescription: "Sat ima značajne znake korišćenja. Moguće dublje ogrebotine, sitna oštećenja ili znaci popravke. Može zahtevati servis ili kozmetičke popravke.",
    icon: AlertCircle,
    level: 1,
    color: "text-orange-600"
  },
];

const CONDITION_MAP: Record<string, ConditionOption> = CONDITIONS.reduce((acc, c) => {
  acc[c.value] = c;
  return acc;
}, {} as Record<string, ConditionOption>);

interface ConditionGradeDisplayProps {
  condition: string;
  showScale?: boolean;
  showDescription?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export function ConditionGradeDisplay({
  condition,
  showScale = true,
  showDescription = true,
  variant = "default",
  className,
}: ConditionGradeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const conditionData = CONDITION_MAP[condition];

  if (!conditionData) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        {condition}
      </div>
    );
  }

  const Icon = conditionData.icon;
  const percentage = (conditionData.level / 6) * 100;

  if (variant === "compact") {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("inline-flex items-center gap-1.5", className)}>
              <Icon className={cn("h-4 w-4", conditionData.color)} aria-hidden />
              <span className="font-medium">{conditionData.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px]">
            <p className="font-medium">{conditionData.label}</p>
            <p className="text-xs text-muted-foreground">{conditionData.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Header with icon and label */}
        <div className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", conditionData.color, "bg-current/10")}>
            <Icon className={cn("h-4 w-4", conditionData.color)} aria-hidden />
          </div>
          <div>
            <p className="font-semibold">{conditionData.label}</p>
            <p className="text-xs text-muted-foreground">{conditionData.description}</p>
          </div>
        </div>

        {/* Progress bar showing condition level */}
        {showScale && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Zadovoljavajuće</span>
              <span>Novo</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  conditionData.level >= 5 ? "bg-emerald-500" :
                  conditionData.level >= 4 ? "bg-green-500" :
                  conditionData.level >= 3 ? "bg-teal-500" :
                  conditionData.level >= 2 ? "bg-amber-500" :
                  "bg-orange-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Detailed description */}
        {showDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {conditionData.detailedDescription}
          </p>
        )}

        {/* Condition scale reference */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Info className="h-3 w-3" aria-hidden />
          <span>Pogledaj skalu stanja</span>
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")}
            aria-hidden
          />
        </button>

        {isExpanded && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            {CONDITIONS.map((c) => {
              const CIcon = c.icon;
              const isActive = c.value === condition;
              return (
                <div
                  key={c.value}
                  className={cn(
                    "flex items-center gap-2 text-xs rounded px-2 py-1.5",
                    isActive && "bg-primary/10 font-medium"
                  )}
                >
                  <CIcon className={cn("h-3.5 w-3.5 flex-shrink-0", c.color)} aria-hidden />
                  <span className={cn(isActive ? "text-foreground" : "text-muted-foreground")}>
                    {c.label}
                  </span>
                  <span className="text-muted-foreground/70 ml-auto hidden sm:block">
                    {c.description}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", conditionData.color)} aria-hidden />
        <span className="font-semibold">{conditionData.label}</span>
      </div>

      {showScale && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                conditionData.level >= 5 ? "bg-emerald-500" :
                conditionData.level >= 4 ? "bg-green-500" :
                conditionData.level >= 3 ? "bg-teal-500" :
                conditionData.level >= 2 ? "bg-amber-500" :
                "bg-orange-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{conditionData.description}</p>
        </div>
      )}
    </div>
  );
}

// Export condition labels for use in other components
export const CONDITION_LABELS: Record<string, string> = CONDITIONS.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {} as Record<string, string>);
