"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error tracking service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Greška</CardTitle>
          <CardDescription className="text-center">
            Došlo je do neočekivane greške
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm font-mono text-destructive">
                {error.message}
              </p>
            </div>
          )}
          <p className="text-center text-muted-foreground">
            Molimo pokušajte ponovo ili kontaktirajte podršku ako se problem nastavi.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset}>Pokušaj ponovo</Button>
            <Button asChild variant="outline">
              <Link href="/">Početna</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

