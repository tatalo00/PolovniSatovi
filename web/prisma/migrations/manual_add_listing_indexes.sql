-- Manual migration: Add composite indexes for listing filter optimization
-- Run this in Supabase SQL Editor if prisma migrate doesn't work

-- Index for movement filter queries
CREATE INDEX IF NOT EXISTS "Listing_status_movement_idx" ON "Listing"("status", "movement");

-- Index for condition filter queries
CREATE INDEX IF NOT EXISTS "Listing_status_condition_idx" ON "Listing"("status", "condition");

-- Index for year filter queries
CREATE INDEX IF NOT EXISTS "Listing_status_year_idx" ON "Listing"("status", "year");

-- Index for seller's listings queries (status first for filtering approved)
CREATE INDEX IF NOT EXISTS "Listing_status_sellerId_idx" ON "Listing"("status", "sellerId");

-- Index for dashboard/seller pages (sellerId first for user-specific queries)
CREATE INDEX IF NOT EXISTS "Listing_sellerId_status_idx" ON "Listing"("sellerId", "status");
