# UX Review #5: Authentication & Onboarding

**Review Date:** January 2025
**Status:** Complete
**Priority:** Critical (Conversion funnel entry point)

---

## Executive Summary

The authentication and onboarding experience is the gateway to the entire platform. Current implementation is solid with multi-step signup, OAuth providers, password strength indicator, and a seller verification wizard. However, several high-impact improvements can significantly boost signup conversion rates and reduce drop-off.

**Key Findings:**
1. **Post-signup forces re-login** - After registration, users are redirected to signin page instead of being auto-logged-in
2. **No email verification flow** - Users have no email verification step, which affects trust and deliverability
3. **Signup form Step 0 shows OAuth always** - Even when providers aren't configured, step structure remains
4. **No welcome/onboarding screen** - After first login, users land on a generic dashboard with no guidance
5. **Password reset success redirects after 3s** - Fixed timer with no user control
6. **Error page is functional but plain** - No visual treatment matching the auth page design language

---

## Current State Analysis

### Files Analyzed (23 files, ~2,966 lines)

| Category | Files | Key Components |
|----------|-------|----------------|
| Auth Config | [auth.ts](../auth.ts), [middleware.ts](../middleware.ts), [lib/auth.ts](../lib/auth.ts) | NextAuth v5, JWT, route protection |
| Auth Pages | 6 pages under [app/auth/](../app/auth/) | Signin, Signup, Forgot Password, Reset, Signout, Error |
| Auth Components | 6 components under [components/auth/](../components/auth/) | Forms, password strength, forgot link |
| API Routes | 4 routes under [app/api/auth/](../app/api/auth/) | Signup, forgot-password, reset-password, NextAuth |
| Seller Onboarding | [app/sell/](../app/sell/), [app/sell/verified/](../app/sell/verified/) | Landing page, verification wizard |
| Seller Components | [verified-wizard.tsx](../components/seller/verified-wizard.tsx), [profile-form.tsx](../components/seller/profile-form.tsx) | 3-step wizard, profile editor |

### Authentication Flows

```
SIGN UP (3-step):
Step 0: Choose method → OAuth (Google/Facebook) OR "Continue with email"
Step 1: Name + Email
Step 2: Password + Confirm Password + Strength indicator
→ POST /api/auth/signup → Redirect to /auth/signin?registered=true

SIGN IN:
OAuth buttons (Google/Facebook) OR Email + Password
→ signIn("credentials") → Redirect to /dashboard

PASSWORD RESET:
/auth/forgot-password → Email → Token (1hr) → /auth/reset-password?token=X → New password → 3s redirect to signin

SELLER VERIFICATION (3-step wizard):
Step 0: Store name, seller type, description
Step 1: Country, city, Instagram, proof image
Step 2: Confirmation → PENDING → APPROVED/REJECTED
```

### Strengths Identified

1. **Multi-step signup** - Progressive disclosure reduces cognitive load
2. **Progress bar** - Clear visual indicator of registration progress
3. **Password strength indicator** - Real-time feedback with checklist
4. **OAuth integration** - Google and Facebook with proper account linking
5. **Account linking security** - Prevents auto-link for password accounts (OAuthAccountNotLinked error with helpful message)
6. **Rate limiting** - 5 requests per 15 min on signup/reset endpoints
7. **Email enumeration protection** - Forgot password always returns success
8. **Redirect preservation** - Callback URLs preserved through auth flows
9. **Touch-friendly inputs** - 44px minimum height (h-12/min-h-[44px])
10. **Glassmorphism card design** - Visually polished auth cards with backdrop blur
11. **Seller onboarding context** - Signup page shows verified seller banner when redirected from `/sell/verified`
12. **Serbian localization** - All UI text properly translated

### Issues Identified

#### Critical UX Gaps

