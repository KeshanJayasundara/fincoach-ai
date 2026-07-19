"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/enums";

const ONE_HOUR_MS = 60 * 60 * 1000;

export type QuickInsight = {
  text: string;
  suggestions: string[];
  cachedAt: string;
};

function parseSuggestions(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

function buildFallbackSuggestions(params: {
  topCategory: string | null;
  topCategoryChangePct: number | null;
  mostUrgentGoal: { name: string; daysLeft: number | null } | null;
  savingsRate: number;
}): string[] {
  const { topCategory, topCategoryChangePct, mostUrgentGoal, savingsRate } = params;
  const suggestions: string[] = [];

  if (topCategory) {
    suggestions.push(
      topCategoryChangePct !== null && topCategoryChangePct > 0
        ? `Why did my ${topCategory} spending go up ${topCategoryChangePct}%?`
        : `Why is ${topCategory} my top expense this month?`
    );
  }

  if (mostUrgentGoal) {
    suggestions.push(
      mostUrgentGoal.daysLeft !== null
        ? `How do I reach ${mostUrgentGoal.name} in ${mostUrgentGoal.daysLeft} days?`
        : `How can I speed up progress on ${mostUrgentGoal.name}?`
    );
  }

  suggestions.push(
    savingsRate < 0
      ? "How do I stop spending more than I earn?"
      : savingsRate < 20
        ? "How can I raise my savings rate?"
        : "Show me this month vs last month"
  );

  return suggestions.slice(0, 3);
}

export async function getQuickInsight(force = false): Promise<QuickInsight> {
  const session = await auth();
  if (!session?.user?.id) {
    return { text: "Sign in to see your insight.", suggestions: [], cachedAt: new Date().toISOString() };
  }
  const userId = session.user.id;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { quickInsightText: true, quickInsightSuggestions: true, quickInsightUpdatedAt: true },
  });

  const isFresh =
    !force &&
    existing?.quickInsightText &&
    existing.quickInsightUpdatedAt &&
    Date.now() - existing.quickInsightUpdatedAt.getTime() < ONE_HOUR_MS;

  if (isFresh) {
    return {
      text: existing.quickInsightText!,
      suggestions: parseSuggestions(existing.quickInsightSuggestions),
      cachedAt: existing.quickInsightUpdatedAt!.toISOString(),
    };
  }

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
  const currentNet     = currentIncome - currentExpense;
  const savingsRate    = currentIncome > 0 ? Math.round((currentNet / currentIncome) * 100) : 0;

  const lastIncome  = lastTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amountBase, 0);
  const lastExpense = lastTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);
  const lastNet     = lastIncome - lastExpense;

  const catMap: Record<string, { current: number; last: number }> = {};
  currentTxns.filter(t => t.type === TransactionType.Expense).forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = { current: 0, last: 0 };
    catMap[t.category].current += t.amountBase;
  });
  lastTxns.filter(t => t.type === TransactionType.Expense).forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = { current: 0, last: 0 };
    catMap[t.category].last += t.amountBase;
  });

  const sortedCategories = Object.entries(catMap).sort((a, b) => b[1].current - a[1].current);

  const topCategories = sortedCategories
    .slice(0, 5)
    .map(([cat, v]) => {
      const change = v.last > 0 ? Math.round(((v.current - v.last) / v.last) * 100) : null;
      return `${cat}: LKR ${v.current.toLocaleString()}${change !== null ? ` (${change > 0 ? "+" : ""}${change}% vs last month)` : ""}`;
    })
    .join(", ");

  const topCatEntry = sortedCategories[0];
  const topCategory = topCatEntry?.[0] ?? null;
  const topCategoryChangePct = topCatEntry && topCatEntry[1].last > 0
    ? Math.round(((topCatEntry[1].current - topCatEntry[1].last) / topCatEntry[1].last) * 100)
    : null;

  const mostUrgentGoal = goals
    .map(g => ({
      name: g.name,
      daysLeft: g.deadline ? Math.ceil((g.deadline.getTime() - now.getTime()) / 86400000) : null,
    }))
    .sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity))[0] ?? null;

  const fallbackSuggestions = buildFallbackSuggestions({
    topCategory,
    topCategoryChangePct,
    mostUrgentGoal,
    savingsRate,
  });

  const goalsText = goals.map(g => {
    const pct      = Math.round((g.currentAmount / g.targetAmount) * 100);
    const daysLeft = g.deadline ? Math.ceil((g.deadline.getTime() - now.getTime()) / 86400000) : null;
    return `${g.name}: ${pct}% saved${daysLeft !== null ? `, ${daysLeft} days left` : ""}`;
  }).join(" | ") || "No active goals";

  const context = `
Month: ${now.toLocaleString("default", { month: "long", year: "numeric" })}
Income: LKR ${currentIncome.toLocaleString()}
Expenses: LKR ${currentExpense.toLocaleString()} (last month: LKR ${lastExpense.toLocaleString()})
Net savings: LKR ${currentNet.toLocaleString()} (${savingsRate}% savings rate; last month net: LKR ${lastNet.toLocaleString()})
Top categories: ${topCategories || "none"}
Goals: ${goalsText}
  `.trim();

  let text = "Could not load insight. Visit AI chat for full analysis.";
  let suggestions = fallbackSuggestions;

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
        max_tokens: 250,
        system: `You are a finance coach. Base everything strictly on the numbers given, not assumptions.
Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"insight": "one or two sentence insight with specific numbers, no greetings", "suggestions": ["question 1", "question 2", "question 3"]}

The 3 suggestions must be short, first-person questions the user could tap to ask their AI chat, each tailored to this user's actual top overspend category, most urgent goal, or savings trend from the data given — not generic questions.`,
        messages: [{ role: "user", content: context }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Quick insight API error:", data);
    } else {
      const raw = data.content?.[0]?.type === "text" ? data.content[0].text : "";
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (typeof parsed.insight === "string" && parsed.insight.trim()) {
          text = parsed.insight;
        }
        if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
          suggestions = parsed.suggestions.slice(0, 3);
        }
      } catch (parseErr) {
        console.error("Quick insight JSON parse error:", parseErr, cleaned);
      }
    }
  } catch (error) {
    console.error("Quick insight fetch error:", error);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      quickInsightText: text,
      quickInsightSuggestions: JSON.stringify(suggestions),
      quickInsightUpdatedAt: now,
    },
  });

  return { text, suggestions, cachedAt: now.toISOString() };
}