import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PolovniSatovi",
    short_name: "PolovniSatovi",
    description: "Marketplace za kupovinu i prodaju polovnih i vintage satova na Balkanu",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#D4AF37",
    orientation: "portrait-primary",
    // TODO: Add PWA icons when branding assets are ready
    // icons: [
    //   { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    //   { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    //   { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    // ],
  };
}
