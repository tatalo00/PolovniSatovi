"use client";

import { useRouter } from "next/navigation";
import { ListingGrid } from "./listing-grid";

interface ListingContentProps {
  listings: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function ListingContent({
  listings,
  total,
  currentPage,
  totalPages,
  searchParams,
}: ListingContentProps) {
  const router = useRouter();

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams as any);
    params.set("sort", sort);
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams as any);
    params.set("page", page.toString());
    return `/listings?${params.toString()}`;
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Pronađeno {total} oglasa</p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm">
            Sortiraj:
          </label>
          <select
            id="sort"
            defaultValue={searchParams.sort || "newest"}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="newest">Najnoviji</option>
            <option value="oldest">Najstariji</option>
            <option value="price-asc">Cena: najniža</option>
            <option value="price-desc">Cena: najviša</option>
          </select>
        </div>
      </div>

      <ListingGrid listings={listings} />

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={buildPageUrl(currentPage - 1)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Prethodna
            </a>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
            )
            .map((p, idx, arr) => (
              <div key={p} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2">...</span>}
                <a
                  href={buildPageUrl(p)}
                  className={`rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent ${
                    p === currentPage ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {p}
                </a>
              </div>
            ))}
          {currentPage < totalPages && (
            <a
              href={buildPageUrl(currentPage + 1)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Sledeća
            </a>
          )}
        </div>
      )}
    </>
  );
}

