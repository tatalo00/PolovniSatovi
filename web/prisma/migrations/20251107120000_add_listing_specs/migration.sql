-- Add optional specification fields to listings
ALTER TABLE "Listing"
  ADD COLUMN "caseDiameterMm" INTEGER,
  ADD COLUMN "caseMaterial" TEXT,
  ADD COLUMN "movement" TEXT;

