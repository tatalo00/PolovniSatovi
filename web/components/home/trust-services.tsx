import { CreditCard, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const SERVICES = [
  {
    title: "Autentikacija",
    description: "Stručna provera svakog sata uz digitalni zapis o autentičnosti.",
    icon: <ShieldCheck className="h-6 w-6" aria-hidden />,
  },
  {
    title: "Verifikovani prodavci",
    description: "Samo proverenim prodavcima sa 5★ recenzijama dozvoljavamo da objavljuju.",
    icon: <Sparkles className="h-6 w-6" aria-hidden />,
  },
  {
    title: "Sigurna plaćanja",
    description: "Escrow opcije, osiguranje pošiljki i mogućnost plaćanja na rate.",
    icon: <CreditCard className="h-6 w-6" aria-hidden />,
  },
  {
    title: "Servis i održavanje",
    description: "Partneri za servisiranje i poliranje sa garancijom na radove.",
    icon: <Wrench className="h-6 w-6" aria-hidden />,
  },
] as const;

export function TrustServices() {
  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16 md:py-20">
      <div className="container mx-auto space-y-8 sm:space-y-10 md:space-y-12 px-3 sm:px-4 md:px-6">
        <div className="space-y-2 sm:space-y-3 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-muted-foreground">
            Sigurnost i podrška
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight sm:leading-normal px-2 sm:px-0">
            Potpuna usluga od prve pretrage do isporuke
          </h2>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
            Transparentnost, osiguranje i partnerstva sa sertifikovanim časovničarima garantuju da
            vaša kupovina protiče bez stresa – online i uživo.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="flex h-full flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 md:p-6 text-left shadow-sm"
            >
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                {service.icon}
              </span>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">{service.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
