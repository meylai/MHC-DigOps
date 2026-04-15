import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMaintenanceRequest = async (req, res) => {
    try {
        const { description, tenantId } = req.body;

        const request = await prisma.maintenanceRequest.create({
            data: {
                description,
                status: "Pending",
                tenantId: Number(tenantId)
            }
        });

        res.status(201).json({
            message: "Maintenance request submitted successfully",
            request
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create maintenance request"
        });
    }
};