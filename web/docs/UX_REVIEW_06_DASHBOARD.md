# UX Review #6: User Dashboard Overview

**Review Date:** January 2025
**Status:** Complete
**Priority:** High (Core authenticated experience)

---

## Executive Summary

The dashboard is the primary hub for authenticated users. The current implementation is feature-rich with a tabbed interface, stat cards, status breakdown, quick actions, and preview sections. However, the information architecture can be improved — the single-page tabbed approach puts too much on one page, navigation between dashboard sections is tab-based rather than persistent sidebar, and there's no actionable intelligence (metrics are static counts without context or trends).

**Key Findings:**
1. **No persistent sidebar navigation** - Dashboard uses tabs on a single page; sub-pages (listings, messages, etc.) lack shared navigation
2. **Metrics lack context** - Stats show raw counts without trends, comparisons, or actionable prompts
3. **No notification center** - Unread count shown but no central notification feed
4. **Tab state not preserved in URL** - Switching tabs doesn't update URL, so users can't bookmark or share specific tabs
5. **Preview sections are server-rendered but tabs are client-side** - All tab content loads on initial page load regardless of active tab
6. **No activity feed or timeline** - Users have no chronological view of what happened

---

## Current State Analysis

### Files Analyzed

| File | Purpose | Lines |
|------|---------|-------|
| [app/dashboard/page.tsx](../app/dashboard/page.tsx) | Main hub with tabs & stats | 587 |
| [app/dashboard/loading.tsx](../app/dashboard/loading.tsx) | Loading skeleton | 47 |
| [_components/listings-preview.tsx](../app/dashboard/_components/listings-preview.tsx) | 3 recent listings | 86 |
| [_components/messages-preview.tsx](../app/dashboard/_components/messages-preview.tsx) | 3 recent threads | 159 |
| [_components/wishlist-preview.tsx](../app/dashboard/_components/wishlist-preview.tsx) | 6 recent favorites | 100 |
| [app/dashboard/listings/page.tsx](../app/dashboard/listings/page.tsx) | Full listings list | 65 |
| [app/dashboard/listings/new/page.tsx](../app/dashboard/listings/new/page.tsx) | Create listing wizard | 78 |
| [app/dashboard/listings/[id]/page.tsx](../app/dashboard/listings/[id]/page.tsx) | Listing preview | 241 |
| [app/dashboard/listings/[id]/edit/page.tsx](../app/dashboard/listings/[id]/edit/page.tsx) | Edit listing | 102 |
| [app/dashboard/messages/page.tsx](../app/dashboard/messages/page.tsx) | Messages list | 26 |
| [app/dashboard/messages/[threadId]/page.tsx](../app/dashboard/messages/[threadId]/page.tsx) | Thread view | 27 |
| [app/dashboard/profile/page.tsx](../app/dashboard/profile/page.tsx) | User profile | 135 |
| [app/dashboard/seller/profile/page.tsx](../app/dashboard/seller/profile/page.tsx) | Seller profile | 31 |
| [app/dashboard/wishlist/page.tsx](../app/dashboard/wishlist/page.tsx) | Wishlist page | 143 |

### Current Dashboard Structure

```
/dashboard (main hub page - 587 lines)
├── Tabs: Overview | Listings | Messages | Wishlist | Profile
│
├── Overview Tab:
│   ├── Profile Completion Alert (if missing location)
│   ├── Quick Stats Cards (4 cards: listings, messages, wishlist, verified)
│   ├── Listing Status Breakdown (6 status cards, filtered to non-zero)
│   └── Quick Actions (6 buttons)
│
├── Listings Tab → ListingsPreview (3 items) + "View All" link
├── Messages Tab → MessagesPreview (3 items) + "View All" link
├── Wishlist Tab → WishlistPreview (6 items) + "View All" link
└── Profile Tab → ProfileForm inline

Sub-pages (separate routes, no shared sidebar):
├── /dashboard/listings → Full listings list
├── /dashboard/listings/new → Create wizard
├── /dashboard/listings/[id] → Preview
├── /dashboard/listings/[id]/edit → Edit wizard
├── /dashboard/messages → Thread list
├── /dashboard/messages/[threadId] → Thread view
├── /dashboard/profile → User profile
├── /dashboard/seller/profile → Seller profile
└── /dashboard/wishlist → Full wishlist
```

