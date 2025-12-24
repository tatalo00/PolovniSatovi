"use client";

import { useState, useRef, ReactNode, useLayoutEffect } from "react";
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
  setHovering,
  className,
  zoomFactor = 2,
  lensSize = 200,
  imageUrl,
}: LensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(imageUrl || "");

  useLayoutEffect(() => {
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    const halfSize = lensSize / 2;
    x = Math.max(halfSize, Math.min(rect.width - halfSize, x));
    y = Math.max(halfSize, Math.min(rect.height - halfSize, y));

    setMousePosition({ x, y });
    setIsHovering(true);
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHovering(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {imageSrc && (
        <div
          className={cn(
            "pointer-events-none absolute rounded-full border-2 border-white/70 shadow-2xl overflow-hidden transition-all duration-200 ease-out",
            isHovering ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
          style={{
            width: lensSize,
            height: lensSize,
            left: mousePosition.x - lensSize / 2,
            top: mousePosition.y - lensSize / 2,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundPosition: `${-mousePosition.x * zoomFactor + lensSize / 2}px ${-mousePosition.y * zoomFactor + lensSize / 2}px`,
            backgroundRepeat: "no-repeat",
            boxShadow:
              "0 0 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
            zIndex: 50,
            clipPath: "circle(50% at 50% 50%)",
          }}
        />
      )}
    </div>
  );
}
