# UX Review #9: Mobile Experience

**Priority**: CRITICAL — Most users access the platform on mobile devices
**Date**: January 2026
**Benchmarks**: Chrono24 app, StockX app, eBay mobile, Airbnb mobile, Baymard Institute mobile UX research

---

## Executive Summary

PolovniSatovi has a **surprisingly strong mobile foundation** that exceeds the average for marketplace platforms. The codebase demonstrates intentional mobile-first thinking: 44px+ touch targets, iOS safe area support, bottom navigation, swipe gestures, and mobile-specific component variants. However, several critical gaps remain that prevent the experience from reaching native-app quality — most notably missing viewport metadata for PWA/home-screen use, no unread message badge on the bottom nav, content being obscured by overlapping fixed elements, and the lack of pull-to-refresh on key pages.

**Overall Mobile Score: 7.2/10** — Strong foundation, needs polish to reach platform-grade quality.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Strengths (What's Working Well)](#2-strengths)
3. [Gap Analysis vs. Benchmarks](#3-gap-analysis)
4. [Recommendations](#4-recommendations)
5. [Implementation Specifications](#5-implementation-specifications)

---

## 1. Current State Analysis

### 1.1 Mobile Navigation Architecture

**Bottom Navigation Bar** (`components/site/mobile-bottom-nav.tsx`)
- 5 items: Početna, Oglasi, Prodaj, Poruke (auth'd), Profil/Prijava
- Fixed at bottom with `z-50`, 64px height (`h-16`)
- Visible below `lg` breakpoint (< 1024px)
- 44x44px minimum touch targets
- iOS safe area inset support via CSS class
- Backdrop blur for modern aesthetic

**Top Navbar** (`components/site/navbar.tsx`)
- Fixed at top, 64px mobile / 80px desktop
- Hamburger menu trigger on mobile (< 768px)
- Desktop nav links hidden on mobile

**Mobile Menu (Hamburger)** (`components/site/navbar-mobile-menu.tsx`)
- Right-side sheet drawer, 85vw width (max 400px)
- 48px minimum touch targets on all items
- User profile section at top when authenticated
- Sections: Main nav, User nav, Admin link, Footer auth buttons
- Auto-closes on navigation

### 1.2 Responsive Layout Strategy

| Breakpoint | Pixel Value | Primary Use |
|-----------|------------|-------------|
| Base | 0px | Mobile-first styles |
| `sm:` | 640px | Text scaling, padding adjustments |
| `md:` | 768px | Layout shifts, component show/hide |
| `lg:` | 1024px | Major layout changes, sidebar visibility |
| `xl:` | 1280px | Filter drawer hiding |

**Layout approach**: Mobile-first with progressive enhancement. Base styles target mobile, then `sm:`, `md:`, `lg:` add complexity.

### 1.3 Touch & Gesture Support

**Image Gallery** (`components/listings/listing-image-gallery.tsx`)
- Swipe left/right to navigate photos (50px min distance)
- Directional slide animations (`slideInRight`/`slideInLeft`)
- Mobile: Navigation dots (12px tap targets) — **below 44px minimum**
- Desktop: Lens zoom, thumbnail strip (hidden on mobile)
- Lightbox: Full swipe support, 48px nav arrows

**Listing Grid Cards** (`components/listings/listing-grid.tsx`)
- Touch press feedback with `scale(0.98)` animation
- `touch-manipulation` CSS for instant response
- Horizontal layout on mobile (140-180px image + content), vertical on desktop

**Sticky CTA** (`components/listings/listing-sticky-cta.tsx`)
- Fixed bottom bar on listing pages (< 1024px)
- Shows price, share button, contact CTA
- Trust badges row
- Safe area bottom padding
- Web Share API integration with clipboard fallback

### 1.4 Safe Area & Device Support

- Bottom insets: Applied to bottom nav, FAB, sticky CTA, footer
- Global CSS utilities: `.safe-area-inset-bottom`, `.mobile-bottom-padding`, `.mobile-bottom-nav-padding`
- Fallback values provided (`env(safe-area-inset-bottom, 0px)`)
- Footer uses `mobile-bottom-nav-padding` class
- `overflow-x-hidden` on both `<html>` and `<body>` to prevent horizontal scroll

### 1.5 Mobile-Specific Component Variants

| Component | Mobile | Desktop |
|-----------|--------|---------|
| Image Gallery | Swipe + dots | Lens zoom + thumbnails |
| Listing Grid | Horizontal card (image left) | Vertical card (image top) |
| Filter Sidebar | Bottom sheet FAB | Left sidebar |
| Contact Card | Inline below gallery + sticky CTA | Sticky sidebar |
| Seller Info | Inline in content flow | Sticky sidebar |
| Navigation | Bottom bar + hamburger | Top nav + user menu |
| Toaster | `bottom-20` (above nav) | `bottom-4` |

---

## 2. Strengths

### 2.1 Touch Target Compliance ✅
Nearly all interactive elements meet the 44px minimum:
- Inputs: `h-11 min-h-[44px]` mobile, `md:h-9` desktop
- Bottom nav items: `min-h-[44px] min-w-[44px]`
- Mobile menu items: `min-h-[48px]` (exceeds requirement)
- Filter buttons: `min-h-[44px]`
- Gallery nav arrows: `h-11 w-11 min-h-[44px] min-w-[44px]`
- Hero CTA: `min-h-[44px]` with full width on mobile

### 2.2 Mobile-First Card Design ✅
The listing grid card (`listing-grid.tsx`) uses an intelligent responsive pattern:
- Mobile: Horizontal layout with fixed-width image (140-180px)
- Desktop: Vertical layout with aspect-square image
- Touch feedback with press/release states
- Properly sized text scaling across breakpoints

### 2.3 Safe Area Implementation ✅
Comprehensive iOS notch/home indicator support across all fixed bottom elements. Most marketplaces ignore this.

### 2.4 Gesture Support ✅
Image gallery swipe navigation with directional animations — exceeds most web marketplace implementations.

### 2.5 Performance Considerations ✅
- Responsive `sizes` attribute on all images with mobile-first breakpoints
- AVIF and WebP format support
- Dynamic imports for heavy components (`ListingStickyCTA`, `ListingReviewsSection`)
- `React.memo` on listing grid cards
- Blur placeholder images

---

## 3. Gap Analysis

### 3.1 Critical Gaps

#### GAP-M1: No Viewport Meta / PWA Metadata
**Current**: `layout.tsx` has no explicit viewport meta, theme-color, apple-touch-icon, or PWA manifest.
**Impact**: No "Add to Home Screen" support, no themed browser chrome, no installable PWA.
**Benchmark**: Chrono24 has a dedicated mobile app with 3.1M downloads. StockX has full PWA support. Even basic viewport-fit=cover is missing for proper safe area support.

#### GAP-M2: Content Obscured by Overlapping Fixed Elements
**Current**: On listing pages, the main content has `pt-8` but no bottom padding. Three fixed elements can overlap content:
1. Bottom navigation bar (64px + safe area)
2. Sticky CTA bar (~90px + safe area)
3. Toast notifications positioned at `bottom-20`

On the listings browse page, `py-6 sm:py-8` with no mobile bottom padding compensation.
**Impact**: Last listing cards, footer content, and reviews section get hidden behind fixed elements.
**Benchmark**: All top apps calculate content insets to prevent overlap.

#### GAP-M3: No Unread Message Badge on Bottom Navigation
**Current**: Bottom nav Messages icon has no notification badge/count.
**Impact**: Users don't know they have unread messages unless they navigate to the messages tab. Chrono24 and eBay show unread counts prominently on their navigation.

#### GAP-M4: Gallery Navigation Dots Below Touch Target Minimum
**Current**: Navigation dots are `h-3` (12px) with `min-h-[12px] min-w-[12px]`.
**Impact**: At 12px, these are well below the 44px minimum. Users with larger fingers will struggle to tap specific photos. The active dot expands to `w-10` but height remains 12px.

### 3.2 High-Priority Gaps

#### GAP-M5: No Pull-to-Refresh on Key Pages
**Current**: No pull-to-refresh implementation anywhere.
**Impact**: Mobile users expect pull-to-refresh on feed-style pages (listings, messages). Without it, they must navigate away and back to refresh.
**Benchmark**: Standard on all native apps and modern PWAs (Chrono24, StockX, eBay).

#### GAP-M6: Dropdown Menus on Mobile (Quick Filter Bar)
**Current**: The homepage quick filter bar uses `DropdownMenu` (Radix) for brand, movement, and condition selectors.
**Impact**: Dropdown menus are desktop patterns. On mobile, they appear as floating popovers that can be partially off-screen, have small text, and require precision tapping. Bottom sheets or full-screen selectors are the mobile-native pattern.
**Benchmark**: Chrono24 uses full-screen filter overlays on mobile. Airbnb uses bottom sheets for all filter selection.

#### GAP-M7: Message Thread Not Optimized for Mobile Viewport
**Current**: `MessageThreadView` uses `h-full` with Card wrappers but no explicit mobile viewport height calculation. The message composer textarea is fixed at 3 rows.
**Impact**: On mobile, the keyboard pushes content up, and the composer may be obscured or the message list may not scroll properly. No `dvh` (dynamic viewport height) or `visualViewport` API usage.

#### GAP-M8: Dashboard 587-Line Monolith Not Mobile-Optimized
**Current**: Dashboard page renders all 5 tabs server-side in a single page with no persistent navigation on mobile. Tab switching via URL-synced tabs component.
**Impact**: Users lose context when switching tabs, and the full page re-renders each time. No swipe-between-tabs gesture. The stat cards and listing breakdown are information-dense and don't adapt well to small screens.

#### GAP-M9: Listing Page Missing Mobile Bottom Padding
**Current**: `<main className="container mx-auto px-4 pt-8 lg:pb-12">` — has `lg:pb-12` for desktop but **zero bottom padding on mobile**.
**Impact**: With both the sticky CTA (~90px) and bottom nav (64px), approximately 154px of content at the bottom of the listing page is hidden. Reviews section and seller info card are partially or fully obscured.

### 3.3 Medium-Priority Gaps

#### GAP-M10: No Haptic Feedback on Touch Interactions
**Current**: Touch press uses CSS `scale(0.98)` visual feedback only.
**Impact**: Native apps provide haptic feedback on important actions (favoriting, sending messages, applying filters). The Vibration API is available on Android and can enhance perceived quality.

#### GAP-M11: No Landscape Mode Consideration
**Current**: No landscape-specific styles or media queries. Images, hero, and cards are portrait-optimized.
**Impact**: While most mobile usage is portrait, landscape mode can create awkward layouts — especially the hero section (which has `min-h-[450px]` filling the entire landscape viewport) and the listing image gallery.

#### GAP-M12: Missing Swipe-to-Go-Back Gesture
**Current**: Browser back button or nav are the only ways to go back. The message thread has a back button (`md:hidden`).
**Impact**: iOS users expect swipe-from-edge to go back. While this works with browser navigation, custom transition animations aren't triggered.

#### GAP-M13: Toaster Position Conflict with Sticky Elements
**Current**: Toast positioned at `bottom-20` (80px) on mobile, `bottom-4` on desktop.
**Impact**: On listing pages with sticky CTA (which is positioned with safe area padding at bottom), toasts can overlap with or be obscured by the sticky CTA bar. The toast z-index may conflict.

#### GAP-M14: No Offline Support or Network Error Handling
**Current**: No service worker, no offline page, no network status detection.
**Impact**: When users lose connectivity (common on mobile), the app shows browser error pages instead of graceful degradation. Cached data could enable read-only browsing.

#### GAP-M15: Advanced Filters Not Touch-Optimized
**Current**: Advanced filter chip buttons in the quick filter bar have `min-h-[36px] sm:min-h-[40px]` — below the 44px minimum on smallest screens.
**Impact**: Chip-style filter buttons for case material, strap, and dial color can be hard to tap accurately on small phones.

---

## 4. Recommendations

### Priority: Critical

#### REC-M1: Add Viewport Meta & PWA Support (GAP-M1)
Add proper viewport metadata, theme-color, apple-touch-icon, and a web app manifest for installable PWA experience.

**Effort**: Low
**Impact**: High — enables Add to Home Screen, themed browser chrome, and proper safe area support

#### REC-M2: Fix Content Obscured by Fixed Elements (GAP-M2, GAP-M9)
Add bottom padding to all pages that accounts for the bottom navigation bar, and on the listing page additionally account for the sticky CTA.

**Effort**: Low
**Impact**: Critical — users literally cannot see content at the bottom of pages

#### REC-M3: Add Unread Message Badge to Bottom Nav (GAP-M3)
Show unread message count on the Messages icon in the bottom navigation bar using a dot or number badge.

**Effort**: Medium
**Impact**: High — drives message engagement, critical for marketplace communication

### Priority: High

#### REC-M4: Increase Gallery Dot Touch Targets (GAP-M4)
Enlarge gallery navigation dots to meet 44px minimum touch target while maintaining visual compactness.

**Effort**: Low
**Impact**: High — direct usability fix for the most-viewed component

#### REC-M5: Replace Dropdowns with Mobile-Native Selectors (GAP-M6)
On mobile, replace `DropdownMenu` in the quick filter bar with bottom sheets or full-screen selectors that are finger-friendly.

**Effort**: Medium
**Impact**: High — the homepage filter bar is the primary entry point for search

#### REC-M6: Add Mobile Bottom Padding to Listing Browse Page (GAP-M2)
The listings page (`/listings`) needs `mobile-bottom-nav-padding` class on its main container.

**Effort**: Low
**Impact**: High — listing cards at bottom of results are partially hidden

#### REC-M7: Fix Advanced Filter Chip Touch Targets (GAP-M15)
Increase chip button minimum height to 44px consistently across all screen sizes.

**Effort**: Low
**Impact**: Medium — affects users who use advanced filters on mobile

### Priority: Medium

#### REC-M8: Optimize Message Thread for Mobile Keyboard (GAP-M7)
Use `dvh` viewport units or the `visualViewport` API to handle keyboard appearance, keeping the composer visible and messages scrollable.

**Effort**: Medium
**Impact**: Medium — messaging is important but currently functional

#### REC-M9: Add Pull-to-Refresh on Listings and Messages (GAP-M5)
Implement pull-to-refresh gesture on the listings browse page and message thread list.

**Effort**: Medium
**Impact**: Medium — improves perceived quality, users currently refresh by navigating away

#### REC-M10: Add Haptic Feedback on Key Actions (GAP-M10)
Trigger haptic feedback via Vibration API on favorite toggles, message sends, filter applies, and listing card press.

**Effort**: Low
**Impact**: Low-Medium — quality polish that improves perceived native feel

---

## 5. Implementation Specifications

### SPEC-M1: Viewport Meta & PWA Manifest

**File**: `web/app/layout.tsx`

Add viewport metadata to the Next.js metadata export:

```tsx
export const metadata: Metadata = {
  title: {
    default: "PolovniSatovi",
    template: "%s | PolovniSatovi",
  },
  description: "Marketplace za kupovinu i prodaju polovnih i vintage satova na Balkanu.",
  // ADD: Viewport and PWA metadata
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PolovniSatovi",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

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
```

**File**: `web/public/manifest.json` (new)

```json
{
  "name": "PolovniSatovi",
  "short_name": "Satovi",
  "description": "Marketplace za polovne i vintage satove",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#D4AF37",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

### SPEC-M2: Fix Content Overlap with Fixed Elements

**File**: `web/app/listing/[id]/page.tsx`

```tsx
// CHANGE: Add mobile bottom padding to account for sticky CTA + bottom nav
<main className="container mx-auto px-4 pt-8 mobile-bottom-padding lg:pb-12">
```

The `mobile-bottom-padding` class already exists in `globals.css` with `calc(7rem + env(safe-area-inset-bottom, 0px))` — this provides 112px + safe area, covering both the sticky CTA (~90px) and bottom nav (64px). Note: these elements overlap vertically so 7rem is sufficient.

**File**: `web/app/listings/page.tsx`

```tsx
// CHANGE: Add mobile bottom padding
<main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 mobile-bottom-nav-padding lg:pb-8">
```

---

### SPEC-M3: Unread Message Badge on Bottom Nav

**File**: `web/components/site/mobile-bottom-nav.tsx`

Add unread count prop and badge display:

```tsx
interface MobileBottomNavProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  unreadMessageCount?: number; // ADD
}

export function MobileBottomNav({ user, unreadMessageCount = 0 }: MobileBottomNavProps) {
  // ... existing code ...

  const navItems = [
    // ... existing items ...
    ...(isLoggedIn
      ? [
          {
            href: "/dashboard/messages",
            label: "Poruke",
            icon: MessageSquare,
            exact: false,
            badge: unreadMessageCount, // ADD
          },
        ]
      : []),
    // ...
  ];

  return (
    <nav className="...">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} className="..." aria-label={item.label}>
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden />
                {/* ADD: Unread badge */}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**File**: `web/app/layout.tsx`

Fetch unread count and pass to `MobileBottomNav`:

```tsx
// In RootLayout, after getting session:
let unreadMessageCount = 0;
if (session?.user?.id) {
  unreadMessageCount = await prisma.message.count({
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
}

// Pass to component:
<MobileBottomNav user={user} unreadMessageCount={unreadMessageCount} />
```

---

### SPEC-M4: Gallery Dot Touch Targets

**File**: `web/components/listings/listing-image-gallery.tsx`

```tsx
// CHANGE: Increase touch target of dots while keeping visual size compact
<div className="flex justify-center gap-2.5 md:hidden mt-3 px-2">
  {photos.map((_, index) => (
    <button
      key={index}
      className={cn(
        // Visual dot stays small, but padding creates 44px touch target
        "relative flex items-center justify-center w-11 h-11 touch-manipulation",
      )}
      onClick={() => handleThumbnailClick(index)}
      aria-label={`Prikaži sliku ${index + 1}`}
    >
      <span
        className={cn(
          "h-2.5 rounded-full transition-all",
          index === currentIndex
            ? "w-8 bg-primary shadow-md"
            : "w-2.5 bg-muted-foreground/50"
        )}
      />
    </button>
  ))}
</div>
```

This wraps each dot in a 44x44px touch target area while keeping the visual dot small and elegant.

---

### SPEC-M5: Mobile-Native Filter Selectors

For the homepage quick filter bar, detect mobile viewport and render bottom sheets instead of dropdown menus.

**Approach**: Create a `MobileFilterSheet` wrapper that renders a `Sheet` (bottom) on mobile and a `DropdownMenu` on desktop. Use the existing `Sheet` component from shadcn/ui.

**File**: `web/components/home/quick-filter-bar.tsx`

```tsx
// Replace DropdownMenu with responsive component
// On mobile: Sheet (bottom) with scrollable list and large touch targets
// On desktop: DropdownMenu (existing behavior)

// Example for brand selector:
{isMobile ? (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" className="h-12 w-full ...">
        {brandLabel}
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
      <SheetHeader>
        <SheetTitle>Izaberite marku</SheetTitle>
      </SheetHeader>
      {/* Search input */}
      <Input placeholder="Pretraži marke..." className="mt-4 min-h-[44px]" />
      {/* Scrollable list with 48px row height */}
      <div className="mt-4 overflow-y-auto flex-1">
        {filteredBrands.map(brand => (
          <button
            key={brand}
            className="flex w-full items-center justify-between px-4 py-3 min-h-[48px] text-base"
            onClick={() => toggleBrand(brand)}
          >
            {brand}
            {selectedBrands.includes(brand) && <Check className="h-5 w-5 text-primary" />}
          </button>
        ))}
      </div>
    </SheetContent>
  </Sheet>
) : (
  <DropdownMenu>
    {/* existing desktop implementation */}
  </DropdownMenu>
)}
```

Detection can use a `useMediaQuery` hook or `window.matchMedia('(max-width: 768px)')`.

---

### SPEC-M6: Advanced Filter Chip Touch Targets

**File**: `web/components/home/quick-filter-bar.tsx`

```tsx
// CHANGE: Increase min-height to 44px on all screen sizes
<button
  className={cn(
    "rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] transition-colors min-h-[44px]",
    // ... active/inactive styles
  )}
>
```

Change `min-h-[36px] sm:min-h-[40px]` to `min-h-[44px]` uniformly.

---

## Appendix: Mobile Audit Scorecard

| Area | Score | Notes |
|------|-------|-------|
| **Touch Targets** | 8/10 | Excellent overall, gallery dots and advanced filter chips are exceptions |
| **Navigation** | 7/10 | Good bottom nav + hamburger, missing unread badges |
| **Responsive Layout** | 8/10 | Smart horizontal-to-vertical card transition, proper breakpoints |
| **Gestures** | 6/10 | Gallery swipe is solid, no pull-to-refresh, no swipe navigation |
| **Safe Area** | 9/10 | Comprehensive iOS support, rare for web apps |
| **Content Visibility** | 5/10 | Fixed elements obscure content on multiple pages |
| **PWA / Installability** | 2/10 | No manifest, no viewport-fit, no service worker |
| **Performance** | 8/10 | Proper image optimization, dynamic imports, memo |
| **Forms / Input** | 7/10 | Good inputMode usage, 44px inputs, but dropdowns on mobile |
| **Offline / Network** | 1/10 | No offline support whatsoever |

---

## Sources

- [Baymard Institute — Mobile UX Trends 2025](https://baymard.com/blog/mobile-ux-ecommerce)
- [Mobile eCommerce Best Practices 2026](https://www.mobiloud.com/blog/mobile-ecommerce-best-practices)
- [Bottom Navigation Bar Guide 2025](https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/)
- [PWA Design Practices for eCommerce](https://www.gomage.com/blog/pwa-design/)
- [Sticky CTA Elements for Mobile PWA — Smashing Magazine](https://www.smashingmagazine.com/2020/01/mobile-pwa-sticky-bars-elements/)
- [Chrono24 App — Google Play](https://play.google.com/store/apps/details?id=com.chrono24.mobile)
- [Chrono24 App — App Store](https://apps.apple.com/us/app/chrono24-luxury-watch-market/id472912032)
- [Mobile CTA Button Best Practices](https://conversionsciences.com/mobile-call-to-action-buttons-best-guidelines-for-placement-copy-design/2/)
