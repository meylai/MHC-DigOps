import express from "express";
import { createPayment, getPaymentHistory } from "../controllers/paymentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/payments", createPayment);
router.get("/payments/history", authenticate, getPaymentHistory);

export default router;