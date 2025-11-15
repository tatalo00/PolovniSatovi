"use client";

import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ShareButtonProps {
  listingId: string;
  listingTitle: string;
  className?: string;
}

export function ShareButton({ listingId, listingTitle, className }: ShareButtonProps) {
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    
    const url = `${window.location.origin}/listing/${listingId}`;
    const shareData = {
      title: listingTitle,
      text: listingTitle,
      url,
    };

    try {
      // Try Web Share API first (works on mobile and modern browsers)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Link je kopiran u clipboard", {
          description: "Možete ga podeliti sa drugima",
          duration: 3000,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (error) {
      // User cancelled share dialog - don't show error
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      
      // If clipboard API fails, try fallback method
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        
        toast.success("Link je kopiran u clipboard", {
          description: "Možete ga podeliti sa drugima",
          duration: 3000,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (fallbackError) {
        console.error("Error sharing:", fallbackError);
        toast.error("Greška pri deljenju", {
          description: "Pokušajte ponovo ili kopirajte link ručno",
          duration: 4000,
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      className={className}
      aria-label="Podeli oglas"
    >
      {isShared ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <Share2 className="h-5 w-5" />
      )}
    </Button>
  );
}

