"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/currency/price-display";
import { Edit, Trash2, Eye, Send, CheckCircle2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

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
  SOLD: "Prodat",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
  ARCHIVED: "bg-gray-400",
  SOLD: "bg-rose-500",
};

export function ListingList({ listings, showActions = false }: ListingListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

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

  const handleToggleSold = async (listingId: string, nextStatus: "APPROVED" | "SOLD") => {
    setStatusUpdatingId(listingId);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success(
        nextStatus === "SOLD"
          ? "Oglas je označen kao prodat"
          : "Oglas je ponovo aktiviran"
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (listings.length === 0) {
    return (
      <EmptyState
        iconType="listings"
        title="Nemate još nijedan oglas"
        description="Kreirajte svoj prvi oglas i počnite da prodajete satove na našoj platformi."
        action={{
          label: "Kreiraj prvi oglas",
          href: "/dashboard/listings/new",
        }}
      />
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
                {(listing.status === "APPROVED" || listing.status === "SOLD") && (
                  <Button
                    variant={listing.status === "SOLD" ? "outline" : "secondary"}
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      handleToggleSold(
                        listing.id,
                        listing.status === "SOLD" ? "APPROVED" : "SOLD"
                      )
                    }
                    disabled={statusUpdatingId === listing.id}
                  >
                    {listing.status === "SOLD" ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Vrati aktivan
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Označi kao prodat
                      </>
                    )}
                  </Button>
                )}
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
                  disabled={deletingId === listing.id || statusUpdatingId === listing.id}
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

