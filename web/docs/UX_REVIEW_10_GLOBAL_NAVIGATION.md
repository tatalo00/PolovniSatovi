# UX Review #10: Global Navigation & Wayfinding

**Priority**: HIGH — Navigation directly impacts engagement, bounce rate, and conversion
**Date**: January 2026
**Benchmarks**: Chrono24, eBay, Airbnb, StockX, Baymard Institute navigation UX research, NN/g breadcrumb guidelines

---

## Executive Summary

PolovniSatovi has a solid navigation foundation with three complementary systems — desktop top nav, mobile bottom nav, and hamburger menu — plus a well-built navigation feedback provider with loading progress bar. However, the platform suffers from **fragmented wayfinding**: breadcrumbs are only on 3 of 20+ pages, dashboard navigation is a monolithic tab system without persistent nav, admin pages have no sub-navigation, and there's no global search accessible from every page. The biggest missed opportunity per Baymard research: 95% of ecommerce sites don't highlight the user's current scope in the main navigation — and PolovniSatovi partially does this but inconsistently.

**Overall Navigation Score: 6.5/10** — Good components, needs architectural cohesion.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Strengths](#2-strengths)
3. [Gap Analysis vs. Benchmarks](#3-gap-analysis)
4. [Recommendations](#4-recommendations)
5. [Implementation Specifications](#5-implementation-specifications)

---

## 1. Current State Analysis

### 1.1 Navigation Architecture Overview

The app uses three separate navigation systems that serve different breakpoints and contexts:

```
┌─────────────────────────────────────────┐
│  Desktop Top Navbar (fixed, z-50)       │  >= 768px
│  Logo | NavLinks | UserMenu             │
├─────────────────────────────────────────┤
│                                         │
│  Page Content                           │
│                                         │
├─────────────────────────────────────────┤
│  Footer                                 │
├─────────────────────────────────────────┤
│  Mobile Bottom Nav (fixed, z-50)        │  < 1024px
└─────────────────────────────────────────┘
     ┌─────────────────┐
     │ Hamburger Menu   │  < 768px (Sheet)
     │ (right drawer)   │
     └─────────────────┘
```

### 1.2 Component Inventory

| Component | File | Visibility | Items |
|-----------|------|-----------|-------|
| **NavLinks** | `navbar-links.tsx` | `md:flex` (>=768px) | 5 links: Oglasi, Prodaj, Blog, O nama, Kontakt |
| **NavUserMenu** | `navbar-user-menu.tsx` | `md:flex` (>=768px) | Wishlist, Messages, Dashboard, Avatar dropdown |
| **NavMobileMenu** | `navbar-mobile-menu.tsx` | `md:hidden` (<768px) | 5 main + 3 user + admin + auth actions |
| **MobileBottomNav** | `mobile-bottom-nav.tsx` | `lg:hidden` (<1024px) | 5 tabs: Home, Oglasi, Prodaj, Poruke, Profil |
| **Footer** | `footer.tsx` | Always | 5 info links + security copy |
| **Breadcrumbs** | `breadcrumbs.tsx` | Per-page | Home > ... > Current Page |
| **MessagesNavLink** | `messages-nav-link.tsx` | Desktop nav | Polls unread count every 30s |
| **UnreadBadge** | `unread-badge.tsx` | Desktop nav only | Red badge with count (up to 99+) |

### 1.3 Active State Logic

Three separate active state implementations exist:

**NavLinks** (`navbar-links.tsx:21`):
```typescript
const isActive = pathname === item.href || pathname.startsWith(item.href);
```
- Visual: Gold underline bar (`h-0.5 bg-primary`) below text
- Text color change: `text-foreground` when active, `text-muted-foreground` when inactive

**NavMobileMenu** (`navbar-mobile-menu.tsx:66-69`):
```typescript
const isActive = (href: string, matchPrefix?: string) => {
  return pathname === href || pathname.startsWith(href) ||
    (matchPrefix && pathname.startsWith(matchPrefix));
};
```
- Visual: Background highlight (`bg-primary/10 text-primary`)
- Supports extra prefix matching (e.g., `/listing/` matches `/listings` nav item)

**MobileBottomNav** (`mobile-bottom-nav.tsx:57-62`):
```typescript
const isActive = (href: string, exact: boolean) => {
  if (exact) return pathname === href;
  return pathname === href || (href !== "/" && pathname.startsWith(href));
};
```
- Visual: Gold text (`text-primary`) for active tab
- Supports exact matching for home page

### 1.4 Breadcrumbs Usage

**Component** (`components/ui/breadcrumbs.tsx`):
- Home icon as first link (always present)
- ChevronRight separators
- Last item is non-clickable current page name
- Proper `aria-label="Breadcrumb"` for accessibility

**Pages WITH breadcrumbs** (3 of 20+):
1. `/listing/[id]` — `Home > Oglasi > [Brand] > [Title]`
2. `/dashboard/listings` — `Home > Dashboard > Moji Oglasi`
3. `/sellers/[slug]` — `Home > Prodavci > [Store Name]`

**Pages WITHOUT breadcrumbs** (17+):
- `/dashboard` (main)
- `/dashboard/messages`, `/dashboard/messages/[id]`
- `/dashboard/wishlist`
- `/dashboard/profile`, `/dashboard/seller/profile`
- `/dashboard/listings/[id]`, `/dashboard/listings/[id]/edit`
- `/admin`, `/admin/listings`, `/admin/listings/[id]`
- `/admin/reports`, `/admin/verifications`
- `/auth/signin`, `/auth/signup`, `/auth/forgot-password`
- `/sell`, `/sell/verified`
- `/about`, `/contact`, `/blog`, `/faq`, `/terms`, `/privacy`

### 1.5 Navigation Feedback System

**NavigationFeedbackProvider** (`navigation-feedback-provider.tsx`):
- Top progress bar: 2px height, primary color, animated
- Title prefix: Prepends "⌛ Učitavanje – " to browser tab during navigation
- Timing: 0ms start delay (immediate), 300ms minimum visible
- Detection: Intercepts anchor clicks and popstate events
- Cleanup: Automatically stops when pathname changes

### 1.6 Dashboard Navigation

The dashboard uses a **Tabs** component (`Tabs` from shadcn/ui) with 5 tabs:
- Pregled (Overview) — stat cards, quick actions
- Oglasi (Listings) — recent listings preview
- Poruke (Messages) — recent threads preview
- Lista želja (Wishlist) — saved listings
- Profil (Profile) — user profile form

**Issues**:
- All tabs render server-side in a single 587-line page
- No URL persistence — tabs don't sync with URL
- No breadcrumbs on the dashboard or its sub-pages
- Sub-pages (`/dashboard/listings`, `/dashboard/messages`) are separate routes with no back-navigation to the dashboard tabs

### 1.7 Admin Navigation

The admin panel has:
- Main page (`/admin`) with stat cards and quick action buttons
- Sub-pages accessible via card links
- **No breadcrumbs, no sidebar, no tab navigation**
- Only the admin link in the desktop user dropdown and mobile menu provides entry

### 1.8 Search Accessibility

- **Global search**: Not available. No search in the navbar.
- **Homepage**: Full filter bar with brand/price/movement/condition selectors
- **Listings page**: Left sidebar with comprehensive filters
- Users must navigate to `/listings` or homepage to search

---

## 2. Strengths

### 2.1 Navigation Feedback Provider ✅
The custom `NavigationFeedbackProvider` is notably well-implemented:
- Intercepts all internal link clicks (not just Next.js Link)
- Handles browser back/forward via `popstate`
- Shows both visual progress bar and title prefix
- Smart same-page detection to avoid false triggers
- Proper cleanup with refs and timeouts

### 2.2 Consistent Next.js Link Usage ✅
All internal navigation uses Next.js `<Link>` component — no raw `<a>` tags for internal routes. This ensures proper client-side navigation, prefetching, and route transitions.

### 2.3 Auth-Aware Navigation ✅
All three nav systems (desktop, mobile menu, bottom nav) properly adapt based on authentication state:
- Logged out: Show signin/signup buttons
- Logged in: Show messages, dashboard, profile
- Admin: Show admin panel link
- Seller: Show appropriate links

### 2.4 Desktop Unread Messages Badge ✅
`MessagesNavLink` component polls every 30s for unread counts and displays an `UnreadBadge` in the desktop navbar. The badge supports 99+ overflow.

### 2.5 Three-Tier Mobile Navigation ✅
The combination of bottom nav (primary actions), hamburger menu (full navigation), and top navbar (branding) provides comprehensive mobile navigation coverage.

---

## 3. Gap Analysis

### 3.1 Critical Gaps

#### GAP-N1: Breadcrumbs Missing on 85% of Pages
**Current**: Only 3 pages have breadcrumbs out of 20+ pages.
**Impact**: Users lose spatial awareness after navigating 2+ levels deep. Per NN/g, breadcrumbs are critical for ecommerce sites where users land on product pages via search engines and need to navigate to parent categories.
**Benchmark**: Chrono24 shows breadcrumbs on every page except homepage. eBay shows breadcrumbs with category hierarchy on all product and category pages. Baymard research confirms breadcrumbs should appear on all pages with 2+ levels of depth.

#### GAP-N2: No Global Search in Navbar
**Current**: Search is only available on the homepage (quick filter bar) and listings page (filter sidebar). The navbar has no search icon or search bar.
**Impact**: Users must navigate to `/listings` to search. This is a significant friction point — search is the #1 navigation method on marketplaces. Baymard identifies visible search bar as essential ecommerce navigation element.
**Benchmark**: Chrono24 has a prominent search bar in the header on every page. eBay has a universal search bar. StockX has persistent search. Airbnb's search bar is the hero element of their navigation.

#### GAP-N3: No Main Navigation Scope Highlighting
**Current**: Desktop `NavLinks` highlights `Pogledaj oglase` when on `/listings`, but the dashboard, admin, auth, and sell pages have **no corresponding nav item** highlighted. Users on `/dashboard` or `/dashboard/messages` see no active nav state.
**Impact**: Per Baymard's 2025 research, 95% of sites fail to highlight the user's current scope — this makes it "unnecessarily difficult for users to determine where they are in the site hierarchy" and hampers learning the site's structure.
**Benchmark**: Airbnb always shows which section is active. eBay highlights the current section consistently.

### 3.2 High-Priority Gaps

#### GAP-N4: Dashboard Has No Persistent Sub-Navigation
**Current**: Dashboard uses client-side Tabs on the main page, but sub-pages (`/dashboard/listings`, `/dashboard/messages`, `/dashboard/wishlist`) are separate routes with no shared navigation. Users navigating to sub-pages lose the tab context entirely.
**Impact**: Users can't easily switch between dashboard sections once they've navigated to a sub-page. They must go back to `/dashboard` and find the tab.
**Benchmark**: Chrono24 has a persistent left sidebar in the user area. eBay has a persistent "My eBay" sidebar. Airbnb has a sub-navigation bar for host/account sections.

#### GAP-N5: Admin Panel Has No Sub-Navigation
**Current**: Admin panel (`/admin`) shows stat cards with links to sub-pages, but once on `/admin/listings` or `/admin/reports`, there's no way to navigate between admin sections without going back to `/admin`.
**Impact**: Admin users must navigate back to the main admin page to switch between listings, reports, and verifications — inefficient for daily operations.

#### GAP-N6: Mobile Bottom Nav Missing Unread Badge
**Current**: Desktop `MessagesNavLink` has unread badges with polling, but the mobile bottom nav's Messages tab has no badge (identified in Review #9, GAP-M3).
**Impact**: The majority of users (mobile) miss unread notifications entirely. This is particularly damaging because messaging is critical for marketplace transactions.

#### GAP-N7: Inconsistent Active State Logic
**Current**: Three separate `isActive` implementations with different matching rules:
- `NavLinks`: Simple `startsWith` (matches `/listing/123` to `/listings`)
- `NavMobileMenu`: Has `matchPrefix` parameter for cross-prefix matching
- `MobileBottomNav`: Has `exact` flag for home page
**Impact**: Active states can be inconsistent between desktop and mobile — e.g., on a listing detail page, mobile menu may show "Pogledaj oglase" as active while bottom nav may not highlight "Oglasi" correctly.

### 3.3 Medium-Priority Gaps

#### GAP-N8: 404 Page Lacks Visual Consistency
**Current**: The 404 page uses `bg-gray-100` background and a centered Card with minimal styling. It doesn't match the app's design language (gold accents, Playfair Display headings, modern aesthetic).
**Impact**: Users who hit a 404 get a jarring visual experience. The page offers only 2 generic links (Home, Listings) with no context-specific suggestions.

#### GAP-N9: No "Back to Results" Navigation on Listing Pages
**Current**: After viewing a listing from the listings grid, users can only go back via browser back button or breadcrumbs (Home > Oglasi > Brand > Title). There's no explicit "Back to results" link that preserves their filter state.
**Impact**: Users lose their filtered results when using breadcrumbs to go back to `/listings` (without query params). Browser back works but isn't visually obvious.
**Benchmark**: Chrono24 has "Back to search results" link. Amazon preserves search context.

#### GAP-N10: Footer Navigation Minimal
**Current**: Footer has 5 info links (O nama, Kontakt, Uslovi, Privatnost, FAQ) and a security blurb. No category links, no popular brands, no sitemap-style navigation.
**Impact**: Footer is an underutilized navigation asset. Ecommerce best practice is to include category links, popular searches, and trust elements in the footer.

#### GAP-N11: No Keyboard Navigation Shortcuts
**Current**: No keyboard shortcuts for navigation (e.g., `/` to focus search, `g + h` for home, `g + d` for dashboard).
**Impact**: Power users and accessibility-dependent users lack efficient navigation paths. Low priority but a quality-of-life improvement.

#### GAP-N12: Nav Items Don't Match Between Desktop and Mobile
**Current**:
- Desktop `NavLinks`: Oglasi, Prodaj, Blog, O nama, Kontakt (5 items)
- Mobile bottom nav: Početna, Oglasi, Prodaj, Poruke, Profil (5 items)
- Mobile hamburger: Oglasi, Prodaj, Blog, O nama, Kontakt + Dashboard, Poruke, Lista želja (8+ items)
**Impact**: The primary nav items differ across surfaces. Blog, O nama, and Kontakt are in the desktop nav but not the bottom nav. Poruke and Profil are in the bottom nav but not the desktop main nav. While this is partly intentional (screen real estate), it can create confusion about information architecture.

---

## 4. Recommendations

### Priority: Critical

#### REC-N1: Add Breadcrumbs to All Multi-Level Pages (GAP-N1)
Add the existing `Breadcrumbs` component to every page that is 2+ levels deep in the hierarchy. The component already exists and works well.

**Effort**: Low (component exists, just needs to be added to pages)
**Impact**: High — improves wayfinding on 17+ pages

**Pages to add breadcrumbs:**
| Page | Breadcrumb Trail |
|------|-----------------|
| `/dashboard` | Home > Dashboard |
| `/dashboard/messages` | Home > Dashboard > Poruke |
| `/dashboard/messages/[id]` | Home > Dashboard > Poruke > [Listing Title] |
| `/dashboard/wishlist` | Home > Dashboard > Lista želja |
| `/dashboard/profile` | Home > Dashboard > Profil |
| `/dashboard/seller/profile` | Home > Dashboard > Prodavnička stranica |
| `/dashboard/listings/[id]` | Home > Dashboard > Moji Oglasi > [Title] |
| `/dashboard/listings/[id]/edit` | Home > Dashboard > Moji Oglasi > [Title] > Izmeni |
| `/admin` | Home > Admin Panel |
| `/admin/listings` | Home > Admin Panel > Oglasi na čekanju |
| `/admin/listings/[id]` | Home > Admin Panel > Oglasi > [Title] |
| `/admin/reports` | Home > Admin Panel > Prijave |
| `/admin/verifications` | Home > Admin Panel > Verifikacije |
| `/sell` | Home > Prodaj sat |
| `/about` | Home > O nama |
| `/contact` | Home > Kontakt |
| `/blog` | Home > Blog |
| `/faq` | Home > FAQ |

#### REC-N2: Add Global Search to Navbar (GAP-N2)
Add a search icon/bar to the top navbar that opens a search overlay or navigates to `/listings` with the search query.

**Effort**: Medium
**Impact**: Critical — search is the #1 navigation method for marketplace users

### Priority: High

#### REC-N3: Add Dashboard Sub-Navigation (GAP-N4)
Replace the tab-based dashboard with a persistent sub-navigation (sidebar on desktop, horizontal scroll on mobile) that stays visible across all dashboard sub-pages.

**Effort**: High (architectural change)
**Impact**: High — improves dashboard usability significantly

#### REC-N4: Add Admin Sub-Navigation (GAP-N5)
Add a simple tab bar or sidebar to the admin section for navigating between Listings, Reports, and Verifications.

**Effort**: Medium
**Impact**: High for admin users — daily workflow improvement

#### REC-N5: Unify Active State Logic (GAP-N7)
Create a shared `useActiveRoute` hook that all navigation components use, ensuring consistent active state detection across desktop and mobile.

**Effort**: Low
**Impact**: Medium — eliminates inconsistencies between nav surfaces

### Priority: Medium

#### REC-N6: Improve 404 Page Design (GAP-N8)
Redesign the 404 page to match the platform's visual identity with gold accents, contextual suggestions, and a search bar.

**Effort**: Low
**Impact**: Medium — improves recovery for lost users

#### REC-N7: Add "Back to Results" on Listing Pages (GAP-N9)
Store the previous listing search URL in sessionStorage and show a "Back to results" link above the breadcrumbs on listing detail pages.

**Effort**: Medium
**Impact**: Medium — preserves user search context

#### REC-N8: Enrich Footer Navigation (GAP-N10)
Add popular brands, quick category links, and a mini search to the footer.

**Effort**: Low
**Impact**: Low-Medium — incremental improvement to bottom-of-page discovery

---

## 5. Implementation Specifications

### SPEC-N1: Breadcrumbs on Dashboard Pages

**File**: `web/app/dashboard/page.tsx`

Add after the imports and before the header section:

```tsx
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

// Inside the return, before the header:
<Breadcrumbs
  items={[
    { label: "Dashboard" },
  ]}
  className="mb-4"
/>
```

**File**: `web/app/dashboard/messages/page.tsx`

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Poruke" },
  ]}
  className="mb-4"
/>
```

**File**: `web/app/dashboard/wishlist/page.tsx`

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Lista želja" },
  ]}
  className="mb-4"
/>
```

Repeat pattern for all dashboard sub-pages. Same approach for admin pages:

**File**: `web/app/admin/page.tsx`

```tsx
<Breadcrumbs
  items={[
    { label: "Admin Panel" },
  ]}
  className="mb-4"
/>
```

**File**: `web/app/admin/listings/page.tsx`

```tsx
<Breadcrumbs
  items={[
    { label: "Admin Panel", href: "/admin" },
    { label: "Oglasi na čekanju" },
  ]}
  className="mb-4"
/>
```

---

### SPEC-N2: Global Search in Navbar

**Approach**: Add a search icon button in the desktop navbar and a search trigger in the mobile hamburger menu. When clicked, open a command palette-style dialog (using `cmdk` or a simple sheet) with search input.

**File**: `web/components/site/navbar.tsx`

```tsx
import { NavSearch } from "./navbar-search";

// Add between NavLinks and NavUserMenu:
<div className="ml-auto hidden items-center justify-end gap-2 md:col-span-3 md:flex">
  <NavSearch /> {/* ADD */}
  <NavUserMenu user={user} />
</div>
```

**File**: `web/components/site/navbar-search.tsx` (new)

```tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function NavSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/listings?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  }, [query, router]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-label="Pretraži"
      >
        <Search className="h-5 w-5" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0">
          <DialogTitle className="sr-only">Pretraži satove</DialogTitle>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex items-center gap-2 p-4"
          >
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretražite po marki, modelu, referenci..."
              className="border-0 focus-visible:ring-0 text-base"
            />
          </form>
          {/* Optional: Quick suggestions section */}
          <div className="border-t px-4 py-3">
            <p className="text-xs text-muted-foreground mb-2">Popularne pretrage</p>
            <div className="flex flex-wrap gap-2">
              {["Rolex", "Omega", "Seiko", "Tag Heuer"].map(brand => (
                <button
                  key={brand}
                  type="button"
                  className="rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/listings?brand=${encodeURIComponent(brand)}`);
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Keyboard shortcut**: Add a global listener for `/` key to open search:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as Element)?.tagName)) {
      e.preventDefault();
      setOpen(true);
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

### SPEC-N3: Dashboard Sub-Navigation Component

**File**: `web/components/dashboard/dashboard-nav.tsx` (new)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, MessageSquare, Heart, User } from "lucide-react";

