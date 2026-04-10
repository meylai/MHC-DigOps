export const getHousesForMap = async (req, res) => {
    const houses = await prisma.house.findMany({
        select: {
            id: true,
            address: true,
            latitude: true,
            longitude: true,
            status: true
        }
    });

    res.json(houses);
};