import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">404</CardTitle>
          <CardDescription className="text-center text-lg">
            Stranica nije pronađena
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Stranica koju tražite ne postoji ili je uklonjena.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/">Početna</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/listings">Oglasi</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

