import { PrismaClient } from "@prisma/client";
import { application } from "express";

const prisma = new PrismaClient();

export const createApplication = async (req, res) => {
  try{
    const { location, userId } = req.body;

    const app = await prisma.landApplication.create({
      data: {
        location,
        status: "Pending",
        userId: req.user.userId,
      },
    });

    res.json({
      message: "Application submitted",
      data: application,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create application" });
  }
};


// 📥 GET ALL APPLICATIONS
export const getAllApplications = async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    let applications; // 🔥 Get userId from authenticated user

    if (role === "ADMIN") {
      //Admin sees all applications
      applications = await prisma.landApplication.findMany({
        include: {
          user: true,       // 🔥 shows who applied
          approval: true,   // 🔥 shows approval status
        },
        orderBy: {
          id: "desc",
        },
      });
    } else {
      // Regular user sees only their applications
      applications = await prisma.landApplication.findMany({
        where: { userId },
        include: {
          approval: true,
        },
        orderBy: {
          id: "desc",
        },
      });
    }
    
    res.status(200).json(applications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};


// 📄 GET SINGLE APPLICATION
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.landApplication.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        approval: true,
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);

  } catch (error) {
    res.status(500).json({ error: "Error fetching application" });
  }
};


// ✏️ UPDATE APPLICATION
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;

    const updated = await prisma.landApplication.update({
      where: { id: parseInt(id) },
      data: { location },
    });

    res.json({
      message: "Application updated",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};


// ❌ DELETE APPLICATION
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.landApplication.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Application deleted" });

  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};

/*export const createApplication = (req, res) => {
  res.json({ message: "Application created successfully" });
};*/

export const approveApplication = async (req, res) => {
  const { id } = req.params;

  const approval = await prisma.approval.create({
    data: {
      decision: "APPROVED",
      applicationId: parseInt(id),
    },
  });

  await prisma.landApplication.update({
    where: { id: Number(id) },
    data: { status: "Approved" }
  });
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json({ message: "Application approved" });
};

export const createTenant = async (req, res) => {
  const { name, houseId, rentStatus } = req.body;

  const tenant = await prisma.tenant.create({
    data: { name, houseId, rentStatus }
  });

  res.json(tenant);
};

export const sensorAlert = async (req, res) => {
  const { houseId, alertType } = req.body;

  console.log("ALERT:", houseId, alertType);

  res.json({ message: "Alert received" });
};