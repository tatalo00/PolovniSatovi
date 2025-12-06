"use client";

import { useState, useRef, ReactNode, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface LensProps {
  children: ReactNode;
  hovering: boolean;
  setHovering: (hovering: boolean) => void;
  className?: string;
  zoomFactor?: number;
  lensSize?: number;
  imageUrl?: string;
}

export function Lens({
  children,
  hovering,
  setHovering,
  className,
  zoomFactor = 2.5,
  lensSize = 180,
  imageUrl,
}: LensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(imageUrl || "");
  const animationRef = useRef<number | null>(null);

  // Smooth position interpolation
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isHovering) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering, mousePosition]);

  useEffect(() => {
    if (imageUrl) {
      setImageSrc(imageUrl);
      return;
    }

    if (containerRef.current) {
      const img = containerRef.current.querySelector("img");
      if (img) {
        let src = img.getAttribute("src") || img.src || "";

        if (src.includes("/_next/image")) {
          try {
            const urlParams = new URLSearchParams(src.split("?")[1]);
            const originalUrl = urlParams.get("url");
            if (originalUrl) {
              src = decodeURIComponent(originalUrl);
            }
          } catch {
            // If parsing fails, use the original src
          }
        }

        setImageSrc(src);
      }
    }
  }, [children, imageUrl]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    const halfSize = lensSize / 2;
    x = Math.max(halfSize, Math.min(rect.width - halfSize, x));
    y = Math.max(halfSize, Math.min(rect.height - halfSize, y));

    setMousePosition({ x, y });
    
    if (!isHovering) {
      setSmoothPosition({ x, y });
      setIsHovering(true);
      setHovering(true);
    }
  }, [lensSize, isHovering, setHovering]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setHovering(false);
  }, [setHovering]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Lens magnifier */}
      {imageSrc && (
        <div
          className={cn(
            "pointer-events-none absolute rounded-full overflow-hidden",
            "transition-opacity duration-200 ease-out",
            isHovering ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: lensSize,
            height: lensSize,
            left: smoothPosition.x - lensSize / 2,
            top: smoothPosition.y - lensSize / 2,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundPosition: `${-smoothPosition.x * zoomFactor + lensSize / 2}px ${-smoothPosition.y * zoomFactor + lensSize / 2}px`,
            backgroundRepeat: "no-repeat",
            boxShadow: `
              0 0 0 3px rgba(212, 175, 55, 0.6),
              0 0 0 4px rgba(255, 255, 255, 0.3),
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 0 20px rgba(255, 255, 255, 0.1)
            `,
            zIndex: 50,
            transform: isHovering ? "scale(1)" : "scale(0.8)",
            transition: "opacity 200ms ease-out, transform 200ms ease-out",
          }}
        />
      )}
      
      {/* Hint text */}
      <div
        className={cn(
          "absolute bottom-3 left-1/2 -translate-x-1/2 z-40",
          "bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm",
          "transition-all duration-300 pointer-events-none",
          isHovering ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}
      >
        Pređi mišem za zoom
      </div>
    </div>
  );
}
