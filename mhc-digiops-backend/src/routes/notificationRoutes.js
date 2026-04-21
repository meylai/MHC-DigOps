import express from "express";
import { getNotifications, createNotification } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/notifications", authenticate, getNotifications);
router.post("/notifications", authenticate, createNotification);

export default router;