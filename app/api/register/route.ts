// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", body); 

    const validated = registerSchema.parse(body);
    const { name, email, password } = validated;

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        onboardingDone: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    console.log("User created:", user); 

    return NextResponse.json({
      success: true,
      message: "User registered successfully!",
      user: user
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}