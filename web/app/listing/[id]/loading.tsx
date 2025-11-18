export default function ListingLoading() {
  return (
    <main className="container mx-auto px-4 py-6 md:py-8 lg:pb-8">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8 lg:items-start lg:content-start">
        {/* Image Gallery Skeleton */}
        <div className="lg:col-span-7">
          <div className="aspect-square w-full bg-neutral-100 rounded-2xl animate-pulse" />
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-20 h-20 bg-neutral-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 bg-neutral-100 rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded-lg w-1/2 animate-pulse" />
          </div>

          {/* Price */}
          <div className="h-12 bg-neutral-100 rounded-lg w-1/3 animate-pulse" />

          {/* Details */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-neutral-100 rounded-lg animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded-lg animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded-lg w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}

