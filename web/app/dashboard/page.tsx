import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;
  const userId = user.id;

  // Check if user is verified or has pending application
  const [userWithVerification, application] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    }),
    prisma.sellerApplication.findUnique({
      where: { userId },
      select: { status: true },
    }),
  ]);

  const isVerified = userWithVerification?.isVerified ?? false;
  const hasApplication = !!application;
  const showVerifiedSection = !isVerified;

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 lg:pb-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Dobrodošli, {user.name || user.email}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Moj Profil</CardTitle>
            <CardDescription>Upravljajte svojim profilom</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="min-h-[44px] w-full sm:w-auto">
              <Link href="/dashboard/profile">Pregled profila</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moji Oglasi</CardTitle>
            <CardDescription>
              Kreirajte i upravljajte svojim oglasima
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="min-h-[44px]">
                <Link href="/dashboard/listings">Pregled oglasa</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-[44px]">
                <Link href="/dashboard/listings/new">Kreiraj novi oglas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Poruke</CardTitle>
            <CardDescription>Pregledajte svoje poruke</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-[44px] w-full sm:w-auto">
              <Link href="/dashboard/messages">Pregled poruka</Link>
            </Button>
          </CardContent>
        </Card>

        {showVerifiedSection && (
          <Card className="border-[#D4AF37]/30 bg-[#D4AF37]/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                {hasApplication ? (
                  <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
                ) : (
                  <Shield className="h-5 w-5 text-[#D4AF37]" />
                )}
                <CardTitle>Verified Prodavac</CardTitle>
              </div>
              <CardDescription>
                {hasApplication
                  ? "Vaša prijava je u obradi"
                  : "Istaknite svoje oglase sa verified badge-om"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {hasApplication
                    ? "Naš tim proverava vašu prijavu. Dobijate trust badge, javnu profil stranicu i prioritetnu podršku."
                    : "Otvorite verified profil i dobijte trust badge, javnu profil stranicu i prioritetnu podršku."}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-[44px] w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900"
                >
                  <Link href="/sell/verified">
                    {hasApplication ? "Pregled prijave" : "Prijavi prodavnicu"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isVerified && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <CardTitle>Verified Prodavac</CardTitle>
              </div>
              <CardDescription>Vaš verified status je aktivan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Čestitamo! Imate verified badge i javnu profil stranicu. Vaši oglasi su istaknuti sa
                trust badge-om.
              </p>
              <Button asChild variant="outline" className="min-h-[44px] w-full">
                <Link href="/dashboard/profile">Upravljaj profilom</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

