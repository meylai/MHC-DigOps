import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
} from "../controllers/maintenanceController.js";

const router = express.Router();

router.post("/maintenance", authenticate, createMaintenanceRequest);
router.get("/maintenance/requests", authenticate, authorizeAdmin, getMaintenanceRequests);

export default router;