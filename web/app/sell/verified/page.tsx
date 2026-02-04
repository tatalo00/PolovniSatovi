import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { SellerVerifiedWizard } from "@/components/seller/verified-wizard";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = {
  title: "Verified prodavci",
  description: "Prijava za verified prodavce na platformi PolovniSatovi",
};

export default async function VerifiedSellerPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const application = userId
    ? await prisma.sellerApplication.findUnique({
        where: { userId },
        select: {
          id: true,
          status: true,
          sellerType: true,
          storeName: true,
          shortDescription: true,
          locationCountry: true,
          locationCity: true,
          instagramHandle: true,
          proofUrl: true,
          updatedAt: true,
        },
      })
    : null;

  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { label: "Prodaj sat", href: "/sell" },
          { label: "Verifikacija" },
        ]}
        className="mb-6"
      />
      <section className="rounded-3xl bg-neutral-950 px-6 py-8 text-white sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
          Verified prodavci
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Izgradite poverenje sa kupcima na jednom mestu
            </h1>
            <p className="text-base text-white/80 sm:text-lg">
              Verified prodavci dobijaju badge poverenja u oglasima, javnu profil stranicu i direktan
              kontakt sa timom za podršku. Prijava traje svega nekoliko minuta.
            </p>
            <ul className="text-sm text-white/80">
              <li>• Javni profil sa svim aktivnim oglasima</li>
              <li>• Trust badge u listingu i na stranici oglasa</li>
              <li>• Prioritetna podrška i vidljivost</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            <p className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur">
              „Naš cilj je zajednica zasnovana na integritetu i transparentnosti. Verified status vam
              otvara vrata ka većem poverenju kupaca.” — Tim PolovniSatovi
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        {userId ? (
          <SellerVerifiedWizard
            initialApplication={
              application
                ? {
                    id: application.id,
                    status: application.status as any,
                    sellerType: application.sellerType as any,
                    storeName: application.storeName,
                    shortDescription: application.shortDescription,
                    locationCountry: application.locationCountry,
                    locationCity: application.locationCity,
                    instagramHandle: application.instagramHandle || "",
                    proofUrl: application.proofUrl || "",
                    updatedAt: application.updatedAt.toISOString(),
                  }
                : null
            }
          />
        ) : (
          <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center sm:px-10">
            <h2 className="text-2xl font-semibold tracking-tight">Kreirajte nalog da biste nastavili</h2>
            <p className="mt-3 text-base text-muted-foreground">
              Potreban je nalog kako biste popunili prijavu za verified prodavca. Registracija traje
              samo nekoliko minuta.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/signup?redirect=/sell/verified">Kreiraj nalog</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Već imate nalog?{" "}
                <Link href="/auth/signin?redirect=/sell/verified" className="font-medium text-foreground underline underline-offset-4">
                  Prijavite se
                </Link>
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

