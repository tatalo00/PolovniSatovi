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
}

export function SignInForm({ className }: SignInFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") ?? null;
  const registered = searchParams?.get("registered") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
              disabled={loading}
              className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
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
              disabled={loading}
              className="h-12 min-h-[44px] rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
          <Button
            type="submit"
            className="h-12 min-h-[44px] w-full rounded-xl bg-[#D4AF37] text-base font-semibold text-neutral-900 transition hover:bg-[#b6932c] disabled:cursor-not-allowed"
            disabled={loading}
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

