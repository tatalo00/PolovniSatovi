"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearchDialog } from "./global-search-dialog";

export function GlobalSearchTrigger() {
  const [open, setOpen] = useState(false);

  // Global "/" keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Open search on "/" key (without modifiers)
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop: Button with text and keyboard hint */}
      <Button
        variant="outline"
        size="sm"
        className="hidden md:inline-flex items-center gap-2 text-muted-foreground hover:text-foreground h-9 px-3"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Pretraži</span>
        <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          /
        </kbd>
      </Button>

      {/* Mobile: Icon-only button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-label="Pretraži"
      >
        <Search className="h-5 w-5" />
      </Button>

      <GlobalSearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
