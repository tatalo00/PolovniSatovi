const OFFERINGS = [
  {
    title: "Kurirana mreža prodavaca",
    description:
      "Saradnja isključivo sa nalozima koji su prošli identifikaciju i dokazali poreklo satova.",
  },
  {
    title: "Transparentni oglasi",
    description:
      "Standardizovan format oglasa, jasne fotografije i stroge smernice za opis stanja i porekla.",
  },
  {
    title: "Bezbednosni protokoli",
    description:
      "Ručno praćenje komunikacije, automatizovani sistemi protiv prevara i partneri za escrow opcije.",
  },
];

const VALUES = [
  { title: "Integritet", body: "Svaki korisnik, oglas i transakcija prolaze iste kriterijume." },
  {
    title: "Transparentnost",
    body: "Jasno objašnjavamo procese verifikacije i status svake prijave.",
  },
  {
    title: "Zajednica",
    body: "Gradimo centralno mesto za kolekcionare, servisere i diler-e iz čitavog regiona.",
  },
  {
    title: "Autentičnost",
    body: "Svi oglasi moraju imati dokazljivo poreklo, servisnu istoriju ili nezavisnu procenu.",
  },
];

const WORKFLOW = {
  buyers: [
    "Registrujte nalog i postavite preferencije za brend, budžet i stanje.",
    "Pregledajte verifikovane oglase i sačuvajte favorite uz Smart Alerts.",
    "Kontaktirajte prodavca kroz sigurni kanal i dogovorite dodatne provere ili escrow.",
  ],
  sellers: [
    "Verifikujte nalog i dokumentujte poreklo sata (račun, servisni nalog, procena).",
    "Kreirajte oglas u standardizovanom formatu sa profesionalnim fotografijama.",
    "Odgovarajte kupcima kroz platformu i koristite alate za praćenje statusa i reputacije.",
  ],
};

const DIFFERENTIATORS = [
  {
    title: "Regionalni fokus",
    detail: "Prilagođeni procesi za tržišta Srbije, Hrvatske, Slovenije, Bosne i Hercegovine i Crne Gore.",
  },
  {
    title: "Partnerstva sa stručnjacima",
    detail: "Saradnja sa sertifikovanim časovničarima i nezavisnim evaluatorima.",
  },
  {
    title: "Usklađenost sa propisima",
    detail:
      "Procesi dizajnirani u skladu sa Zakonom o elektronskoj trgovini, zaštiti potrošača i GDPR-om.",
  },
];

export const metadata = {
  title: "O nama",
  description: "Saznajte više o PolovniSatovi platformi.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="space-y-4 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            O platformi
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Jedinstvena zajednica za ljubitelje satova na Balkanu
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Misija PolovniSatovi platforme je da okupimo kolekcionare i prodavce na jednom mestu,
            uz fokus na integritet, poverenje i transparentnu komunikaciju. Verujemo da tržište
            polovnih i vintage satova zaslužuje standarde identične onima u najvećim svetskim
            metropolama, ali prilagođene realnosti regiona.
          </p>
        </header>

        <section className="grid gap-4 rounded-3xl bg-neutral-950 px-6 py-8 text-white sm:px-8 lg:px-12">
          <p className="text-sm uppercase tracking-[0.4em] text-white/70">Naša misija</p>
          <p className="text-2xl font-semibold leading-tight sm:text-3xl">
            Kreiramo zajednicu posvećenu poverenju i integritetu, kako bi svaki ljubitelj satova u
            regionu imao sigurno mesto za kupovinu, prodaju i razmenu znanja.
          </p>
          <p className="text-white/80 leading-relaxed">
            Dodatno ulažemo u edukaciju tržišta, standardizaciju opisa i transparentnu komunikaciju
            između kupaca i prodavaca. Platforma raste uz podršku stručnjaka za autentifikaciju,
            pravnika i tehnologa koji prate najbolje prakse digitalne trgovine.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Šta nudimo zajednici</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {OFFERINGS.map((offering) => (
              <div
                key={offering.title}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
              >
                <p className="text-lg font-semibold">{offering.title}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {offering.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Kako funkcioniše</h2>
            <p className="text-muted-foreground mt-2">
              Jasno definisani koraci za kupce i prodavce obezbeđuju dosledno iskustvo.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Za kupce
              </p>
              <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                {WORKFLOW.buyers.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="text-foreground font-semibold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Za prodavce
              </p>
              <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                {WORKFLOW.sellers.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="text-foreground font-semibold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Naše vrednosti</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border/60 p-5">
                <p className="text-lg font-semibold">{value.title}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Zašto odabrati PolovniSatovi</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {DIFFERENTIATORS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/70 bg-card p-5">
                <p className="text-base font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
