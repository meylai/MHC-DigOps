import express from "express";
import { register, login } from "../controllers/authController.js";
import { createApplication, approveApplication } from "../controllers/applicationController.js";
import { sensorAlert } from "../controllers/sensorController.js";
import { getAlerts } from "../routes/dashboardRoutes.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/applications", createApplication);
router.put("/applications/:id/approve", approveApplication);
router.post("/sensor-alert", sensorAlert);
router.get("/alerts", getAlerts);

export default router;