import express from "express";
import { register, login, profile, updateProfile } from "../controllers/authController.js";
import { createApplication, approveApplication } from "../controllers/applicationController.js";
import { sensorAlert } from "../controllers/sensorController.js";
import { getAlerts } from "../routes/dashboardRoutes.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, profile);
router.put("/profile", authenticate, updateProfile);
router.post("/applications", createApplication);
router.put("/applications/:id/approve", approveApplication);
router.post("/sensor-alert", sensorAlert);
router.get("/alerts", getAlerts);

export default router;