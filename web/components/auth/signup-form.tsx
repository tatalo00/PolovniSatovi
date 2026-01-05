"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PasswordStrength } from "./password-strength";
import { cn } from "@/lib/utils";
import { emailSchema, nameSchema } from "@/lib/validation";

interface SignUpFormProps {
  className?: string;
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-6 w-6 shrink-0"
    >
      <path
        fill="#EA4335"
        d="M24 20.2v7.6h10.7c-.5 2.5-2.9 7.3-10.7 7.3-6.4 0-11.7-5.3-11.7-11.8S17.6 11.5 24 11.5c3.6 0 6 1.6 7.4 2.9l5-4.8C33.2 6.6 29 5 24 5 14.6 5 7 12.6 7 22s7.6 17 17 17c9.8 0 16.3-6.9 16.3-16.6 0-1.1-.1-1.9-.3-2.7H24z"
      />
      <path
        fill="#34A853"
        d="M24 39c4.5 0 8.3-1.5 11-4l-5.3-4.1c-1.4 1-3.3 1.7-5.7 1.7-4.4 0-8.1-3-9.4-7.1l-6 4.6C11.9 35.1 17.5 39 24 39z"
      />
      <path
        fill="#FBBC05"
        d="M14.6 25.6c-.3-.9-.5-1.9-.5-3s.2-2.1.5-3l-6-4.6C7.6 17 7 19.4 7 22s.6 5 1.6 7.1l6-4.5z"
      />
      <path
        fill="#4285F4"
        d="M24 11.5c2.5 0 4.7.9 6.4 2.6l4.8-4.7C32.9 6.6 29 5 24 5c-6.5 0-12.1 3.9-14.7 9.6l6 4.6c1.3-4.1 5-7.7 8.7-7.7z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="currentColor"
    >
      <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18 4.4 22.9 10.1 24v-8.4H7.1v-3.5h3v-2.7c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3H16c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5H14V24C19.6 22.9 24 18 24 12.1z" />
    </svg>
  );
}

