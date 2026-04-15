import express from "express";
import { createPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payments", createPayment);

export default router;