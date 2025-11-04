import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { CheckCircle, Upload, Shield, MessageCircle } from "lucide-react";

export default async function SellPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Prodajte Svoj Sat
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Bilo koji registrovan korisnik može da kreira oglas i proda svoj sat. Brzo i jednostavno!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <Upload className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Lako Objavljivanje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kreirajte oglas u nekoliko koraka. Dodajte fotografije, opis i cenu vašeg sata.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Bezbedno i Pouzdano</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Svi oglasi su pregledani od strane administratora pre objavljivanja.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Direktna Komunikacija</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kupci vas mogu kontaktirati direktno putem emaila kada zainteresovani za vaš sat.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Besplatno</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Objavljivanje oglasa je potpuno besplatno. Nema skrivenih troškova.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          {isLoggedIn ? (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Spremni da objavite svoj prvi oglas?
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard/listings/new">Kreiraj Oglas</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Registrujte se da biste mogli da objavljujete oglase
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/signin">Prijavite se</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/auth/signup">Registrujte se</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


