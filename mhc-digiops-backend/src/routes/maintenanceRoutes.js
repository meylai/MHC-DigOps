import express from "express";
import { createMaintenanceRequest } from "../controllers/maintenanceController.js";

const router = express.Router();

router.post("/maintenance", createMaintenanceRequest);

export default router;