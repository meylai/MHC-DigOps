import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createLandAcquisition = async (req, res) => {
    try {
        const acquisition = await prisma.landAcquisition.create({
            data: req.body
        });

        res.status(201).json({
            message: "Land acquisition form saved successfully",
            acquisition
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};