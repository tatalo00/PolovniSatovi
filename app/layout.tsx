import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Providers } from "@/components/providers/session-provider";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

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
        </Providers>
      </body>
    </html>
  );
}
