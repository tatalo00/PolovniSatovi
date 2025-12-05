import Link from "next/link";
import { Suspense } from "react";
import { Shield } from "lucide-react";

import { SignUpForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Registracija",
  description: "Kreirajte novi nalog",
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Registracija</h1>
          <p className="mb-8 text-muted-foreground">
            Kreirajte novi nalog da biste počeli da koristite PolovniSatovi
          </p>
        </div>
        <Suspense fallback={<div>Učitavanje...</div>}>
          <SignUpFormWrapper searchParams={searchParams} />
        </Suspense>
        
        <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-lg font-semibold tracking-tight">Zvanični ste prodavac?</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Otvorite profil verifikovanog prodavca i istaknite svoje oglase. Dobijate trust ikonicu, javnu profil
              stranicu i prioritetnu podršku od admin tima.
            </p>
            <Button asChild variant="outline" size="sm" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900">
              <Link href="/sell/verified">Prijavi prodavnicu</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

async function SignUpFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const isFromVerified = params.redirect === "/sell/verified";

  return (
    <>
      {isFromVerified && (
        <div className="mb-6 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4 text-sm text-foreground">
          <p className="font-semibold">Prijava za verified prodavca</p>
          <p className="mt-1 text-muted-foreground">
            Nakon registracije, bićete automatski vraćeni na stranicu za prijavu verified prodavca.
          </p>
        </div>
      )}
      <SignUpForm />
    </>
  );
}

