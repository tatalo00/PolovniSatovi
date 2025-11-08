export const metadata = {
  title: "Politika privatnosti",
  description: "Politika privatnosti platforme PolovniSatovi.",
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Politika privatnosti</h1>
          <p className="text-muted-foreground mt-2">
            Stub dokument – kompletna politika privatnosti biće objavljena uskoro.
          </p>
        </header>
        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Čuvamo podatke o nalozima i porukama u skladu sa važećim propisima o zaštiti podataka.
            Kada finalizujemo saradnju sa pravnim timom objavićemo detaljima o obradi, čuvanju i deljenju podataka.
          </p>
          <p>
            U međuvremenu nas možete kontaktirati za bilo kakva pitanja u vezi sa privatnošću.
          </p>
        </section>
      </div>
    </main>
  );
}


