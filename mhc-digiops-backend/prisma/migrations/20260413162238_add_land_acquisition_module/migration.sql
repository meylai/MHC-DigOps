-- CreateTable
CREATE TABLE "LandAcquisition" (
    "id" SERIAL NOT NULL,
    "formType" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "villageChief" TEXT,
    "chiefSignature" TEXT,
    "landLocation" TEXT NOT NULL,
    "landSize" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "valuationRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandAcquisition_pkey" PRIMARY KEY ("id")
);
