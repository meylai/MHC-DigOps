import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminDashboard = async (req, res) => {
  try {
    const { role } = req.user;

    if (String(role).toUpperCase() !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    const totalUsers = await prisma.user.count();
    const totalApplications = await prisma.landApplication.count();
    const pendingApprovals = await prisma.approval.count({
      where: { decision: "PENDING" },
    });
    const totalNotifications = await prisma.notification.count();

    res.status(200).json({
      totalUsers,
      totalApplications,
      pendingApprovals,
      totalNotifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.user;

    if (String(role).toUpperCase() !== "ADMIN" && String(role).toUpperCase() !== "HOUSING_MANAGER") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};