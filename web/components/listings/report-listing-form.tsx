"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag } from "lucide-react";

interface ReportListingFormProps {
  listingId: string;
  listingTitle: string;
}

export function ReportListingForm({ listingId, listingTitle }: ReportListingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Molimo unesite razlog prijave");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Došlo je do greške");
        return;
      }

      toast.success("Oglas je uspešno prijavljen. Hvala vam!");
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (error) {
      console.error("Error reporting listing:", error);
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[36px] text-xs sm:text-sm">
          <Flag className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Prijavi oglas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prijavite oglas</DialogTitle>
          <DialogDescription>
            Prijavite oglas &quot;{listingTitle}&quot; ako smatrate da krši naša pravila ili standarde.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Razlog prijave *</Label>
              <Textarea
                id="reason"
                placeholder="Molimo opišite razlog prijave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={loading || !reason.trim()}>
              {loading ? "Slanje..." : "Prijavi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

