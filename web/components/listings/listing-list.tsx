"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/currency/price-display";
import { Edit, Trash2, Eye, Send } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ListingListProps {
  listings: any[];
  showActions?: boolean;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Nacrt",
  PENDING: "Čeka odobrenje",
  APPROVED: "Odobren",
  REJECTED: "Odbijen",
  ARCHIVED: "Arhiviran",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
  ARCHIVED: "bg-gray-400",
};

export function ListingList({ listings, showActions = false }: ListingListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setListingToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;

    setDeletingId(listingToDelete);
    try {
      const response = await fetch(`/api/listings/${listingToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success("Oglas je obrisan");
      router.refresh();
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setDeletingId(null);
      setListingToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nemate još nijedan oglas.{" "}
            <Link href="/dashboard/listings/new" className="text-primary hover:underline">
              Kreirajte prvi oglas
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Card key={listing.id} className="flex flex-col">
          <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
            {listing.photos && listing.photos.length > 0 ? (
              <Image
                src={listing.photos[0].url}
                alt={listing.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <span className="text-muted-foreground">Nema slike</span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge
                className={statusColors[listing.status] || "bg-gray-500"}
              >
                {statusLabels[listing.status] || listing.status}
              </Badge>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
            <CardDescription>
              {listing.brand} {listing.model}
              {listing.reference && ` • ${listing.reference}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                <PriceDisplay amountEurCents={listing.priceEurCents} />
              </div>
              {listing.condition && (
                <div className="text-sm text-muted-foreground">
                  Stanje: {listing.condition}
                </div>
              )}
              {listing.year && (
                <div className="text-sm text-muted-foreground">
                  Godina: {listing.year}
                </div>
              )}
            </div>
          </CardContent>
          {showActions && (
            <div className="border-t p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link href={`/listing/${listing.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Pregled
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Izmeni
                  </Link>
                </Button>
                {listing.status === "DRAFT" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/listings/${listing.id}/submit`, {
                          method: "POST",
                        });
                        if (res.ok) {
                          toast.success("Oglas je poslat na odobrenje!");
                          router.refresh();
                        } else {
                          const error = await res.json();
                          toast.error(error.error || "Greška pri slanju oglasa");
                        }
                      } catch (error) {
                        toast.error("Greška pri slanju oglasa");
                      }
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Pošalji
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(listing.id)}
                  disabled={deletingId === listing.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Obriši oglas"
        description="Da li ste sigurni da želite da obrišete ovaj oglas? Ova akcija se ne može poništiti."
        confirmText="Obriši"
        cancelText="Otkaži"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deletingId !== null}
      />
    </div>
  );
}

