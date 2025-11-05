"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageClick = () => {
    if (photos.length > 0) {
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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrevious, handleNext]);

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
        <div className="relative group">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted cursor-pointer"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleImageClick}
          >
            <Image
              src={currentPhoto.url}
              alt={`${title} - Slika ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            />
            
            {/* Image Counter */}
            {photos.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            )}

            {/* Zoom Icon Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
            </div>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  aria-label="Prethodna slika"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Sledeća slika"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation Dots */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-2 md:hidden mt-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  )}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`Prikaži sliku ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="hidden md:grid grid-cols-4 gap-2">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all",
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-muted-foreground/50"
                )}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`Prikaži sliku ${index + 1}`}
              >
                <Image
                  src={photo.url}
                  alt={`${title} - Minijatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 15vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">
            Galerija slika - {title}
          </DialogTitle>
          <div className="relative w-full h-full flex flex-col">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <div className="text-sm">
                {currentIndex + 1} / {photos.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Zatvori"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Lightbox Image Container */}
            <div
              className="relative flex-1 flex items-center justify-center p-4"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative w-full h-full max-w-5xl max-h-full">
                <Image
                  src={currentPhoto.url}
                  alt={`${title} - Slika ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Lightbox Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-12 w-12 rounded-full"
                    onClick={handlePrevious}
                    aria-label="Prethodna slika"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-12 w-12 rounded-full"
                    onClick={handleNext}
                    aria-label="Sledeća slika"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-black/50">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    className={cn(
                      "relative flex-shrink-0 w-20 h-20 overflow-hidden rounded border-2 transition-all",
                      index === currentIndex
                        ? "border-white"
                        : "border-transparent hover:border-white/50 opacity-70 hover:opacity-100"
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
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

