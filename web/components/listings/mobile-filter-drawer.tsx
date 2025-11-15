"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { ListingFilters } from "./listing-filters";
import { Badge } from "@/components/ui/badge";

interface MobileFilterDrawerProps {
  popularBrands: string[];
  searchParams: Record<string, string | undefined>;
}

function countActiveFilters(searchParams: Record<string, string | undefined>): number {
  let count = 0;
  
  if (searchParams.brand) count += searchParams.brand.split(",").filter(Boolean).length;
  if (searchParams.model) count++;
  if (searchParams.reference) count++;
  if (searchParams.min || searchParams.max) count++;
  if (searchParams.year) count++;
  if (searchParams.yearFrom || searchParams.yearTo) count++;
  if (searchParams.cond) count += searchParams.cond.split(",").filter(Boolean).length;
  if (searchParams.movement) count += searchParams.movement.split(",").filter(Boolean).length;
  if (searchParams.loc) count++;
  if (searchParams.gender) count += searchParams.gender.split(",").filter(Boolean).length;
  if (searchParams.box) count += searchParams.box.split(",").filter(Boolean).length;
  if (searchParams.verified === "1") count++;
  if (searchParams.authenticated === "1") count++;
  
  return count;
}

export function MobileFilterDrawer({ popularBrands, searchParams }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const urlSearchParams = useSearchParams();
  const activeFilterCount = useMemo(() => countActiveFilters(searchParams), [searchParams]);
  const prevParamsRef = useRef<string>("");

  // Close drawer when search params change (filters applied)
  useEffect(() => {
    const currentParams = urlSearchParams.toString();
    if (open && prevParamsRef.current && currentParams !== prevParamsRef.current) {
      // Small delay to allow navigation to complete
      const timer = setTimeout(() => {
        setOpen(false);
      }, 150);
      return () => clearTimeout(timer);
    }
    prevParamsRef.current = currentParams;
  }, [open, urlSearchParams]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg xl:hidden safe-area-inset-bottom"
          style={{ position: 'fixed', bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))', right: '1rem' }}
          aria-label="Otvori napredne filtere"
        >
          <Filter className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount > 9 ? "9+" : activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[90vh] max-h-[90vh] w-full rounded-t-2xl border-t p-0 xl:hidden"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">Filtrirajte oglase</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-10 w-10 min-h-[44px] min-w-[44px]"
                aria-label="Zatvori"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {activeFilterCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {activeFilterCount} {activeFilterCount === 1 ? "aktivan filter" : "aktivna filtera"}
              </p>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ListingFilters popularBrands={popularBrands} searchParams={searchParams} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

