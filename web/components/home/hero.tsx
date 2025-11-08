"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/listings");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Pronađite svoj savršeni sat
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Najveća ponuda polovnih i vintage satova na Balkanu. Pretražite hiljade oglasa od pouzdanih prodavaca.
          </p>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Pretražite marke, modele, reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                Pretraži
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/listings">Pregledaj sve oglase</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/sell">Prodaj svoj sat</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

