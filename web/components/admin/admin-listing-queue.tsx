"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { PriceDisplay } from "@/components/currency/price-display";

interface AdminListingQueueProps {
  listings: any[];
  currentStatus: string;
}

export function AdminListingQueue({ listings, currentStatus }: AdminListingQueueProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);


  const handleApprove = async (listingId: string) => {
    if (!confirm("Da li ste sigurni da želite da odobrite ovaj oglas?")) {
      return;
    }

    setProcessing(listingId);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Došlo je do greške");
        return;
      }

      router.refresh();
      alert("Oglas je odobren!");
    } catch (error) {
      console.error("Error approving listing:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (listingId: string) => {
    const reason = prompt("Unesite razlog odbijanja (opciono):");
    if (reason === null) return; // User cancelled

    setProcessing(listingId);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Došlo je do greške");
        return;
      }

      router.refresh();
      alert("Oglas je odbijen!");
    } catch (error) {
      console.error("Error rejecting listing:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setProcessing(null);
    }
  };

  const handleStatusChange = (status: string) => {
    router.push(`/admin/listings?status=${status}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Čeka odobrenje</SelectItem>
            <SelectItem value="APPROVED">Odobreni</SelectItem>
            <SelectItem value="REJECTED">Odbijeni</SelectItem>
            <SelectItem value="DRAFT">Nacrti</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nema oglasa sa ovim statusom
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Photo */}
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border">
                    {listing.photos && listing.photos.length > 0 ? (
                      <Image
                        src={listing.photos[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">Nema slike</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/listing/${listing.id}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {listing.brand} {listing.model}
                          {listing.reference && ` • ${listing.reference}`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          <span className="font-medium">
                            <PriceDisplay amountEurCents={listing.priceEurCents} />
                          </span>
                          {listing.condition && <span>Stanje: {listing.condition}</span>}
                          {listing.year && <span>Godina: {listing.year}</span>}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>
                            Prodavac: {listing.seller.name || listing.seller.email}
                          </p>
                          <p>
                            Kreiran: {new Date(listing.createdAt).toLocaleDateString("sr-RS")}
                          </p>
                        </div>
                        {listing.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {listing.description}
                          </p>
                        )}
                      </div>

                      <Badge className="ml-4">
                        {listing.status === "PENDING" && "Čeka odobrenje"}
                        {listing.status === "APPROVED" && "Odobren"}
                        {listing.status === "REJECTED" && "Odbijen"}
                        {listing.status === "DRAFT" && "Nacrt"}
                      </Badge>
                    </div>

                    {/* Actions */}
                    {currentStatus === "PENDING" && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(listing.id)}
                          disabled={processing === listing.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Odobri
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(listing.id)}
                          disabled={processing === listing.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Odbij
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/listing/${listing.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Pregled
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

