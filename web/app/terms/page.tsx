type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  ordered?: boolean;
};

const SECTIONS: Section[] = [
  {
    title: "1. Prihvatanje uslova",
    paragraphs: [
      "Korišćenjem platforme PolovniSatovi (\"Platforma\") potvrđujete da ste pročitali, razumeli i prihvatili ove Uslove korišćenja. Ukoliko se ne slažete sa bilo kojim delom dokumenta, molimo vas da ne koristite Platformu.",
      "Platformom upravlja PolovniSatovi d.o.o. Beograd, koji nastupa kao posrednik između kupaca i prodavaca satova, bez preuzimanja vlasništva nad robom ili odgovornosti za izvršenje plaćanja.",
    ],
  },
  {
    title: "2. Opis usluga i ograničenja",
    paragraphs: [
      "Platforma obezbeđuje prostor za objavu oglasa, verifikaciju prodavaca, digitalnu komunikaciju i alate za izgradnju reputacije. PolovniSatovi ne garantuje zaključenje transakcije, dostupnost artikala niti konačnu autentičnost satova ukoliko prodavac ne dostavi traženu dokumentaciju.",
      "Sadržaj na Platformi ima informativni karakter. Za svaku kupovinu korisnici su dužni da izvrše dodatnu proveru i, po potrebi, angažuju stručnjake za autentifikaciju.",
    ],
  },
  {
    title: "3. Otvaranje naloga i odgovornosti korisnika",
    paragraphs: [
      "Registracijom prihvatate da ćete pružiti tačne, potpune i ažurne podatke. Platforma zadržava pravo da zatraži dodatnu identifikaciju, posebno za prodavce ili korisnike koji prelaze regulatorne pragove.",
      "Korisnik je odgovoran za čuvanje pristupnih podataka, kao i za sve radnje preduzete preko sopstvenog naloga.",
    ],
    bullets: [
      "Zabranjeno je deljenje naloga sa trećim licima.",
      "Svaka sumnja u kompromitovanje naloga mora odmah biti prijavljena timu za bezbednost.",
      "Platforma može privremeno suspendovati nalog dok se ne završi dodatna provera.",
    ],
  },
  {
    title: "4. Obaveze prodavaca",
    paragraphs: ["Prodavci su u obavezi da obezbede potpunu i istinitu dokumentaciju o satovima."],
    bullets: [
      "dostavljanje dokaza o poreklu (račun, ovlašćeni servis, procena) i servisnoj istoriji;",
      "jasan opis stanja, uključujući sve intervencije i eventualne nedostatke;",
      "pravovremeno ažuriranje cena i statusa (rezervisano, prodato);",
      "komunikacija isključivo preko sigurnih kanala Platforme dok se ne potvrdi identitet kupca;",
      "poštovanje rokova isporuke i šema slanja uz mogućnost korišćenja escrow ili trećih strana za plaćanje.",
    ],
  },
  {
    title: "5. Obaveze kupaca",
    paragraphs: [
      "Kupci su dužni da pre svake kupovine izvrše sopstvenu procenu rizika i da poštuju dogovorene rokove komunikacije.",
    ],
    bullets: [
      "ne zahtevati isporuku ili rezervaciju bez jasne namere kupovine;",
      "koristiti samo proverene načine plaćanja i zahtevati dokaz o vlasništvu pre transakcije;",
      "održavati profesionalan ton komunikacije i prijaviti svaku sumnju timu za bezbednost;",
      "poštovati lokalne carinske i poreske propise ukoliko sat napušta državu prodavca.",
    ],
  },
  {
    title: "6. Zabranjeni sadržaji i aktivnosti",
    paragraphs: [
      "Zabranjena je objava satova sa nepoznatim poreklom, falsifikovanih ili ukradenih artikala, kao i ponuda dodatnih usluga koje nisu u skladu sa važećim propisima. Platforma može trajno ukloniti nalog i obavestiti nadležne organe u slučaju sumnje na krivično delo.",
    ],
    bullets: [
      "manipulisanje cenama, lažni pregledi ili koordinisana prevara;",
      "zaobilaženje Platforme u cilju izbegavanja provizije ili procedura;",
      "deljenje tuđih ličnih podataka bez izričite saglasnosti.",
    ],
  },
  {
    title: "7. Operativni preduslovi za upravljanje marketplace platformom",
    paragraphs: [
      "Radi zaštite korisnika i same Platforme, obavezujemo se da održavamo sledeće kontrolne mehanizme i očekujemo da ih korisnici poštuju. Ovo predstavlja sumu najvažnijih elemenata koje svaka ozbiljna marketplace platforma mora imati.",
    ],
    bullets: [
      "Politike due diligence-a: proveru identiteta prodavaca, reviziju dokumentacije o poreklu i kontinuirani monitoring reputacije.",
      "Usklađenost sa zakonom: interne procedure za sprečavanje pranja novca, čuvanje evidencija transakcija i saradnja sa nadležnim organima.",
      "Sigurnosne procedure: dvofaktorska autentifikacija, evidencija pristupa i plan reagovanja u slučaju incidenta.",
      "Transparentnu komunikaciju: jasan prikaz provizija, statusa oglasa i vidljivih oznaka za verifikovane prodavce.",
      "Proces rešavanja prigovora: definisani rokovi odgovora, eskalacioni nivo i dokumentovanje svakog slučaja.",
    ],
  },
  {
    title: "8. Transakcije, plaćanja i ograničenje odgovornosti",
    paragraphs: [
      "PolovniSatovi ne učestvuje u finansijskim transakcijama između korisnika, ne preuzima sredstva niti garantuje povraćaj. Platforma može preporučiti partnere za escrow i logistiku, ali korisnici snose punu odgovornost za izbor i izvršenje plaćanja.",
      "U meri dozvoljenoj zakonom, isključujemo odgovornost za indirektnu štetu, izgubljenu dobit, narušenu reputaciju ili druge posledice proizašle iz korišćenja Platforme.",
    ],
  },
  {
    title: "9. Rešavanje sporova",
    paragraphs: [
      "U slučaju spora između korisnika, Platforma može posredovati savetodavno, ali nema obavezu da donosi konačne odluke. Korisnici se podstiču na internu medijaciju ili obraćanje nadležnim organima ukoliko dogovor nije moguć.",
    ],
  },
  {
    title: "10. Intelektualna svojina",
    paragraphs: [
      "Svi elementi vizuelnog identiteta, sadržaja, softvera i baza podataka predstavljaju intelektualnu svojinu PolovniSatovi i zaštićeni su važećim propisima. Korišćenje materijala dozvoljeno je isključivo uz prethodnu pisanu saglasnost.",
    ],
  },
  {
    title: "11. Suspenzija i zatvaranje naloga",
    paragraphs: [
      "Platforma može privremeno ili trajno ograničiti pristup nalogu ukoliko postoji sumnja na kršenje uslova, zakona ili bezbednosnih procedura. Korisnik može zatražiti brisanje naloga, ali pojedini podaci mogu biti zadržani u skladu sa zakonskim obavezama.",
    ],
  },
  {
    title: "12. Izmene dokumenta",
    paragraphs: [
      "PolovniSatovi zadržava pravo da ažurira Uslove korišćenja. Nova verzija stupa na snagu danom objave na sajtu, a korisnici će biti blagovremeno obavešteni putem e-pošte ili sistemskih obaveštenja.",
    ],
  },
  {
    title: "13. Merodavno pravo i nadležnost",
    paragraphs: [
      "Ovi Uslovi tumače se u skladu sa pravom Republike Srbije. Za sve sporove nadležan je stvarno nadležni sud u Beogradu, osim ako je obavezna nadležnost drugačije propisana imperativnim normama.",
    ],
  },
];

export const metadata = {
  title: "Uslovi korišćenja",
  description: "Opšti uslovi korišćenja platforme PolovniSatovi.",
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Pravna dokumentacija
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Uslovi korišćenja</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Dokument je pripremljen u skladu sa Zakonom o elektronskoj trgovini, Zakonom o zaštiti
            potrošača i GDPR regulativom, kako bi zaštitio sve učesnike i jasno definisao pravila
            ponašanja na Platformi.
          </p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {SECTIONS.map((section) => (
            <section key={section.title} className="space-y-3 rounded-2xl border border-border/70 p-5">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                section.ordered ? (
                  <ol className="list-decimal space-y-1 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc space-y-1 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
