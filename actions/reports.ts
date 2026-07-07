"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { sendMonthlyReport } from "@/lib/email";
import { revalidatePath } from "next/cache";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#7C6FF0",
  Rent: "#3DDC97",
  Transport: "#F2A93B",
  Dining: "#F0574B",
  Other: "#8B87A8",
};

function fmt(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString()}`;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function buildReport(userId: string, monthStr?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const now = monthStr ? new Date(monthStr + "-01") : new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
  const endOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59);

  const [monthlyTransactions, prevMonthTransactions, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { date: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
    }),
    prisma.goal.findMany({ where: { userId, status: "active" } }),
  ]);

  const currency = user.preferredCurrency || "USD";

  // Use amountBase (normalized to preferredCurrency), not amount,
  // since transactions may be logged in different currencies.
  const totalIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amountBase, 0);
  const totalExpense = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amountBase, 0);
  const netSaved = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSaved / totalIncome) * 100 : 0;

  const prevExpense = prevMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amountBase, 0);
  const txnDeltaPct = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;

  const categoryTotals: Record<string, number> = {};
  monthlyTransactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      const cat = t.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amountBase;
    });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategoryAmount = sortedCategories.length ? sortedCategories[0][1] : 1;

  const categoryRows = sortedCategories
    .map(([cat, amount]) => {
      const widthPct = Math.max(4, Math.round((amount / maxCategoryAmount) * 100));
      const color = CATEGORY_COLORS[cat] || "#8B87A8";
      return `
      <tr>
        <td style="padding:6px 0;font-size:12px;color:#CFCBEA;width:70px;font-family:Helvetica Neue,Arial,sans-serif;">${cat}</td>
        <td style="padding:6px 8px;">
          <div style="background:#2A2650;border-radius:6px;height:8px;width:100%;">
            <div style="background:${color};height:8px;border-radius:6px;width:${widthPct}%;"></div>
          </div>
        </td>
        <td style="padding:6px 0;font-size:12px;color:#EDEBFF;text-align:right;white-space:nowrap;font-family:Helvetica Neue,Arial,sans-serif;">${fmt(amount, currency)}</td>
      </tr>`;
    })
    .join("");

  // Goals progress — real data from the Goal model
  const goalRows = goals
    .map(g => {
      const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
      return `
      <tr>
        <td style="padding:8px 0;">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#CFCBEA;margin-bottom:4px;">
            <span>${g.name}</span>
            <span style="color:#A78BFA;font-weight:700;">${pct.toFixed(0)}%</span>
          </div>
          <div style="background:#2A2650;border-radius:6px;height:8px;width:100%;">
            <div style="background:#5B4FE8;height:8px;border-radius:6px;width:${pct}%;"></div>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  // Simple rule-based insights derived from real numbers (no hardcoding)
  const insights: string[] = [];
  const topCategory = sortedCategories[0];
  if (topCategory) {
    const prevCategoryTotal = prevMonthTransactions
      .filter(t => t.type === "expense" && (t.category || "Other") === topCategory[0])
      .reduce((s, t) => s + t.amountBase, 0);
    if (prevCategoryTotal > 0) {
      const catDelta = ((topCategory[1] - prevCategoryTotal) / prevCategoryTotal) * 100;
      if (catDelta > 15) {
        insights.push(
          `⚠️ <strong>${topCategory[0]} spending jumped ${catDelta.toFixed(0)}%</strong> vs last month (${fmt(
            topCategory[1],
            currency
          )} vs ${fmt(prevCategoryTotal, currency)}).`
        );
      }
    }
  }
  goals.forEach(g => {
    if (g.targetAmount > 0 && g.currentAmount < g.targetAmount) {
      const pct = (g.currentAmount / g.targetAmount) * 100;
      if (pct >= 40 && pct < 100) {
        insights.push(`🎯 <strong>${g.name} is ${pct.toFixed(0)}% complete!</strong> Keep it up.`);
      }
    }
  });

  const monthLabel = startOfMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const generatedLabel = new Date().toLocaleString("default", { month: "long", day: "numeric", year: "numeric" });
  const firstName = user.name?.split(" ")[0] || "there";

  const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${monthLabel} Financial Report</title>
