import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all tenants
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        house: true,
        payments: true,
        maintenanceRequests: true
      }
    });
    res.json(tenants);
  } catch (error) {
    console.error("Get all tenants error:", error);
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
};

// Get tenant by ID
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(id) },
      include: {
        house: true,
        payments: true,
        maintenanceRequests: true
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json(tenant);
  } catch (error) {
    console.error("Get tenant error:", error);
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
};

// Create new tenant
export const createTenant = async (req, res) => {
  try {
    const { name, houseId, rentStatus } = req.body;

    if (!name || !houseId) {
      return res.status(400).json({ error: "Name and houseId are required" });
    }

    // Check if house exists
    const house = await prisma.house.findUnique({
      where: { id: Number(houseId) }
    });

    if (!house) {
      return res.status(404).json({ error: "House not found" });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        houseId: Number(houseId),
        rentStatus: rentStatus || "pending"
      },
      include: {
        house: true
      }
    });

    // Update house status to occupied if it was available
    if (house.status === "available") {
      await prisma.house.update({
        where: { id: Number(houseId) },
        data: { status: "occupied" }
      });
    }

    res.status(201).json({
      message: "Tenant created successfully",
      tenant
    });
  } catch (error) {
    console.error("Create tenant error:", error);
    res.status(500).json({ error: "Failed to create tenant" });
  }
};

// Update tenant
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rentStatus } = req.body;
    const userRole = String(req.user.role).toUpperCase();

    // Get the tenant to check ownership
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(id) }
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    let updateData = {};

    if (userRole === "TENANT") {
      // Tenants can only update their own name
      if (req.user.userId !== tenant.id) {
        return res.status(403).json({ error: "You can only update your own information" });
      }
      if (name) updateData.name = name;
    } else if (userRole === "HOUSING_MANAGER" || userRole === "ADMIN") {
      // Housing managers can update rent status
      if (rentStatus) updateData.rentStatus = rentStatus;
    } else {
      return res.status(403).json({ error: "Unauthorized to update tenant" });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        house: true
      }
    });

    res.json({
      message: "Tenant updated successfully",
      tenant: updatedTenant
    });
  } catch (error) {
    console.error("Update tenant error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tenant not found" });
    }
    res.status(500).json({ error: "Failed to update tenant" });
  }
};

// Delete tenant (move to previous tenants)
export const removeTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(id) },
      include: { house: true }
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Check if this is the only tenant in the house
    const otherTenants = await prisma.tenant.count({
      where: { houseId: tenant.houseId, id: { not: Number(id) } }
    });

    // Only update house status to available if this was the only tenant
    if (otherTenants === 0) {
      await prisma.house.update({
        where: { id: tenant.houseId },
        data: { status: "available" }
      });
    }

    // Delete the tenant
    await prisma.tenant.delete({
      where: { id: Number(id) }
    });

    res.json({
      message: "Tenant removed successfully"
    });
  } catch (error) {
    console.error("Remove tenant error:", error);
    res.status(500).json({ error: "Failed to remove tenant" });
  }
};

// Send rent due notification
export const sendRentDueNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(id) },
      include: {
        house: true
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // For now, we'll create a notification record
    // In a real implementation, you'd need to link tenants to users
    // This could be done by adding a userId field to the Tenant model
    const notification = await prisma.notification.create({
      data: {
        message: `Rent due notification sent to ${tenant.name} for house at ${tenant.house.address}`,
        userId: req.user.userId // Log it for the housing manager who sent it
      }
    });

    res.json({
      message: `Rent due notification sent to ${tenant.name}`,
      notification
    });
  } catch (error) {
    console.error("Send rent due notification error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

// Get previous tenants (tenants who have been removed)
export const getPreviousTenants = async (req, res) => {
  try {
    // Since we delete tenants when they leave, we need to track this differently
    // For now, return empty array as we don't have historical data
    // In a real implementation, you might want to add a status or archive table
    res.json([]);
  } catch (error) {
    console.error("Get previous tenants error:", error);
    res.status(500).json({ error: "Failed to fetch previous tenants" });
  }
};