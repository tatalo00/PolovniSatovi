import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type SellerTier,
  SELLER_TIER_CONFIG,
} from "@/lib/seller-tier";

interface SellerTierBadgeProps {
  tier: SellerTier;
  className?: string;
  variant?: "default" | "hero";
  showLabel?: boolean;
}

export function SellerTierBadge({
  tier,
  className,
  variant = "default",
  showLabel = true,
}: SellerTierBadgeProps) {
  const config = SELLER_TIER_CONFIG[tier];
  const Icon = config.icon;
  const colorClass =
    variant === "hero" ? config.heroClassName : config.className;

  return (
    <Badge className={cn(colorClass, className)}>
      <Icon className="h-3.5 w-3.5 mr-1" aria-hidden />
      {showLabel && config.label}
    </Badge>
  );
}
