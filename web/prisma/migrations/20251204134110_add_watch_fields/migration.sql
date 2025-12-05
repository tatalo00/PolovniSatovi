-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "caseThicknessMm" INTEGER,
ADD COLUMN     "waterResistanceM" INTEGER,
ADD COLUMN     "movementType" TEXT,
ADD COLUMN     "caliber" TEXT,
ADD COLUMN     "dialColor" TEXT,
ADD COLUMN     "dateDisplay" TEXT,
ADD COLUMN     "bezelType" TEXT,
ADD COLUMN     "bezelMaterial" TEXT,
ADD COLUMN     "strapType" TEXT,
ADD COLUMN     "braceletMaterial" TEXT,
ADD COLUMN     "strapWidthMm" INTEGER,
ADD COLUMN     "warranty" TEXT,
ADD COLUMN     "warrantyCard" BOOLEAN,
ADD COLUMN     "originalOwner" BOOLEAN,
ADD COLUMN     "runningCondition" TEXT;


