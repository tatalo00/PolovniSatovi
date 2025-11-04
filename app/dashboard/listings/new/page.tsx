import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListingForm } from "@/components/listings/listing-form";

export const metadata = {
  title: "Novi Oglas",
  description: "Kreirajte novi oglas za sat",
};

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Any authenticated user can create listings

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Kreiraj Novi Oglas</h1>
          <p className="text-muted-foreground mt-2">
            Popunite informacije o satu koji prodajete
          </p>
        </div>

        <ListingForm />
      </div>
    </main>
  );
}

