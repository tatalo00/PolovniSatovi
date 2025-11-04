import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Zaboravljena šifra",
  description: "Resetujte svoju šifru",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Zaboravljena šifra</CardTitle>
          <CardDescription className="text-center">
            Unesite vaš email adresu i poslaćemo vam link za resetovanje šifre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
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

