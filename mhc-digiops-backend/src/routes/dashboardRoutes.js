export const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.sensorData.findMany({
      orderBy: {
        timestamp: "desc",
      },
      include: {
        house: true,
      },
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};