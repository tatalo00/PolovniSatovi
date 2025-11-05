"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trackContactSeller } from "@/lib/analytics";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface ContactSellerFormProps {
  listingId: string;
  listingTitle: string;
  sellerEmail: string;
}

export function ContactSellerForm({
  listingId,
  listingTitle,
  sellerEmail,
}: ContactSellerFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      alert(error.message || "Došlo je do greške. Pokušajte ponovo.");
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Prijavite se da biste kontaktirali prodavca
        </p>
        <Button asChild className="w-full">
          <Link href={`/auth/signin?callbackUrl=/listing/${listingId}`}>
            Prijavite se
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleStartConversation}
        className="w-full"
        disabled={loading}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        {loading ? "Kreiranje konverzacije..." : "Pošalji poruku"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Otvorite konverzaciju sa prodavcem direktno u aplikaciji
      </p>
    </div>
  );
}