const DASHBOARD_NAV_ITEMS = [
  { href: "/dashboard", label: "Pregled", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Oglasi", icon: FileText },
  { href: "/dashboard/messages", label: "Poruke", icon: MessageSquare },
  { href: "/dashboard/wishlist", label: "Lista želja", icon: Heart },
  { href: "/dashboard/profile", label: "Profil", icon: User },
] as const;

export function DashboardNav() {
  const pathname = usePathname() ?? "/dashboard";

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex overflow-x-auto border-b bg-background scrollbar-hide" aria-label="Dashboard navigation">
      <div className="flex min-w-max px-4">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Usage**: Add to dashboard layout (`web/app/dashboard/layout.tsx`):

```tsx
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <DashboardNav />
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
```

This provides persistent navigation across all dashboard pages. The main `/dashboard/page.tsx` should be refactored to show only the Overview tab content.

---

### SPEC-N4: Admin Sub-Navigation

**File**: `web/components/admin/admin-nav.tsx` (new)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Flag, ShieldCheck } from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Pregled", exact: true },
  { href: "/admin/listings", label: "Oglasi", icon: FileText },
  { href: "/admin/reports", label: "Prijave", icon: Flag },
  { href: "/admin/verifications", label: "Verifikacije", icon: ShieldCheck },
] as const;

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav className="flex border-b mb-6" aria-label="Admin navigation">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

