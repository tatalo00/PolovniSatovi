"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, string>;
  createdAt: string;
}

function buildSearchUrl(filters: Record<string, string>): string {
  const params = new URLSearchParams(filters);
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("sr-Latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SavedSearchesPreview({ userId }: { userId: string }) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/saved-searches")
      .then((res) => res.json())
      .then((data) => {
        if (active && data.data) setSearches(data.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
        toast.success("Pretraga obrisana");
      } else {
        toast.error("Greška pri brisanju");
      }
    } catch {
      toast.error("Greška pri brisanju");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-100"
          />
        ))}
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Search className="mb-3 h-8 w-8 text-neutral-400" />
          <p className="text-sm text-neutral-500">
            Nemate sačuvanih pretraga.
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Pretražite oglase i sačuvajte filtere za brz pristup.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/listings">Pretraži oglase</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {searches.slice(0, 6).map((search) => (
        <Card
          key={search.id}
          className="group relative overflow-hidden transition-shadow hover:shadow-md"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={buildSearchUrl(search.filters)}
                className="flex-1 space-y-1.5"
              >
                <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {search.name}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(search.filters)
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500"
                      >
                        {value}
                      </span>
                    ))}
                  {Object.keys(search.filters).length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                      +{Object.keys(search.filters).length - 3}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400">
                  {formatDate(search.createdAt)}
                </p>
              </Link>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-neutral-400 hover:text-[#D4AF37]"
                  asChild
                >
                  <Link href={buildSearchUrl(search.filters)}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500"
                  onClick={() => handleDelete(search.id)}
                  disabled={deleting === search.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
