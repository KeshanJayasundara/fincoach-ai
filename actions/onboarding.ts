"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type RoleInput = { name: string; emoji: string };

export async function saveOnboarding(data: {
  primaryProfession: string;
  primaryEmoji: string;
  secondaryRoles: RoleInput[];
  incomeType: string;
  preferredCurrency: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          primaryProfession: data.primaryProfession,
          secondaryRoles: data.secondaryRoles.map((r) => r.name),
          incomeType: data.incomeType,
          preferredCurrency: data.preferredCurrency,
          onboardingDone: true,
        },
      });

      await tx.userRole.upsert({
        where: { userId_roleName: { userId, roleName: data.primaryProfession } },
        create: {
          userId,
          roleName: data.primaryProfession,
          displayName: data.incomeType,
          emoji: data.primaryEmoji,
          isPrimary: true,
          status: "ACTIVE",
        },
        update: {
          displayName: data.incomeType,
          emoji: data.primaryEmoji,
          isPrimary: true,
          status: "ACTIVE",
          archivedAt: null,
        },
      });

      for (const role of data.secondaryRoles.slice(0, 2)) {
        await tx.userRole.upsert({
          where: { userId_roleName: { userId, roleName: role.name } },
          create: {
            userId,
            roleName: role.name,
            displayName: "Additional role",
            emoji: role.emoji,
            isPrimary: false,
            status: "ACTIVE",
          },
          update: {
            emoji: role.emoji,
            status: "ACTIVE",
            archivedAt: null,
          },
        });
      }

      await tx.userTypeHistory.create({
        data: {
          userId,
          toType: data.primaryProfession,
          reason: "Onboarding completed",
        },
      });
    });
  } catch (error) {
    console.error("❌ Onboarding save error:", error);
    throw new Error("Failed to save onboarding data");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard");
}