import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getHousesForMap = async (req, res) => {
    try {
        const houses = await prisma.house.findMany({
            select: {
                id: true,
                address: true,
                location: true,
                status: true,
                latitude: true,
                longitude: true,
            }
        });

        res.json(houses);
    } catch (error) {
        console.error("Map fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
};