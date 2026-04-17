import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPayment = async (req, res) => {
    try {
        const { amount, tenantId, houseId } = req.body;

        const payment = await prisma.payment.create({
            data: {
                amount: Number(amount),
                date: new Date(),
                tenantId: tenantId ? Number(tenantId) : undefined,
                houseId: houseId ? Number(houseId) : undefined,
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

export const getPaymentHistory = async (req, res) => {
    try {
        const email = req.user?.email;

        if (!email) {
            return res.status(400).json({ error: "Profile email required" });
        }

        const payments = await prisma.payment.findMany({
            where: { email },
            orderBy: { date: "desc" },
        });

        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to load payment history" });
    }
};