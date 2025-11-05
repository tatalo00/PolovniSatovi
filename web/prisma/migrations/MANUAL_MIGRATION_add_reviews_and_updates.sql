-- Manual Migration: Add Reviews and MessageThread Updates
-- Run this manually if Prisma migrations are not working
-- Apply via Supabase SQL Editor or psql

-- 1. Add updatedAt to MessageThread table
ALTER TABLE "MessageThread" 
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have updatedAt = createdAt
UPDATE "MessageThread" 
SET "updatedAt" = "createdAt" 
WHERE "updatedAt" IS NULL;

-- 2. Create Review table
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "sellerId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- 3. Add foreign keys for Review
ALTER TABLE "Review" 
ADD CONSTRAINT "Review_reviewerId_fkey" 
FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" 
ADD CONSTRAINT "Review_sellerId_fkey" 
FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" 
ADD CONSTRAINT "Review_listingId_fkey" 
FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Create indexes for Review
CREATE INDEX IF NOT EXISTS "Review_sellerId_idx" ON "Review"("sellerId");
CREATE INDEX IF NOT EXISTS "Review_listingId_idx" ON "Review"("listingId");

-- 5. Create unique constraint (one review per listing per user)
CREATE UNIQUE INDEX IF NOT EXISTS "Review_reviewerId_listingId_key" 
ON "Review"("reviewerId", "listingId");

-- 6. Add check constraint for rating (1-5)
ALTER TABLE "Review" 
ADD CONSTRAINT "Review_rating_check" 
CHECK ("rating" >= 1 AND "rating" <= 5);

-- Note: After running this migration, run:
-- npm run prisma:generate
-- to regenerate the Prisma client

