import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const sensorAlert = async (req, res) => {
  try {
    const { houseId, alertType } = req.body;

    console.log("🚨 Sensor Alert Received:", { houseId, alertType });

    // Save sensor data
    const alert = await prisma.sensorData.create({
      data: {
        type: alertType,
        value: 1,
        timestamp: new Date(),
        houseId: houseId,
      },
    });

    console.log("Alert saved to DB with ID:", alert.id);

     // Create notification
    await prisma.notification.create({
      data: {
        message: `🚨 Alert: ${alertType} detected at House ${houseId}`,
        userId: 1, // Admin user (you can improve later)
      },
    });

    res.json({
      message: "Sensor alert received successfully and triggered notification",
      data: alert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing alert" });
  }
};