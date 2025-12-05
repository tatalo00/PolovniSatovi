"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define enum locally to avoid importing from @prisma/client in client components
enum SellerApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldX, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";

type ApplicationWithUser = {
  id: string;
  sellerType: string;
  storeName: string;
  shortDescription: string;
  locationCountry: string;
  locationCity: string;
  instagramHandle: string | null;
  proofUrl: string | null;
  status: SellerApplicationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    isVerified: boolean;
    locationCity: string | null;
    locationCountry: string | null;
    createdAt: Date;
  };
};

interface AdminVerificationsListProps {
  applications: ApplicationWithUser[];
  currentStatus: SellerApplicationStatus;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

const STATUS_TABS = [
  { value: SellerApplicationStatus.PENDING, label: "Na čekanju", count: "pendingCount" },
  { value: SellerApplicationStatus.APPROVED, label: "Odobrene", count: "approvedCount" },
  { value: SellerApplicationStatus.REJECTED, label: "Odbijene", count: "rejectedCount" },
] as const;

export function AdminVerificationsList({
  applications,
  currentStatus,
  pendingCount,
  approvedCount,
  rejectedCount,
}: AdminVerificationsListProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const counts = {
    pendingCount,
    approvedCount,
    rejectedCount,
  };

  const handleApproveClick = (application: ApplicationWithUser) => {
    setSelectedApplication(application);
    setApproveDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    setProcessing(selectedApplication.id);
    try {
      const response = await fetch(`/api/admin/verifications/${selectedApplication.id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success("Prijava je odobrena!");
      router.refresh();
      setApproveDialogOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (application: ApplicationWithUser) => {
    setSelectedApplication(application);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    setProcessing(selectedApplication.id);
    try {
      const response = await fetch(`/api/admin/verifications/${selectedApplication.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success("Prijava je odbijena");
      router.refresh();
      setRejectDialogOpen(false);
      setSelectedApplication(null);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("sr-RS", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="flex gap-2 border-b">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab.count as keyof typeof counts];
          const isActive = currentStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/verifications?status=${tab.value}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({count})
            </Link>
          );
        })}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nema prijava sa ovim statusom</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{app.storeName}</CardTitle>
                      <Badge
                        variant={
                          app.status === SellerApplicationStatus.APPROVED
                            ? "default"
                            : app.status === SellerApplicationStatus.REJECTED
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {app.status === SellerApplicationStatus.PENDING && "Na čekanju"}
                        {app.status === SellerApplicationStatus.APPROVED && "Odobreno"}
                        {app.status === SellerApplicationStatus.REJECTED && "Odbijeno"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {app.sellerType === "OFFICIAL"
                        ? "Oficijalni butik / registrovana firma"
                        : "Nezavisni časovničar / online shop"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Korisnik</p>
                    <p className="text-sm text-muted-foreground">
                      {app.user.name || app.user.email}
                    </p>
                    <a
                      href={`mailto:${app.user.email}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <Mail className="h-3 w-3" />
                      {app.user.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Lokacija</p>
                    <p className="text-sm text-muted-foreground">
                      {app.locationCity}, {app.locationCountry}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-1">Opis</p>
                    <p className="text-sm text-muted-foreground">{app.shortDescription}</p>
                  </div>
                  {app.instagramHandle && (
                    <div>
                      <p className="text-sm font-medium mb-1">Instagram</p>
                      <a
                        href={`https://instagram.com/${app.instagramHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {app.instagramHandle}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {app.proofUrl && (
                    <div>
                      <p className="text-sm font-medium mb-1">Dokaz</p>
                      <a
                        href={app.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Pogledaj sliku
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-1">Datum prijave</p>
                    <p className="text-sm text-muted-foreground">{formatDate(app.createdAt)}</p>
                  </div>
                  {app.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium mb-1">Napomene</p>
                      <p className="text-sm text-muted-foreground">{app.notes}</p>
                    </div>
                  )}
                </div>

                {currentStatus === SellerApplicationStatus.PENDING && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleApproveClick(app)}
                      disabled={processing === app.id}
                      className="flex-1"
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Odobri
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(app)}
                      disabled={processing === app.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      <ShieldX className="h-4 w-4 mr-2" />
                      Odbij
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odobri prijavu</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da odobrite prijavu za verified prodavca? Korisnik će
              dobiti verified badge i javnu profil stranicu.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="py-4">
              <p className="text-sm font-medium">{selectedApplication.storeName}</p>
              <p className="text-sm text-muted-foreground">
                {selectedApplication.user.name || selectedApplication.user.email}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={handleApprove} disabled={!!processing}>
              {processing ? "Odobravanje..." : "Odobri"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odbij prijavu</DialogTitle>
            <DialogDescription>
              Unesite razlog za odbijanje prijave. Korisnik će biti obavešten o razlogu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedApplication && (
              <div>
                <p className="text-sm font-medium">{selectedApplication.storeName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.user.name || selectedApplication.user.email}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Razlog odbijanja</Label>
              <Textarea
                id="rejectReason"
                placeholder="Unesite razlog za odbijanje prijave..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Otkaži
            </Button>
            <Button
              onClick={handleReject}
              disabled={!!processing || !rejectReason.trim()}
              variant="destructive"
            >
              {processing ? "Odbijanje..." : "Odbij"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

