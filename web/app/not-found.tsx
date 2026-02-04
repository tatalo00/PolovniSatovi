"use client";

import Link from "next/link";
import { Watch, Home, Search, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-[#FAFAFA] to-background px-4">
      <div className="w-full max-w-lg text-center">
        {/* Watch Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 via-amber-50/40 to-[#D4AF37]/10 ring-2 ring-[#D4AF37]/20">
              <Watch className="h-16 w-16 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-1 ring-border">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Error Text */}
        <h1 className="mb-2 text-6xl font-bold tracking-tight text-foreground">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Stranica nije pronađena
        </h2>
        <p className="mb-8 text-muted-foreground">
          Stranica koju tražite ne postoji, premeštena je ili je uklonjena.
          Proverite URL adresu ili se vratite na početnu stranicu.
        </p>

        {/* Navigation Buttons */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Početna stranica
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/listings">
              <Search className="h-4 w-4" />
              Pretraži oglase
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Popularne stranice
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              href="/listings?brand=Rolex"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground transition-colors hover:bg-muted"
            >
              <Watch className="h-4 w-4 text-[#D4AF37]" />
              Rolex satovi
            </Link>
            <Link
              href="/listings?brand=Omega"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground transition-colors hover:bg-muted"
            >
              <Watch className="h-4 w-4 text-[#D4AF37]" />
              Omega satovi
            </Link>
            <Link
              href="/sell"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              Prodaj sat
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              Česta pitanja
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <button
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Vratite se na prethodnu stranicu
          </button>
        </div>
      </div>
    </div>
  );
}
