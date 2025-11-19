import { Clock3, Mail, ShieldCheck, MessageSquare } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";

export const metadata = {
  title: "Kontakt",
  description: "Stupite u kontakt sa timom PolovniSatovi.",
};

const SUPPORT_HOURS = [
  { label: "Radnim danima", value: "09:00 – 18:00 (CET)" },
  { label: "Vikendom", value: "10:00 – 14:00 (CET)" },
];

const SUPPORT_TOPICS = [
  { label: "Provera oglasa", description: "Status verifikacije, dopune i izmene oglasa." },
  { label: "Bezbednost", description: "Prijava sumnjivih aktivnosti i zloupotreba." },
  { label: "Partnerstva", description: "Brendovi, dileri i medijski partneri." },
  { label: "Tehnička podrška", description: "Prijava grešaka ili problema sa nalogom." },
];

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-10 lg:space-y-12">
        <header className="space-y-3 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Podrška i saradnja
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Uvek dostupni za zajednicu ljubitelja satova
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            Najbrže nas kontaktirate putem forme ili direktno na{" "}
            <a
              href="mailto:info@polovnisatovi.net"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              info@polovnisatovi.net
            </a>
            . Svako pitanje tretiramo kao poverljivo i odgovaramo u roku od jednog radnog dana.
          </p>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_1.2fr] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-3xl bg-neutral-950 text-white px-6 py-8 sm:px-8 shadow-2xl">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/70">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                Prioritet bezbednosti
              </div>
              <p className="mt-4 text-2xl font-semibold leading-tight">
                Svaki upit prolazi kroz sigurnosni protokol i dobija personalizovan odgovor.
              </p>
              <p className="mt-4 text-sm text-white/80 leading-relaxed">
                Naš tim za poverenje i bezbednost aktivno prati prijave i sarađuje sa pouzdanim
                prodavcima kako bi svaka transakcija bila u skladu sa standardima platforme.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" aria-hidden />
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Direktan kontakt
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">info@polovnisatovi.net</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Za hitne slučajeve označite temu kao „Bezbednost“ kako bismo prioritetno reagovali.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-primary" aria-hidden />
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Vreme odgovora
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {SUPPORT_HOURS.map((slot) => (
                    <li key={slot.label} className="flex flex-col">
                      <span className="font-semibold text-foreground">{slot.label}</span>
                      <span>{slot.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold">Najčešći zahtevi</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {SUPPORT_TOPICS.map((topic) => (
                  <div key={topic.label} className="space-y-1.5 text-sm">
                    <p className="font-semibold text-foreground">{topic.label}</p>
                    <p className="text-muted-foreground leading-relaxed">{topic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ContactForm />
        </section>
      </div>
    </main>
  );
}
