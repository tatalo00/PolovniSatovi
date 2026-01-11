import Link from "next/link";

import { Button } from "@/components/ui/button";

const errorMessages: Record<string, { title: string; description: string }> = {
  OAuthSignin: {
    title: "Prijava nije uspela",
    description: "Došlo je do problema pri povezivanju sa provajderom. Pokušajte ponovo.",
  },
  OAuthCallback: {
    title: "Neuspešan povratni poziv",
    description: "Provajder je vratio nevažeći odgovor. Pokušajte ponovo.",
  },
  OAuthCreateAccount: {
    title: "Kreiranje naloga nije uspelo",
    description: "Nalog nije moguće kreirati pomoću provajdera. Kontaktirajte podršku.",
  },
  OAuthAccountNotLinked: {
    title: "Nalog je već povezan",
    description: "Nalog je povezan sa drugim načinom prijave. Prijavite se pomoću postojećeg naloga.",
  },
  AccessDenied: {
    title: "Pristup odbijen",
    description: "Nemate dozvolu da pristupite ovom nalogu.",
  },
  Configuration: {
    title: "Greška u konfiguraciji",
    description: "Proverite konfiguraciju autentifikacije i pokušajte ponovo.",
  },
  Default: {
    title: "Došlo je do greške",
    description: "Pokušajte ponovo ili kontaktirajte podršku.",
  },
};

export const metadata = {
  title: "Greška pri prijavi",
  description: "Došlo je do greške u procesu prijave",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const errorKey = resolvedParams?.error ?? "Default";
  const message = errorMessages[errorKey] ?? errorMessages.Default;

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{message.title}</h1>
          <p className="text-muted-foreground">{message.description}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Vrati se na prijavu</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Nazad na početnu</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
