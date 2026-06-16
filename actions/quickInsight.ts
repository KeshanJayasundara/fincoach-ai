"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { TransactionType } from "@/lib/enums";

export async function getQuickInsight(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) return "Sign in to see your insight.";
  const userId = session.user.id;

  const now          = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const lastStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd      = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [currentTxns, lastTxns, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: currentStart, lte: currentEnd } },
      select: { type: true, amountBase: true, category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: lastStart, lte: lastEnd } },
      select: { type: true, amountBase: true, category: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: "active" },
      select: { name: true, targetAmount: true, currentAmount: true, deadline: true },
    }),
  ]);

  const currentIncome  = currentTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amountBase, 0);
  const currentExpense = currentTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);
  const lastExpense    = lastTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);

  const catMap: Record<string, { current: number; last: number }> = {};
  currentTxns.filter(t => t.type === TransactionType.Expense).forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = { current: 0, last: 0 };
    catMap[t.category].current += t.amountBase;
  });
  lastTxns.filter(t => t.type === TransactionType.Expense).forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = { current: 0, last: 0 };
    catMap[t.category].last += t.amountBase;
  });

  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1].current - a[1].current)
    .slice(0, 5)
    .map(([cat, v]) => {
      const change = v.last > 0 ? Math.round(((v.current - v.last) / v.last) * 100) : null;
      return `${cat}: LKR ${v.current.toLocaleString()}${change !== null ? ` (${change > 0 ? "+" : ""}${change}% vs last month)` : ""}`;
    })
    .join(", ");

  const goalsText = goals.map(g => {
    const pct      = Math.round((g.currentAmount / g.targetAmount) * 100);
    const daysLeft = g.deadline
      ? Math.ceil((g.deadline.getTime() - now.getTime()) / 86400000)
      : null;
    return `${g.name}: ${pct}% saved${daysLeft !== null ? `, ${daysLeft} days left` : ""}`;
  }).join(" | ") || "No active goals";

  const context = `
Month: ${now.toLocaleString("default", { month: "long", year: "numeric" })}
Income: LKR ${currentIncome.toLocaleString()}
Expenses: LKR ${currentExpense.toLocaleString()} (last month: LKR ${lastExpense.toLocaleString()})
Top categories: ${topCategories || "none"}
Goals: ${goalsText}
  `.trim();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 120,
        system:     "You are a finance coach. Reply with ONE insight: max 2 sentences, specific numbers, no greetings, no markdown.",
        messages:   [{ role: "user", content: context }],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text ?? "No insight available right now.";
  } catch {
    return "Could not load insight. Visit AI chat for full analysis.";
  }
}