# UX Review #7: Listing Creation Flow

**Review Date:** January 2025
**Status:** Complete
**Priority:** High (Seller conversion funnel)

---

## Executive Summary

The listing creation wizard is one of the best-implemented features on the platform. The 4-step wizard with draft autosave, visual condition/box-papers cards, brand autocomplete, and real-time price conversion demonstrates strong product thinking. However, several improvements can reduce seller friction and increase listing completion rates.

**Key Findings:**
1. **No success/celebration screen** — After submission, user is silently redirected to listings page with only a toast
2. **No listing preview before submission** — User can't see how their listing will look to buyers
3. **Photos step lacks drag-to-reorder UI feedback** — No visual indication of reorder capability
4. **Step 3 (Details) has 20+ fields** — Despite "skip" option, can feel overwhelming
5. **No "Save as Draft" explicit button** — Autosave exists but users have no manual save control
6. **Title is auto-generated** — Users can't customize the listing title
7. **Legacy 1,160-line form exists alongside wizard** — Code duplication

---

## Current State Analysis

### Files Analyzed (21 files, ~4,797 lines)

| Category | Files | Key Components |
|----------|-------|----------------|
| Wizard Core | [index.tsx](../components/listings/listing-wizard/index.tsx), [wizard-context.tsx](../components/listings/listing-wizard/wizard-context.tsx), [wizard-progress.tsx](../components/listings/listing-wizard/wizard-progress.tsx), [wizard-navigation.tsx](../components/listings/listing-wizard/wizard-navigation.tsx) | Orchestration, state, progress, nav |
| Steps | [step-photos.tsx](../components/listings/listing-wizard/steps/step-photos.tsx), [step-identity.tsx](../components/listings/listing-wizard/steps/step-identity.tsx), [step-pricing.tsx](../components/listings/listing-wizard/steps/step-pricing.tsx), [step-details.tsx](../components/listings/listing-wizard/steps/step-details.tsx) | 4 wizard steps |
| Helpers | [brand-combobox.tsx](../components/listings/listing-wizard/components/brand-combobox.tsx), [condition-cards.tsx](../components/listings/listing-wizard/components/condition-cards.tsx), [box-papers-cards.tsx](../components/listings/listing-wizard/components/box-papers-cards.tsx), [collapsible-section.tsx](../components/listings/listing-wizard/components/collapsible-section.tsx) | Reusable sub-components |
| Validation | [listing-wizard.ts](../lib/validation/listing-wizard.ts), [listing.ts](../lib/validation/listing.ts) | Zod schemas per step |
| API | [route.ts](../app/api/listings/route.ts), [[id]/route.ts](../app/api/listings/%5Bid%5D/route.ts), [suggest/route.ts](../app/api/listings/suggest/route.ts) | CRUD + autocomplete |
| Pages | [new/page.tsx](../app/dashboard/listings/new/page.tsx), [edit/page.tsx](../app/dashboard/listings/%5Bid%5D/edit/page.tsx) | Entry points |

### Current Wizard Flow

```
Step 0: Photos (3-10 images)
  ├── Image upload to Supabase
  ├── Tips box with photography advice
  └── Minimum validation (3 photos)

Step 1: Identity
  ├── Brand (autocomplete with 15 popular + API search)
  ├── Model (text input)
  ├── Reference (optional, pattern-validated)
  ├── Condition (6 visual cards with icons + descriptions)
  └── Gender (3 toggle buttons)

Step 2: Pricing & Condition
  ├── Currency toggle (EUR/RSD with live conversion)
  ├── Price input with currency prefix
  ├── Box & Papers (4 visual cards)
  ├── Warranty (select dropdown)
  ├── Running Condition (select dropdown)
  ├── Warranty Card (checkbox)
  └── Original Owner (checkbox)

Step 3: Details (ALL OPTIONAL, skippable)
  ├── Case & Movement (8 fields)
  ├── Dial & Bezel (4 fields)
  ├── Strap/Bracelet (3 fields)
  └── Additional Info (description + location)

→ Submit → POST /api/listings (status: PENDING)
→ Redirect to /dashboard/listings + toast notification
```

### Strengths Identified

