"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function deleteAccount(password: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.password) {
    // Credentials-based account — password is required and must match.
    if (!password) {
      throw new Error("Please enter your current password.");
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Incorrect password.");
    }
  }
  // If user.password is null, they signed up via Google OAuth and have
  // no password to check — proceed since the DELETE confirmation text
  // is already required on the client.

  // All related records (Account, Session, Transaction, Goal, ReportLog,
  // UserRole, UserTypeHistory, ChatMessage, Asset) are set to
  // onDelete: Cascade in schema.prisma, so this one call removes everything.
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return { success: true };
}