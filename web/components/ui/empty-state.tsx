"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, Inbox, MessageSquare, Star, ListChecks } from "lucide-react";
import Link from "next/link";

const iconMap = {
  listings: Package,
  messages: MessageSquare,
  reviews: Star,
  general: Inbox,
  tasks: ListChecks,
};

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
  iconType?: keyof typeof iconMap;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  iconType,
}: EmptyStateProps) {
  const IconComponent = iconType ? iconMap[iconType] : null;
  const displayIcon = icon || (IconComponent ? <IconComponent className="h-12 w-12 text-muted-foreground" /> : null);

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {displayIcon && (
          <div className="mb-4 rounded-full bg-muted p-4">
            {displayIcon}
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action && (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

