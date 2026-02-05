"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ForgotPasswordLink } from "./forgot-password-link";
import { cn } from "@/lib/utils";

interface SignInFormProps {
  className?: string;
  enableGoogle?: boolean;
  enableFacebook?: boolean;
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

export function SignInForm({
  className,
  enableGoogle = false,
  enableFacebook = false,
}: SignInFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") ?? null;
  const registered = searchParams?.get("registered") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<"google" | "facebook" | null>(null);

  const hasProvider = enableGoogle || enableFacebook;
  const isBusy = loading || providerLoading !== null;

  const handleProviderSignIn = async (provider: "google" | "facebook") => {
    if ((provider === "google" && !enableGoogle) || (provider === "facebook" && !enableFacebook)) {
      setError("Prijava putem izabranog provajdera trenutno nije dostupna.");
      return;
    }
    setError("");
    setProviderLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: redirectTo || "/dashboard",
      });
    } catch (err) {
      setError("Došlo je do greške. Pokušajte ponovo.");
      setProviderLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Neispravni podaci za prijavu");
      } else {
        // Redirect to specified destination or default to dashboard
        const destination = redirectTo || "/dashboard";
        router.push(destination);
        router.refresh();
      }
    } catch (err) {
      setError("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "border-white/15 bg-white/85 text-neutral-900 shadow-[0_30px_65px_-35px_rgba(0,0,0,0.65)] backdrop-blur-2xl",
        className
      )}
    >
      <CardHeader className="px-4 sm:px-6 md:px-8 pb-0">
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          Prijavite se
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-neutral-600">
          Unesite svoje podatke za prijavu
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-0">
        <CardContent className="space-y-4 px-4 sm:px-6 md:px-8 pt-6">
          {registered && (
            <div className="rounded-lg bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
              Nalog je uspešno kreiran! Prijavite se da biste nastavili.
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {hasProvider && (
            <>
              <div className="grid gap-3">
                {enableGoogle && (
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
                        {providerLoading === "google"
                          ? "Povezivanje..."
                          : "Nastavi sa Google nalogom"}
                      </span>
                    </span>
                  </Button>
                )}
                {enableFacebook && (
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
                        {providerLoading === "facebook"
                          ? "Povezivanje..."
                          : "Nastavi sa Facebook nalogom"}
                      </span>
                    </span>
                  </Button>
                )}
              </div>
              <div className="relative py-2">
                <div className="h-px w-full bg-neutral-200" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-neutral-500">
                  ili
                </span>
              </div>
            </>
          )}
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
              className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-800">
                Šifra
              </Label>
              <ForgotPasswordLink />
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isBusy}
              className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
          <Button
            type="submit"
            className="h-12 min-h-[44px] w-full rounded-xl bg-[#D4AF37] text-base font-semibold text-neutral-900 transition hover:bg-[#b6932c] disabled:cursor-not-allowed"
            disabled={isBusy}
          >
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </Button>
          <p className="text-center text-sm text-neutral-600">
            Nemate nalog?{" "}
            <Link href="/auth/signup" className="text-[#D4AF37] underline-offset-4 hover:underline">
              Registrujte se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
