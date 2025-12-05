-- Create Enums
CREATE TYPE "SellerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "SellerType" AS ENUM ('OFFICIAL', 'INDEPENDENT');

-- Create Table
CREATE TABLE "SellerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sellerType" "SellerType" NOT NULL,
    "storeName" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "locationCountry" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "proofUrl" TEXT,
    "status" "SellerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SellerApplication_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint to userId
CREATE UNIQUE INDEX "SellerApplication_userId_key" ON "SellerApplication"("userId");

-- Add foreign key
ALTER TABLE "SellerApplication"
ADD CONSTRAINT "SellerApplication_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

