import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const initiateRentPayment = async (req, res) => {
    try {
        const { amount, method, tenantId, houseId } = req.body;

        const response = await axios.post(
            "https://api.paychangu.com/payment",
            {
                amount: Number(amount),
                currency: "MWK",
                email: email,
                callback_url: "https://gerbil-winter-surgical.ngrok-free.dev/api/payment-callback",
                return_url: "http://localhost:3000/user-dashboard.html",
                reference: 'PAY-${Date.now()}-${tenantId}-${houseId}',
                description: `Rent payment for tenant ${tenantId} and house ${houseId}`,
            },
            {
                headers: {
                    Authorization: 'Bearer ${process.env.PAYCHANGU_SECRET_KEY}',
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

        const checkoutUrl = response.data.checkout_url;

        res.status(200).json({
            message: "Payment initiated successfully",
            paymentUrl: checkoutUrl,
            provider: method
        });

    } catch (error) {
        console.error(error.response?.data || error.message);

        res.status(500).json({
            error: "Failed to initiate payment"
        });
    }
};

export const handlePaymentCallback = async (req, res) => {
    try {
        console.log("Payment callback received:", req.body);
        
        const { status, amount, reference } = req.body;

        if (status === "success") {

            await prisma.payment.create({
                data: {
                    amount: Number(amount),
                    tenantId: tenantId,   
                    houseId: houseId,     
                }
            });

            console.log("Payment saved:", reference);
        }

        res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};