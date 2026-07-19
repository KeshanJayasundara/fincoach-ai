import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

const MILESTONES = [50, 75, 100];

interface CheckMilestoneParams {
  userId: string;
  goalId: string;
  goalName: string;
  targetAmount: number;
  beforeAmount: number;
  afterAmount: number;
}

/**
 * Call this right after a goal's currentAmount changes. It figures out
 * which milestone thresholds (if any) were just crossed and creates one
 * notification per threshold crossed — so a single big contribution that
 * jumps straight from 40% to 100% still notifies for 50, 75, and 100.
 */
export async function checkGoalMilestones(params: CheckMilestoneParams) {
  const { userId, goalId, goalName, targetAmount, beforeAmount, afterAmount } = params;

  if (targetAmount <= 0) return; // avoid division by zero on malformed goals

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { goalMilestones: true },
  });
  if (!user?.goalMilestones) return; // user has this notification type disabled

  const beforePct = (beforeAmount / targetAmount) * 100;
  const afterPct = (afterAmount / targetAmount) * 100;

  const crossed = MILESTONES.filter((m) => beforePct < m && afterPct >= m);
  if (crossed.length === 0) return;

  for (const milestone of crossed) {
    const title =
      milestone === 100 ? "Goal completed! 🎉" : `${milestone}% of the way there!`;
    const message =
      milestone === 100
        ? `Congrats — you've fully funded "${goalName}".`
        : `Your "${goalName}" goal just hit ${milestone}% of its target.`;

    await createNotification({
      userId,
      type: "goal_milestone",
      title,
      message,
      link: `/dashboard/goals`,
    });
  }

  // If the goal is fully funded, flip its status so it stops showing as
  // "active" in progress lists.
  if (afterPct >= 100) {
    await prisma.goal.update({
      where: { id: goalId },
      data: { status: "completed" },
    });
  }
}