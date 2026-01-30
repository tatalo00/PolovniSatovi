-- Manual Migration: Seller Trust & Profile Features
-- Run this manually via Supabase SQL Editor or psql if Prisma migration fails
-- This adds fields for: seller ratings, transaction counts, response time,
-- return policy, verification date, and seller tier features.
--
-- Safe to run multiple times (uses IF NOT EXISTS / idempotent patterns)

-- ============================================================
-- 1. User model: Add verifiedAt column
-- ============================================================

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- Backfill: Set verifiedAt for already-verified users
-- Uses updatedAt as best approximation of when they were verified
UPDATE "User"
SET "verifiedAt" = "updatedAt"
WHERE "isVerified" = true AND "verifiedAt" IS NULL;

-- ============================================================
-- 2. SellerProfile model: Add new columns
-- ============================================================

-- Review count (materialized from Review table)
ALTER TABLE "SellerProfile"
ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- Total sold count (materialized from Listing status=SOLD)
ALTER TABLE "SellerProfile"
ADD COLUMN IF NOT EXISTS "totalSoldCount" INTEGER NOT NULL DEFAULT 0;

-- Average response time in minutes (computed from message threads)
ALTER TABLE "SellerProfile"
ADD COLUMN IF NOT EXISTS "avgResponseTimeMinutes" INTEGER;

-- Free-text return/dispute policy
ALTER TABLE "SellerProfile"
ADD COLUMN IF NOT EXISTS "returnPolicy" TEXT;

-- Profile creation date (if not already present)
ALTER TABLE "SellerProfile"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
-- 3. Backfill: reviewCount from Review table
-- ============================================================

UPDATE "SellerProfile" sp
SET "reviewCount" = sub.cnt
FROM (
  SELECT "sellerId", COUNT(*)::int AS cnt
  FROM "Review"
  GROUP BY "sellerId"
) sub
WHERE sp."userId" = sub."sellerId"
  AND sp."reviewCount" = 0;

-- ============================================================
-- 4. Backfill: totalSoldCount from Listing table
-- ============================================================

UPDATE "SellerProfile" sp
SET "totalSoldCount" = sub.cnt
FROM (
  SELECT "sellerId", COUNT(*)::int AS cnt
  FROM "Listing"
  WHERE "status" = 'SOLD'
  GROUP BY "sellerId"
) sub
WHERE sp."userId" = sub."sellerId"
  AND sp."totalSoldCount" = 0;

-- ============================================================
-- 5. Backfill: ratingAvg (recompute from Review table)
-- ============================================================

UPDATE "SellerProfile" sp
SET "ratingAvg" = sub.avg_rating
FROM (
  SELECT "sellerId", ROUND(AVG("rating")::numeric, 2) AS avg_rating
  FROM "Review"
  GROUP BY "sellerId"
) sub
WHERE sp."userId" = sub."sellerId"
  AND sp."ratingAvg" IS NULL;

-- ============================================================
-- 6. Backfill: avgResponseTimeMinutes from message threads
-- ============================================================

UPDATE "SellerProfile" sp
SET "avgResponseTimeMinutes" = sub.avg_minutes
FROM (
  SELECT
    t."sellerId",
    ROUND(AVG(
      EXTRACT(EPOCH FROM (seller_reply."createdAt" - buyer_msg."createdAt")) / 60
    ))::int AS avg_minutes
  FROM "MessageThread" t
  CROSS JOIN LATERAL (
    SELECT "createdAt" FROM "Message"
    WHERE "threadId" = t.id AND "senderId" = t."buyerId"
    ORDER BY "createdAt" ASC LIMIT 1
  ) buyer_msg
  CROSS JOIN LATERAL (
    SELECT "createdAt" FROM "Message"
    WHERE "threadId" = t.id
      AND "senderId" = t."sellerId"
      AND "createdAt" > buyer_msg."createdAt"
    ORDER BY "createdAt" ASC LIMIT 1
  ) seller_reply
  GROUP BY t."sellerId"
  HAVING AVG(
    EXTRACT(EPOCH FROM (seller_reply."createdAt" - buyer_msg."createdAt")) / 60
  ) > 0
) sub
WHERE sp."userId" = sub."sellerId"
  AND sp."avgResponseTimeMinutes" IS NULL;

-- ============================================================
-- 7. Verification
-- ============================================================

-- Run these queries to verify the migration worked:

-- Check new User columns
-- SELECT id, email, "isVerified", "verifiedAt" FROM "User" WHERE "isVerified" = true LIMIT 5;

-- Check new SellerProfile columns
-- SELECT sp.id, sp."userId", sp."reviewCount", sp."totalSoldCount", sp."avgResponseTimeMinutes", sp."returnPolicy", sp."createdAt"
-- FROM "SellerProfile" sp LIMIT 10;

-- ============================================================
-- Note: After running this migration, regenerate the Prisma client:
-- npx prisma generate
-- ============================================================
