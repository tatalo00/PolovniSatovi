"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface SignUpFormProps {
  className?: string;
}

export function SignUpForm({ className }: SignUpFormProps = {}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Šifre se ne poklapaju");
      return;
    }

    if (password.length < 8) {
      setError("Šifra mora imati najmanje 8 karaktera");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email,
          password,
          country: country.trim(),
          city: city.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Došlo je do greške. Pokušajte ponovo.");
      } else {
        router.push("/auth/signin?registered=true");
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
      <CardHeader className="px-8 pb-0">
        <CardTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
          Kreirajte nalog
        </CardTitle>
        <CardDescription className="text-sm text-neutral-600">
          Unesite svoje podatke za registraciju
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-0">
        <CardContent className="space-y-4 px-8 pt-6">
          {error && (
            <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-neutral-800">
                Ime
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Vaše ime"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-neutral-800">
                Prezime
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Vaše prezime"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-neutral-800">
                Država
              </Label>
              <Input
                id="country"
                type="text"
                placeholder="Država"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-neutral-800">
                Grad
              </Label>
              <Input
                id="city"
                type="text"
                placeholder="Grad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={loading}
                className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-neutral-800">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vas@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-neutral-800">
              Šifra
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
              className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="h-12 rounded-xl border-neutral-200 bg-white/90 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-6">
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#D4AF37] text-base font-semibold text-neutral-900 transition hover:bg-[#b6932c] disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Registracija..." : "Registrujte se"}
          </Button>
          <p className="text-center text-sm text-neutral-600">
            Već imate nalog?{" "}
            <Link href="/auth/signin" className="text-[#D4AF37] underline-offset-4 hover:underline">
              Prijavite se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

