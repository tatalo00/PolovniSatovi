import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Providers } from "@/components/providers/session-provider";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { NavigationFeedbackProvider } from "@/components/providers/navigation-feedback-provider";
import { PageTransitionWrapper } from "@/components/providers/page-transition-wrapper";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} antialiased flex min-h-screen flex-col bg-background`}>
        <Providers>
          <Suspense fallback={null}>
            <NavigationFeedbackProvider>
              <PageViewTracker />
              <Navbar />
              <PageTransitionWrapper>{children}</PageTransitionWrapper>
              <Footer />
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
            </NavigationFeedbackProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
