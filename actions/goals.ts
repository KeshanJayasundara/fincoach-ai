"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createGoal(data: {
  name: string;
  targetAmount: number;
  currency?: string;
  deadline?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      name: data.name,
      targetAmount: data.targetAmount,
      currency: data.currency || "LKR",
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  revalidatePath("/dashboard/goals");
  return goal;
}

export async function getGoals() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateGoalProgress(id: string, addAmount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = await prisma.goal.update({
    where: { id, userId: session.user.id },
    data: {
      currentAmount: {
        increment: addAmount,
      },
    },
  });

  revalidatePath("/dashboard/goals");
  return goal;
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.goal.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard/goals");
}