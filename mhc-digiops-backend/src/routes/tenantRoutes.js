import express from "express";
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  removeTenant,
  getPreviousTenants,
  sendRentDueNotification
} from "../controllers/tenantController.js";
import { authenticate, authorizeHousingManager, authorizeHousingManagerOnly, authorizeTenantOrHousingManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// All tenant routes require authentication
router.use(authenticate);

// Read operations - Admin and Housing Manager can view
router.get("/", authorizeHousingManager, getAllTenants);
router.get("/previous", authorizeHousingManager, getPreviousTenants);
router.get("/:id", authorizeHousingManager, getTenantById);

// Write operations - Housing Manager only
router.post("/", authorizeHousingManagerOnly, createTenant);
router.delete("/:id", authorizeHousingManagerOnly, removeTenant);

// Update operations - Tenants can update their own info, Housing Managers can update rent status
router.put("/:id", authorizeTenantOrHousingManager, updateTenant);

// Notifications - Housing Manager only
router.post("/:id/notify-rent-due", authorizeHousingManagerOnly, sendRentDueNotification);

export default router;