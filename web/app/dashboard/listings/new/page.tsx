import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListingForm } from "@/components/listings/listing-form";
import { Plus, Watch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Novi Oglas",
  description: "Kreirajte novi oglas za sat",
};

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-amber-50/40 ring-1 ring-[#D4AF37]/20">
                  <Watch className="h-6 w-6 text-[#D4AF37]" aria-hidden />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                    Kreiraj Novi Oglas
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Popunite informacije o satu koji prodajete
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <Link href="/dashboard/listings">
                  Nazad na oglase
                </Link>
              </Button>
            </div>

            {/* Info Banner */}
            <div className="rounded-lg border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/5 via-amber-50/30 to-[#D4AF37]/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20">
                  <Plus className="h-3 w-3 text-[#D4AF37]" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Savet za najbolji oglas
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Popunite osnovne informacije (označene sa *) za brzo kreiranje. Dodatna polja su opciona i pomažu kupcima da pronađu vaš sat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="relative">
            <ListingForm />
          </div>
        </div>
      </div>
    </main>
  );
}

