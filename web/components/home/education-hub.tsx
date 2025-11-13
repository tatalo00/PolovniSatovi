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
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Centar znanja
            </h2>
            <p className="text-muted-foreground">
              Vodiči, analize i priče iz zajednice kako biste doneli informisane odluke i
              uživali u kolekcionarstvu satova.
            </p>
          </div>
          <div className="flex gap-2 rounded-full border border-border/60 bg-background/70 p-2">
            {CATEGORY_ORDER.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition " +
                  (category === activeCategory
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {EDUCATION_CONTENT[category].icon}
                {EDUCATION_CONTENT[category].title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {activeContent.articles.map((article) => (
            <Card
              key={article.title}
              className="flex h-full flex-col justify-between border-border/60 bg-background/90 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">{article.summary}</p>
                </div>
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span>{article.readTime}</span>
                  <Link href={article.href} className="text-primary hover:underline">
                    Pročitaj više
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/blog">Poseti edukativni centar</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