### Strengths Identified

1. **Comprehensive overview** - Single page shows listings, messages, wishlist, verified status
2. **Optimized queries** - Reduced to 6 parallel queries with Promise.all
3. **Profile completion prompt** - Alerts users to add location data
4. **Verified seller conditional UI** - Shows different actions for verified vs non-verified
5. **Loading skeleton** - Proper loading state with skeletons for each section
6. **Suspense boundaries** - Each preview section wrapped in Suspense for streaming
7. **Stat cards with gradients** - Visually distinct cards with hover effects
8. **Quick actions section** - One-click access to common tasks
9. **Status breakdown** - Clear visibility into listing pipeline
10. **Empty states** - Each preview section has appropriate empty state CTAs

### Issues Identified

#### Critical UX Gaps

1. **No persistent navigation between dashboard sections**
   - Tabs on main page, but sub-pages (listings, messages, etc.) have no sidebar
   - Users must use browser back button or breadcrumbs to return
   - Best practice: Persistent sidebar navigation like Airbnb Host Dashboard, eBay Seller Hub
   - **Impact:** Users feel lost navigating between dashboard sections

2. **All tab content loads on initial page load**
   - All 5 tab panels render server-side on first load (587 line page)
   - Each preview component makes its own DB queries
   - Only the active tab is visible; others are hidden with CSS
   - **Impact:** Unnecessary server load, slower TTFB

3. **Metrics show raw counts without actionable context**
   - "Nepročitane poruke: 3" — but no trend or urgency indicator
   - "Ukupno oglasa: 5" — but no comparison to last period
   - Best practice: Connect metrics with actions (e.g., "3 new messages today — respond now")
   - **5-second rule:** Users should find needed info in 5 seconds; current dashboard requires scanning

#### High Priority Gaps

4. **Tab state not reflected in URL**
   - Switching tabs doesn't update the URL hash or query param
   - Users can't bookmark specific tabs or share links
   - Refreshing always returns to "Overview" tab

5. **No activity timeline/notification feed**
   - No chronological view of events (new messages, listing approved, new wishlist saves)
   - Users must check each section manually
   - Best practice: Activity feed showing recent events with timestamps

6. **No dashboard layout component**
   - No shared `layout.tsx` for dashboard routes with persistent navigation
   - Each sub-page is completely standalone
   - Missed opportunity for consistent sidebar + content structure

7. **Quick Actions section is static**
   - Same 6 buttons for every user, every time
   - No personalization based on user behavior
   - No urgency indicators (e.g., "Reply to 3 messages")

#### Medium Priority Gaps

8. **Profile form inline in Overview tab**
   - Full ProfileForm is rendered within the Profile tab on the main page
   - Also accessible at `/dashboard/profile` — redundancy
   - Profile editing should live in one place

9. **No data visualization**
   - Listing stats shown as numbers only
   - No charts or graphs for trends over time
   - Missing: views per listing, message response rate

10. **Mobile tabs require horizontal scroll on small screens**
    - 5 tabs on a 2-column grid can be awkward on mobile
    - Could benefit from bottom navigation bar pattern on mobile

11. **No keyboard shortcuts or quick search**
    - Power users have no keyboard-driven navigation
    - No search within dashboard content

---

## Benchmark Comparison

### Airbnb Host Dashboard

| Feature | Airbnb | PolovniSatovi |
|---------|--------|---------------|
| Persistent sidebar | Yes | No |
| Today's overview | "Today" tab with actions | Static stat cards |
| Notification center | Yes, with feed | No |
| Performance metrics | Graphs, trends, comparison | Raw counts only |
| Listing quality score | Yes | No |
| Response rate display | Prominent | Not tracked |
| Earnings dashboard | Yes | N/A (no payments) |
| Calendar management | Yes | No |
| Quick actions | Context-aware | Static |

### eBay Seller Hub

| Feature | eBay | PolovniSatovi |
|---------|------|---------------|
| Persistent sidebar | Yes | No |
| Activity feed | Yes | No |
| Performance dashboard | Detailed graphs | No |
| Task list | Active tasks/to-dos | No |
| Listing status overview | Visual funnel | Status cards (good) |
| Message inbox | Integrated | Separate tab |
| Sales analytics | Yes | No |
| Traffic stats | Views per listing | No |

