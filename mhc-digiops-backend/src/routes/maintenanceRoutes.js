import express from "express";
import { authenticate, authorizeHousingManager } from "../middleware/authMiddleware.js";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getUserMaintenanceRequests,
} from "../controllers/maintenanceController.js";

const router = express.Router();

router.post("/maintenance", authenticate, createMaintenanceRequest);
router.get("/maintenance/requests", authenticate, authorizeHousingManager, getMaintenanceRequests);
router.get("/maintenance/user", authenticate, getUserMaintenanceRequests);

export default router;