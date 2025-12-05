import { MessageSquare, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Kontakt",
  description: "Stupite u kontakt sa timom PolovniSatovi.",
};

const SUPPORT_HOURS = [
  { label: "Radnim danima", value: "09:00 – 18:00 (CET)" },
  { label: "Vikendom", value: "10:00 – 14:00 (CET)" },
];

const SUPPORT_TOPICS = [
  { 
    label: "Provera oglasa", 
    description: "Status verifikacije, dopune i izmene oglasa.",
    icon: <CheckCircle2 className="h-5 w-5" aria-hidden />,
    gradient: "from-emerald-50 to-teal-50",
    iconColor: "text-emerald-600",
  },
  { 
    label: "Bezbednost", 
    description: "Prijava sumnjivih aktivnosti i zloupotreba.",
    icon: <ShieldCheck className="h-5 w-5" aria-hidden />,
    gradient: "from-blue-50 to-indigo-50",
    iconColor: "text-blue-600",
  },
  { 
    label: "Partnerstva", 
    description: "Brendovi, časovničarske radnje i medijski partneri.",
    icon: <Sparkles className="h-5 w-5" aria-hidden />,
    gradient: "from-amber-50 to-yellow-50",
    iconColor: "text-amber-600",
  },
  { 
    label: "Tehnička podrška", 
    description: "Prijava grešaka ili problema sa nalogom.",
    icon: <MessageSquare className="h-5 w-5" aria-hidden />,
    gradient: "from-purple-50 to-pink-50",
    iconColor: "text-purple-600",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">
          {/* Header Section */}
          <header className="space-y-4 sm:space-y-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-4 py-1.5 sm:px-5 sm:py-2">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D4AF37]" aria-hidden />
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#D4AF37]">
                Podrška i saradnja
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-tight sm:leading-normal px-2 sm:px-0">
              Uvek dostupni za zajednicu ljubitelja satova
            </h1>
            <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-2 sm:px-0">
              Najbrže nas kontaktirate putem forme ili direktno na{" "}
              <a
                href="mailto:info@polovnisatovi.net"
                className="font-semibold text-[#D4AF37] hover:text-[#b6932c] underline underline-offset-4 transition-colors"
              >
                info@polovnisatovi.net
              </a>
              . Svako pitanje tretiramo kao poverljivo i odgovaramo u roku od jednog radnog dana.
            </p>
          </header>

          {/* Main Contact Form - Central and Prominent */}
          <section className="mx-auto max-w-2xl lg:max-w-3xl">
            <ContactForm />
          </section>


          {/* Support Topics - Below Form */}
          <section className="mx-auto max-w-5xl lg:max-w-6xl">
            <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="rounded-full bg-[#D4AF37]/15 p-2.5 sm:p-3">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-[#D4AF37]" aria-hidden />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                  Najčešći zahtevi
                </h2>
              </div>
              <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {SUPPORT_TOPICS.map((topic) => (
                  <div 
                    key={topic.label} 
                    className={cn(
                      "group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-border/50 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                      "hover:border-[#D4AF37]/40"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                      topic.gradient
                    )} />
                    <div className="relative z-10 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex-shrink-0", topic.iconColor)}>
                          {topic.icon}
                        </span>
                        <p className="font-semibold text-sm sm:text-base md:text-lg text-foreground">
                          {topic.label}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
