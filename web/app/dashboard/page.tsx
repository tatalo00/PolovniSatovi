import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;

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
      </div>
    </main>
  );
}

