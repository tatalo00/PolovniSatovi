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
    <section className="relative isolate min-h-[450px] sm:min-h-[500px] md:min-h-[600px] w-full overflow-hidden bg-neutral-950 text-white">
      <Image
        src={heroImage}
        alt="Vintage watch collection"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[450px] sm:min-h-[500px] md:min-h-[600px] w-full items-center justify-center px-3 sm:px-4 py-6 sm:py-8 md:py-12 text-center md:px-6">
        <div className="w-full max-w-4xl rounded-xl sm:rounded-2xl md:rounded-[32px] bg-black/55 px-3 py-8 sm:px-4 sm:py-10 md:px-6 md:py-14 shadow-2xl ring-1 ring-white/10 backdrop-blur-[18px] md:px-8 md:py-16 lg:px-16">
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            <p className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.4em] text-white/70">
              Jedinstvena platforma za prodaju polovnih satova u regionu
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-[0.02em] sm:tracking-[0.05em] leading-tight sm:leading-normal">
              Pronađite sledeći sat u svojoj kolekciji
            </h1>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg text-white/75 leading-relaxed px-2 sm:px-0">
              Veliki izbor polovnih i vintage satova iz celog regiona. Povežite se
              sa verifikovanim prodavcima i kupujte od autentifikovanih korisnika.
            </p>
          </div>

          <div className="mt-5 sm:mt-6 md:mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#D4AF37] px-6 sm:px-8 py-4 sm:py-5 md:px-10 md:py-6 text-sm sm:text-base md:text-base font-semibold text-neutral-900 transition hover:bg-[#b6932c] min-h-[44px] w-full sm:w-auto"
            >
              <Link 
                href="/listings"
                className="inline-flex items-center justify-center gap-2"
              >
                Istraži satove
                <ArrowRight className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="mt-6 sm:mt-8 md:mt-10 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-wrap">
            {TRUST_INDICATORS.map((indicator) => (
              <div
                key={indicator.label}
                className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 rounded-full bg-white/5 px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium uppercase tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.2em] text-white/70 text-center backdrop-blur-xl flex-1 sm:flex-initial sm:min-w-0"
              >
                <span className="text-white flex-shrink-0">{indicator.icon}</span>
                <span className="text-center leading-tight break-words hyphens-auto">{indicator.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
