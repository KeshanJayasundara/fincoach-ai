"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { checkGoalMilestones } from "@/lib/goalMilestones";

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

  // Read the amount BEFORE the update so we know which side of each
  // milestone threshold (50/75/100%) we were on beforehand.
  const before = await prisma.goal.findUnique({
    where: { id },
    select: { userId: true, currentAmount: true, targetAmount: true, name: true },
  });
  if (!before || before.userId !== session.user.id) {
    throw new Error("Goal not found");
  }

  const goal = await prisma.goal.update({
    where: { id, userId: session.user.id },
    data: {
      currentAmount: {
        increment: addAmount,
      },
    },
  });

  // Fire-and-check milestone notifications. Awaited (not fire-and-forget)
  // so any DB error here surfaces instead of silently vanishing, but it
  // never blocks on external services since it only touches the DB.
  await checkGoalMilestones({
    userId: session.user.id,
    goalId: goal.id,
    goalName: before.name,
    targetAmount: before.targetAmount,
    beforeAmount: before.currentAmount,
    afterAmount: goal.currentAmount,
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