---

### SPEC-N5: Unified Active Route Hook

**File**: `web/lib/hooks/use-active-route.ts` (new)

```tsx
"use client";

import { usePathname } from "next/navigation";

interface RouteMatchOptions {
  exact?: boolean;
  matchPrefixes?: string[];
}

export function useActiveRoute() {
  const pathname = usePathname() ?? "/";

  const isActive = (href: string, options?: RouteMatchOptions) => {
    const { exact = false, matchPrefixes = [] } = options ?? {};

    if (exact) return pathname === href;

    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    if (matchPrefixes.some(prefix => pathname.startsWith(prefix))) return true;

    return false;
  };

  return { pathname, isActive };
}
```

Then refactor all three nav components to use this single hook instead of inline implementations.

---

### SPEC-N6: Improved 404 Page

**File**: `web/app/not-found.tsx`

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Stranica nije pronađena
          </p>
          <h1 className="font-heading text-6xl font-semibold text-primary">404</h1>
          <p className="text-muted-foreground text-base">
            Stranica koju tražite ne postoji ili je uklonjena.
            Proverite URL ili se vratite na početnu.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Početna
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/listings">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pogledaj oglase
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Appendix: Navigation Audit Scorecard

| Area | Score | Notes |
|------|-------|-------|
| **Component Quality** | 8/10 | Well-built, type-safe, accessible components |
| **Breadcrumbs** | 3/10 | Component exists but only used on 3 pages |
| **Search** | 4/10 | Good filter bar exists but not globally accessible |
| **Active States** | 6/10 | Works on main nav, missing on dashboard/admin scope |
| **Wayfinding** | 5/10 | Good on main pages, poor in dashboard/admin depth |
| **Navigation Feedback** | 9/10 | Excellent progress bar with title prefix |
| **Dashboard Nav** | 4/10 | Tab-based monolith, no persistent sub-nav |
| **Admin Nav** | 3/10 | No sub-navigation between sections |
| **Mobile Nav** | 7/10 | Good bottom nav + hamburger, missing badges |
| **Footer** | 5/10 | Minimal, underutilized for discovery |
| **404/Error** | 4/10 | Functional but visually inconsistent |

---

## Sources

- [Baymard Institute — Homepage & Navigation UX Best Practices 2025](https://baymard.com/blog/ecommerce-navigation-best-practice)
- [NN/g — Breadcrumbs: 11 Design Guidelines for Desktop and Mobile](https://www.nngroup.com/articles/breadcrumbs/)
- [Mobile Breadcrumbs Design Guidelines](https://thegood.com/insights/mobile-breadcrumbs/)
- [Ecommerce Navigation UX Best Practices 2025](https://www.designstudiouiux.com/blog/ecommerce-navigation-best-practices/)
- [How Users Navigate a Website — UX Guide 2025](https://www.parallelhq.com/blog/how-users-move-through-information-or-navigate-pages-of-website)
- [Website Navigation Best Practices](https://forgeandsmith.com/blog/website-navigation-ux-best-practices/)