</head>
<body style="margin:0;padding:0;background-color:#0F0D24;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0F0D24;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:480px;background-color:#181633;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.4);font-family:Helvetica Neue,Arial,sans-serif;">

          <tr>
            <td style="background:linear-gradient(135deg,#5B4FE8 0%,#7C6FF0 100%);padding:28px 32px;text-align:center;">
              <div style="font-size:18px;font-weight:700;color:#fff;">FinCoach AI</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">Your ${monthLabel} Financial Report</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">Auto-generated on ${generatedLabel}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 8px;">
              <div style="font-size:14px;color:#EDEBFF;">Hi ${firstName}! 👋 Here's your monthly financial summary.</div>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px 4px;">
              <div style="font-size:13px;font-weight:700;color:#EDEBFF;margin-bottom:10px;">${monthLabel} Overview</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="background:#1E1B45;border-radius:10px;padding:12px 8px;text-align:center;" align="center">
                    <div style="font-size:15px;font-weight:700;color:#4ADE80;">${fmt(totalIncome, currency)}</div>
                    <div style="font-size:10.5px;color:#8B87A8;margin-top:2px;">Income</div>
                  </td>
                  <td width="3%"></td>
                  <td width="33%" style="background:#1E1B45;border-radius:10px;padding:12px 8px;text-align:center;" align="center">
                    <div style="font-size:15px;font-weight:700;color:#F87171;">${fmt(totalExpense, currency)}</div>
                    <div style="font-size:10.5px;color:#8B87A8;margin-top:2px;">Expenses</div>
                  </td>
                  <td width="3%"></td>
                  <td width="33%" style="background:#1E1B45;border-radius:10px;padding:12px 8px;text-align:center;" align="center">
                    <div style="font-size:15px;font-weight:700;color:#A78BFA;">${fmt(netSaved, currency)}</div>
                    <div style="font-size:10.5px;color:#8B87A8;margin-top:2px;">Saved</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 24px 4px;">
              <div style="background:#1E1B45;border-radius:8px;padding:8px 12px;font-size:11.5px;color:#B7B2E0;">
                Savings rate: <strong style="color:#A78BFA;">${savingsRate.toFixed(1)}%</strong>
                &nbsp;·&nbsp; Transactions: <strong style="color:#EDEBFF;">${monthlyTransactions.length}</strong>
                &nbsp;·&nbsp; vs last month:
                <strong style="color:${txnDeltaPct <= 0 ? "#4ADE80" : "#F87171"};">
                  ${txnDeltaPct >= 0 ? "+" : ""}${txnDeltaPct.toFixed(1)}%
                </strong>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 24px 4px;">
              <div style="font-size:13px;font-weight:700;color:#EDEBFF;margin-bottom:6px;">Spending by Category</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${categoryRows || `<tr><td style="font-size:12px;color:#8B87A8;padding:8px 0;">No expenses recorded this month.</td></tr>`}
              </table>
            </td>
          </tr>

          ${
            insights.length
              ? `
          <tr>
            <td style="padding:20px 24px 4px;">
              <div style="font-size:13px;font-weight:700;color:#EDEBFF;margin-bottom:8px;">AI Insights 💡</div>
              ${insights
                .map(
                  i => `
                <div style="background:#1E1B45;border-radius:8px;padding:10px 12px;font-size:12px;color:#CFCBEA;margin-bottom:8px;">${i}</div>
              `
                )
                .join("")}
            </td>
          </tr>`
              : ""
          }

          ${
            goals.length
              ? `
          <tr>
            <td style="padding:8px 24px 4px;">
              <div style="font-size:13px;font-weight:700;color:#EDEBFF;margin-bottom:4px;">Goals Progress</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${goalRows}
              </table>
            </td>
          </tr>`
              : ""
          }

          <tr>
            <td style="padding:20px 24px 8px;">
              <div style="font-size:13px;font-weight:700;color:#EDEBFF;margin-bottom:8px;">Recent Transactions</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${monthlyTransactions
                  .slice(0, 8)
                  .map(
                    t => `
                  <tr>
                    <td style="padding:5px 0;font-size:11.5px;color:#8B87A8;width:70px;">${t.date.toLocaleDateString()}</td>
                    <td style="padding:5px 0;font-size:11.5px;color:#CFCBEA;">${t.description || t.category}</td>
                    <td style="padding:5px 0;font-size:11.5px;text-align:right;color:${
                      t.type === "income" ? "#4ADE80" : "#F87171"
                    };white-space:nowrap;">
                      ${t.type === "income" ? "+" : "-"}${fmt(t.amountBase, currency)}
                    </td>
                  </tr>`
                  )
                  .join("")}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 24px 24px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard"
                 style="display:inline-block;background:#5B4FE8;color:#fff;text-decoration:none;
                        font-size:13px;font-weight:600;padding:10px 24px;border-radius:8px;">
                View Full Dashboard →
              </a>
            </td>
          </tr>

          <tr>
            <td style="background:#12102A;padding:14px;text-align:center;">
              <div style="font-size:10.5px;color:#66618C;">
                FinCoach AI · This is general financial information, not professional advice.<br/>
                <a href="#" style="color:#8B87A8;text-decoration:underline;">Unsubscribe</a> ·
                <a href="#" style="color:#8B87A8;text-decoration:underline;">Settings</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { reportHtml, monthKey, email: user.email! };
}

/**
 * Called by the "Send Combined Report" button on the dashboard.
 * Session-gated — always logs sentVia: "manual".
 */
export async function generateMonthlyReport(monthStr?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { reportHtml, monthKey, email } = await buildReport(session.user.id, monthStr);

  const existing = await prisma.reportLog.findFirst({
    where: { userId: session.user.id, month: monthKey, type: "combined" },
  });
  if (existing) {
    throw new Error(
      `A report for this month was already sent (${
        existing.sentVia === "auto" ? "auto-sent on the last day" : "sent manually"
      }).`
    );
  }

  const success = await sendMonthlyReport(email, reportHtml);

  if (success) {
    await prisma.reportLog.create({
      data: {
        userId: session.user.id,
        month: monthKey,
        type: "combined",
        sentVia: "manual",
        emailSentTo: email,
      },
    });
  }

  revalidatePath("/dashboard/reports");
  return { success };
}

/**
 * Called by the cron route — no session, loops over all users.
 * Always logs sentVia: "auto". Skips if a report for the current
 * month already exists for that user.
 */
export async function generateMonthlyReportForUser(userId: string) {
  const monthKey = currentMonthKey();

  const existing = await prisma.reportLog.findFirst({
    where: { userId, month: monthKey, type: "combined" },
  });
  if (existing) return { success: false, reason: "already sent" };

  const { reportHtml, email } = await buildReport(userId);
  const success = await sendMonthlyReport(email, reportHtml);

  if (success) {
    await prisma.reportLog.create({
      data: { userId, month: monthKey, type: "combined", sentVia: "auto", emailSentTo: email },
    });
  }
  return { success };
}

export async function getReportLogs() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.reportLog.findMany({
    where: { userId: session.user.id },
    orderBy: { sentAt: "desc" },
  });
}