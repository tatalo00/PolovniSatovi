import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingList } from "@/components/listings/listing-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Moji Oglasi",
  description: "Upravljajte svojim oglasima",
};

export default async function MyListingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;

  // Any authenticated user can view their listings

  // Fetch user's listings
  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    include: {
      photos: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Moji Oglasi</h1>
          <p className="text-muted-foreground mt-2">
            Upravljajte svojim oglasima za satove
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Novi Oglas
          </Link>
        </Button>
      </div>

      <ListingList listings={listings} showActions={true} />
    </main>
  );
}

