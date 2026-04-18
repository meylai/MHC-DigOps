import express from "express";
import { initiateRentPayment, handlePaymentCallback, handlePaymentCallbackGet } from "../controllers/paychanguPaymentController.js";

const router = express.Router();

router.post("/pay-rent", initiateRentPayment);
router.post("/payment-callback", handlePaymentCallback);
router.get("/payment-callback", handlePaymentCallbackGet);

export default router;