-- Create new optional metadata fields for seller public profiles
ALTER TABLE "SellerProfile"
ADD COLUMN "slug" TEXT,
ADD COLUMN "shortDescription" VARCHAR(320),
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "heroImageUrl" TEXT;

-- Ensure slug values remain unique when provided
CREATE UNIQUE INDEX "SellerProfile_slug_key" ON "SellerProfile"("slug");

