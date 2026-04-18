import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMaintenanceRequest = async (req, res) => {
  try {
    const { description, tenantId } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        description,
        status: "Pending",
        tenantId: Number(tenantId),
      },
    });

    res.status(201).json({
      message: "Request submitted successfully",
      request,
    });
  } catch (error) {
    console.error(error);
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