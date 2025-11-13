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
    <section className="bg-[#F5F5F5] py-16 md:py-20">
      <div className="container mx-auto space-y-12 px-4 md:px-6">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Sigurnost i podrška
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Potpuna usluga od prve pretrage do isporuke
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
            Transparentnost, osiguranje i partnerstva sa sertifikovanim časovničarima garantuju da
            vaša kupovina protiče bez stresa – online i uživo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 text-left shadow-sm"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {service.icon}
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
