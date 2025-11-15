"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trackContactSeller } from "@/lib/analytics";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ContactSellerFormProps {
  listingId: string;
  listingTitle: string;
  sellerEmail: string;
  sellerId: string;
}

export function ContactSellerForm({
  listingId,
  listingTitle,
  sellerEmail,
  sellerId,
}: ContactSellerFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Check if current user is the seller
  const isSeller = session?.user?.id === sellerId;

  const handleStartConversation = async () => {
    setLoading(true);

    try {
      // Create or get existing thread
      const response = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Došlo je do greške");
      }

      const thread = await response.json();
      trackContactSeller(listingId);

      // Redirect to the thread
      router.push(`/dashboard/messages/${thread.id}`);
    } catch (error: any) {
      console.error("Error creating thread:", error);
      toast.error(error.message || "Došlo je do greške. Pokušajte ponovo.");
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Prijavite se da biste kontaktirali prodavca
        </p>
        <Button asChild className="w-full min-h-[44px] text-sm sm:text-base">
          <Link href={`/auth/signin?callbackUrl=/listing/${listingId}`}>
            Prijavite se
          </Link>
        </Button>
      </div>
    );
  }

  // Don't show contact form if user is the seller
  if (isSeller) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Ovo je vaš oglas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <Button
        onClick={handleStartConversation}
        className="w-full min-h-[44px] text-sm sm:text-base"
        disabled={loading}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        {loading ? "Kreiranje konverzacije..." : "Pošalji poruku"}
      </Button>
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
        Otvorite konverzaciju sa prodavcem direktno u aplikaciji
      </p>
    </div>
  );
}

