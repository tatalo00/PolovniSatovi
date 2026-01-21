import Link from "next/link";

import { Button } from "@/components/ui/button";

const errorMessages: Record<string, { title: string; description: string; showEmailLogin?: boolean }> = {
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
    title: "Nalog već postoji",
    description: "Već imate nalog sa ovom email adresom. Prijavite se pomoću email-a i šifre koju ste koristili pri registraciji.",
    showEmailLogin: true,
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
  searchParams?: Promise<{ error?: string; email?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const errorKey = resolvedParams?.error ?? "Default";
  const email = resolvedParams?.email;
  const message = errorMessages[errorKey] ?? errorMessages.Default;

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{message.title}</h1>
          <p className="text-muted-foreground">{message.description}</p>
          {email && message.showEmailLogin && (
            <p className="text-sm text-muted-foreground">
              Email: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {message.showEmailLogin ? (
            <>
              <Button asChild className="w-full">
                <Link href="/auth/signin">Prijavi se sa email-om i šifrom</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/forgot-password">Zaboravili ste šifru?</Link>
              </Button>
            </>
          ) : (
            <Button asChild className="w-full">
              <Link href="/auth/signin">Vrati se na prijavu</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Nazad na početnu</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
