import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Star, Award, Crown } from "lucide-react";

export type SellerTier = "novi" | "aktivan" | "pouzdani" | "top";

export interface SellerTierConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  heroClassName: string;
}

export function computeSellerTier(stats: {
  totalSold: number;
  ratingAvg: number | null;
  avgResponseTimeMinutes?: number | null;
}): SellerTier {
  const { totalSold, ratingAvg, avgResponseTimeMinutes } = stats;
  const rating = ratingAvg ?? 0;

  if (
    totalSold >= 50 &&
    rating >= 4.8 &&
    avgResponseTimeMinutes != null &&
    avgResponseTimeMinutes <= 120
  ) {
    return "top";
  }
  if (totalSold >= 20 && rating >= 4.5) {
    return "pouzdani";
  }
  if (totalSold >= 5) {
    return "aktivan";
  }
  return "novi";
}

export const SELLER_TIER_CONFIG: Record<SellerTier, SellerTierConfig> = {
  novi: {
    label: "Novi prodavac",
    icon: ShieldCheck,
    className: "bg-muted text-muted-foreground",
    heroClassName: "bg-white/10 text-white/80",
  },
  aktivan: {
    label: "Aktivan prodavac",
    icon: Star,
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    heroClassName: "bg-blue-500/20 text-blue-200",
  },
  pouzdani: {
    label: "Pouzdani prodavac",
    icon: Award,
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    heroClassName: "bg-amber-500/20 text-amber-200",
  },
  top: {
    label: "Top prodavac",
    icon: Crown,
    className:
      "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0",
    heroClassName:
      "bg-gradient-to-r from-amber-400/30 to-amber-500/30 text-amber-100",
  },
};
