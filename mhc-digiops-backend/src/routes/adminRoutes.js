import express from "express";
import { getAdminDashboard, getUsers } from "../controllers/adminDashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { getAdminDashboardStats } from "../controllers/adminDashboardStatsController.js";    

const router = express.Router();

// Admin dashboard route
router.get("/dashboard", authenticate, getAdminDashboard);
router.get("/dashboard/stats", authenticate, getAdminDashboardStats);
router.get("/users", authenticate, getUsers);

export default router;