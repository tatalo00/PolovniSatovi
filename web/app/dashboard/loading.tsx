import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-6 w-64" />
          </div>

          {/* Tabs Skeleton */}
          <Skeleton className="h-12 w-full max-w-xl" />

          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2 border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
