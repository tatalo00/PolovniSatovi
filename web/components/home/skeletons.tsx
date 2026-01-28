import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="relative min-h-[450px] sm:min-h-[500px] md:min-h-[600px] w-full overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
      <div className="relative z-10 mx-auto flex min-h-[450px] sm:min-h-[500px] md:min-h-[600px] w-full items-center justify-center px-3 sm:px-4 py-6 sm:py-8 md:py-12 text-center md:px-6">
        <div className="w-full max-w-4xl rounded-xl sm:rounded-2xl md:rounded-[32px] bg-black/55 px-3 py-8 sm:px-4 sm:py-10 md:px-6 md:py-14 shadow-2xl ring-1 ring-white/10 backdrop-blur-[18px] md:px-8 md:py-16 lg:px-16">
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            <Skeleton className="mx-auto h-4 w-64 bg-white/10" />
            <Skeleton className="mx-auto h-10 w-full max-w-xl bg-white/10 sm:h-12 md:h-14" />
            <Skeleton className="mx-auto h-16 w-full max-w-2xl bg-white/10" />
          </div>
          <div className="mt-5 sm:mt-6 md:mt-8 flex justify-center">
            <Skeleton className="h-12 w-40 rounded-full bg-white/10 sm:h-14 sm:w-48" />
          </div>
          <div className="mt-6 sm:mt-8 md:mt-10 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-full bg-white/10 sm:h-12 sm:w-40" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuickFilterBarSkeleton() {
  return (
    <section className="mt-8 sm:mt-12 px-3 sm:px-4 md:mt-16">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-white/85 p-4 sm:p-6 shadow-xl backdrop-blur-md md:p-8">
          <div className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-5 lg:gap-8 lg:items-end">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-1.5 sm:gap-2 md:gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-xl sm:h-12" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3">
              <div className="h-[1.5rem] hidden sm:block" />
              <Skeleton className="h-11 w-full rounded-full sm:h-12" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PaidListingsSkeleton() {
  return (
    <section className="bg-background py-12 sm:py-16 md:py-20">
      <div className="container mx-auto space-y-8 sm:space-y-10 md:space-y-12 px-3 sm:px-4 md:px-6">
        <div className="space-y-2 sm:space-y-3 text-center">
          <Skeleton className="mx-auto h-4 w-40" />
          <Skeleton className="mx-auto h-8 w-full max-w-lg sm:h-10" />
          <Skeleton className="mx-auto h-12 w-full max-w-2xl" />
        </div>
        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-card/80"
            >
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-3 sm:space-y-4 px-4 sm:px-5 md:px-6 pb-5 sm:pb-6 md:pb-8 pt-4 sm:pt-5 md:pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecentListingsSkeleton() {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <Skeleton className="h-9 w-64 md:h-10" />
            <Skeleton className="h-5 w-full max-w-md" />
          </div>
          <Skeleton className="h-10 w-full sm:w-36" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] sm:w-[300px] overflow-hidden rounded-xl border border-border/60 bg-background/80"
            >
              <Skeleton className="h-48 w-full" />
              <div className="space-y-3 p-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
