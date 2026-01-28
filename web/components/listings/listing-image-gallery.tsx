"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUR_DATA_URL, GALLERY_IMAGE_SIZES } from "@/lib/image-utils";
import { Lens } from "@/components/ui/lens";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface ListingPhoto {
  id: string;
  url: string;
  order: number;
}

interface ListingImageGalleryProps {
  photos: ListingPhoto[];
  title: string;
}

const ZOOM_LEVELS = [2, 2.5, 3] as const;
type ZoomLevel = typeof ZOOM_LEVELS[number];

export function ListingImageGallery({ photos, title }: ListingImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [hovering, setHovering] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(2.5);
  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const handlePrevious = useCallback(() => {
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const handleThumbnailClick = (index: number) => {
    setSlideDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
    // Scroll thumbnail into view
    thumbnailRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  const handleZoomChange = (direction: 'in' | 'out') => {
    const currentIdx = ZOOM_LEVELS.indexOf(zoomLevel);
    if (direction === 'in' && currentIdx < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[currentIdx + 1]);
    } else if (direction === 'out' && currentIdx > 0) {
      setZoomLevel(ZOOM_LEVELS[currentIdx - 1]);
    }
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
      if (isLightboxOpen) {
        if (e.key === "ArrowLeft") {
          handlePrevious();
        } else if (e.key === "ArrowRight") {
          handleNext();
        } else if (e.key === "Escape") {
          setIsLightboxOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrevious, handleNext]);

  const handleKeyboardNavigate = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleImageClick();
      }
    },
    [handleNext, handlePrevious, handleImageClick]
  );

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
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:aspect-[3/2]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleImageClick}
            onKeyDown={handleKeyboardNavigate}
            role="button"
            tabIndex={0}
            aria-label={`Otvori galeriju, slika ${currentIndex + 1} od ${photos.length}`}
            aria-haspopup="dialog"
            style={{
              position: 'relative'
            }}
          >
            {/* Lens wrapper - only on desktop */}
            <div className="hidden md:block absolute inset-0 z-10 pointer-events-none">
              <Lens
                hovering={hovering}
                setHovering={setHovering}
                className="w-full h-full pointer-events-auto"
                zoomFactor={zoomLevel}
                lensSize={250}
                imageUrl={currentPhoto.url}
              >
                <Image
                  key={currentPhoto.id}
                  src={currentPhoto.url}
                  alt={`${title} - Slika ${currentIndex + 1}`}
                  fill
                  className="object-cover"
                  priority={currentIndex === 0}
                  sizes={GALLERY_IMAGE_SIZES.main}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  style={{
                    animation: slideDirection === 'right' ? 'slideInRight 0.5s ease-out' : 'slideInLeft 0.5s ease-out'
                  }}
                />
              </Lens>
            </div>
            
            {/* Regular image for mobile and fallback */}
            <Image
              key={currentPhoto.id}
              src={currentPhoto.url}
              alt={`${title} - Slika ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105 md:hidden"
              priority={currentIndex === 0}
              sizes={GALLERY_IMAGE_SIZES.main}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              style={{
                animation: slideDirection === 'right' ? 'slideInRight 0.5s ease-out' : 'slideInLeft 0.5s ease-out'
              }}
            />
            
            {/* Image Counter */}
            {photos.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm z-20">
                {currentIndex + 1} / {photos.length}
              </div>
            )}

            {/* Zoom Icon Overlay - only on mobile */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 md:hidden">
              <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
            </div>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity h-11 w-11 min-h-[44px] min-w-[44px] rounded-full md:h-10 md:w-10 md:min-h-0 md:min-w-0 z-20"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity h-11 w-11 min-h-[44px] min-w-[44px] rounded-full md:h-10 md:w-10 md:min-h-0 md:min-w-0 z-20"
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

            {/* Zoom Controls - Desktop only */}
            <TooltipProvider delayDuration={300}>
              <div className="absolute bottom-3 left-3 hidden md:flex items-center gap-1 bg-black/60 rounded-full px-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoomChange('out');
                      }}
                      disabled={zoomLevel === ZOOM_LEVELS[0]}
                      aria-label="Umanji zumiranje"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Umanji zum</TooltipContent>
                </Tooltip>
                <span className="text-white text-xs font-medium min-w-[32px] text-center">
                  {zoomLevel}x
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoomChange('in');
                      }}
                      disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                      aria-label="Uvećaj zumiranje"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Uvećaj zum</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Mobile Navigation Dots */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-2.5 md:hidden mt-3 px-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-3 rounded-full transition-all min-h-[12px] min-w-[12px] touch-manipulation",
                    index === currentIndex
                      ? "w-10 bg-primary shadow-md"
                      : "w-3 bg-muted-foreground/50 hover:bg-muted-foreground/70"
                  )}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`Prikaži sliku ${index + 1}`}
                  style={{ touchAction: 'manipulation' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Strip - scrollable for many images */}
        {photos.length > 1 && (
          <div
            className={cn(
              "hidden md:flex gap-2 overflow-x-auto scrollbar-hide pb-1",
              photos.length <= 5 ? "justify-center" : ""
            )}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                ref={(el) => { thumbnailRefs.current[index] = el; }}
                className={cn(
                  "relative flex-shrink-0 w-[calc((100%-2rem)/5)] min-w-[80px] max-w-[120px] aspect-square overflow-hidden rounded-md border-2 transition-all",
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary ring-offset-2 scale-105"
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
                  key={currentPhoto.id}
                  src={currentPhoto.url}
                  alt={`${title} - Slika ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes={GALLERY_IMAGE_SIZES.lightbox}
                  priority
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  style={{
                    animation: slideDirection === 'right' ? 'slideInRight 0.5s ease-out' : 'slideInLeft 0.5s ease-out'
                  }}
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
                      sizes={GALLERY_IMAGE_SIZES.lightboxThumbnail}
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
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

