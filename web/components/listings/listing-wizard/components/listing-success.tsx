"use client";

import Link from "next/link";
import { CheckCircle2, Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ListingSuccessProps {
  listingTitle: string;
}

export function ListingSuccess({ listingTitle }: ListingSuccessProps) {
  return (
    <Card className="border-border/70">
      <CardContent className="py-12">
        <div className="text-center space-y-6">
          {/* Success icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          {/* Success message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Oglas je uspešno kreiran!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Vaš oglas &quot;{listingTitle}&quot; je poslat na pregled. Obično odobravamo oglase u roku od 24 sata.
            </p>
          </div>

          {/* What happens next */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-medium text-muted-foreground">Šta dalje?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 max-w-sm mx-auto text-left">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Proverićemo vaš oglas da li ispunjava naše smernice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Dobićete email obaveštenje kada oglas bude odobren</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Odobren oglas će biti vidljiv svim kupcima</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild>
              <Link href="/dashboard/listings/new">
                <Plus className="mr-2 h-4 w-4" />
                Kreiraj još jedan oglas
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/listings">
                <List className="mr-2 h-4 w-4" />
                Pregled mojih oglasa
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
