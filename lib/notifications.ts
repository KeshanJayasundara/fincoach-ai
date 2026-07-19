import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "goal_milestone"
  | "weekly_digest"
  | "spending_alert"
  | "monthly_report"
  | "system";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Plain server-side helper — deliberately NOT a "use server" action.
 *
 * It accepts an arbitrary `userId`, so if this were exposed directly to the
 * client, any signed-in user could create notifications in someone else's
 * feed. Only call this from trusted server code that has already decided
 * *which* user the notification belongs to — e.g. inside goal progress
 * updates, transaction creation, or a scheduled digest/report job.
 */
export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}