export const metadata = {
  title: "Uslovi korišćenja",
  description: "Opšti uslovi korišćenja platforme PolovniSatovi.",
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Uslovi korišćenja</h1>
          <p className="text-muted-foreground mt-2">
            Stub dokument – završna verzija Uslova korišćenja je u pripremi.
          </p>
        </header>
        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Korišćenjem platforme prihvatate buduće uslove koji će detaljno definisati odgovornosti kupaca i prodavaca,
            pravila objave oglasa i načine rešavanja sporova.
          </p>
          <p>
            Ovaj dokument je trenutno u izradi i biće objavljen pre zvaničnog lansiranja javne verzije sajta.
          </p>
        </section>
      </div>
    </main>
  );
}


