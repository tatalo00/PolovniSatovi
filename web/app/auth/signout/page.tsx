"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function SignOutPage() {
  const [status, setStatus] = useState<"pending" | "done" | "error">("pending");

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        await signOut({ redirect: false });
        if (isMounted) {
          setStatus("done");
        }
      } catch {
        if (isMounted) {
          setStatus("error");
        }
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {status === "pending" && "Odjava je u toku"}
            {status === "done" && "Uspešno ste odjavljeni"}
            {status === "error" && "Odjava nije uspela"}
          </h1>
          <p className="text-muted-foreground">
            {status === "pending" && "Molimo sačekajte trenutak."}
            {status === "done" && "Možete nastaviti da pregledate oglase ili se ponovo prijaviti."}
            {status === "error" && "Pokušajte ponovo ili se prijavite kasnije."}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Prijavi se ponovo</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Nazad na početnu</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
