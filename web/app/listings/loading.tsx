export default function ListingsLoading() {
  return (
    <main className="container mx-auto px-4 py-6 md:py-8 lg:pb-8">
      <div className="mb-6 md:mb-8">
        <div className="h-10 bg-neutral-100 rounded-lg w-1/4 animate-pulse mb-4" />
        <div className="h-4 bg-neutral-100 rounded-lg w-1/2 animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 bg-neutral-100 rounded-lg w-24 animate-pulse"
          />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-4"
          >
            <div className="aspect-square bg-neutral-100 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-neutral-100 rounded-lg animate-pulse" />
              <div className="h-4 bg-neutral-100 rounded-lg w-2/3 animate-pulse" />
              <div className="h-8 bg-neutral-100 rounded-lg w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

