import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Resetuj šifru",
  description: "Unesite novu šifru",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-destructive">Greška</CardTitle>
            <CardDescription className="text-center">
              Nedostaje token za resetovanje. Molimo zatražite novi link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Zatraži novi link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Resetuj šifru</CardTitle>
          <CardDescription className="text-center">
            Unesite novu šifru za vaš nalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} />
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/signin" className="text-primary hover:underline">
              Nazad na prijavu
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

