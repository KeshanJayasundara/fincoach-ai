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

    // ✅ Token clear කරන්නේ නෑ — resetPassword step එකෙදී clear වෙනවා
    return { success: true };
  } catch (error) {
    return { success: false, error: "Verification failed" };
  }
}

export async function resetPassword(data: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  try {
    console.log("🔄 Reset Password Attempt for:", data.email, "OTP:", data.otp);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) return { success: false, error: "User not found" };

    if (!user.resetToken || !user.resetTokenExpiry) {
      return { success: false, error: "No active reset request" };
    }

    if (user.resetToken !== data.otp) {
      return { success: false, error: "Invalid OTP" };
    }

    if (user.resetTokenExpiry < new Date()) {
      return { success: false, error: "OTP has expired" };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { email: data.email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log("✅ Password reset successful for:", data.email);
    return { success: true, message: "Password reset successful" };
  } catch (error: any) {
    console.error("❌ Reset Password Error:", error);
    return { success: false, error: error.message || "Failed to reset password" };
  }
}