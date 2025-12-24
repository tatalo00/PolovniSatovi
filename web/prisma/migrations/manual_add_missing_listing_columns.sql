-- Manual Migration: Add missing Listing columns
-- Run this manually via Supabase SQL Editor or psql when database is accessible
-- This fixes the schema drift between Prisma schema and actual database

-- Add movement column if it doesn't exist
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "movement" TEXT;

-- Add location column if it doesn't exist
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "location" TEXT;

-- Add caseMaterial column if it doesn't exist
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "caseMaterial" TEXT;

-- Verify the columns from add_watch_fields migration exist
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "caseThicknessMm" INTEGER;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "waterResistanceM" INTEGER;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "movementType" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "caliber" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "dialColor" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "dateDisplay" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "bezelType" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "bezelMaterial" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "strapType" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "braceletMaterial" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "strapWidthMm" INTEGER;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "warranty" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "warrantyCard" BOOLEAN;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "originalOwner" BOOLEAN;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "runningCondition" TEXT;

-- Create indexes for the new columns (if they don't exist)
CREATE INDEX IF NOT EXISTS "Listing_status_movement_idx" ON "Listing"("status", "movement");

-- Note: After running this migration, regenerate the Prisma client:
-- npx prisma generate
