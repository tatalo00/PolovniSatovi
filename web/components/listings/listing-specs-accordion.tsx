"use client";

import { useState } from "react";
import {
  Tag,
  Circle,
  Settings2,
  Palette,
  Watch,
  FileCheck,
  ChevronDown,
  Box,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ConditionGradeDisplay } from "./condition-grade-display";

interface ListingData {
  brand: string;
  model: string;
  reference?: string | null;
  year?: number | null;
  caseDiameterMm?: number | null;
  caseThicknessMm?: number | null;
  caseMaterial?: string | null;
  waterResistanceM?: number | null;
  movement?: string | null;
  movementType?: string | null;
  caliber?: string | null;
  dialColor?: string | null;
  dateDisplay?: string | null;
  bezelType?: string | null;
  bezelMaterial?: string | null;
  strapType?: string | null;
  braceletMaterial?: string | null;
  strapWidthMm?: number | null;
  condition: string;
  boxPapers?: string | null;
  warranty?: string | null;
  warrantyCard?: boolean | null;
  originalOwner?: boolean | null;
  runningCondition?: string | null;
  location?: string | null;
}

interface SpecSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  specs: { label: string; value: string | null | undefined }[];
  defaultExpanded?: boolean;
}

interface ListingSpecsAccordionProps {
  listing: ListingData;
  location?: string | null;
  className?: string;
}

const DIAL_COLOR_LABELS: Record<string, string> = {
  Black: "Crna",
  White: "Bela",
  Blue: "Plava",
  Silver: "Srebrna",
  Champagne: "Šampanj",
  Green: "Zelena",
  Brown: "Braon",
  Gray: "Siva",
  Other: "Ostalo",
};

const DATE_DISPLAY_LABELS: Record<string, string> = {
  "No Date": "Bez datuma",
  Date: "Datum",
  "Day-Date": "Dan-datum",
  GMT: "GMT",
  Other: "Ostalo",
};

const BEZEL_TYPE_LABELS: Record<string, string> = {
  Fixed: "Fiksni",
  Rotating: "Rotirajući",
  GMT: "GMT",
  Tachymeter: "Tahimetar",
  Countdown: "Odbrojavanje",
  Other: "Ostalo",
};

const STRAP_TYPE_LABELS: Record<string, string> = {
  "Metal Bracelet": "Metalna narukvica",
  Leather: "Koža",
  Rubber: "Guma",
  NATO: "NATO",
  Fabric: "Platno",
  Other: "Ostalo",
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  Automatic: "Automatik",
  Manual: "Ručni navijač",
  Quartz: "Kvarcni",
  "Spring Drive": "Spring Drive",
  Tourbillon: "Tourbillon",
  Other: "Ostalo",
};

const WARRANTY_LABELS: Record<string, string> = {
  "Active Warranty": "Aktivna garancija",
  "Expired Warranty": "Istekla garancija",
  "No Warranty": "Bez garancije",
};

const RUNNING_CONDITION_LABELS: Record<string, string> = {
  "Running Perfectly": "Radi savršeno",
  "Minor Issues": "Manji problemi",
  "Needs Service": "Potreban servis",
  "Not Running": "Ne radi",
};

const BOX_PAPERS_VARIANTS: Record<string, { label: string; tone: "success" | "warn" | "neutral" }> = {
  "Full Set": { label: "Komplet (box + papiri)", tone: "success" },
  "Papers Only": { label: "Samo papiri", tone: "neutral" },
  "Box Only": { label: "Samo box", tone: "neutral" },
  "No Box or Papers": { label: "Bez boxa i papira", tone: "warn" },
};

