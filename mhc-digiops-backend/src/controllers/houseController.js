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

export const getHouseDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await prisma.house.findUnique({
            where: { id: Number(id) },
            include: {
                tenants: true,
                sensorData: true,
                payments: true,
                maintenanceRequests: true

            }
        });

        res.json(house);
    }catch (error) {
        console.error("House details error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAvailableHouses = async (req, res) => {
    try {
        // Find houses that don't have any tenants
        const availableHouses = await prisma.house.findMany({
            where: {
                tenants: {
                    none: {}  // This means no tenants associated
                }
            },
            select: {
                id: true,
                address: true,
                location: true,
                status: true,
                latitude: true,
                longitude: true,
            }
        });

        res.json(availableHouses);
    } catch (error) {
        console.error("Available houses fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
};