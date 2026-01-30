import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SellerProfileForm } from "@/components/seller/profile-form";

export const metadata = {
  title: "Prodavac Profil",
  description: "Upravljajte svojim prodavac profilom",
};

export default async function SellerProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prodavac Profil</h1>
        <p className="text-muted-foreground mt-2">
          Kreirajte ili ažurirajte svoj prodavac profil da biste mogli da objavljujete oglase
        </p>
      </div>

      <SellerProfileForm />
    </div>
  );
}

