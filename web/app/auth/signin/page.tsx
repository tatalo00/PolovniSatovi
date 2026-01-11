import { SignInForm } from "@/components/auth/signin-form";

export const metadata = {
  title: "Prijava",
  description: "Prijavite se na svoj nalog",
};

export default function SignInPage() {
  const enableGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const enableFacebook = Boolean(
    process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
  );

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Prijava</h1>
        <p className="mb-8 text-muted-foreground">
          Unesite svoje podatke da biste se prijavili
        </p>
        <SignInForm enableGoogle={enableGoogle} enableFacebook={enableFacebook} />
      </div>
    </main>
  );
}
