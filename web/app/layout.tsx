import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Providers } from "@/components/providers/session-provider";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { NavigationFeedbackProvider } from "@/components/providers/navigation-feedback-provider";
import { PageTransitionWrapper } from "@/components/providers/page-transition-wrapper";
import { VibeKanbanCompanion } from "@/components/providers/vibe-kanban-companion";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "PolovniSatovi",
    template: "%s | PolovniSatovi",
  },
  description: "Marketplace za kupovinu i prodaju polovnih i vintage satova na Balkanu.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PolovniSatovi",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role,
    isVerified: session.user.isVerified ?? false,
  } : null;

  // Query unread message count for mobile nav badge
  let unreadCount = 0;
  if (session?.user?.id) {
    try {
      unreadCount = await prisma.message.count({
        where: {
          thread: {
            OR: [
              { buyerId: session.user.id },
              { sellerId: session.user.id },
            ],
          },
          senderId: { not: session.user.id },
          readAt: null,
        },
      });
    } catch {
      // Silently fail - badge is non-critical
    }
  }

  return (
    <html lang="en" className="h-full overflow-x-hidden">
      <body className={`${inter.variable} ${playfair.variable} antialiased flex min-h-screen flex-col bg-background overflow-x-hidden`}>
        <Providers>
          <Suspense fallback={null}>
            <NavigationFeedbackProvider>
              <PageViewTracker />
              <VibeKanbanCompanion />
              <Navbar user={user} />
              <PageTransitionWrapper>{children}</PageTransitionWrapper>
              <Footer />
              <MobileBottomNav user={user} unreadCount={unreadCount} />
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
                className="lg:bottom-4 bottom-20"
              />
              <WebVitalsReporter />
            </NavigationFeedbackProvider>
          </Suspense>
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
