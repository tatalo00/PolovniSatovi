import { Breadcrumbs } from "@/components/ui/breadcrumbs";

type PrivacySection = {
  title: string;
  content: string[];
  list?: string[];
};

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "1. Kontrolor podataka",
    content: [
      "PolovniSatovi d.o.o. Beograd, sa sedištem u Srbiji, odgovoran je za obradu ličnih podataka prikupljenih preko ove platforme. Za sva pitanja možete nas kontaktirati na info@polovnisatovi.net.",
    ],
  },
  {
    title: "2. Koje podatke prikupljamo",
    content: [
      "Prikupljamo samo podatke neophodne za funkcionisanje Platforme i zaštitu zajednice.",
    ],
    list: [
      "Podaci o nalogu: ime i prezime, e-mail, lozinka (hash), broj telefona i preferencije.",
      "Podaci o verifikaciji prodavaca: dokumentacija o identitetu, dokazi o poreklu satova, status firme.",
      "Podaci iz komunikacije: poruke, prijave, beleške o incidentima i evidencija o prigovorima.",
      "Tehnički podaci: IP adrese, identifikatori uređaja, logovi aktivnosti i kolačići.",
    ],
  },
  {
    title: "3. Kako koristimo podatke",
    content: [
      "Osnova obrade je izvršenje ugovora, legitimni interes za bezbednost zajednice i zakonske obaveze.",
    ],
    list: [
      "kreiranje i održavanje korisničkih naloga;",
      "verifikaciju oglasa i zaštitu od prevara;",
      "personalizaciju sadržaja, notifikacija i preporuka;",
      "analitiku i poboljšanje performansi sajta;",
      "pravovremeno odgovaranje na zahtev nadležnih organa.",
    ],
  },
  {
    title: "4. Deljenje podataka",
    content: [
      "Podaci se dele isključivo sa partnerima koji podržavaju rad Platforme i imaju ugovor o poverljivosti.",
    ],
    list: [
      "Brevo (e-mail servis) za transakcione i sistemske poruke;",
      "Cloudinary za čuvanje fotografija oglasa;",
      "Supabase/Prisma infrastruktura za bezbedno skladištenje podataka;",
      "Pravni i računovodstveni savetnici kada je to zakonski potrebno.",
    ],
  },
  {
    title: "5. Bezbednost i čuvanje podataka",
    content: [
      "Primena enkripcije u mirovanju i tokom prenosa, ograničeni pristup uz princip najmanjih privilegija, redovne revizije bezbednosnih logova i plan reagovanja u slučaju incidenta.",
      "Podatke čuvamo onoliko koliko je potrebno za ispunjenje svrhe obrade ili poštovanje zakonskih obaveza (računovodstveni rokovi, zaštita od potraživanja, AML evidencije).",
    ],
  },
  {
    title: "6. Vaša prava",
    content: [
      "Korisnici imaju pravo na pristup, ispravku, brisanje, ograničenje obrade, prenosivost i prigovor na obradu podataka. Zahtev možete poslati na info@polovnisatovi.net, a odgovor ćete dobiti najkasnije u roku od 30 dana.",
    ],
  },
  {
    title: "7. Kolačići i tehnologije praćenja",
    content: [
      "Koristimo neophodne kolačiće za prijavu i sigurnost, kao i analitičke kolačiće za poboljšanje korisničkog iskustva. Možete promeniti podešavanja u svom pretraživaču u bilo kom trenutku.",
    ],
  },
  {
    title: "8. Podaci dece",
    content: [
      "Platforma nije namenjena licima mlađim od 16 godina. Svesno ne prikupljamo podatke o maloletnicima i brišemo ih čim saznamo da su greškom dostavljeni.",
    ],
  },
  {
    title: "9. Međunarodni transferi",
    content: [
      "Podaci se mogu prenositi na servere partnera u EU ili SAD, isključivo uz primenu standardnih ugovornih klauzula i dodatnih tehničkih mera zaštite.",
    ],
  },
  {
    title: "10. Izmene politike",
    content: [
      "Politika privatnosti može biti ažurirana kako bi odražavala promene u zakonodavstvu ili načinu rada Platforme. O značajnim izmenama obavestićemo vas putem e-pošte ili obaveštenja na sajtu.",
    ],
  },
  {
    title: "11. Kontakt za pitanja o privatnosti",
    content: [
      "Za sva pitanja i zahteve u vezi sa podacima, kontaktirajte nas na info@polovnisatovi.net ili poštom na adresu sedišta. Takođe imate pravo da uložite prigovor Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti.",
    ],
  },
];

export const metadata = {
  title: "Politika privatnosti",
  description: "Politika privatnosti platforme PolovniSatovi.",
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <Breadcrumbs items={[{ label: "Politika privatnosti" }]} className="mb-6" />
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Zaštita podataka
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Politika privatnosti
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Politika je usklađena sa Opštom uredbom o zaštiti podataka (GDPR) i relevantnim propisima
            Republike Srbije. Naš cilj je da transparentno komuniciramo zašto i kako obrađujemo vaše
            podatke.
          </p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-3 rounded-2xl border border-border/70 p-5">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              {section.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list ? (
                <ul className="list-disc space-y-1 pl-5">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
