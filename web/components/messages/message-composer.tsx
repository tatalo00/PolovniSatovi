"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageComposerProps {
  threadId: string;
  onMessageSent?: () => void;
}

export function MessageComposer({ threadId, onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/messages/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Greška pri slanju poruke");
      }

      setMessage("");
      onMessageSent?.();
    } catch (error: any) {
      console.error("Error sending message:", error);
      alert(error.message || "Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Napišite poruku..."
          rows={3}
          className="resize-none"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || loading}
          className="self-end h-12 w-12"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Pošalji</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Pritisnite Enter za slanje, Shift+Enter za novi red
      </p>
    </form>
  );
}

