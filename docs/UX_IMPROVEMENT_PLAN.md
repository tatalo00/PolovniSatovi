# UX Improvement Plan for PolovniSatovi

## Platform Overview

PolovniSatovi is a watch marketplace with:
- Homepage with hero, featured listings, quick filters
- Listings browse page with filters
- Individual listing detail pages
- User dashboard (listings, messages, wishlist, profile)
- Seller verification system
- Messaging between buyers and sellers
- Review system

---

## 1. Homepage Improvements

### Current State
- Hero section with featured listings
- Quick filter bar
- Featured/paid listings section
- Trust services and education hub

### Recommendations

#### A. Add Recent Listings Section
- [ ] Show "Najnoviji oglasi" (newest listings) on homepage
- [ ] Currently fetched but not displayed (`recentListings` variable exists but unused)
- [ ] Add horizontal scroll carousel or grid below featured listings

#### B. Add Search Bar to Hero
- [ ] Prominent search input in hero section
- [ ] Quick search by brand, model, or keyword
- [ ] Auto-suggest popular brands as user types

#### C. Add "Browse by Price" Quick Links
- [ ] Price segments are defined but not displayed
- [ ] Show clickable price range cards (Budget, Mid-Range, Serious, Luxury)
- [ ] Each links to `/listings?min=X&max=Y`

#### D. Social Proof Section
- [ ] Show recent sales/sold items count
- [ ] Display testimonials or featured reviews
- [ ] "X satova prodato ovog meseca" counter

---

## 2. Listings Page Improvements

### Current State
- Grid/list view with filters sidebar
- Mobile filter drawer
- Pagination

### Recommendations

#### A. Saved Searches
- [ ] Allow users to save filter combinations
- [ ] Email notifications when new listings match saved search
- [ ] Quick access to saved searches in dashboard

#### B. Sort Options Enhancement
- [ ] Add "Najpopularnije" (most viewed) sort option
- [ ] Add "Najnovije sniženje" (recently reduced price) if price history exists

#### C. Quick View Modal
- [ ] Hover/click to preview listing without leaving page
- [ ] Show main image, price, key specs, contact button
- [ ] Reduces back-and-forth navigation

#### D. Infinite Scroll Option
- [ ] Alternative to pagination for mobile users
- [ ] "Učitaj više" button or auto-load on scroll

#### E. Filter Improvements
- [ ] Show active filter count on mobile filter button
- [ ] "Obriši sve filtere" (clear all) button more prominent
- [ ] Remember last used filters in session

---

## 3. Listing Detail Page Improvements

### Current State
- Image gallery with thumbnails
- Specs table, description
- Seller info card
- Contact form
- Reviews section

### Recommendations

#### A. Image Gallery Enhancements
- [ ] Full-screen lightbox on image click
- [ ] Swipe gestures on mobile
- [ ] Image zoom on hover (lens component exists but verify usage)
- [ ] Show image count indicator (e.g., "3/8")

#### B. Price History (if applicable)
- [ ] Show if price was reduced
- [ ] "Sniženo sa €X" badge
- [ ] Price drop notifications for wishlisted items

#### C. Similar Listings Section
- [ ] "Slični oglasi" at bottom of page
- [ ] Based on same brand, price range, or condition
- [ ] Helps users discover alternatives

#### D. Sticky Mobile CTA
- [ ] Price and "Kontaktiraj prodavca" always visible on mobile
- [ ] Currently exists (`listing-sticky-cta.tsx`) - verify it's implemented

#### E. Share Improvements
- [ ] Add copy link button
- [ ] WhatsApp share (popular in Balkans)
- [ ] Viber share option

---

## 4. Dashboard Improvements

### Current State
- Tabs: Overview, Listings, Messages, Wishlist, Profile
- Stats cards, quick actions
- Recent items in each tab

### Recommendations

#### A. Notification Center
- [ ] Bell icon in navbar with dropdown
- [ ] New message notifications
- [ ] Listing status changes (approved, rejected)
- [ ] Price drops on wishlisted items

#### B. Analytics for Sellers
- [ ] View count per listing
- [ ] Message/inquiry count
- [ ] "Najpopularniji oglas" highlight
- [ ] Weekly/monthly stats summary

#### C. Bulk Actions for Listings
- [ ] Select multiple listings
- [ ] Bulk archive, delete, or renew
- [ ] Useful for sellers with many listings

#### D. Draft Auto-Save
- [ ] Auto-save listing form as draft
- [ ] "Imate nesačuvan nacrt" reminder
- [ ] Resume where you left off

---

## 5. Messaging Improvements

### Current State
- Thread list with listing context
- Message bubbles
- 10-second polling for new messages

### Recommendations

#### A. Typing Indicator
- [ ] Show when other user is typing
- [ ] Requires real-time (Supabase Realtime or polling)

#### B. Read Receipts
- [ ] Show when message was read
- [ ] Already have `readAt` field - display it

