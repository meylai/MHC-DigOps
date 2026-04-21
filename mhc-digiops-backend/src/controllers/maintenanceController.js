import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMaintenanceRequest = async (req, res) => {
  try {
    const { description, tenantId } = req.body;
    //const tenantId = req.user.userId;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    if (!tenantId) {
        return res.status(400).json({ error: "Unauthorized: no tenant ID found" });
    }

    // Get tenant to find houseId
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(tenantId) },
      include: { house: true }
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        description,
        status: "pending",
        tenantId: Number(tenantId),
        houseId: tenant.houseId
      },
    });

    const io = req.app.get("io");
    io.emit("newMaintenanceRequest", {
      id: request.id,
      tenant: tenant,
      house: tenant.house,
      description: request.description
    });


    res.status(201).json({
      message: "Request submitted successfully",
      request,
    });
  } catch (error) {
    console.error(error);
    console.error("Prisma error:", error);
    
    res.status(500).json({
      error: "Failed to submit request",
    });
  }
};

export const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        tenant: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch maintenance requests" });
  }
};

export const getUserMaintenanceRequests = async (req, res) => {
  try {
    const { userId } = req.user;

    // Find tenant for this user
    const tenant = await prisma.tenant.findFirst({
      where: { id: Number(userId) }, // Assuming userId is tenantId for simplicity
    });

    if (!tenant) {
      return res.json([]);
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 10, // Recent 10
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch maintenance requests" });
  }
};