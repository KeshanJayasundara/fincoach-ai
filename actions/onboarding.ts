"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveOnboarding(data: {
  primaryProfession: string;
  secondaryRoles: string[];
  incomeType: string;
  preferredCurrency: string;
}) {
  const session = await auth();

  // ✅ DEBUG — paste terminal output here if still failing
  console.log("=== ONBOARDING DEBUG ===");
  console.log("Session:", JSON.stringify(session, null, 2));
  console.log("Data:", JSON.stringify(data, null, 2));

  if (!session?.user?.id) {
    console.log("❌ No session — redirecting to login");
    redirect("/login");
  }

  console.log("✅ Saving for user:", session.user.id);

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        primaryProfession: data.primaryProfession,
        secondaryRoles: data.secondaryRoles,
        incomeType: data.incomeType,
        preferredCurrency: data.preferredCurrency,
        onboardingDone: true,
      },
    });
    console.log("✅ DB save success");
  } catch (error) {
    console.error("❌ Prisma Error:", error);
    throw new Error("Failed to save onboarding data");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}