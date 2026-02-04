"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchHistory } from "@/lib/hooks/use-search-history";

export function BackToResults() {
  const { getBackToResults } = useSearchHistory();
  const backLink = getBackToResults();

  if (!backLink) {
    return null;
  }

  return (
    <Link
      href={backLink.href}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Nazad na {backLink.label.toLowerCase()}</span>
    </Link>
  );
}
