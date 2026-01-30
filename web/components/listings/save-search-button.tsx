"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SaveSearchButtonProps {
  searchParams: Record<string, string | undefined>;
}

function buildSearchName(params: Record<string, string | undefined>): string {
  const parts: string[] = [];
  if (params.brand) parts.push(params.brand);
  if (params.cond || params.condition)
    parts.push(params.cond ?? params.condition ?? "");
  if (params.min && params.max) parts.push(`€${params.min}–€${params.max}`);
  else if (params.min) parts.push(`od €${params.min}`);
  else if (params.max) parts.push(`do €${params.max}`);
  if (params.movement) parts.push(params.movement);
  return parts.length > 0 ? parts.join(", ") : "Moja pretraga";
}

function getActiveFilters(
  params: Record<string, string | undefined>
): Record<string, string> {
  const filters: Record<string, string> = {};
  const skipKeys = new Set(["sort", "page"]);
  for (const [key, value] of Object.entries(params)) {
    if (value && !skipKeys.has(key)) {
      filters[key] = value;
    }
  }
  return filters;
}

export function SaveSearchButton({ searchParams }: SaveSearchButtonProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const filters = getActiveFilters(searchParams);
  const hasFilters = Object.keys(filters).length > 0;

  if (!hasFilters) return null;

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(buildSearchName(searchParams));
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Unesite ime pretrage");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), filters }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Greška pri čuvanju pretrage");
        return;
      }

      toast.success("Pretraga sačuvana");
      setOpen(false);
    } catch {
      toast.error("Greška pri čuvanju pretrage");
    } finally {
      setSaving(false);
    }
  };

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => toast.info("Prijavite se da biste sačuvali pretragu")}
      >
        <Bookmark className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sačuvaj</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Bookmark className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sačuvaj pretragu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sačuvaj pretragu</DialogTitle>
          <DialogDescription>
            Sačuvajte trenutne filtere za brz pristup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="search-name">Ime pretrage</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="npr. Rolex do 500 EUR"
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] text-neutral-600"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Otkaži
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Čuvanje..." : "Sačuvaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
