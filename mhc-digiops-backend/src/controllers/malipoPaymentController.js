import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const initiateRentPayment = async (req, res) => {
    try {
        const { amount, method, tenantId, houseId } = req.body;

        const payload = {
            merchantAccount: process.env.MALIPO_MERCHANT_ACCOUNT,
            currency: "MWK",
            amount: Number(amount),
            order_id: `RENT-${Date.now()}`,
            description: `Rent payment via ${method}`
        };

        const response = await axios.post(
            "https://app.malipo.mw/api/v1/invoice/prepare",
            payload,
            {
                headers: {
                    "x-app-id": process.env.MALIPO_APP_ID,
                    "x-api-key": process.env.MALIPO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        // save payment locally
        await prisma.payment.create({
            data: {
                amount: Number(amount),
                tenantId: Number(tenantId),
                houseId: Number(houseId)
            }
        });

        res.status(200).json({
            message: "Payment initiated successfully",
            paymentUrl: response.data.payment_url || response.data.url,
            provider: method
        });

    } catch (error) {
        console.error(error.response?.data || error.message);

        res.status(500).json({
            error: "Failed to initiate payment"
        });
    }
};