import { prisma } from "@/lib/prisma";
import { generateMonthlyReportForUser } from "@/actions/reports";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Protect this endpoint — only the scheduler should be able to call it
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const isLastDayOfMonth =
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === now.getDate();

  if (!isLastDayOfMonth) {
    return NextResponse.json({ skipped: true, reason: "not last day of month" });
  }

  // Only auto-send to users who haven't opted out
  const users = await prisma.user.findMany({
    where: { autoReportEnabled: true },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    users.map(u => generateMonthlyReportForUser(u.id))
  );

  const sent = results.filter(
    r => r.status === "fulfilled" && (r.value as { success: boolean }).success
  ).length;

  const failed = results.filter(r => r.status === "rejected").length;

  return NextResponse.json({
    total: users.length,
    sent,
    failed,
  });
}