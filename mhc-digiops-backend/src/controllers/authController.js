import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  console.log("BODY:", req.body);
  try {
    const { name, email, password, role, phone, gender } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        gender,
      },
    });

    res.json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // generate token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    let tenantId = null;
    if (user.role.toLowerCase() === 'tenant') {
      const tenant = await prisma.tenant.findFirst({
        where: { userId: user.id },
        select: { id: true }
      });
      if (tenant) {
        tenantId = tenant.id;
      }
    }

    res.json({
      message: "Login successful",
      token,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      tenantId,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const profile = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, name: true, email: true, role: true, phone: true, gender: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let tenantId = null;
    if (user.role.toLowerCase() === 'tenant') {
      const tenant = await prisma.tenant.findFirst({
        where: { userId: user.id }, // Link tenant to user via userId for uniqueness
        select: { id: true }
      });
      if (tenant) {
        tenantId = tenant.id;
      }
    }

    res.json({ ...user, tenantId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to retrieve profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, email, phone, gender } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name,
        email,
        phone,
        gender,
      },
      select: { id: true, name: true, email: true, role: true, phone: true, gender: true },
    });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to update profile" });
  }
};