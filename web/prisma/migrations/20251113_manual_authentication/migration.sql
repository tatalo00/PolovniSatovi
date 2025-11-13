-- Manual migration: rename user verification artifacts to authentication terminology

-- Rename enum type used for Didit session status
ALTER TYPE "UserVerificationStatus" RENAME TO "UserAuthenticationStatus";

-- Rename the table that stores Didit session metadata
ALTER TABLE "UserVerification" RENAME TO "UserAuthentication";

-- Update primary key and foreign key constraint names to match the new table name
ALTER TABLE "UserAuthentication" RENAME CONSTRAINT "UserVerification_pkey" TO "UserAuthentication_pkey";
ALTER TABLE "UserAuthentication" RENAME CONSTRAINT "UserVerification_userId_fkey" TO "UserAuthentication_userId_fkey";

-- Rename supporting indexes
ALTER INDEX "UserVerification_userId_key" RENAME TO "UserAuthentication_userId_key";
ALTER INDEX "UserVerification_status_idx" RENAME TO "UserAuthentication_status_idx";
