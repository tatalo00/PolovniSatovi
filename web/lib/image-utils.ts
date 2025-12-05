/**
 * Image optimization utilities
 */

/**
 * Base64 encoded tiny placeholder for blur effect
 * This is a 10x10 neutral gray gradient that works well for watch images
 */
export const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgcI/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDBAURAAYSIQcTMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABsRAAICAwEAAAAAAAAAAAAAAAECAAMEESFB/9oADAMBAAIRAxEAPwCd7Y8hXmy2Wks9NbqCWKBSoeWNizEkkkn9J1pHxzv+5d0bZe43uGniqPdJGqQRlFCgDHXfetGaKqrLTqxmJHuf/9k=";

/**
 * Generate responsive sizes attribute based on grid columns
 * @param columns - Number of columns in the grid (3, 4, or 5)
 * @param variant - 'grid' for listing grid, 'card' for cards
 */
export function getListingImageSizes(
  columns: 3 | 4 | 5 = 4,
  variant: "grid" | "card" | "featured" = "grid"
): string {
  if (variant === "featured") {
    return "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
  }

  if (variant === "card") {
    return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";
  }

  // Grid variant - mobile shows horizontal cards with fixed image widths
  const desktopWidth = columns === 5 ? "20vw" : columns === 4 ? "25vw" : "33vw";
  return `(max-width: 475px) 140px, (max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, ${desktopWidth}`;
}

/**
 * Gallery image sizes for detail pages
 */
export const GALLERY_IMAGE_SIZES = {
  main: "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw",
  thumbnail: "(max-width: 768px) 25vw, 15vw",
  lightbox: "100vw",
  lightboxThumbnail: "80px",
} as const;
