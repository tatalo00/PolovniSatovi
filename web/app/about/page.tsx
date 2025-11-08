export const metadata = {
  title: "O nama",
  description: "Saznajte više o PolovniSatovi platformi.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">O nama</h1>
          <p className="text-muted-foreground mt-2">
            Stub stranica – uskoro donosimo više informacija o timu i procesu verifikacije.
          </p>
        </header>
        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            PolovniSatovi je zajednica ljubitelja satova. Naša misija je da kupovina i
            prodaja satova bude transparentna i sigurna. Ovu stranicu ćemo uskoro
            proširiti detaljima o timu, istoriji platforme i planovima razvoja.
          </p>
          <p>
            Do tada, posetite naš FAQ ili nas kontaktirajte ukoliko imate pitanje.
          </p>
        </section>
      </div>
    </main>
  );
}


