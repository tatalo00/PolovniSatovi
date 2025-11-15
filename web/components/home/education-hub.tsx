"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EducationCategory = "guides" | "trends" | "community";

interface EducationArticle {
  title: string;
  summary: string;
  readTime: string;
  href: string;
}

const EDUCATION_CONTENT: Record<
  EducationCategory,
  { icon: React.ReactNode; title: string; articles: EducationArticle[] }
> = {
  guides: {
    icon: <BookOpen className="h-5 w-5" aria-hidden />,
    title: "Vodiči i saveti",
    articles: [
      {
        title: "Prvi koraci u kolekcionarstvu satova",
        summary: "Kako prepoznati kvalitet, očuvati vrednost i izabrati svoj prvi sat.",
        readTime: "7 min čitanja",
        href: "/guides/beginners-watch-collecting",
      },
      {
        title: "Autentifikacija Rolexa u 10 koraka",
        summary: "Praktičan vodič za prepoznavanje originalnih komponenti i dokumenata.",
        readTime: "6 min čitanja",
        href: "/guides/authenticate-rolex",
      },
      {
        title: "Razumevanje mehanizama",
        summary: "Automatski, ručni i kvarcni mehanizmi – koje razlike za vas znače.",
        readTime: "5 min čitanja",
        href: "/guides/watch-movements",
      },
    ],
  },
  trends: {
    icon: <TrendingUp className="h-5 w-5" aria-hidden />,
    title: "Trendovi i tržište",
    articles: [
      {
        title: "Mesečni indeks cena za Omega Speedmaster",
        summary: "Praćenje kretanja cena za najtraženije referentne brojeve u regionu.",
        readTime: "4 min čitanja",
        href: "/trends/omega-speedmaster-index",
      },
      {
        title: "Investicioni satovi 2025.",
        summary: "Koji modeli beleže najveći rast i zašto kolekcionari prate te trendove.",
        readTime: "8 min čitanja",
        href: "/trends/investment-watches-2025",
      },
      {
        title: "Vintage tržište Balkana",
        summary: "Najtraženiji modeli u regionu i očekivanja za narednih 6 meseci.",
        readTime: "5 min čitanja",
        href: "/trends/vintage-market-balkan",
      },
    ],
  },
  community: {
    icon: <Users className="h-5 w-5" aria-hidden />,
    title: "Zajednica i priče",
    articles: [
      {
        title: "Restauracija Seiko divera iz 1978.",
        summary: "Kako je kolekcionar iz Zagreba vratio sjaj retkom ronilačkom modelu.",
        readTime: "6 min čitanja",
        href: "/community/seiko-restoration-story",
      },
      {
        title: "Intervju: kolekcionar iz Beograda",
        summary: "Priča o građenju kolekcije od prvog sata do rariteta iz 60-ih.",
        readTime: "5 min čitanja",
        href: "/community/collector-interview-belgrade",
      },
      {
        title: "Kako funkcionišu meetup događaji",
        summary: "Saveti za umrežavanje i razmenu iskustava sa lokalnim entuzijastima.",
        readTime: "4 min čitanja",
        href: "/community/watch-meetups-guide",
      },
    ],
  },
};

const CATEGORY_ORDER: EducationCategory[] = ["guides", "trends", "community"];

export function EducationHub() {
  const [activeCategory, setActiveCategory] = useState<EducationCategory>("guides");

  const activeContent = useMemo(
    () => EDUCATION_CONTENT[activeCategory],
    [activeCategory]
  );

  return (
    <section className="bg-muted/30 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight sm:leading-normal">
              Centar znanja
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              Vodiči, analize i priče iz zajednice kako biste doneli informisane odluke i
              uživali u kolekcionarstvu satova.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5 rounded-2xl sm:rounded-full border border-border/60 bg-background/70 p-2 w-full sm:w-auto">
            {CATEGORY_ORDER.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={
                  "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-full px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 min-h-[40px] flex-1 sm:flex-initial min-w-0 " +
                  (category === activeCategory
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-[0.98]")
                }
              >
                <span className="flex-shrink-0">{EDUCATION_CONTENT[category].icon}</span>
                <span className="whitespace-nowrap truncate">{EDUCATION_CONTENT[category].title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeContent.articles.map((article) => (
            <Card
              key={article.title}
              className="flex h-full flex-col justify-between border-border/60 bg-background/90 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <CardContent className="flex h-full flex-col gap-3 sm:gap-4 p-4 sm:p-5 md:p-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">{article.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
                </div>
                <div className="mt-auto flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-2">
                  <span>{article.readTime}</span>
                  <Link href={article.href} className="text-primary hover:underline font-medium">
                    Pročitaj više
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 flex justify-center">
          <Button asChild variant="outline" size="lg" className="min-h-[44px] w-full sm:w-auto">
            <Link href="/blog">Poseti edukativni centar</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

