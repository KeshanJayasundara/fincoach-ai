"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { createNotification } from "@/lib/notifications";

export async function updateName(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name cannot be empty.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });

  await createNotification({
    userId: session.user.id,
    type: "system",
    title: "Name updated",
    message: `Your name was changed to "${trimmed}".`,
    link: "/dashboard/settings",
  });

  return { success: true };
}

export async function updateEmail(newEmail: string, currentPassword: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const trimmedEmail = newEmail.trim().toLowerCase();
  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, email: true },
  });
  if (!user) throw new Error("User not found");

  if (trimmedEmail === user.email.toLowerCase()) {
    throw new Error("That's already your current email.");
  }

  // Email changes are sensitive (they control login + account recovery),
  // so require the current password when the account has one.
  if (user.password) {
    if (!currentPassword) {
      throw new Error("Please enter your current password.");
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Incorrect password.");
    }
  }

  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existing && existing.id !== session.user.id) {
    throw new Error("That email is already in use.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { email: trimmedEmail, emailVerified: null }, // needs re-verification
  });

  // Notify the OLD email's inbox implicitly via in-app feed too — the
  // notification is attached to the user record (userId), not the email
  // address, so it still shows up correctly once they're signed back in
  // under the new email.
  await createNotification({
    userId: session.user.id,
    type: "system",
    title: "Email address changed",
    message: `Your account email was changed to ${trimmedEmail}. Please re-verify it.`,
    link: "/dashboard/settings",
  });

  return { success: true };
}

export async function updateCurrency(currency: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  if (!currency) {
    throw new Error("Please select a currency.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { preferredCurrency: currency },
  });

  await createNotification({
    userId: session.user.id,
    type: "system",
    title: "Base currency updated",
    message: `Your base currency was changed to ${currency}.`,
    link: "/dashboard/settings",
  });

  return { success: true };
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  if (!user) throw new Error("User not found");

  if (user.password) {
    if (!currentPassword) {
      throw new Error("Please enter your current password.");
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Incorrect current password.");
    }
  }
  // If user.password is null (Google OAuth account), this sets a password
  // for the first time — lets them add credentials login going forward.

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  // Security-relevant event — worth surfacing even though the user just
  // triggered it themselves, so they'd notice if it ever happens without
  // their knowledge (e.g. compromised session).
  await createNotification({
    userId: session.user.id,
    type: "system",
    title: "Password updated",
    message: "Your account password was changed successfully.",
    link: "/dashboard/settings",
  });

  return { success: true };
}

export interface NotificationSettings {
  monthlyReport: boolean;
  goalMilestones: boolean;
  weeklyDigest: boolean;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      autoReportEnabled: true,
      goalMilestones: true,
      weeklyDigest: true,
    },
  });
  if (!user) throw new Error("User not found");

  return {
    monthlyReport: user.autoReportEnabled,
    goalMilestones: user.goalMilestones,
    weeklyDigest: user.weeklyDigest,
  };
}

export async function updateNotificationSetting(
  key: keyof NotificationSettings,
  value: boolean
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  let data: Record<string, boolean>;
  switch (key) {
    case "monthlyReport":
      data = { autoReportEnabled: value };
      break;
    case "goalMilestones":
      data = { goalMilestones: value };
      break;
    case "weeklyDigest":
      data = { weeklyDigest: value };
      break;
    default:
      throw new Error("Unknown notification setting.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return { success: true };
}

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
  // UserRole, UserTypeHistory, ChatMessage, Asset, Notification) are set to
  // onDelete: Cascade in schema.prisma, so this one call removes everything.
  // No point creating a notification here — the user record is about to
  // be deleted along with it.
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return { success: true };
}