### Chrono24 Seller Dashboard

| Feature | Chrono24 | PolovniSatovi |
|---------|----------|---------------|
| Navigation | Sidebar | Tabs |
| Listing management | List + grid views | List view only |
| Analytics | Views, inquiries | Not tracked |
| Quick actions | Context-based | Static |
| Notification bell | Yes | No |
| Status indicators | Color-coded | Badge-based (good) |

---

## Prioritized Recommendations

### Critical Priority

#### CP1: Add Dashboard Layout with Sidebar Navigation
**Impact:** Critical | **Effort:** 1-2 days

Create a shared `layout.tsx` for `/dashboard` with persistent sidebar:

```
┌──────────────────────────────────────┐
│ Header (existing navbar)             │
├────────────┬─────────────────────────┤
│ Sidebar    │ Content Area            │
│            │                         │
│ • Pregled  │  (current page)         │
│ • Oglasi   │                         │
│ • Poruke   │                         │
│ • Želje    │                         │
│ • Profil   │                         │
│ • Prodavac │                         │
│            │                         │
│ [Mobile:   │                         │
│  Bottom    │                         │
│  nav bar]  │                         │
└────────────┴─────────────────────────┘
```

**Files:** New [app/dashboard/layout.tsx](../app/dashboard/layout.tsx), new sidebar component

#### CP2: Convert Tabs to Separate Route-Based Pages
**Impact:** Critical | **Effort:** 1 day

Instead of one 587-line page with hidden tabs, make the overview page lean:
- `/dashboard` → Overview with stat cards and activity feed
- `/dashboard/listings` → Full listings (already exists)
- `/dashboard/messages` → Messages (already exists)
- `/dashboard/wishlist` → Wishlist (already exists)
- `/dashboard/profile` → Profile (already exists)

Each uses the shared sidebar layout. Remove tab-based architecture.

**Files:** [app/dashboard/page.tsx](../app/dashboard/page.tsx) — reduce to overview only

#### CP3: Add Actionable Context to Metrics
**Impact:** High | **Effort:** 3-4 hours

Transform stat cards from raw counts to actionable prompts:

| Current | Improved |
|---------|----------|
| "Nepročitane poruke: 3" | "3 nova pitanja — odgovorite danas" |
| "Ukupno oglasa: 5" | "5 oglasa • 2 čekaju odobrenje" |
| "Lista želja: 8" | "8 sačuvanih • 1 snižen" |

**Files:** [app/dashboard/page.tsx](../app/dashboard/page.tsx)

### High Priority

#### HP1: Add Activity Feed
**Impact:** High | **Effort:** 2-3 days

Create a chronological feed showing:
- New messages received
- Listing status changes (approved, rejected)
- New wishlist saves (for sellers: when someone favorites their listing)
- New reviews

```tsx
// Activity feed item types
type ActivityItem = {
  type: "message" | "listing_status" | "wishlist" | "review";
  title: string;
  description: string;
  timestamp: Date;
  href: string;
  icon: LucideIcon;
};
```

**Database:** Could use existing data with a combined query, or add an Activity model

#### HP2: Add Notification Bell to Navbar
**Impact:** High | **Effort:** 1 day

Add notification indicator in the global navbar:
- Bell icon with count badge
- Dropdown showing recent notifications
- Link to full notification center

**Files:** [components/site/navbar.tsx](../components/site/navbar.tsx), new notification component

#### HP3: Persist Tab/Section State in URL
**Impact:** Medium | **Effort:** 2-3 hours

If keeping tabs temporarily, use URL search params:
```
/dashboard?tab=messages
/dashboard?tab=listings
```

**Files:** [app/dashboard/page.tsx](../app/dashboard/page.tsx)

### Medium Priority

#### MP1: Add Mobile Bottom Navigation
**Impact:** Medium | **Effort:** 1 day

Replace tab scrolling on mobile with fixed bottom navigation bar:
```
┌─────────────────────────┐
│     Content Area        │
│                         │
│                         │
├───┬───┬───┬───┬───┤
│ 🏠 │ 📋 │ 💬 │ ❤️ │ 👤 │
│Home│List│Msg │Wish│Prof│
└───┴───┴───┴───┴───┘
```

