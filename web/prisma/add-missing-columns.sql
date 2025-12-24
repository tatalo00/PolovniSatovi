-- Simple migration script - just add missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns to User table (these are the ones causing the error)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locale" VARCHAR(8);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locationCountry" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locationCity" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

-- Done!
SELECT 'Migration completed successfully!' as result;
