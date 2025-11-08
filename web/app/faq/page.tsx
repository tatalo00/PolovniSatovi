export const metadata = {
  title: "FAQ",
  description: "Najčešća pitanja u vezi sa platformom PolovniSatovi.",
};

export default function FaqPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Najčešća pitanja</h1>
          <p className="text-muted-foreground mt-2">
            Stub stranica – uskoro ćemo objaviti odgovore na najčešća pitanja kupaca i prodavaca.
          </p>
        </header>
        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Radimo na detaljnom vodiču kroz proces objave oglasa, verifikacije prodavaca i sigurnosti tranzakcija.
          </p>
          <p>
            Do tada, pogledajte naše Uslove korišćenja i Politiku privatnosti ili nas kontaktirajte direktno.
          </p>
        </section>
      </div>
    </main>
  );
}


