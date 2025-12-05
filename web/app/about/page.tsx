import { Sparkles, ShieldCheck, CheckCircle2, Users, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const OFFERINGS = [
  {
    title: "Verifikovana mreža prodavaca",
    description:
      "Saradnja isključivo sa nalozima koji su prošli autentifikaciju.",
    icon: <ShieldCheck className="h-6 w-6" aria-hidden />,
    gradient: "from-blue-50 to-indigo-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Transparentni oglasi",
    description:
      "Standardizovan format oglasa, jasne fotografije i stroge smernice za opis stanja.",
    icon: <CheckCircle2 className="h-6 w-6" aria-hidden />,
    gradient: "from-emerald-50 to-teal-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Bezbedna komunikacija",
    description:
      "Siguran kanal za kontakt između kupaca i prodavaca sa zaštitom podataka i praćenjem komunikacije.",
    icon: <MessageSquare className="h-6 w-6" aria-hidden />,
    gradient: "from-amber-50 to-yellow-50",
    iconColor: "text-amber-600",
  },
];

const VALUES = [
  { 
    title: "Integritet", 
    body: "Svaki korisnik, oglas i transakcija prolaze iste kriterijume.",
    gradient: "from-purple-50 to-pink-50",
  },
  {
    title: "Transparentnost",
    body: "Jasno objašnjavamo procese verifikacije i status svake prijave.",
    gradient: "from-blue-50 to-cyan-50",
  },
  {
    title: "Zajednica",
    body: "Gradimo centralno mesto za kolekcionare, servisere i prodavce iz čitavog regiona.",
    gradient: "from-emerald-50 to-teal-50",
  },
  {
    title: "Autentičnost",
    body: "Svi oglasi moraju imati dokazljivo poreklo, servisnu istoriju ili nezavisnu procenu.",
    gradient: "from-amber-50 to-orange-50",
  },
];

const WORKFLOW = {
  buyers: [
    "Registrujte nalog i pregledajte oglase koristeći napredne filtere.",
    "Sačuvajte omiljene oglase u listu želja za brži pristup.",
    "Kontaktirajte prodavca kroz sigurni kanal platforme.",
  ],
  sellers: [
    "Verifikujte nalog i kreirajte prodavački profil sa informacijama o prodavnici.",
    "Kreirajte oglas u standardizovanom formatu sa profesionalnim fotografijama.",
    "Pošaljite oglas na odobrenje i odgovarajte kupcima kroz platformu.",
  ],
};

const DIFFERENTIATORS = [
  {
    title: "Regionalni fokus",
    detail: "Prilagođeni procesi za tržišta Srbije, Hrvatske, Slovenije, Bosne i Hercegovine i Crne Gore.",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    title: "Admin odobrenje",
    detail: "Svi oglasi prolaze kroz proces ručne provere pre objavljivanja, osiguravajući kvalitet i autentičnost.",
    gradient: "from-emerald-50 to-teal-50",
  },
  {
    title: "Usklađenost sa propisima",
    detail:
      "Procesi dizajnirani u skladu sa Zakonom o elektronskoj trgovini, zaštiti potrošača i GDPR-om.",
    gradient: "from-amber-50 to-yellow-50",
  },
];

export const metadata = {
  title: "O nama",
  description: "Saznajte više o PolovniSatovi platformi.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl space-y-12 sm:space-y-16">
          {/* Header Section */}
          <header className="space-y-4 sm:space-y-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-4 py-1.5 sm:px-5 sm:py-2">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]" aria-hidden />
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#D4AF37]">
                O platformi
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-tight sm:leading-normal px-2 sm:px-0">
              Jedinstvena zajednica za ljubitelje satova na Balkanu
            </h1>
            <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-2 sm:px-0 text-center">
              Misija PolovniSatovi platforme je da okupimo kolekcionare i ljubitelje satova na jednom mestu,
              uz fokus na integritet, poverenje i transparentnu komunikaciju. Verujemo da tržište
              polovnih i vintage satova zaslužuje standarde identične onima na najvećim svetskim
              metropolama, prilagođene našem regionu.
            </p>
          </header>

          {/* Mission Section */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4AF37]/15 via-amber-50/30 via-[#D4AF37]/10 to-yellow-50/20 px-6 py-8 text-foreground sm:px-8 lg:px-12 shadow-2xl border-2 border-[#D4AF37]/30">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37]/3 to-transparent opacity-30" />
            <div className="relative z-10 space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37] font-semibold">Naša misija</p>
              <p className="text-2xl font-semibold leading-tight sm:text-3xl text-foreground">
                Kreiramo zajednicu posvećenu poverenju i integritetu, kako bi svaki ljubitelj satova u
                regionu imao sigurno mesto za kupovinu, prodaju i razmenu znanja.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ulažemo u edukaciju tržišta, standardizaciju opisa i transparentnu komunikaciju
                između kupaca i prodavaca. Platforma raste i razvija se uz podršku naše zajednice.
              </p>
            </div>
          </section>

          {/* Offerings Section */}
          <section className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Šta nudimo zajednici</h2>
              <p className="mt-2 text-muted-foreground">
                Platforma dizajnirana sa fokusom na sigurnost i transparentnost
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {OFFERINGS.map((offering) => (
                <div
                  key={offering.title}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 border-border/60 bg-white/70 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    "hover:border-[#D4AF37]/40"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                    offering.gradient
                  )} />
                  <div className="relative z-10 space-y-3">
                    <div className={cn("flex-shrink-0", offering.iconColor)}>
                      {offering.icon}
                    </div>
                    <p className="text-lg font-semibold text-foreground">{offering.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {offering.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Workflow Section */}
          <section className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Kako funkcioniše</h2>
              <p className="mt-2 text-muted-foreground">
                Jasno definisani koraci za kupce i prodavce obezbeđuju dosledno iskustvo.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl border-2 border-border/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#D4AF37]/40">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Users className="h-5 w-5 text-blue-600" aria-hidden />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Za kupce
                    </p>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    {WORKFLOW.buyers.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="text-foreground font-semibold flex-shrink-0">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border-2 border-border/60 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#D4AF37]/40">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <Search className="h-5 w-5 text-emerald-600" aria-hidden />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Za prodavce
                    </p>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    {WORKFLOW.sellers.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="text-foreground font-semibold flex-shrink-0">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Naše vrednosti</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {VALUES.map((value) => (
                <div 
                  key={value.title} 
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 border-border/60 bg-white/70 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    "hover:border-[#D4AF37]/40"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                    value.gradient
                  )} />
                  <div className="relative z-10">
                    <p className="text-lg font-semibold text-foreground">{value.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Differentiators Section */}
          <section className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Zašto odabrati PolovniSatovi</h2>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {DIFFERENTIATORS.map((item) => (
                <div 
                  key={item.title} 
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 border-border/60 bg-white/70 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    "hover:border-[#D4AF37]/40"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                    item.gradient
                  )} />
                  <div className="relative z-10">
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
