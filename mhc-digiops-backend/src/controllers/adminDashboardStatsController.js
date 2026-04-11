import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
    try {
        const applications = await prisma.landApplication.count();
        const tenants = await prisma.tenant.count();
        const alerts = await prisma.sensorData.count();
        const houses = await prisma.house.count();

        res.json({
            applications,
            tenants,
            alerts,
            houses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};