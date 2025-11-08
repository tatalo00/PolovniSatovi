import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "O nama" },
  { href: "/contact", label: "Kontakt" },
  { href: "/terms", label: "Uslovi korišćenja" },
  { href: "/privacy", label: "Politika privatnosti" },
  { href: "/faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-10 md:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              PolovniSatovi
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Sigurno mesto za ljubitelje satova. Kupujte i prodajte proverene
              modele uz pouzdanu verifikaciju prodavaca i transparentne informacije.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Informacije
              </h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.map((link) => (
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
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Sigurnost
              </h4>
              <p className="text-sm text-muted-foreground">
                Svi oglasi prolaze kroz ručnu proveru pre objave. Prodavci ostvaruju
                reputaciju kroz ocene i preporuke kupaca.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t pt-4 text-xs text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} PolovniSatovi. Sva prava zadržana.</span>
          <span>Napravljeno sa ❤️ za ljubitelje satova.</span>  
        </div>
      </div>
    </footer>
  );
}