export function SignUpForm({ className }: SignUpFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") ?? null;
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<"google" | "facebook" | null>(null);

  const isBusy = loading || providerLoading !== null;

  const handleProviderSignIn = async (provider: "google" | "facebook") => {
    setError("");
    setProviderLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: redirectTo ?? "/dashboard/profile",
      });
    } catch (err) {
      setError("Došlo je do greške. Pokušajte ponovo.");
      setProviderLoading(null);
    }
  };

  const handleDetailsNext = () => {
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Unesite ime i prezime");
      return;
    }

    const nameValidation = nameSchema.safeParse(trimmedName);
    if (!nameValidation.success) {
      setError(nameValidation.error.issues[0]?.message ?? "Neispravno ime");
      return;
    }

    const emailValidation = emailSchema.safeParse(trimmedEmail);
    if (!emailValidation.success) {
      setError(emailValidation.error.issues[0]?.message ?? "Neispravan email");
      return;
    }

    setStep(2);
  };

  const getPasswordError = (value: string) => {
    if (value.length < 8) {
      return "Šifra mora imati najmanje 8 karaktera";
    }
    if (!/[a-z]/.test(value)) {
      return "Šifra mora sadržati najmanje jedno malo slovo";
    }
    if (!/[A-Z]/.test(value)) {
      return "Šifra mora sadržati najmanje jedno veliko slovo";
    }
    if (!/[0-9]/.test(value)) {
      return "Šifra mora sadržati najmanje jedan broj";
    }
    return "";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 0) {
      return;
    }

    if (step === 1) {
      handleDetailsNext();
      return;
    }

    if (password !== confirmPassword) {
      setError("Šifre se ne poklapaju");
      return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Došlo je do greške. Pokušajte ponovo.");
      } else {
        // If redirect is specified, go to signin with redirect param
        // After signin, user will be redirected to the original destination
        const destination = redirectTo
          ? `/auth/signin?registered=true&redirect=${encodeURIComponent(redirectTo)}`
          : `/auth/signin?registered=true&redirect=${encodeURIComponent("/dashboard/profile")}`;
        router.push(destination);
      }
    } catch (err) {
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitle = step === 0 ? "Kreirajte nalog" : step === 1 ? "Unesite osnovne podatke" : "Kreirajte šifru";
  const stepDescription = step === 0
    ? "Izaberite način registracije"
    : `Korak ${step} od 2`;
  const progressValue = step === 1 ? 50 : step === 2 ? 100 : 0;

  return (
    <Card
      className={cn(
        "border-white/15 bg-white/85 text-neutral-900 shadow-[0_30px_65px_-35px_rgba(0,0,0,0.65)] backdrop-blur-2xl",
        className
      )}
    >
      <CardHeader className="px-4 sm:px-6 md:px-8 pb-0">
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          {stepTitle}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-neutral-600">
          {stepDescription}
        </CardDescription>
        {step > 0 && (
          <div className="pt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      {step === 0 ? (
        <>
          <CardContent className="space-y-4 px-4 sm:px-6 md:px-8 pt-6">
            {error && (
              <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 min-h-[44px] w-full rounded-xl border-neutral-200 bg-white text-base text-neutral-900 shadow-sm hover:border-neutral-300 hover:bg-neutral-50"
                onClick={() => handleProviderSignIn("google")}
                disabled={isBusy}
              >
                <span className="flex items-center gap-3">
                  <GoogleIcon />
                  <span className="leading-none">
                    {providerLoading === "google" ? "Povezivanje..." : "Nastavi sa Google nalogom"}
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 min-h-[44px] w-full rounded-xl border-transparent bg-[#1877F2] text-base font-semibold text-white shadow-sm hover:bg-[#1666d2]"
                onClick={() => handleProviderSignIn("facebook")}
                disabled={isBusy}
              >
                <span className="flex items-center gap-3">
                  <FacebookIcon />
                  <span className="leading-none">
                    {providerLoading === "facebook" ? "Povezivanje..." : "Nastavi sa Facebook nalogom"}
                  </span>
                </span>
              </Button>
            </div>
            <div className="relative py-2">
              <div className="h-px w-full bg-neutral-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-neutral-500">
                ili
              </span>
            </div>
            <Button
              type="button"
              className="h-12 min-h-[44px] w-full rounded-xl bg-[#D4AF37] text-base font-semibold text-neutral-900 transition hover:bg-[#b6932c] disabled:cursor-not-allowed"
              onClick={() => {
                setError("");
                setStep(1);
              }}
              disabled={isBusy}
            >
              Nastavi sa email-om
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-4">
            <p className="text-center text-sm text-neutral-600">
              Već imate nalog?{" "}
              <Link href="/auth/signin" className="text-[#D4AF37] underline-offset-4 hover:underline">
                Prijavite se
              </Link>
            </p>
          </CardFooter>
        </>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-0">
          <CardContent className="space-y-4 px-4 sm:px-6 md:px-8 pt-6">
            {error && (
              <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-800">
                    Ime i prezime
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    inputMode="text"
                    autoComplete="name"
                    placeholder="Vaše ime i prezime"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isBusy}
                    className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-800">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="vas@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isBusy}
                    className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-neutral-800">
                    Šifra
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isBusy}
                    minLength={8}
                    className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <PasswordStrength password={password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-800">
                    Ponovljena šifra
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isBusy}
                    className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-12 min-h-[44px] w-full rounded-xl sm:flex-1"
                onClick={() => {
                  setError("");
                  setStep(step === 1 ? 0 : 1);
                }}
                disabled={isBusy}
              >
                Nazad
              </Button>
              <Button
                type="submit"
                className="h-12 min-h-[44px] w-full rounded-xl bg-[#D4AF37] text-base font-semibold text-neutral-900 transition hover:bg-[#b6932c] disabled:cursor-not-allowed sm:flex-1"
                disabled={isBusy}
              >
                {loading ? "Registracija..." : step === 1 ? "Nastavi" : "Registrujte se"}
              </Button>
            </div>
            <p className="text-center text-sm text-neutral-600">
              Već imate nalog?{" "}
              <Link href="/auth/signin" className="text-[#D4AF37] underline-offset-4 hover:underline">
                Prijavite se
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
