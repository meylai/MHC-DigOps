import express from "express";
import { initiateRentPayment } from "../controllers/paychanguPaymentController.js";
import { handlePaymentCallback } from "../controllers/paychanguPaymentController.js";

const router = express.Router();

router.post("/pay-rent", initiateRentPayment);
router.post("/payment-callback", handlePaymentCallback);

export default router;