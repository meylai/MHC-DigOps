import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPayment = async (req, res) => {
    try {
        const { amount, tenantId, houseId } = req.body;

        const payment = await prisma.payment.create({
            data: {
                amount: Number(amount),
                tenantId: Number(tenantId),
                houseId: Number(houseId)
            }
        });

        res.status(201).json({
            message: "Payment successful",
            payment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Payment failed"
        });
    }
};