import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatisticsSkeleton() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center space-y-2">
                <Skeleton className="h-10 w-20 mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

