-- Add SOLD status to enum
ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'SOLD';

-- Create audit table
CREATE TABLE "ListingStatusAudit" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "listingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "ListingStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListingStatusAudit_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ListingStatusAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ListingStatusAudit_listingId_idx" ON "ListingStatusAudit"("listingId");
CREATE INDEX "ListingStatusAudit_userId_idx" ON "ListingStatusAudit"("userId");

