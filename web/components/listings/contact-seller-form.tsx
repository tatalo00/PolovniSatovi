"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trackContactSeller } from "@/lib/analytics";
import Link from "next/link";

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
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          listingTitle,
          sellerEmail,
          buyerName: name,
          buyerEmail: email,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Došlo je do greške");
        return;
      }

      trackContactSeller(listingId);
      setSent(true);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-green-800">
        <p className="font-medium">Poruka je poslata!</p>
        <p className="text-sm mt-1">Prodavac će vam odgovoriti na email.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setSent(false)}
        >
          Pošalji još jednu poruku
        </Button>
      </div>
    );
  }

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Vaše ime</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Poruka</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Pošaljite poruku prodavcu o ovom satu..."
          rows={4}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Slanje..." : "Pošalji poruku"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Vaša poruka će biti poslata prodavcu na email adresu
      </p>
    </form>
  );
}