1. **Post-signup requires re-login**
   - After successful registration, user is sent to `/auth/signin?registered=true`
   - User must manually enter credentials again
   - Best practice: Auto-login after signup, redirect to onboarding/dashboard
   - **Impact:** 74% of users abandon complex flows; extra login step adds friction

2. **No post-login onboarding**
   - First-time users land on empty dashboard with no guidance
   - No welcome screen, feature tour, or "next steps" prompts
   - Missed opportunity to guide users toward their first action (browse watches, list a watch, complete profile)

3. **No email verification**
   - User accounts are created without email verification
   - Affects trust (unverified users messaging sellers)
   - Best practice: Allow immediate access, verify email in background with banner prompt

#### High Priority Gaps

4. **Signup Step 0 always shows even without OAuth**
   - If neither Google nor Facebook is configured, Step 0 still shows OAuth buttons (they just won't work)
   - Should skip to Step 1 directly when no providers available

5. **No "Remember me" option on signin**
   - Session is fixed at 7 days
   - Users have no control over session persistence

6. **Password reset has forced 3-second redirect**
   - After resetting password, user sees success message then auto-redirects after 3 seconds
   - No manual "Continue to sign in" button visible during countdown
   - User might miss the message or feel rushed

7. **Sign-out page has no animation/transition**
   - Abrupt state changes between "signing out...", "done", and "error"
   - Could use smoother transitions

#### Medium Priority Gaps

8. **No "Show password" toggle**
   - Password fields lack visibility toggle
   - Users can't verify what they typed
   - Especially important on mobile where typos are common

9. **Error page doesn't match auth design language**
   - Auth pages use glassmorphism cards
   - Error page uses plain centered text
   - Visual disconnect in the flow

10. **No Terms of Service / Privacy Policy acceptance**
    - Signup doesn't include TOS/privacy checkbox
    - Legal requirement for EU users (GDPR)

11. **Signup form doesn't check email availability in real-time**
    - User fills out all fields, submits, then gets "email exists" error
    - Should check email availability on Step 1 "Next" click

---

## Benchmark Comparison

### Airbnb

| Feature | Airbnb | PolovniSatovi |
|---------|--------|---------------|
| Social login options | Google, Apple, Facebook, Email | Google, Facebook, Email |
| Auto-login after signup | Yes | No (re-login required) |
| Phone number auth | Yes | No |
| Welcome onboarding | Yes (personalized) | No |
| Show password toggle | Yes | No |
| Email verification | Background, non-blocking | None |
| Terms acceptance | Inline during signup | Missing |

### Chrono24

| Feature | Chrono24 | PolovniSatovi |
|---------|----------|---------------|
| Signup fields | Email + Password only | 3-step (name, email, password) |
| Post-signup | Auto-login | Re-login required |
| Email verification | Required but non-blocking | None |
| Seller onboarding | Guided multi-step wizard | Yes (similar quality) |
| Password requirements | Visual indicator | Yes (similar quality) |
| Remember me | Yes | No |

### Stripe

| Feature | Stripe | PolovniSatovi |
|---------|--------|---------------|
| Signup flow | Email → Verify later | Email + Password |
| Progressive profiling | Yes (collect info over time) | All upfront |
| Email verification | Optional, delayed | None |
| Onboarding | Interactive setup guide | None |
| Error messages | Inline, contextual | Good but could improve |

---

## Prioritized Recommendations

### Critical Priority

#### CP1: Auto-Login After Signup
**Impact:** Critical | **Effort:** 2-3 hours

After successful registration via `/api/auth/signup`, automatically sign the user in instead of redirecting to the signin page.

**Files:** [components/auth/signup-form.tsx:159-188](../components/auth/signup-form.tsx#L159-188)

**Current flow:**
```
Register → Redirect to /auth/signin?registered=true → User logs in again
```

**New flow:**
```
Register → Auto signIn("credentials") → Redirect to /dashboard (or callback)
```

#### CP2: Add First-Time User Onboarding
**Impact:** Critical | **Effort:** 1-2 days

After first login, show a welcome screen or guided prompt:
- "Welcome to PolovniSatovi! What would you like to do?"
- Browse watches (→ /listings)
- List your watch (→ /dashboard/listings/new)
- Complete your profile (→ /dashboard/profile)
- Become a verified seller (→ /sell/verified)

**Files:** New component, [app/dashboard/page.tsx](../app/dashboard/page.tsx)

#### CP3: Add Email Verification (Non-Blocking)
**Impact:** Critical | **Effort:** 2-3 days

Implement background email verification:
1. Send verification email on signup
2. Allow immediate platform access
3. Show persistent banner: "Verifikujte vaš email" until verified
4. Gate certain features behind verification (messaging sellers, leaving reviews)

**Database:** Add `emailVerified` field (already exists in NextAuth User model), verification token fields
**Files:** New API route, email template, banner component

### High Priority

#### HP1: Add "Show Password" Toggle
**Impact:** High | **Effort:** 1-2 hours

Add eye icon toggle on all password fields.

**Files:** [components/auth/signin-form.tsx](../components/auth/signin-form.tsx), [components/auth/signup-form.tsx](../components/auth/signup-form.tsx), [components/auth/reset-password-form.tsx](../components/auth/reset-password-form.tsx)

```tsx
const [showPassword, setShowPassword] = useState(false);

<div className="relative">
  <Input type={showPassword ? "text" : "password"} ... />
  <button
    type="button"
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

#### HP2: Check Email Availability on Step 1
**Impact:** High | **Effort:** 2-3 hours

When user clicks "Next" on Step 1, check if email is already registered:
- If exists: Show inline error with link to sign in
- If new: Proceed to Step 2

**Files:** [components/auth/signup-form.tsx](../components/auth/signup-form.tsx), new API route `/api/auth/check-email`

#### HP3: Skip Step 0 When No OAuth Providers
**Impact:** Medium | **Effort:** 1 hour

If no OAuth providers are configured, start signup directly at Step 1.

**Files:** [components/auth/signup-form.tsx](../components/auth/signup-form.tsx), [app/auth/signup/page.tsx](../app/auth/signup/page.tsx)

#### HP4: Improve Password Reset Success UX
**Impact:** Medium | **Effort:** 1 hour

Replace forced 3-second redirect with:
- Clear success message
- Prominent "Nastavi na prijavu" button
- Optional auto-redirect after 5 seconds with visible countdown

**Files:** [components/auth/reset-password-form.tsx](../components/auth/reset-password-form.tsx)

### Medium Priority

#### MP1: Add Terms of Service Acceptance
**Impact:** Medium (Legal) | **Effort:** 2-3 hours

Add checkbox on signup Step 2:
```
☐ Prihvatam Uslove korišćenja i Politiku privatnosti
```

**Files:** [components/auth/signup-form.tsx](../components/auth/signup-form.tsx)

#### MP2: Match Error Page Design to Auth Pages
**Impact:** Low | **Effort:** 1-2 hours

Update error page to use glassmorphism card design consistent with signin/signup.

**Files:** [app/auth/error/page.tsx](../app/auth/error/page.tsx)

#### MP3: Add "Remember Me" Toggle
**Impact:** Medium | **Effort:** 2-3 hours

Allow users to choose session persistence:
- Checked: 30-day session
- Unchecked: Session-only (closes with browser)

**Files:** [components/auth/signin-form.tsx](../components/auth/signin-form.tsx), [auth.ts](../auth.ts)

#### MP4: Add Sign-Out Animation
**Impact:** Low | **Effort:** 1 hour

Smooth transition between sign-out states with fade animations.

**Files:** [app/auth/signout/page.tsx](../app/auth/signout/page.tsx)

---

## Implementation Specifications

### Spec 1: Auto-Login After Signup (CP1)

**Current code in signup-form.tsx:**
```typescript
// Lines 159-188
const response = await fetch("/api/auth/signup", { ... });
const data = await response.json();
if (!response.ok) {
  setError(data.error || "...");
} else {
  const destination = redirectTo
    ? `/auth/signin?registered=true&redirect=${encodeURIComponent(redirectTo)}`
    : `/auth/signin?registered=true&redirect=${encodeURIComponent("/dashboard/profile")}`;
  router.push(destination);
}
```

**New code:**
```typescript
const response = await fetch("/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: name.trim(),
    email: email.trim(),
    password,
  }),
});