#### C. Quick Replies
- [ ] Pre-defined response templates
- [ ] "Da li je još dostupno?", "Koja je najniža cena?", etc.
- [ ] One-tap to send common questions

#### D. Image Sharing in Messages
- [ ] Allow sending photos in conversation
- [ ] Useful for showing watch condition, authenticity docs

#### E. Message Search
- [ ] Search across all conversations
- [ ] Find specific discussions quickly

---

## 6. Authentication & Onboarding

### Current State
- Sign in/sign up forms
- Password reset flow
- Seller verification wizard

### Recommendations

#### A. Social Login
- [ ] Google sign-in
- [ ] Apple sign-in
- [ ] Reduces friction for new users

#### B. Onboarding Tour
- [ ] First-time user walkthrough
- [ ] Highlight key features (search, wishlist, messaging)
- [ ] "Kako da prodam sat" guide for new sellers

#### C. Email Verification Reminder
- [ ] Prompt unverified users to verify email
- [ ] Show benefits of verification

---

## 7. Mobile Experience

### Current State
- Responsive design
- Mobile bottom navigation
- Mobile filter drawer

### Recommendations

#### A. Pull-to-Refresh
- [ ] On listings page and dashboard
- [ ] Native mobile feel

#### B. Swipe Actions
- [ ] Swipe listing card to add to wishlist
- [ ] Swipe message to archive/delete

#### C. App-Like Navigation
- [ ] Smooth page transitions (already have some)
- [ ] Back gesture support
- [ ] Persistent bottom nav state

#### D. Offline Support
- [ ] Cache viewed listings
- [ ] Show cached content when offline
- [ ] Queue messages to send when back online

---

## 8. Trust & Safety

### Current State
- Verified seller badges
- Report listing functionality
- Admin review queue

### Recommendations

#### A. Buyer Protection Info
- [ ] "Kako kupovati bezbedno" guide
- [ ] Tips for spotting scams
- [ ] What to check before buying

#### B. Seller Ratings Display
- [ ] Show seller rating on listing cards
- [ ] Star rating + review count
- [ ] Filter by seller rating

#### C. Verification Badges Explanation
- [ ] Tooltip explaining what "Verified" means
- [ ] Link to verification process
- [ ] Build trust with transparency

---

## 9. Accessibility Improvements

### Recommendations

#### A. Keyboard Navigation
- [ ] Ensure all interactive elements are focusable
- [ ] Visible focus indicators
- [ ] Skip to main content link

#### B. Screen Reader Support
- [ ] Proper ARIA labels on icons
- [ ] Alt text on all images
- [ ] Announce dynamic content changes

#### C. Color Contrast
- [ ] Verify all text meets WCAG AA standards
- [ ] Don't rely solely on color for information

#### D. Reduced Motion
- [ ] Respect `prefers-reduced-motion`
- [ ] Disable animations for users who prefer it

---

## 10. Performance Perception

### Recommendations

#### A. Skeleton Loaders
- [ ] Consistent skeleton patterns across pages
- [ ] Already have some - ensure coverage
- [ ] Match actual content layout

#### B. Optimistic Updates
- [ ] Wishlist toggle instant feedback
- [ ] Message send shows immediately
- [ ] Revert on error

#### C. Progressive Image Loading
- [ ] Low-quality placeholder → full image
- [ ] Already have blur placeholders - verify usage

---

## Priority Implementation Order

### Phase 1: Quick Wins (1-2 days each)
- [ ] Display recent listings on homepage
- [ ] Add price segment quick links
- [ ] Show read receipts in messages
- [ ] Add WhatsApp/Viber share buttons
- [ ] Improve filter UX (clear all, active count)

### Phase 2: Medium Effort (3-5 days each)
- [ ] Similar listings section
- [ ] Quick view modal
- [ ] Notification center
- [ ] Seller analytics dashboard
- [ ] Quick reply templates

### Phase 3: Larger Features (1-2 weeks each)
- [ ] Saved searches with notifications
- [ ] Social login (Google)
- [ ] Image sharing in messages
- [ ] Onboarding tour
- [ ] Offline support (PWA)

---

## Progress Tracking

| Task | Status | Priority | Date Completed |
|------|--------|----------|----------------|
| Recent listings on homepage | ⬜ Pending | High | - |
| Price segment links | ⬜ Pending | High | - |
| WhatsApp share | ⬜ Pending | Medium | - |
| Similar listings | ⬜ Pending | High | - |
| Notification center | ⬜ Pending | Medium | - |
| Quick view modal | ⬜ Pending | Medium | - |
| Saved searches | ⬜ Pending | Low | - |
| Social login | ⬜ Pending | Medium | - |

---

## Notes

- Focus on features that reduce friction in the buy/sell flow
- Prioritize mobile experience (likely majority of traffic)
- Consider A/B testing for major UX changes
- Gather user feedback before implementing large features
