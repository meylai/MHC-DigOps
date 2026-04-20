/*
  Warnings:

  - You are about to drop the column `agriculturePlan` on the `LandAcquisition` table. All the data in the column will be lost.
  - You are about to drop the column `wtnessName` on the `LandAcquisition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LandAcquisition" DROP COLUMN "agriculturePlan",
DROP COLUMN "wtnessName",
ADD COLUMN     "agriculturalPlan" TEXT,
ADD COLUMN     "witnessName" TEXT;
