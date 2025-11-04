"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Greška sistema</h1>
            <p className="text-muted-foreground mb-6">
              Došlo je do kritične greške. Molimo pokušajte ponovo.
            </p>
            <button
              onClick={reset}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

