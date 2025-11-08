"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  listingId: string;
  className?: string;
  isFavorite?: boolean;
  initialIsFavorite?: boolean;
  onToggle?: (nextValue: boolean) => void;
  size?: "sm" | "md";
}

export function WishlistButton({
  listingId,
  className,
  isFavorite,
  initialIsFavorite = false,
  onToggle,
  size = "md",
}: WishlistButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const [internalFavorite, setInternalFavorite] = useState<boolean>(
    isFavorite ?? initialIsFavorite
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof isFavorite === "boolean") {
      setInternalFavorite(isFavorite);
    }
  }, [isFavorite]);

  useEffect(() => {
    if (typeof isFavorite !== "boolean") {
      setInternalFavorite(initialIsFavorite);
    }
  }, [initialIsFavorite, isFavorite]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) return;

    if (status !== "authenticated") {
      const callbackUrl =
        typeof window !== "undefined" ? window.location.href : "/listings";
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    const nextValue = !internalFavorite;
    setInternalFavorite(nextValue);
    setIsAnimating(true);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: nextValue ? "POST" : "DELETE",
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      onToggle?.(nextValue);
    } catch (error) {
      setInternalFavorite(!nextValue);
      console.error("Failed to toggle wishlist", error);
      toast.error("Nije moguće ažurirati listu želja. Pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsAnimating(false), 250);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "h-8 w-8"
      : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center rounded-full border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        sizeClasses,
        internalFavorite
          ? "text-rose-500 hover:text-rose-600"
          : "text-muted-foreground hover:text-foreground",
        isAnimating && "scale-110",
        className
      )}
      aria-label={internalFavorite ? "Ukloni iz liste želja" : "Dodaj u listu želja"}
      aria-pressed={internalFavorite}
      aria-busy={isSubmitting}
    >
      <Heart
        className="h-4 w-4"
        fill={internalFavorite ? "currentColor" : "none"}
      />
    </button>
  );
}

