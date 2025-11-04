import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Registracija",
  description: "Kreirajte novi nalog",
};

export default function SignUpPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Registracija</h1>
        <p className="mb-8 text-muted-foreground">
          Kreirajte novi nalog da biste počeli da koristite PolovniSatovi
        </p>
        <SignUpForm />
      </div>
    </main>
  );
}

