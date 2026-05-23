"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendResetOTP } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

// Register with OTP
export async function registerUser(data: { name: string; email: string; password: string }) {
  try {
    const validated = registerSchema.parse(data);

    const existingUser = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existingUser) return { success: false, error: "User already exists" };

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        onboardingDone: false,
        preferredCurrency: "LKR",
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: otp, resetTokenExpiry: expiry },
    });

    await sendResetOTP(validated.email, otp);

    return { success: true, message: "OTP sent" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Verify OTP (for both Register & Forgot Password)
export async function verifyOTP(email: string, otp: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return { success: false, error: "Invalid request" };
    }

    if (user.resetToken !== otp) {
      return { success: false, error: "Invalid OTP" };
    }

    if (user.resetTokenExpiry < new Date()) {
      return { success: false, error: "OTP has expired" };
    }

    // OTP is valid → Clear it
    await prisma.user.update({
      where: { email },
      data: { resetToken: null, resetTokenExpiry: null },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Verification failed" };
  }
}