import express from "express";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin dashboard route
router.get("/dashboard", authenticate, getAdminDashboard);

export default router;