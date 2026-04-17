import axios from "axios";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

const canSendMail = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

async function sendReceiptEmail(to, payment) {
  if (!canSendMail) {
    console.log("SMTP not configured. Skipping receipt email for", to);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "MHC DigiOps Rent Payment Receipt",
    html: `
      <h1>Payment Receipt</h1>
      <p>Thank you for your rent payment.</p>
      <p><strong>Amount:</strong> MWK ${payment.amount}</p>
      <p><strong>Status:</strong> ${payment.status}</p>
      <p><strong>Reference:</strong> ${payment.reference}</p>
      <p><strong>Date:</strong> ${new Date(payment.date).toLocaleString()}</p>
      <p>If you have any questions, please contact support.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export const initiateRentPayment = async (req, res) => {
  try {
    const { amount, method, tenantId, houseId, email } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ error: "Amount and email are required" });
    }

    const reference = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const response = await axios.post(
      "https://api.paychangu.com/payment",
      {
        amount: Number(amount),
        currency: "MWK",
        email,
        callback_url: "http://localhost:3000/api/payment-callback",
        return_url: "http://localhost:3000/user-dashboard.html?payment=success",
        reference,
        description: `Rent payment for ${email}`,
        metadata: {
          tenantId: tenantId || "",
          houseId: houseId || "",
          method,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const checkoutUrl = response.data.checkout_url || response.data.data?.checkout_url;

    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        date: new Date(),
        email,
        method,
        reference,
        status: "pending",
        tenantId: tenantId ? Number(tenantId) : undefined,
        houseId: houseId ? Number(houseId) : undefined,
      },
    });

    if (!checkoutUrl) {
      return res.status(500).json({ error: "Unable to get PayChangu checkout URL" });
    }

    res.status(200).json({
      message: "Payment initiated successfully",
      paymentUrl: checkoutUrl,
      payment,
    });
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

export const handlePaymentCallback = async (req, res) => {
  try {
    console.log("Payment callback received:", req.body);

    const { status, amount, reference, email, payment_id, method } = req.body;

    let payment = null;

    if (reference) {
      payment = await prisma.payment.findUnique({ where: { reference } });
    }

    if (!payment && payment_id) {
      payment = await prisma.payment.findFirst({ where: { externalId: String(payment_id) } });
    }

    const updateData = {
      status,
      amount: amount ? Number(amount) : payment?.amount,
      email: email || payment?.email,
      method: method || payment?.method,
      externalId: payment_id ? String(payment_id) : payment?.externalId,
      date: new Date(),
    };

    if (payment) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: updateData,
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          amount: amount ? Number(amount) : 0,
          date: new Date(),
          email,
          method,
          reference,
          externalId: payment_id ? String(payment_id) : undefined,
          status,
        },
      });
    }

    if (status === "success" && payment.email) {
      await sendReceiptEmail(payment.email, payment);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};