1. **Wizard pattern with clear steps** — Progressive disclosure keeps each step manageable
2. **Draft autosave every 30 seconds** — Data preserved in localStorage
3. **Draft recovery dialog** — Prompts user to resume or discard on return
4. **Visual selection cards** — Condition and Box/Papers cards are excellent UX
5. **Brand autocomplete** — 15 popular brands + API search with debounce
6. **Real-time price conversion** — EUR↔RSD with ≈ indicator
7. **Photography tips** — Actionable advice in the photo step
8. **Skippable details step** — Acknowledges that not all fields are critical
9. **Per-step validation** — Only validates current step fields on "Next"
10. **Edit mode support** — Same wizard for create and edit, with data pre-population
11. **Collapsible sections** — Details step organized in 4 collapsible groups
12. **Serbian localization** — All labels, placeholders, and errors translated

### Issues Identified

#### High Priority Gaps

1. **No listing preview before submission**
   - User clicks "Objavi oglas" and listing goes directly to PENDING
   - No chance to see how listing looks to buyers
   - Best practice: Show preview step or confirmation screen
   - **Impact:** Users submit incomplete or poorly formatted listings

2. **No success/celebration screen**
   - After submit: toast("Oglas je poslat na pregled") + redirect to listings
   - No celebration, no "what happens next" explanation
   - Missed opportunity: Explain approval process, suggest next actions
   - **Impact:** Users feel uncertain about what happened

3. **No explicit "Save as Draft" button**
   - Autosave exists but is invisible to users
   - No "Save for later" CTA
   - Users might close and worry about data loss
   - **Impact:** Users rush through wizard to avoid losing work

4. **Title auto-generated, not editable**
   - Title = "{brand} {model}" — auto-generated on API
   - Users can't customize the listing title
   - Chrono24 allows custom titles with keywords
   - **Impact:** Limited SEO and discoverability

5. **Details step has 20+ fields in one screen**
   - Even with collapsible sections, Step 3 is dense
   - All 4 sections visible on load (3 collapsed, 1 open)
   - Could benefit from "smart defaults" or "auto-fill from reference"

#### Medium Priority Gaps

6. **No inline image annotations**
   - Users upload photos but can't mark which shows the dial, caseback, etc.
   - Chrono24 has labeled photo slots (front, back, side, wrist)

7. **No model autocomplete**
   - Brand has autocomplete, but model doesn't
   - Could suggest popular models for selected brand

8. **No market price reference**
   - When setting price, no guidance on typical prices for this brand/model
   - Could show: "Prosečna cena za Omega Speedmaster: €3,500 - €5,500"

9. **Price field uses `priceEurCents` naming for display value**
   - Confusing naming: `priceEurCents` holds the user-entered display value (e.g., "1500")
   - Not actually cents until conversion in submitListing
   - Could lead to maintenance bugs

10. **No image quality validation**
    - Minimum 3 photos enforced, but no resolution/size checks
    - No blur detection or aspect ratio guidance

11. **Legacy form coexists (1,160 lines)**
    - [listing-form.tsx](../components/listings/listing-form.tsx) appears unused
    - Code duplication with wizard; maintenance burden

#### Minor Gaps

12. **No keyboard shortcuts** — Can't press Enter to advance steps
13. **No estimated time to complete** — "~5 min" would set expectations
14. **Currency toggle could remember preference** — Always defaults to EUR
15. **No listing template** — Repeat sellers can't save common settings

---

## Benchmark Comparison

### Chrono24

| Feature | Chrono24 | PolovniSatovi |
|---------|----------|---------------|
| Step wizard | Yes (6 steps) | Yes (4 steps) |
| Photo labels (front/back) | Yes | No |
| Reference lookup | Auto-fill specs from ref # | No |
| Market price guide | Yes, with range | No |
| Custom title | Yes | No (auto-generated) |
| Listing preview | Yes, before publish | No |
| Draft save | Yes (server-side) | Yes (localStorage) |
| Listing templates | Yes | No |
| Image quality check | Yes (resolution) | No |
| Condition guide with photos | Yes | Text descriptions only |

### eBay

