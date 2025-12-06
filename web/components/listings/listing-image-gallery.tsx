"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUR_DATA_URL, GALLERY_IMAGE_SIZES } from "@/lib/image-utils";
import { Lens } from "@/components/ui/lens";

interface ListingPhoto {
  id: string;
  url: string;
  order: number;
}

interface ListingImageGalleryProps {
  photos: ListingPhoto[];
  title: string;
}

export function ListingImageGallery({ photos, title }: ListingImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef<HTMLDivElement | null>(null);

  const minSwipeDistance = 50;

  const navigateTo = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning]);

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    navigateTo(newIndex);
  }, [currentIndex, photos.length, navigateTo]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    navigateTo(newIndex);
  }, [currentIndex, photos.length, navigateTo]);

  const handleThumbnailClick = (index: number) => {
    navigateTo(index);
  };

  const handleImageClick = () => {
    if (photos.length > 0) {
      setLightboxZoom(1);
      setLightboxPan({ x: 0, y: 0 });
      setIsLightboxOpen(true);
    }
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrevious();
  };

  // Lightbox double-tap zoom
  const handleLightboxDoubleTap = useCallback(() => {
    if (lightboxZoom === 1) {
      setLightboxZoom(2);
    } else {
      setLightboxZoom(1);
      setLightboxPan({ x: 0, y: 0 });
    }
  }, [lightboxZoom]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === "ArrowLeft") handlePrevious();
        else if (e.key === "ArrowRight") handleNext();
        else if (e.key === "Escape") setIsLightboxOpen(false);
        else if (e.key === " ") {
          e.preventDefault();
          handleLightboxDoubleTap();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrevious, handleNext, handleLightboxDoubleTap]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-muted rounded-lg">
        <span className="text-muted-foreground">Nema slike</span>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative group max-w-2xl mx-auto">
          <div
            ref={mainImageRef}
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted cursor-zoom-in",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "md:aspect-[3/2]"
            )}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleImageClick}
            role="button"
            tabIndex={0}
            aria-label={`Otvori galeriju, slika ${currentIndex + 1} od ${photos.length}`}
          >
            {/* Desktop: Lens zoom */}
            <div className="hidden md:block absolute inset-0 z-10">
              <Lens
                hovering={hovering}
                setHovering={setHovering}
                className="w-full h-full"
                zoomFactor={2.5}
                lensSize={180}
                imageUrl={currentPhoto.url}
              >
                <div className="relative w-full h-full">
                  {photos.map((photo, index) => (
                    <Image
                      key={photo.id}
                      src={photo.url}
                      alt={`${title} - Slika ${index + 1}`}
                      fill
                      className={cn(
                        "object-cover transition-all duration-300 ease-out",
                        index === currentIndex 
                          ? "opacity-100 scale-100" 
                          : "opacity-0 scale-105 absolute"
                      )}
                      priority={index === 0}
                      sizes={GALLERY_IMAGE_SIZES.main}
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                    />
                  ))}
                </div>
              </Lens>
            </div>
            
            {/* Mobile: Regular image with swipe */}
            <div className="md:hidden relative w-full h-full">
              {photos.map((photo, index) => (
                <Image
                  key={photo.id}
                  src={photo.url}
                  alt={`${title} - Slika ${index + 1}`}
                  fill
                  className={cn(
                    "object-cover transition-all duration-300 ease-out",
                    index === currentIndex 
                      ? "opacity-100 scale-100" 
                      : "opacity-0 scale-105"
                  )}
                  priority={index === 0}
                  sizes={GALLERY_IMAGE_SIZES.main}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              ))}
            </div>
            
            {/* Image Counter Badge */}
            {photos.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm z-20 flex items-center gap-1.5">
                <span>{currentIndex + 1}</span>
                <span className="text-white/60">/</span>
                <span className="text-white/80">{photos.length}</span>
              </div>
            )}

            {/* Fullscreen hint - mobile only */}
            <div className="absolute bottom-3 right-3 md:hidden z-20">
              <div className="bg-black/70 text-white p-2 rounded-full backdrop-blur-sm">
                <Expand className="w-4 h-4" />
              </div>
            </div>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 z-20",
                    "bg-white/90 hover:bg-white text-neutral-900 shadow-lg",
                    "h-10 w-10 rounded-full",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "hover:scale-110 active:scale-95"
                  )}
                  onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                  aria-label="Prethodna slika"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 z-20",
                    "bg-white/90 hover:bg-white text-neutral-900 shadow-lg",
                    "h-10 w-10 rounded-full",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "hover:scale-110 active:scale-95"
                  )}
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  aria-label="Sledeća slika"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation Dots */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-1.5 md:hidden mt-3">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-6 bg-[#D4AF37]"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  )}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`Prikaži sliku ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="hidden md:flex gap-2 justify-center">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                className={cn(
                  "relative w-16 h-16 overflow-hidden rounded-lg transition-all duration-200",
                  "ring-2 ring-offset-2",
                  index === currentIndex
                    ? "ring-[#D4AF37] scale-105"
                    : "ring-transparent hover:ring-neutral-300 opacity-70 hover:opacity-100"
                )}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`Prikaži sliku ${index + 1}`}
              >
                <Image
                  src={photo.url}
                  alt={`${title} - Minijatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes={GALLERY_IMAGE_SIZES.thumbnail}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[100vw] w-full h-[100dvh] max-h-[100dvh] p-0 bg-black border-none rounded-none">
          <DialogTitle className="sr-only">Galerija slika - {title}</DialogTitle>
          
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">
                  {currentIndex + 1} / {photos.length}
                </span>
                {lightboxZoom > 1 && (
                  <span className="text-white/60 text-sm">
                    {Math.round(lightboxZoom * 100)}%
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Zatvori"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Image Area */}
            <div
              className="flex-1 flex items-center justify-center overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onDoubleClick={handleLightboxDoubleTap}
            >
              <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${lightboxZoom}) translate(${lightboxPan.x}px, ${lightboxPan.y}px)`,
                  transition: "transform 300ms ease-out",
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center p-4 md:p-8",
                      "transition-all duration-300 ease-out",
                      index === currentIndex
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    )}
                  >
                    <div className="relative w-full h-full max-w-6xl">
                      <Image
                        src={photo.url}
                        alt={`${title} - Slika ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority={index === currentIndex}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 z-40",
                      "bg-white/10 hover:bg-white/20 text-white",
                      "h-14 w-14 rounded-full backdrop-blur-sm",
                      "transition-all duration-200 hover:scale-110"
                    )}
                    onClick={handlePrevious}
                    aria-label="Prethodna slika"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 z-40",
                      "bg-white/10 hover:bg-white/20 text-white",
                      "h-14 w-14 rounded-full backdrop-blur-sm",
                      "transition-all duration-200 hover:scale-110"
                    )}
                    onClick={handleNext}
                    aria-label="Sledeća slika"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </Button>
                </>
              )}
            </div>

            {/* Bottom Thumbnails */}
            {photos.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex gap-2 justify-center overflow-x-auto pb-safe">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg",
                        "transition-all duration-200 ring-2 ring-offset-2 ring-offset-black",
                        index === currentIndex
                          ? "ring-[#D4AF37] scale-105"
                          : "ring-transparent opacity-50 hover:opacity-100"
                      )}
                      onClick={() => handleThumbnailClick(index)}
                      aria-label={`Prikaži sliku ${index + 1}`}
                    >
                      <Image
                        src={photo.url}
                        alt={`${title} - Minijatura ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 text-white/60 text-xs pointer-events-none">
              Dupli klik za zoom • Strelice za navigaciju
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
