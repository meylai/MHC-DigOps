import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminDashboardStats = async (req, res) => {
    try {
        const totalApplications = await prisma.application.count();
        const availableHouses = await prisma.house.count({
            where: { status: "available" } 
        });
        const occupiedHouses = await prisma.house.count({ 
            where: { status: "occupied" } 
        });
        

        res.json({
            totalApplications,
            availableHouses,
            occupiedHouses
        });
        
    } catch (error) {
        console.error("Admin dashboard stats error:", error);

        res.status(500).json({ 
            message: "Failed to fetch admin dashboard statistics"
        });
    }
};