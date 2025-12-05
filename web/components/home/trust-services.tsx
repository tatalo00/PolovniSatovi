"use client";

import { CheckCircle2, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    title: "Autentifikacija korisnika",
    description: "Provera autentičnosti korisnika i verifikacija identiteta.",
    icon: <ShieldCheck className="h-6 w-6" aria-hidden />,
    gradient: "from-emerald-50 to-teal-50",
    iconGradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-200/50",
  },
  {
    title: "Verifikovani prodavci",
    description: "Provereni prodavci sa oficijalnim radnjama za prodaju satova.",
    icon: <Sparkles className="h-6 w-6" aria-hidden />,
    gradient: "from-amber-50 to-yellow-50",
    iconGradient: "from-amber-500 to-yellow-600",
    borderColor: "border-amber-200/50",
  },
  {
    title: "Promocija oglasa",
    description: "Mogućnost promovisanja oglasa na početnoj strani.",
    icon: <Megaphone className="h-6 w-6" aria-hidden />,
    gradient: "from-blue-50 to-indigo-50",
    iconGradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-200/50",
  },
  {
    title: "Provera oglasa",
    description: "Svaki oglas mora proći kroz proveru od strane admin tima.",
    icon: <CheckCircle2 className="h-6 w-6" aria-hidden />,
    gradient: "from-purple-50 to-pink-50",
    iconGradient: "from-purple-500 to-pink-600",
    borderColor: "border-purple-200/50",
  },
] as const;

export function TrustServices() {
  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16 md:py-20">
      <div className="container mx-auto space-y-8 sm:space-y-10 md:space-y-12 px-3 sm:px-4 md:px-6">
        <div className="space-y-2 sm:space-y-3 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-muted-foreground">
            Platforma i usluge
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight sm:leading-normal px-2 sm:px-0">
            Sve što vam treba za sigurnu i uspešnu kupovinu ili prodaju
          </h2>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
            Naša platforma nudi kompletan set alata i usluga koji vam pomažu da brzo i lako prodate ili kupite
            satove uz potpunu sigurnost i podršku.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className={cn(
                "group relative flex h-full flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl",
                "bg-white p-4 sm:p-5 md:p-6 text-left",
                "border-2 border-transparent",
                "shadow-sm hover:shadow-xl",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:scale-[1.02]",
                "cursor-pointer",
                "overflow-hidden",
                service.borderColor.replace("border-", "hover:border-")
              )}
            >
              {/* Animated background gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                service.gradient
              )} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="relative inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
                  <span className={cn(
                    "absolute inset-0 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    service.iconGradient
                  )} />
                  <span className={cn(
                    "relative inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full",
                    "bg-primary/10 text-primary flex-shrink-0",
                    "group-hover:text-white",
                    "transition-all duration-300 ease-out",
                    "group-hover:scale-110 group-hover:rotate-3",
                    "shadow-sm group-hover:shadow-lg",
                    "z-10"
                  )}>
                    {service.icon}
                  </span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight group-hover:text-foreground transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className={cn(
                "absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                "bg-gradient-to-br from-white/20 to-transparent rounded-bl-full",
                "-z-0"
              )} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
