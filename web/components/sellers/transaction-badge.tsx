import { Badge } from "@/components/ui/badge";
import { Award, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionBadgeProps {
  soldCount: number;
  className?: string;
  variant?: "default" | "hero";
}

const TIERS = [
  {
    min: 100,
    label: "100+ prodato",
    icon: Trophy,
    className: "bg-amber-500 text-white border-0",
    heroClassName: "bg-amber-500/20 text-amber-200",
  },
  {
    min: 50,
    label: "50+ prodato",
    icon: Medal,
    className: "bg-amber-400 text-amber-950 border-0",
    heroClassName: "bg-amber-400/20 text-amber-200",
  },
  {
    min: 10,
    label: "10+ prodato",
    icon: Award,
    className: "bg-amber-200 text-amber-900 border-0",
    heroClassName: "bg-amber-300/20 text-amber-200",
  },
] as const;

export function TransactionBadge({
  soldCount,
  className,
  variant = "default",
}: TransactionBadgeProps) {
  const tier = TIERS.find((t) => soldCount >= t.min);
  if (!tier) return null;

  const Icon = tier.icon;
  const colorClass =
    variant === "hero" ? tier.heroClassName : tier.className;

  return (
    <Badge className={cn(colorClass, className)}>
      <Icon className="h-3 w-3 mr-1" aria-hidden />
      {tier.label}
    </Badge>
  );
}
