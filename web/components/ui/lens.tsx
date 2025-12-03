"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LensProps {
  children: ReactNode;
  hovering: boolean;
  setHovering: (hovering: boolean) => void;
  className?: string;
  zoomFactor?: number;
  lensSize?: number;
  imageUrl?: string; // Optional direct image URL for better quality
}

export function Lens({
  children,
  hovering,
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

  // Get image source from the child image element if not provided directly
  useEffect(() => {
    if (imageUrl) {
      setImageSrc(imageUrl);
      return;
    }

    if (containerRef.current) {
      const img = containerRef.current.querySelector("img");
      if (img) {
        // Get the full resolution image URL
        // Next.js Image component might use srcset, so we need to get the actual src
        let src = img.getAttribute("src") || img.src || "";
        
        // If it's a Next.js optimized image, try to get the original URL
        // Next.js images often have the format: /_next/image?url=...&w=...&q=...
        if (src.includes("/_next/image")) {
          try {
            const urlParams = new URLSearchParams(src.split("?")[1]);
            const originalUrl = urlParams.get("url");
            if (originalUrl) {
              src = decodeURIComponent(originalUrl);
            }
          } catch (e) {
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

    // Constrain lens position within container bounds
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
      {isHovering && imageSrc && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute rounded-full border-2 border-white/70 shadow-2xl overflow-hidden"
          style={{
            width: lensSize,
            height: lensSize,
            left: mousePosition.x - lensSize / 2,
            top: mousePosition.y - lensSize / 2,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundPosition: `${
              -mousePosition.x * zoomFactor + lensSize / 2
            }px ${
              -mousePosition.y * zoomFactor + lensSize / 2
            }px`,
            backgroundRepeat: "no-repeat",
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
            zIndex: 50,
            clipPath: "circle(50% at 50% 50%)",
          }}
        />
      )}
    </div>
  );
}

