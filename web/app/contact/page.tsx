export const metadata = {
  title: "Kontakt",
  description: "Stupite u kontakt sa timom PolovniSatovi.",
};

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Kontakt</h1>
          <p className="text-muted-foreground mt-2">
            Stub stranica – unesite dodatne informacije o podršci čim budu spremne.
          </p>
        </header>
        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Najbrži način da stupite u kontakt sa nama je putem e-mail adrese{" "}
            <a
              href="mailto:info@polovnisatovi.net"
              className="font-medium text-foreground underline underline-offset-4"
            >
              info@polovnisatovi.net
            </a>
            .
          </p>
          <p>
            Uskoro ćemo dodati i dodatne kanale podrške (chat, telefonski broj) kao i formu za prijavu problema.
          </p>
        </section>
      </div>
    </main>
  );
}