function resolveBadgeTone(tone: "success" | "warn" | "neutral") {
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

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium", !value && "text-muted-foreground")}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function CollapsibleSpecSection({
  section,
  isExpanded,
  onToggle,
}: {
  section: SpecSection;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = section.icon;
  const hasValues = section.specs.some((spec) => spec.value);

  if (!hasValues) return null;

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
          "hover:bg-accent/50"
        )}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium">{section.title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {isExpanded && (
        <div className="px-4 pb-3">
          {section.specs.map((spec) => (
            <SpecRow key={spec.label} label={spec.label} value={spec.value} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingSpecsAccordion({ listing, location, className }: ListingSpecsAccordionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["identification"]));

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sections: SpecSection[] = [
    {
      id: "identification",
      title: "Identifikacija",
      icon: Tag,
      defaultExpanded: true,
      specs: [
        { label: "Marka", value: listing.brand },
        { label: "Model", value: listing.model },
        { label: "Referenca", value: listing.reference },
        { label: "Godina proizvodnje", value: listing.year?.toString() },
      ],
    },
    {
      id: "case",
      title: "Kućište",
      icon: Circle,
      specs: [
        { label: "Prečnik", value: listing.caseDiameterMm ? `${listing.caseDiameterMm} mm` : null },
        { label: "Debljina", value: listing.caseThicknessMm ? `${listing.caseThicknessMm} mm` : null },
        { label: "Materijal", value: listing.caseMaterial },
        { label: "Vodootpornost", value: listing.waterResistanceM ? `${listing.waterResistanceM} m` : null },
      ],
    },
    {
      id: "movement",
      title: "Mehanizam",
      icon: Settings2,
      specs: [
        { label: "Tip", value: listing.movementType ? MOVEMENT_TYPE_LABELS[listing.movementType] || listing.movementType : null },
        { label: "Kalibar", value: listing.caliber },
        { label: "Mehanizam", value: listing.movement },
        { label: "Stanje rada", value: listing.runningCondition ? RUNNING_CONDITION_LABELS[listing.runningCondition] || listing.runningCondition : null },
      ],
    },
    {
      id: "dial",
      title: "Brojčanik i Bezel",
      icon: Palette,
      specs: [
        { label: "Boja brojčanika", value: listing.dialColor ? DIAL_COLOR_LABELS[listing.dialColor] || listing.dialColor : null },
        { label: "Prikaz datuma", value: listing.dateDisplay ? DATE_DISPLAY_LABELS[listing.dateDisplay] || listing.dateDisplay : null },
        { label: "Tip bezela", value: listing.bezelType ? BEZEL_TYPE_LABELS[listing.bezelType] || listing.bezelType : null },
        { label: "Materijal bezela", value: listing.bezelMaterial },
      ],
    },
    {
      id: "strap",
      title: "Narukvica / Kaiš",
      icon: Watch,
      specs: [
        { label: "Tip", value: listing.strapType ? STRAP_TYPE_LABELS[listing.strapType] || listing.strapType : null },
        { label: "Materijal", value: listing.braceletMaterial },
        { label: "Širina", value: listing.strapWidthMm ? `${listing.strapWidthMm} mm` : null },
      ],
    },
  ];

  const resolvedBoxPapers =
    listing.boxPapers && BOX_PAPERS_VARIANTS[listing.boxPapers]
      ? BOX_PAPERS_VARIANTS[listing.boxPapers]
      : listing.boxPapers
      ? { label: listing.boxPapers, tone: "neutral" as const }
      : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main specs accordion */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {sections.map((section) => (
          <CollapsibleSpecSection
            key={section.id}
            section={section}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>

      {/* Condition and Documentation Section */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium">Stanje i dokumentacija</span>
        </div>

        {/* Condition Display */}
        <ConditionGradeDisplay condition={listing.condition} variant="default" />

        {/* Box & Papers */}
        {resolvedBoxPapers && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm text-muted-foreground">Box & papiri</span>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "whitespace-nowrap px-2.5 py-0.5 text-xs font-medium",
                resolveBadgeTone(resolvedBoxPapers.tone)
              )}
            >
              {resolvedBoxPapers.label}
            </Badge>
          </div>
        )}

        {/* Warranty */}
        {listing.warranty && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm text-muted-foreground">Garancija</span>
            </div>
            <span className="text-sm font-medium">
              {WARRANTY_LABELS[listing.warranty] || listing.warranty}
            </span>
          </div>
        )}

        {/* Original Owner */}
        {listing.originalOwner !== null && listing.originalOwner !== undefined && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Originalni vlasnik</span>
            <span className="text-sm font-medium">{listing.originalOwner ? "Da" : "Ne"}</span>
          </div>
        )}

        {/* Warranty Card */}
        {listing.warrantyCard !== null && listing.warrantyCard !== undefined && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Garantni list</span>
            <span className="text-sm font-medium">{listing.warrantyCard ? "Da" : "Ne"}</span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Lokacija</span>
            <span className="text-sm font-medium">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
