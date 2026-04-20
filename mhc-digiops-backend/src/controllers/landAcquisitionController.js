import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createLandAcquisition = async (req, res) => {
    try {
        //extract file paths from multer
        const files = req.files || {};
        console.log("Files:", req.files);
        const acquisition = await prisma.landAcquisition.create({
            data: {
                ...req.body,
                nationalId: files.nationalId? files.nationalId[0].path: null,
                ownershipProof: files.ownershipProof? files.ownershipProof[0].path: null,
                landMap: files.landMap? files.landMap[0].path: null,
                valuationReport: files.valuationReport? files.valuationReport[0].path: null
            }
        });

        res.status(201).json({
            message: "Land acquisition form submitted successfully",
            data: acquisition
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Server error, failed to submit form"
        });
    }
};