#### MP2: Add Listing Performance Metrics
**Impact:** Medium | **Effort:** 2-3 days

Track and display per-listing analytics:
- Views count
- Wishlist saves count
- Message inquiries count
- Days since posted

**Database:** Add `viewCount` to Listing model or create ListingAnalytics model

#### MP3: Contextual Quick Actions
**Impact:** Medium | **Effort:** 3-4 hours

Make quick actions respond to user state:
- If user has pending listings: "2 čekaju odobrenje — pregled"
- If user has unread messages: "Odgovorite na 3 poruke"
- If no listings: "Kreirajte vaš prvi oglas"
- If not verified: "Postanite verifikovani prodavac"

#### MP4: Remove Profile Redundancy
**Impact:** Low | **Effort:** 1-2 hours

Remove inline ProfileForm from dashboard Overview tab. Keep it only at `/dashboard/profile`. Replace the Profile tab with a link to the profile page.

---

## Implementation Specifications

### Spec 1: Dashboard Layout with Sidebar (CP1)

**New file: `app/dashboard/layout.tsx`**
```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[#FAFAFA] to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex gap-6 py-8 sm:py-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <DashboardSidebar
              userName={session.user.name}
              isVerified={(session.user as any).isVerified}
            />
          </aside>
          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
```

**New file: `components/dashboard/sidebar.tsx`**
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Heart,
  User,
  ShieldCheck,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  userName?: string | null;
  isVerified?: boolean;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Pregled", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Moji oglasi", icon: FileText },
  { href: "/dashboard/messages", label: "Poruke", icon: MessageSquare },
  { href: "/dashboard/wishlist", label: "Lista želja", icon: Heart },
  { href: "/dashboard/profile", label: "Moj profil", icon: User },
];

