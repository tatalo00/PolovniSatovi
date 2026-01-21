import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:grid lg:grid-cols-3 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={cn(
            "flex flex-row lg:flex-col items-stretch overflow-hidden",
            "rounded-xl border border-neutral-200/80 bg-white",
            "h-[160px] sm:h-[180px] md:h-[200px] lg:h-full",
            // Override Card's default padding and gap
            "p-0 gap-0"
          )}
        >
          {/* Image skeleton - rounded corners matching card */}
          <div
            className={cn(
              "relative bg-neutral-100",
              "w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0",
              "lg:w-full lg:aspect-square",
              // Mobile: round left corners
              "rounded-l-xl lg:rounded-l-none",
              // Desktop: round top corners
              "lg:rounded-t-xl"
            )}
          >
            <Skeleton className="h-full w-full rounded-[inherit]" />
          </div>

          {/* Content skeleton - matches new hierarchy */}
          <CardContent className="flex flex-col flex-1 min-w-0 p-3 sm:p-4 lg:p-5 gap-1 sm:gap-1.5">
            {/* Brand + Model */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* Reference */}
            <Skeleton className="h-3 w-1/3" />

            {/* Condition + Year chips */}
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>

            {/* Price + Location */}
            <div className="mt-auto flex justify-between items-end pt-1">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
