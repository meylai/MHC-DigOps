import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ APPROVE
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if application exists
    const application = await prisma.landApplication.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Create approval record
    await prisma.approval.create({
      data: {
        decision: "APPROVED",
        applicationId: parseInt(id),
      },
    });

    // Update application status
    await prisma.landApplication.update({
      where: { id: parseInt(id) },
      data: { status: "APPROVED" },
    });

    res.json({ message: "Application approved successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Approval failed" });
  }
};

// ❌ REJECT
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.landApplication.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    await prisma.approval.create({
      data: {
        decision: "REJECTED",
        applicationId: parseInt(id),
      },
    });

    await prisma.landApplication.update({
      where: { id: parseInt(id) },
      data: { status: "REJECTED" },
    });

    res.json({ message: "Application rejected successfully" });

  } catch (error) {
    res.status(500).json({ error: "Rejection failed" });
  }
};