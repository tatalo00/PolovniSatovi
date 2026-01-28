import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { QuickFilterSection } from "@/components/home/quick-filter-section";
import { PaidListingsSection } from "@/components/home/paid-listings-section";
import { RecentListingsSection } from "@/components/home/recent-listings-section";
import { TrustServices } from "@/components/home/trust-services";
import { EducationHub } from "@/components/home/education-hub";
import {
  HeroSkeleton,
  QuickFilterBarSkeleton,
  PaidListingsSkeleton,
  RecentListingsSkeleton,
} from "@/components/home/skeletons";

// Revalidate homepage every 5 minutes
export const revalidate = 300;

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<QuickFilterBarSkeleton />}>
        <QuickFilterSection />
      </Suspense>
      <Suspense fallback={<PaidListingsSkeleton />}>
        <PaidListingsSection />
      </Suspense>
      <Suspense fallback={<RecentListingsSkeleton />}>
        <RecentListingsSection />
      </Suspense>
      <TrustServices />
      <EducationHub />
    </main>
  );
}
