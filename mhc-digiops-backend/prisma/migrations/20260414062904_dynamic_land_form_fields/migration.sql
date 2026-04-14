/*
  Warnings:

  - You are about to drop the column `valuationRef` on the `LandAcquisition` table. All the data in the column will be lost.
  - Added the required column `landMap` to the `LandAcquisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownershipProof` to the `LandAcquisition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LandAcquisition" DROP COLUMN "valuationRef",
ADD COLUMN     "agriculturePlan" TEXT,
ADD COLUMN     "landMap" TEXT NOT NULL,
ADD COLUMN     "leaseDuration" TEXT,
ADD COLUMN     "ministryApproval" TEXT,
ADD COLUMN     "ownershipProof" TEXT NOT NULL,
ADD COLUMN     "valuationReport" TEXT,
ADD COLUMN     "wtnessName" TEXT;
