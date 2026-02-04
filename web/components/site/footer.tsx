import Link from "next/link";
import { Watch } from "lucide-react";

const popularBrands = [
  { href: "/listings?brand=Rolex", label: "Rolex" },
  { href: "/listings?brand=Omega", label: "Omega" },
  { href: "/listings?brand=Tag%20Heuer", label: "TAG Heuer" },
  { href: "/listings?brand=Breitling", label: "Breitling" },
  { href: "/listings?brand=Seiko", label: "Seiko" },
  { href: "/listings?brand=Tissot", label: "Tissot" },
];

const browseLinks = [
  { href: "/listings", label: "Svi oglasi" },
  { href: "/listings?condition=New", label: "Novi satovi" },
  { href: "/listings?condition=Like+New", label: "Kao novo" },
  { href: "/sell", label: "Prodaj sat" },
];

const accountLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/listings", label: "Moji oglasi" },
  { href: "/dashboard/messages", label: "Poruke" },
  { href: "/dashboard/wishlist", label: "Lista želja" },
];

const infoLinks = [
  { href: "/about", label: "O nama" },
  { href: "/contact", label: "Kontakt" },
  { href: "/faq", label: "Česta pitanja" },
  { href: "/blog", label: "Blog" },
];

const legalLinks = [
  { href: "/terms", label: "Uslovi korišćenja" },
  { href: "/privacy", label: "Politika privatnosti" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mobile-bottom-nav-padding">
      <div className="container mx-auto px-4 py-10 md:py-12">
        {/* Main Footer Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-amber-50/40 ring-1 ring-[#D4AF37]/20">
                <Watch className="h-4 w-4 text-[#D4AF37]" />
              </div>
              PolovniSatovi
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Sigurno mesto za ljubitelje satova. Kupujte i prodajte proverene
              modele uz pouzdanu verifikaciju prodavaca.
            </p>
          </div>

          {/* Popular Brands */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Popularni brendovi
            </h4>
            <ul className="space-y-2 text-sm">
              {popularBrands.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Browse */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Pretraži
            </h4>
            <ul className="space-y-2 text-sm">
              {browseLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Moj nalog
            </h4>
            <ul className="space-y-2 text-sm">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Informacije
            </h4>
            <ul className="space-y-2 text-sm">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 border-t pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} PolovniSatovi</span>
              {legalLinks.map((link, index) => (
                <span key={link.href} className="flex items-center gap-4">
                  {index === 0 && <span className="hidden sm:inline">•</span>}
                  <Link
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && <span className="hidden sm:inline">•</span>}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Svi oglasi prolaze ručnu proveru pre objave.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