export function DashboardSidebar({ userName, isVerified }: DashboardSidebarProps) {
  const pathname = usePathname();

  const items = [...NAV_ITEMS];
  if (isVerified) {
    items.push({
      href: "/dashboard/seller/profile",
      label: "Prodavnica",
      icon: Store,
    });
  }

  return (
    <nav className="sticky top-24 space-y-1">
      {/* User identity */}
      <div className="mb-6 px-3">
        <p className="text-sm font-semibold text-foreground truncate">
          {userName || "Dashboard"}
        </p>
        {isVerified && (
          <span className="inline-flex items-center gap-1 text-xs text-[#D4AF37] mt-1">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>

      {/* Navigation links */}
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

---

### Spec 2: Simplified Overview Page (CP2)

**Simplified `app/dashboard/page.tsx` (overview only):**
```tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, MessageSquare, Heart, Plus, ShieldCheck } from "lucide-react";

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const userId = session.user.id;

  const [listingCount, unreadCount, wishlistCount] = await Promise.all([
    prisma.listing.count({ where: { sellerId: userId } }),
    prisma.message.count({
      where: {
        thread: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        senderId: { not: userId },
        readAt: null,
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Dobrodošli, {session.user.name?.split(" ")[0] || "nazad"}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Evo šta se dešava na vašem nalogu
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* ... simplified stat cards with actionable text ... */}
      </div>

      {/* Primary CTA */}
      <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#b6932c] text-neutral-900">
        <Link href="/dashboard/listings/new">
          <Plus className="mr-2 h-5 w-5" />
          Kreiraj novi oglas
        </Link>
      </Button>

      {/* Activity Feed */}
      <Suspense fallback={<ActivityFeedSkeleton />}>
        <ActivityFeed userId={userId} />
      </Suspense>
    </div>
  );
}
```

---

### Spec 3: Activity Feed Component (HP1)

**New component: `components/dashboard/activity-feed.tsx`**
```tsx
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Heart,
  Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sr } from "date-fns/locale";
import Link from "next/link";

interface ActivityFeedProps {
  userId: string;
}

export async function ActivityFeed({ userId }: ActivityFeedProps) {
  // Fetch recent activities from multiple sources
  const [recentMessages, recentStatusChanges, recentFavorites] = await Promise.all([
    // Last 5 messages received
    prisma.message.findMany({
      where: {
        thread: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        senderId: { not: userId },
      },
      include: {
        sender: { select: { name: true } },
        thread: { select: { id: true, listing: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Last 5 listing status changes (use updatedAt)
    prisma.listing.findMany({
      where: { sellerId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      select: { id: true, title: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    // Last 5 favorites on user's listings (if seller)
    prisma.favorite.findMany({
      where: { listing: { sellerId: userId } },
      include: {
        user: { select: { name: true } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Combine and sort all activities
  const activities = [
    ...recentMessages.map((m) => ({
      type: "message" as const,
      title: `Nova poruka od ${m.sender.name || "korisnika"}`,
      description: m.thread.listing?.title || "",
      timestamp: m.createdAt,
      href: `/dashboard/messages/${m.thread.id}`,
      icon: MessageSquare,
      color: "text-blue-600",
    })),
    ...recentStatusChanges.map((l) => ({
      type: "status" as const,
      title: l.status === "APPROVED" ? "Oglas odobren" : "Oglas odbijen",
      description: l.title,
      timestamp: l.updatedAt,
      href: `/dashboard/listings/${l.id}`,
      icon: l.status === "APPROVED" ? CheckCircle2 : XCircle,
      color: l.status === "APPROVED" ? "text-emerald-600" : "text-red-600",
    })),
    ...recentFavorites.map((f) => ({
      type: "favorite" as const,
      title: `${f.user.name || "Korisnik"} je sačuvao vaš oglas`,
      description: f.listing.title,
      timestamp: f.createdAt,
      href: "#",
      icon: Heart,
      color: "text-pink-600",
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Još nema aktivnosti. Kreirajte vaš prvi oglas da biste počeli!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nedavna aktivnost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <Link
              key={`${activity.type}-${i}`}
              href={activity.href}
              className="flex items-start gap-3 px-6 py-3 hover:bg-muted/50 transition-colors border-b last:border-0"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(activity.timestamp, {
                  addSuffix: true,
                  locale: sr,
                })}
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

---

### Spec 4: Mobile Bottom Navigation (MP1)

**New component: `components/dashboard/mobile-nav.tsx`**
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, MessageSquare, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Pregled", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Oglasi", icon: FileText },
  { href: "/dashboard/messages", label: "Poruke", icon: MessageSquare },
  { href: "/dashboard/wishlist", label: "Želje", icon: Heart },
  { href: "/dashboard/profile", label: "Profil", icon: User },
];

interface MobileNavProps {
  unreadCount?: number;
}

export function DashboardMobileNav({ unreadCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors relative",
                isActive
                  ? "text-[#D4AF37]"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.href === "/dashboard/messages" && unreadCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 h-4 w-4 rounded-full bg-[#D4AF37] text-[10px] font-bold text-neutral-900 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Add padding-bottom to layout for mobile nav:**
```tsx
<main className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</main>
```

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Time to find info (5s rule) | Unknown | < 5s | User testing |
| Dashboard page load time | Unknown | < 1.5s | Lighthouse/TTFB |
| Navigation success rate | Unknown | > 90% | Track dead-end returns |
| Quick action click-through | Unknown | +30% | Click tracking |
| Mobile dashboard usability | Unknown | > 80 SUS | User testing |

---

## Research Sources

- [20 Best Dashboard UI/UX Design Principles 2025](https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795)
- [UXPin - Dashboard Design Principles 2025](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [Pencil & Paper - Dashboard UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [DesignRush - Dashboard UX Best Practices 2025](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-ux)
- [Fuselab Creative - Dashboard Design Trends 2025](https://fuselabcreative.com/top-dashboard-design-trends-2025/)
- [Toptal - Dashboard Design Best Practices](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)
- [15 Dashboard Design Principles 2025](https://bricxlabs.com/blogs/tips-for-dashboard-design)
- [Marketplace UX Design: 9 Best Practices](https://excited.agency/blog/marketplace-ux-design)

---

## Next Steps

1. **Immediate:** Add dashboard layout.tsx with sidebar navigation (CP1)
2. **This week:** Convert tabs to route-based pages, simplify overview (CP2)
3. **Next sprint:** Activity feed (HP1), notification bell (HP2)
4. **Backlog:** Mobile bottom nav, listing analytics, contextual quick actions

---

*Review completed. Proceed to Review #7: Listing Creation Flow*
