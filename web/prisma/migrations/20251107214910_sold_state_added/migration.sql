-- DropForeignKey
ALTER TABLE "public"."ListingStatusAudit" DROP CONSTRAINT "ListingStatusAudit_listingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingStatusAudit" DROP CONSTRAINT "ListingStatusAudit_userId_fkey";

-- AlterTable
ALTER TABLE "ListingStatusAudit" ALTER COLUMN "id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ListingStatusAudit" ADD CONSTRAINT "ListingStatusAudit_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingStatusAudit" ADD CONSTRAINT "ListingStatusAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