const data = await response.json();

if (!response.ok) {
  setError(data.error || "Došlo je do greške. Pokušajte ponovo.");
} else {
  // Auto-login after successful registration
  const signInResult = await signIn("credentials", {
    email: email.trim(),
    password,
    redirect: false,
  });

  if (signInResult?.error) {
    // Fallback: redirect to signin if auto-login fails
    router.push(`/auth/signin?registered=true`);
  } else {
    // Success: go directly to destination
    const destination = redirectTo || "/dashboard/profile";
    router.push(destination);
    router.refresh();
  }
}
```

---

### Spec 2: First-Time Onboarding Component (CP2)

**New component: `components/dashboard/welcome-card.tsx`**
```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, User, ShieldCheck, X } from "lucide-react";
import Link from "next/link";

interface WelcomeCardProps {
  userName?: string;
  onDismiss: () => void;
}

const ACTIONS = [
  {
    icon: Search,
    title: "Pregledaj satove",
    description: "Pretražite kolekciju satova od proverenih prodavaca",
    href: "/listings",
    variant: "outline" as const,
  },
  {
    icon: PlusCircle,
    title: "Postavi oglas",
    description: "Prodajte svoj sat brzo i besplatno",
    href: "/dashboard/listings/new",
    variant: "default" as const,
  },
  {
    icon: User,
    title: "Uredi profil",
    description: "Dopunite vaš profil sa osnovnim informacijama",
    href: "/dashboard/profile",
    variant: "outline" as const,
  },
  {
    icon: ShieldCheck,
    title: "Postani verifikovani prodavac",
    description: "Dobijte trust badge i javnu profil stranicu",
    href: "/sell/verified",
    variant: "outline" as const,
  },
];

