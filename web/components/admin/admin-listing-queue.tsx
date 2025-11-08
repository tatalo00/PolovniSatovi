"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AdminListingQueueProps {
  listings: any[];
  currentStatus: string;
}

export function AdminListingQueue({ listings, currentStatus }: AdminListingQueueProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [listingToApprove, setListingToApprove] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [listingToReject, setListingToReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleApproveClick = (listingId: string) => {
    setListingToApprove(listingId);
    setApproveConfirmOpen(true);
  };

  const handleApprove = async () => {
    if (!listingToApprove) return;

    setProcessing(listingToApprove);
    try {
      const response = await fetch(`/api/admin/listings/${listingToApprove}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success("Oglas je odobren!");
      router.refresh();
      setApproveConfirmOpen(false);
      setListingToApprove(null);
    } catch (error) {
      console.error("Error approving listing:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (listingId: string) => {
    setListingToReject(listingId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!listingToReject) return;

    setProcessing(listingToReject);
    try {
      const response = await fetch(`/api/admin/listings/${listingToReject}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success("Oglas je odbijen!");
      router.refresh();
      setRejectDialogOpen(false);
      setListingToReject(null);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting listing:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setProcessing(null);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    router.push(`/admin/listings?status=${status}`, { scroll: false });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Čeka odobrenje</SelectItem>
            <SelectItem value="APPROVED">Odobreni</SelectItem>
            <SelectItem value="REJECTED">Odbijeni</SelectItem>
            <SelectItem value="DRAFT">Nacrti</SelectItem>
            <SelectItem value="SOLD">Prodati</SelectItem>
            <SelectItem value="ARCHIVED">Arhivirani</SelectItem>
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
                    {selectedStatus === "PENDING" && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveClick(listing.id)}
                          disabled={processing === listing.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Odobri
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(listing.id)}
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
                          <Link href={`/admin/listings/${listing.id}`}>
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
      <ConfirmDialog
        open={approveConfirmOpen}
        onOpenChange={setApproveConfirmOpen}
        title="Odobri oglas"
        description="Da li ste sigurni da želite da odobrite ovaj oglas?"
        confirmText="Odobri"
        cancelText="Otkaži"
        onConfirm={handleApprove}
        loading={listingToApprove !== null && processing === listingToApprove}
      />
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odbij oglas</DialogTitle>
            <DialogDescription>
              Unesite razlog odbijanja (opciono). Razlog će biti poslat prodavcu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Razlog odbijanja</Label>
              <Textarea
                id="rejectReason"
                placeholder="Opišite razlog odbijanja oglasa..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                disabled={listingToReject !== null && processing === listingToReject}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={listingToReject !== null && processing === listingToReject}
            >
              Otkaži
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={listingToReject !== null && processing === listingToReject}
            >
              {listingToReject !== null && processing === listingToReject ? "Odbijanje..." : "Odbij"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

