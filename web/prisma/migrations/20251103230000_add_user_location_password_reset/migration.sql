-- Add location fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locationCountry" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locationCity" TEXT;

-- Add password reset fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