export function WelcomeCard({ userName, onDismiss }: WelcomeCardProps) {
  return (
    <Card className="border-[#D4AF37]/30 bg-[#D4AF37]/5">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">
            Dobrodošli{userName ? `, ${userName.split(" ")[0]}` : ""}!
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Odakle želite da počnete?
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-start gap-3 rounded-xl border bg-background p-4 transition hover:border-[#D4AF37]/50 hover:shadow-sm"
            >
              <action.icon className="h-5 w-5 mt-0.5 text-[#D4AF37] shrink-0" />
              <div>
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Integration in dashboard page:**
```tsx
// Check if user is new (created within last 24h or has no listings/favorites)
const isNewUser = user.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000);

{isNewUser && !dismissed && (
  <WelcomeCard userName={user.name} onDismiss={() => setDismissed(true)} />
)}
```

---

### Spec 3: Show Password Toggle (HP1)

**Reusable component: `components/auth/password-input.tsx`**
```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Sakrij šifru" : "Prikaži šifru"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
```

Replace all `<Input type="password" ... />` with `<PasswordInput ... />` across signin, signup, and reset forms.

---

### Spec 4: Email Availability Check (HP2)

**New API route: `/api/auth/check-email/route.ts`**
```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = emailSchema.safeParse(body.email);

  if (!validation.success) {
    return Response.json({ available: false, error: "Neispravan email" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: validation.data.toLowerCase() },
    select: { id: true },
  });

  return Response.json({ available: !existingUser });
}
```

**In signup-form.tsx, update handleDetailsNext:**
```typescript
const handleDetailsNext = async () => {
  setError("");
  // ... existing validation ...

  // Check email availability
  try {
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail }),
    });
    const data = await res.json();
    if (!data.available) {
      setError(
        <span>
          Email je već registrovan.{" "}
          <Link href="/auth/signin" className="text-[#D4AF37] underline">Prijavite se</Link>
        </span>
      );
      return;
    }
  } catch {}

  setStep(2);
};
```

---

### Spec 5: Email Verification Banner (CP3)

**New component: `components/ui/email-verification-banner.tsx`**
```tsx
"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const resend = async () => {
    setSending(true);
    try {
      await fetch("/api/auth/verify-email/resend", { method: "POST" });
      toast.success("Email za verifikaciju je poslat!");
    } catch {
      toast.error("Greška pri slanju. Pokušajte ponovo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-amber-800 dark:text-amber-200">
            Verifikujte vaš email ({email}) da biste otključali sve funkcije.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:text-amber-900 h-7 text-xs"
            onClick={resend}
            disabled={sending}
          >
            {sending ? "Slanje..." : "Ponovo pošalji"}
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Seller Onboarding Analysis

### Strengths
- **Dark hero section** is visually striking and differentiates from regular pages
- **Team quote** adds authenticity and personal touch
- **Clear benefits list** (badge, profile page, priority support)
- **3-step wizard** breaks down complex application into manageable steps
- **Application status tracking** (PENDING/APPROVED/REJECTED) with clear messages
- **Redirect flow preserved** - Signup → Login → Back to verification page

### Gaps
- **No progress saving** - If user leaves wizard midway, progress is lost (unless they already submitted)
- **No preview** - Sellers can't preview how their profile will look
- **Step 2 mentions Didit KYC** but doesn't explain the process clearly
- **No estimated timeline visibility** - "1-2 business days" mentioned only in status card

### Seller Onboarding Recommendations

#### SO1: Add Profile Preview in Wizard
Show a live preview of how the seller profile will appear to buyers during the wizard.

#### SO2: Improve KYC Step Communication
Add clear visual steps showing the full verification journey:
```
1. Popunite prijavu ✓
2. Admin pregled (1-2 dana)
3. Verifikacija identiteta (Didit)
4. Profil aktivan!
```

#### SO3: Send Application Status Emails
Notify sellers via email when their application status changes (APPROVED, REJECTED with feedback).

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Signup completion rate | Unknown | +25% | Track step abandonment |
| Signup → first action | Unknown | < 5 min | Time to first listing/browse |
| Password reset completion | Unknown | +15% | Track token usage |
| Seller application completion | Unknown | +20% | Track wizard step drop-off |
| Email verification rate | N/A | 70%+ | Track verification clicks |

---

## Research Sources

- [Authgear - Login & Signup UX Complete 2025 Guide](https://www.authgear.com/post/login-signup-ux-guide)
- [Eleken - Best Sign Up Flows 2025: 15 UX Examples](https://www.eleken.co/blog-posts/sign-up-flow)
- [Userpilot - Ultimate Guide to SaaS Signup Flow UX](https://userpilot.com/blog/saas-signup-flow/)
- [UXCam - App Onboarding Guide 2025](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)
- [UX Design Institute - Onboarding Best Practices 2025](https://www.uxdesigninstitute.com/blog/ux-onboarding-best-practices-guide/)
- [Ping Identity - 12 Best Practices for Frictionless Sign Up](https://www.pingidentity.com/en/resources/blog/post/frictionless-signup.html)
- [Webstacks - Multi-Step Form Best Practices 2025](https://www.webstacks.com/blog/multi-step-form)

---

## Next Steps

1. **Immediate:** Auto-login after signup (CP1) - highest ROI, lowest effort
2. **This week:** Show password toggle (HP1), email availability check (HP2)
3. **Next sprint:** First-time onboarding (CP2), email verification (CP3)
4. **Backlog:** Terms acceptance, Remember Me, error page redesign

---

*Review completed. Proceed to Review #6: User Dashboard Overview*
