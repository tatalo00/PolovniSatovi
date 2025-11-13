-- Ensure the enum exists (older environments may not have the type yet)
DO $$
BEGIN
  CREATE TYPE "UserVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure the table exists with the simplified columns so the migration is idempotent
CREATE TABLE IF NOT EXISTS "UserVerification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "UserVerificationStatus" NOT NULL DEFAULT 'PENDING',
  "diditSessionId" TEXT NOT NULL,
  "diditVerificationId" TEXT,
  "diditSessionUrl" TEXT,
  "rejectionReason" TEXT,
  "statusDetail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Ensure supporting indexes exist
CREATE UNIQUE INDEX IF NOT EXISTS "UserVerification_userId_key" ON "UserVerification"("userId");
CREATE INDEX IF NOT EXISTS "UserVerification_status_idx" ON "UserVerification"("status");

-- Drop foreign key and index that are no longer needed in the simplified flow
ALTER TABLE "UserVerification" DROP CONSTRAINT IF EXISTS "UserVerification_reviewedById_fkey";
DROP INDEX IF EXISTS "UserVerification_reviewedById_idx";

-- Drop encrypted asset columns and reviewer metadata
ALTER TABLE "UserVerification"
  DROP COLUMN IF EXISTS "encryptedSelfie",
  DROP COLUMN IF EXISTS "encryptedSelfieNonce",
  DROP COLUMN IF EXISTS "encryptedDocument",
  DROP COLUMN IF EXISTS "encryptedDocumentNonce",
  DROP COLUMN IF EXISTS "encryptionKeyVersion",
  DROP COLUMN IF EXISTS "reviewedById",
  DROP COLUMN IF EXISTS "reviewedAt";

-- Add detail column for provider status notes
ALTER TABLE "UserVerification"
  ADD COLUMN IF NOT EXISTS "statusDetail" TEXT;



