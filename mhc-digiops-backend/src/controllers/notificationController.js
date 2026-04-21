import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.user;

    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { id: "desc" },
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const notification = await prisma.notification.create({
      data: {
        message,
        userId: Number(userId),
      },
    });

    res.json({ message: "Notification sent", notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};