| Feature | eBay | PolovniSatovi |
|---------|------|---------------|
| Product catalog lookup | GTIN/UPC auto-fill | Brand autocomplete only |
| AI-powered suggestions | Item specifics from photos | No |
| Listing preview | Full preview | No |
| Save as draft | Explicit button | Autosave only |
| Scheduling | Set publish date | No |
| Bulk listing | Yes | No |
| Listing analytics | After publish | No |

### Vinted (Marketplace)

| Feature | Vinted | PolovniSatovi |
|---------|--------|---------------|
| Photo-first approach | Yes (like PS) | Yes |
| Category selection | Guided tree | N/A (watches only) |
| Price suggestion | Based on similar items | No |
| Success celebration | Confetti animation | Toast only |
| Share to social | After publish | No |
| Bump/promote | Yes | No |

---

## Prioritized Recommendations

### High Priority

#### HP1: Add Listing Preview Step
**Impact:** High | **Effort:** 1 day

Add optional Step 4.5 (or make current Step 3 "Details" → Step 4 "Preview"):

```
Photos → Identity → Pricing → Details → Preview → Submit
```

Or simpler: Show preview in a dialog when user clicks "Objavi":
```tsx
<Dialog>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Pregled pre objavljivanja</DialogTitle>
    </DialogHeader>
    <ListingPreviewCard data={formData} photos={photos} />
    <DialogFooter>
      <Button variant="outline" onClick={close}>Izmeni</Button>
      <Button onClick={submit}>Objavi oglas</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Files:** [wizard-context.tsx](../components/listings/listing-wizard/wizard-context.tsx), new preview component

#### HP2: Add Success/Celebration Screen
**Impact:** High | **Effort:** 3-4 hours

After successful submission, show a dedicated success screen:

```tsx
function ListingSuccessScreen({ listingTitle }: { listingTitle: string }) {
  return (
    <div className="text-center space-y-6 py-12">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Oglas je uspešno kreiran!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Vaš oglas "{listingTitle}" je poslat na pregled. Obično odobravamo oglase
          u roku od 24 sata.
        </p>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Šta dalje?</h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard/listings/new">Kreiraj još jedan oglas</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/listings">Pregled mojih oglasa</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Files:** [wizard-context.tsx](../components/listings/listing-wizard/wizard-context.tsx) — add success state instead of immediate redirect

#### HP3: Add Explicit "Save as Draft" Button
**Impact:** High | **Effort:** 2-3 hours

Add visible draft management:
- "Sačuvaj nacrt" button in wizard navigation (secondary action)
- Toast confirmation: "Nacrt je sačuvan"
- Visual autosave indicator: "Automatski sačuvano pre 2 min"

**Files:** [wizard-navigation.tsx](../components/listings/listing-wizard/wizard-navigation.tsx), [wizard-context.tsx](../components/listings/listing-wizard/wizard-context.tsx)

```tsx
// In wizard-navigation.tsx, add:
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    {canGoPrev && <Button variant="outline" onClick={prevStep}>Nazad</Button>}
    <Button variant="ghost" size="sm" onClick={saveDraft}>
      <Save className="h-4 w-4 mr-1.5" />
      Sačuvaj nacrt
    </Button>
  </div>
  <Button onClick={handleNext}>{isLastStep ? submitLabel : "Sledeći korak"}</Button>
</div>

// Autosave indicator:
{lastSavedAt && (
  <p className="text-xs text-muted-foreground">
    Automatski sačuvano {formatDistanceToNow(lastSavedAt, { addSuffix: true, locale: sr })}
  </p>
)}
```

#### HP4: Add Model Autocomplete
**Impact:** Medium | **Effort:** 3-4 hours

Extend the suggestion API to include model suggestions when brand is selected:
```
/api/listings/suggest?type=model&brand=Omega&q=Spee
→ ["Speedmaster", "Seamaster", "De Ville"]
```

**Files:** [step-identity.tsx](../components/listings/listing-wizard/steps/step-identity.tsx), [suggest/route.ts](../app/api/listings/suggest/route.ts)

### Medium Priority

#### MP1: Add Market Price Reference
**Impact:** Medium | **Effort:** 1-2 days

When brand + model are entered, show price guidance:
```tsx
// After price input:
{priceGuide && (
  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm">
    <p className="font-medium text-blue-900">Prosečna cena na platformi:</p>
    <p className="text-blue-700">
      {priceGuide.brand} {priceGuide.model}: €{priceGuide.min.toLocaleString()} - €{priceGuide.max.toLocaleString()}
    </p>
    <p className="text-xs text-blue-600 mt-1">
      Bazirano na {priceGuide.count} oglasa u poslednjih 6 meseci
    </p>
  </div>
)}
```

**API:** Extend suggest endpoint or create `/api/listings/price-guide`

#### MP2: Add Labeled Photo Slots
**Impact:** Medium | **Effort:** 1 day

Instead of generic upload, suggest specific shots:
```
1. Prednja strana (cifferblat)  — REQUIRED
2. Poleđina (caseback)          — REQUIRED
3. Bočna strana                 — REQUIRED
4. Na ruci (wrist shot)         — Optional
5. Kutija i papiri              — Optional
6-10. Dodatne fotografije      — Optional
```

**Files:** [step-photos.tsx](../components/listings/listing-wizard/steps/step-photos.tsx)

#### MP3: Add Custom Title Field
**Impact:** Medium | **Effort:** 2-3 hours

Add optional title override in Step 1:
```tsx
<div className="space-y-2">
  <Label htmlFor="title">Naslov oglasa (opciono)</Label>
  <Input
    id="title"
    placeholder={`${brand} ${model}`}
    value={customTitle}
    onChange={(e) => setCustomTitle(e.target.value)}
  />
  <p className="text-xs text-muted-foreground">
    Ako ostavite prazno, naslov će biti automatski generisan.
  </p>
</div>
```

#### MP4: Remove Legacy listing-form.tsx
**Impact:** Low (code health) | **Effort:** 1 hour

Remove the 1,160-line legacy form component if it's no longer used anywhere.

**Files:** [listing-form.tsx](../components/listings/listing-form.tsx)

### Nice to Have

#### NH1: Reference Number Auto-Fill
**Impact:** Medium | **Effort:** 1-2 weeks

Build a watch reference database that auto-fills specs when user enters a reference number:
- Input: "326.30.40.50.01.001"
- Auto-fill: Omega Speedmaster, 40mm, Steel, Automatic, Chronograph

#### NH2: Estimated Completion Time
**Impact:** Low | **Effort:** 30 min

Show "~5 min" estimate at the start of the wizard.

#### NH3: Listing Templates for Repeat Sellers
**Impact:** Medium | **Effort:** 2-3 days

Save last listing's brand/location/condition as template for quick re-listing.

---

## Implementation Specifications

### Spec 1: Listing Preview Dialog (HP1)

**New component: `components/listings/listing-wizard/components/listing-preview.tsx`**
```tsx
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Watch, Package } from "lucide-react";
import { PriceDisplay } from "@/components/currency/price-display";
import type { ListingFormSchema } from "@/lib/validation/listing";

interface ListingPreviewProps {
  formData: Partial<ListingFormSchema>;
  photos: string[];
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Kao novo",
  EXCELLENT: "Odlično",
  VERY_GOOD: "Vrlo dobro",
  GOOD: "Dobro",
  FAIR: "Zadovoljavajuće",
};

const BOX_PAPERS_LABELS: Record<string, string> = {
  FULL_SET: "Kompletan set",
  BOX_ONLY: "Samo kutija",
  PAPERS_ONLY: "Samo papiri",
  NONE: "Bez kutije i papira",
};

export function ListingPreview({ formData, photos }: ListingPreviewProps) {
  const EUR_TO_RSD = 117;
  const priceEur = formData.currency === "EUR"
    ? Number(formData.priceEurCents || 0)
    : Number(formData.priceEurCents || 0) / EUR_TO_RSD;
  const priceEurCents = Math.round(priceEur * 100);

  return (
    <div className="space-y-6">
      {/* Photo gallery preview */}
      <div className="grid grid-cols-4 gap-2">
        {photos.slice(0, 4).map((url, i) => (
          <div
            key={url}
            className={`relative rounded-lg overflow-hidden ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
          >
            <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Listing info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">
            {formData.brand} {formData.model}
          </h3>
          {formData.reference && (
            <p className="text-sm text-muted-foreground">Ref. {formData.reference}</p>
          )}
        </div>

        <div className="text-2xl font-bold">
          <PriceDisplay amountEurCents={priceEurCents} />
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.condition && (
            <Badge variant="secondary">{CONDITION_LABELS[formData.condition]}</Badge>
          )}
          {formData.boxPapers && (
            <Badge variant="outline">
              <Package className="h-3 w-3 mr-1" />
              {BOX_PAPERS_LABELS[formData.boxPapers]}
            </Badge>
          )}
          {formData.year && (
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {formData.year}
            </Badge>
          )}
          {formData.location && (
            <Badge variant="outline">
              <MapPin className="h-3 w-3 mr-1" />
              {formData.location}
            </Badge>
          )}
        </div>

        {formData.description && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm whitespace-pre-wrap">{formData.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Integration in wizard-context.tsx:**
```tsx
// Instead of immediate submission, show preview state:
const [showPreview, setShowPreview] = useState(false);

// In submitListing — rename to requestSubmit:
const requestSubmit = useCallback(() => {
  setShowPreview(true);
}, []);

// Actual submit stays the same, called from preview dialog confirm
```

---

### Spec 2: Success Screen (HP2)

**Modify wizard-context.tsx to add success state:**
```tsx
const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle");
const [submittedTitle, setSubmittedTitle] = useState("");

const submitListing = useCallback(async () => {
  setSubmissionState("submitting");
  try {
    // ... existing submission logic ...

    // Don't redirect — show success screen
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setSubmittedTitle(`${formData.brand} ${formData.model}`);
    setSubmissionState("success");
    toast.success(isEditMode ? "Oglas je uspešno ažuriran" : "Oglas je poslat na pregled");
  } catch (error) {
    setSubmissionState("error");
    // ... error handling ...
  }
}, [/* deps */]);
```

**In wizard index.tsx, render success screen:**
```tsx
if (submissionState === "success") {
  return <ListingSuccessScreen listingTitle={submittedTitle} />;
}
```

---

### Spec 3: Autosave Indicator (HP3)

**New component: `components/listings/listing-wizard/components/autosave-indicator.tsx`**
```tsx
"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sr } from "date-fns/locale";

interface AutosaveIndicatorProps {
  lastSavedAt: Date | null;
  isDirty: boolean;
  isEditMode: boolean;
}

export function AutosaveIndicator({ lastSavedAt, isDirty, isEditMode }: AutosaveIndicatorProps) {
  if (isEditMode) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {isDirty ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Nesačuvane izmene...</span>
        </>
      ) : lastSavedAt ? (
        <>
          <Cloud className="h-3 w-3 text-green-500" />
          <span>Sačuvano {formatDistanceToNow(lastSavedAt, { addSuffix: true, locale: sr })}</span>
        </>
      ) : (
        <>
          <CloudOff className="h-3 w-3" />
          <span>Nije sačuvano</span>
        </>
      )}
    </div>
  );
}
```

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Wizard completion rate | Unknown | +20% | Track step-to-step drop-off |
| Time to first listing | Unknown | < 8 min | Timestamp tracking |
| Draft recovery rate | Unknown | > 60% | Track draft dialog interactions |
| Listings needing resubmission | Unknown | -30% | Track rejection → resubmit |
| Photo count avg per listing | Unknown | 5+ photos | DB query |

---

## Research Sources

- [Marketplace UX Design: 9 Best Practices](https://excited.agency/blog/marketplace-ux-design)
- [8 Best Multi-Step Form Examples 2025](https://www.webstacks.com/blog/multi-step-form)
- [Marketplace Seller Onboarding](https://www.journeyh.io/blog/marketplace-onboarding-marketplace-seller)
- [Product Listing Page Best Practices](https://www.stibosystems.com/blog/product-listing-page-best-practices-create-better-listings-with-pim)
- [7 User Onboarding Best Practices 2025](https://formbricks.com/blog/user-onboarding-best-practices)
- [Baymard Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering)

---

## Next Steps

1. **Immediate:** Add listing preview dialog before submission (HP1)
2. **This week:** Success screen (HP2), explicit draft save + autosave indicator (HP3)
3. **Next sprint:** Model autocomplete (HP4), market price reference (MP1)
4. **Backlog:** Labeled photo slots, custom titles, reference auto-fill

---

*Review completed. Proceed to Review #8: Messaging System*
