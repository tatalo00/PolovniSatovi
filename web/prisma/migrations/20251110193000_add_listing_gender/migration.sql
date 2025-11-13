-- Create Gender enum if it does not exist
DO $$
BEGIN
  CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNISEX');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add gender column to listings, defaulting to UNISEX
ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "gender" "Gender" NOT NULL DEFAULT 'UNISEX';

-- Backfill existing rows to the default (in case the column existed but allowed NULL)
UPDATE "Listing"
SET "gender" = 'UNISEX'
WHERE "gender" IS NULL;


