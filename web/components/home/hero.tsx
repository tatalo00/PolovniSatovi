"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Watch, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

type FeaturedListing = {
  id: string;
  brand: string;
  model: string;
  title: string;
  priceEurCents: number;
  condition: string;
  photoUrl?: string | null;
};

export interface HeroProps {
  featuredListings: FeaturedListing[];
  totalListings: number;
  totalSellers: number;
  userLocation?: string | null;
}

const TRUST_INDICATORS = [
  {
    icon: <Watch className="h-4 w-4" aria-hidden />,
    label: "Jednostavna kupovina",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
    label: "Verifikovani prodavci",
  },
  {
    icon: <Zap className="h-4 w-4" aria-hidden />,
    label: "Autentifikacija korisnika",
  },
] as const;

const FALLBACK_HERO_IMAGE = "/images/hero-pocket-watch.jpg";

export function Hero({ featuredListings }: HeroProps) {
  const heroImage =
    featuredListings.find((listing) => listing.photoUrl)?.photoUrl ?? FALLBACK_HERO_IMAGE;

  return (
    <section className="relative isolate min-h-[600px] w-full overflow-hidden bg-neutral-950 text-white">
      <Image
        src={heroImage}
        alt="Vintage watch collection"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-6xl items-center justify-center px-4 py-12 text-center md:px-6">
        <div className="w-full max-w-4xl rounded-[32px] bg-black/55 px-10 py-14 shadow-2xl ring-1 ring-white/10 backdrop-blur-[18px] md:px-16 md:py-16">
          <div className="space-y-6 md:space-y-8">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70 md:text-sm">
              Kurirana selekcija luksuznih satova
            </p>
            <h1 className="text-4xl font-semibold tracking-[0.05em] md:text-5xl lg:text-6xl">
              Pronađite sledeći sat u svojoj kolekciji
            </h1>
            <p className="mx-auto max-w-2xl text-base text-white/75 md:text-lg">
              Ekskluzivni izbor verificiranih polovnih i vintage satova iz celog regiona. Povežite se
              sa stručnim prodavcima i kupujte bez kompromisa po pitanju autentičnosti.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#D4AF37] px-10 py-6 text-base font-semibold text-neutral-900 transition hover:bg-[#b6932c]"
            >
              <Link href="/listings" className="inline-flex items-center gap-2">
                Istraži satove
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-4 text-xs font-medium uppercase tracking-[0.3em] text-white/70 md:gap-6 md:text-sm">
            {TRUST_INDICATORS.map((indicator) => (
              <div
                key={indicator.label}
                className="flex min-w-[200px] flex-1 items-center justify-center gap-3 rounded-full bg-white/5 px-6 py-3 text-center backdrop-blur-xl sm:max-w-xs"
              >
                <span className="text-white">{indicator.icon}</span>
                <span>{indicator.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
