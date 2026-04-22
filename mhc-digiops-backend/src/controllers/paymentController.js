import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPayment = async (req, res) => {
    try {
        const { amount, tenantId, houseId, email, method = "manual" } = req.body;

        const payment = await prisma.payment.create({
            data: {
                amount: Number(amount),
                date: new Date(),
                email: email || null,
                method,
                reference: `MAN-${Date.now()}`,
                status: "success",
                tenantId: tenantId ? Number(tenantId) : undefined,
                houseId: houseId ? Number(houseId) : undefined,
            }
        });

        res.status(201).json({
            message: "Payment marked successful",
            payment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Payment mark failed"
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