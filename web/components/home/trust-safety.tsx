import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

interface TrustPoint {
  title: string;
  description: string;
  details: string;
  href: string;
  icon: React.ReactNode;
}

const TRUST_POINTS: TrustPoint[] = [
  {
    title: "Zaštita kupca",
    description: "Bezbedna kupovina sa proverom autentičnosti i mogućnošću prigovora.",
    details: "Escrow plaćanje, 48h period za pregled i posredovanje u slučaju nesuglasica.",
    href: "/faq#buyer-protection",
    icon: <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />,
  },
  {
    title: "Sigurne transakcije",
    description: "Šifrovana komunikacija i verifikovani prodavci uz jasne procedure.",
    details: "SSL enkripcija, verifikacija identiteta i tim za rešavanje sporova.",
    href: "/faq#secure-transactions",
    icon: <Lock className="h-6 w-6 text-primary" aria-hidden />,
  },
  {
    title: "Garancija kvaliteta",
    description: "Svi oglasi prolaze filtriranje i upoređuju se sa bazama ukradenih satova.",
    details: "Vodiči za autentifikaciju, politike povraćaja i provera porekla.",
    href: "/faq#quality-guarantee",
    icon: <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden />,
  },
];

export function TrustSafetyHighlights() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Bezbednost i poverenje na prvom mestu
          </h2>
          <p className="text-muted-foreground">
            Kombinujemo tehnološku zaštitu, verifikaciju i podršku zajednice kako biste mogli
            da kupujete i prodajete sa punim poverenjem.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <article
              key={point.title}
              className="flex h-full flex-col rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  {point.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{point.description}</p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground/90">{point.details}</p>
              <a
                href={point.href}
                className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Saznaj više
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

