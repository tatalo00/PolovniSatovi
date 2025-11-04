"use client";

// Simple analytics tracking
// In production, integrate with Google Analytics, Mixpanel, etc.

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, properties);
  }

  // In production, send to analytics service
  // Example: gtag('event', eventName, properties);
  // Or: mixpanel.track(eventName, properties);
}

export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}

export function trackListingView(listingId: string, listingTitle: string) {
  trackEvent("listing_view", { listingId, listingTitle });
}

export function trackContactSeller(listingId: string) {
  trackEvent("contact_seller", { listingId });
}

export function trackListingCreated(listingId: string) {
  trackEvent("listing_created", { listingId });
}

export function trackSignUp(method: string) {
  trackEvent("sign_up", { method });
}

export function trackSignIn(method: string) {
  trackEvent("sign_in", { method });
}

