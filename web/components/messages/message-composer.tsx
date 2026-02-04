"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface MessageComposerProps {
  threadId: string;
  onMessageSent?: () => void;
  isFirstMessage?: boolean;
}

const QUICK_REPLIES = [
  { label: "Da li je dostupan?", text: "Zdravo! Da li je ovaj sat još uvek dostupan?" },
  { label: "Cena fiksna?", text: "Da li je cena fiksna ili je moguć dogovor?" },
  { label: "Više fotografija?", text: "Da li biste mogli da pošaljete još fotografija sata?" },
  { label: "Lična predaja?", text: "Gde se nalazite i da li je moguća lična predaja?" },
];

export function MessageComposer({ threadId, onMessageSent, isFirstMessage }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

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
      toast.error(error.message || "Došlo je do greške. Pokušajte ponovo.");
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
    <div className="border-t">
      {isFirstMessage && (
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Brzi odgovori:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply.label}
                type="button"
                className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors"
                onClick={() => setMessage(reply.text)}
              >
                {reply.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4 pt-2">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Napišite poruku..."
            rows={1}
            className="resize-none min-h-[44px] max-h-[120px] overflow-y-auto"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || loading}
            className="self-end h-11 w-11"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Pošalji</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Pritisnite Enter za slanje, Shift+Enter za novi red
        </p>
      </form>
    </div>
  );
}

