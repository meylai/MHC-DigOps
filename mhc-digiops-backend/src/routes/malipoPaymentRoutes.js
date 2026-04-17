import express from "express";
import { initiateRentPayment } from "../controllers/malipoPaymentController.js";

const router = express.Router();

router.post("/pay-rent", initiateRentPayment);

export default router;