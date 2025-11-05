import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Providers } from "@/components/providers/session-provider";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PolovniSatovi",
    template: "%s | PolovniSatovi",
  },
  description: "Marketplace za kupovinu i prodaju polovnih i vintage satova na Balkanu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <PageViewTracker />
          <Navbar />
          {children}
          <Toaster 
            position="bottom-center"
            expand={false}
            richColors
            closeButton
            visibleToasts={3}
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
