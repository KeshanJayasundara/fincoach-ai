"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/enums";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AIResponse = {
  success: boolean;
  reply: string;
  queriesUsed: number;
  queriesLimit: number;
};

const QUERY_LIMITS: Record<string, number> = {
  free: 10,
  pro: 999,
};

function getCurrentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

async function getUserQueryStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, aiQueriesUsed: true, aiQueryMonth: true },
  });

  if (!user) throw new Error("User not found");

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isNewMonth   = user.aiQueryMonth !== currentMonth;
  const queriesUsed  = isNewMonth ? 0 : user.aiQueriesUsed;
  const limit        = QUERY_LIMITS[user.plan] ?? 10;

  return { queriesUsed, limit, currentMonth, isNewMonth };
}

/**
 * Deletes chat messages from before the current calendar month.
 * Called opportunistically whenever chat history is touched, so no
 * separate cron job is required.
 */
async function cleanupOldChatMessages(userId: string) {
  const monthStart = getCurrentMonthStart();
  await prisma.chatMessage.deleteMany({
    where: { userId, createdAt: { lt: monthStart } },
  });
}

/**
 * Lightweight call the client can use (e.g. on page load) to display
 * the user's current AI query usage without sending a chat message.
 */
export async function getAIUsage(): Promise<{ queriesUsed: number; queriesLimit: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { queriesUsed, limit } = await getUserQueryStatus(session.user.id);
  return { queriesUsed, queriesLimit: limit };
}

/**
 * Returns this month's chat history for the current user (oldest first),
 * after clearing out anything older than the current month.
 */
export async function getChatHistory(): Promise<StoredChatMessage[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  await cleanupOldChatMessages(userId);

  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return messages.map(m => ({
    id:        m.id,
    role:      m.role as "user" | "assistant",
    content:   m.content,
    createdAt: m.createdAt.toISOString(),
  }));
}

/**
 * Clears all saved chat history for the current user immediately
 * (used by a "Clear chat" button, if you add one).
 */
export async function clearChatHistory(): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.chatMessage.deleteMany({ where: { userId: session.user.id } });
  return { success: true };
}

async function buildFinancialContext(userId: string): Promise<string> {
  const now = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentStart = new Date(currentYear, currentMonth, 1);
  const currentEnd   = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  const lastStart    = new Date(currentYear, currentMonth - 1, 1);
  const lastEnd      = new Date(currentYear, currentMonth, 0, 23, 59, 59);
  const todayStart   = new Date(currentYear, currentMonth, now.getDate(), 0, 0, 0);
  const todayEnd     = new Date(currentYear, currentMonth, now.getDate(), 23, 59, 59);

  const [user, currentTxns, lastTxns, todayTxns, goals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name:              true,
        primaryProfession: true,
        secondaryRoles:    true,
        preferredCurrency: true,
        plan:              true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: currentStart, lte: currentEnd } },
      select: { type: true, amountBase: true, category: true, description: true, date: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: lastStart, lte: lastEnd } },
      select: { type: true, amountBase: true, category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: todayStart, lte: todayEnd } },
      select: { type: true, amountBase: true, category: true, description: true, date: true },
      orderBy: { date: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId, status: "active" },
      select: {
        name:          true,
        targetAmount:  true,
        currentAmount: true,
        deadline:      true,
        currency:      true,
      },
    }),
  ]);

  const currency      = user?.preferredCurrency ?? "LKR";
  const monthName     = now.toLocaleString("default", { month: "long", year: "numeric" });
  const lastMonthName = new Date(currentYear, currentMonth - 1).toLocaleString("default", {
    month: "long", year: "numeric",
  });
  const todayStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const currentIncome  = currentTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amountBase, 0);
  const currentExpense = currentTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);
  const currentNet     = currentIncome - currentExpense;

  const categoryMap: Record<string, number> = {};
  currentTxns.filter(t => t.type === TransactionType.Expense).forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amountBase;
  });

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => {
      const pct = currentExpense > 0 ? Math.round((amt / currentExpense) * 100) : 0;
      return `  - ${cat}: ${currency} ${amt.toLocaleString()} (${pct}%)`;
    })
    .join("\n");

  const lastIncome  = lastTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amountBase, 0);
  const lastExpense = lastTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);
  const lastNet     = lastIncome - lastExpense;

  const todayIncome  = todayTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amountBase, 0);
  const todayExpense = todayTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);

  const todayTxnsText = todayTxns.length === 0
    ? "  No transactions recorded today."
    : todayTxns.map(t => {
        const time = new Date(t.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const sign = t.type === TransactionType.Income ? "+" : "-";
        return `  - [${time}] ${sign}${currency} ${t.amountBase.toLocaleString()} | ${t.category}${t.description ? ` | ${t.description}` : ""}`;
      }).join("\n");

  const goalsText = goals.length === 0
    ? "  No active goals set."
    : goals.map(g => {
        const progress  = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
        const remaining = Math.max(g.targetAmount - g.currentAmount, 0);
        const deadline  = g.deadline
          ? g.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "No deadline";
        const daysLeft  = g.deadline
          ? Math.ceil((g.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        return [
          `  - ${g.name}:`,
          `    Target:    ${currency} ${g.targetAmount.toLocaleString()}`,
          `    Saved:     ${currency} ${g.currentAmount.toLocaleString()} (${progress}%)`,
          `    Remaining: ${currency} ${remaining.toLocaleString()}`,
          `    Deadline:  ${deadline}${daysLeft !== null ? ` (${daysLeft} days left)` : ""}`,
        ].join("\n");
      }).join("\n");

  const professions = [
    user?.primaryProfession,
    ...(user?.secondaryRoles ?? []),
  ].filter(Boolean).join(" + ") || "Not specified";

  return `
TODAY: ${todayStr}

USER PROFILE:
  Name:       ${user?.name ?? "User"}
  Profession: ${professions}
  Currency:   ${currency}
  Plan:       ${user?.plan ?? "free"}

TODAY'S TRANSACTIONS (${todayStr}):
  Income today:  ${currency} ${todayIncome.toLocaleString()}
  Expense today: ${currency} ${todayExpense.toLocaleString()}
  Transactions:
${todayTxnsText}

${monthName.toUpperCase()} (CURRENT MONTH):
  Income:       ${currency} ${currentIncome.toLocaleString()}
  Expenses:     ${currency} ${currentExpense.toLocaleString()}
  Saved:        ${currency} ${currentNet.toLocaleString()}
  Savings Rate: ${currentIncome > 0 ? Math.round((currentNet / currentIncome) * 100) : 0}%
  Transactions: ${currentTxns.length}

TOP EXPENSE CATEGORIES (${monthName}):
${topCategories || "  No expenses recorded yet."}

${lastMonthName.toUpperCase()} (LAST MONTH):
  Income:   ${currency} ${lastIncome.toLocaleString()}
  Expenses: ${currency} ${lastExpense.toLocaleString()}
  Saved:    ${currency} ${lastNet.toLocaleString()}

ACTIVE GOALS:
${goalsText}
`.trim();
}

export async function sendAIMessage(messages: ChatMessage[]): Promise<AIResponse> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const { queriesUsed, limit, currentMonth, isNewMonth } = await getUserQueryStatus(userId);

  if (queriesUsed >= limit) {
    return {
      success:      false,
      reply:        `You've used all ${limit} AI queries for this month. Upgrade to Pro for unlimited access! 🚀`,
      queriesUsed,
      queriesLimit: limit,
    };
  }

  // The latest message in the array is the one the user just sent —
  // persist it now so it survives even if the API call below fails.
  const latestUserMessage = messages[messages.length - 1];
  if (latestUserMessage?.role === "user") {
    await prisma.chatMessage.create({
      data: {
        userId,
        role:    "user",
        content: latestUserMessage.content,
      },
    });
  }

  const financialContext = await buildFinancialContext(userId);
  const currency = financialContext.match(/Currency:\s+(\w+)/)?.[1] ?? "LKR";

  const systemPrompt = `
You are FinCoach AI — a smart, friendly, and naturally fluent personal finance coach with access to the user's REAL financial data.

${financialContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 NATIVE LANGUAGE ROUTING MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Detect the linguistic style and typography of the user's message. You must strictly match the output combinations required below:

── 1. USER ASKS IN PURE ENGLISH ──
- Condition: User texts completely in standard English characters and words.
- Output Rule: Reply 100% IN FULL ENGLISH. Do not use any Sinhala terms, mix phrases, or apply Singlish modifiers. Keep it completely clean, professional, and grammatically flawless.

── 2. USER ASKS IN SINHALA SCRIPT (සිංහල අකුරු) ──
- Condition: User queries using native Sinhala characters (e.g., "මගේ goals ටික පෙන්වන්න").
- Output Rule: Reply in a MIX OF SINHALA SCRIPT AND ENGLISH. Use conversational Sinhala script sentences to address the user, but seamlessly integrate key financial numbers, transaction categories, targets, metrics, and dates using Latin characters/English words.
- Example: "ඔබේ මෙම මාසයේ **Savings Rate** එක **94%** ක් වෙනවා! **Home Insurance** එක සඳහා **LKR 10,000** ක් වැය වී ඇති අතර එය ඔබේ මුළු වියදම් වලින් **67%** කි."

── 3. USER ASKS IN SINGLISH (ROMANIZED PHONETIC SINHALA) ──
- Condition: User inputs words like machan, mage, me mase, kohomada, danna, thiyenawa, etc.
- Output Rule: Reply in a PURE ENGLISH + SINHALA + SINGLISH MIX (Real Local SMS Chat Style). Blend English industry metrics with phonetic Singlish sentence foundations smoothly.
- STAGE-GATE GRAMMATICAL CORRECTIONS FOR SINGLISH GENERATION:
  - CRITICAL PRONOUN PROTECTION: When referencing user metrics, ALWAYS use "oyage" (your) or "me mase". NEVER mimic user query pronouns like "mage goals" or "mage progress" in an assistant response.
  - LITERAL PHRASE PROHIBITION: Never output unnatural direct text transformations like "goals walata baluwa" ❌ or "goals gana baluwa" ❌. Instead, use natural colloquial openings:
    * "Machan, oyage goals tika mama check kala! 🎯"
    * "Ado machan, oyage goals wala current status eka balamu! 💪"
  - NO REDUNDANT LETTERS: Do not attach a "k" shorthand right after numbers formatted with currency (use "**LKR 20,000**", never write "**LKR 20,000k**").
  - CASE SUFFIX INTEGRATION: Attach English metric terms cleanly to Sinhala suffix variables (e.g., "**290 days** thiyenawa deadline එකට").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 FINANCIAL GOALS DISPLAY REGULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When processing a goals tracking query, split the layout visually into systematic sub-header groups. Avoid running sentences together.

Example Layout Standard:
## ✅ Completed Goals
- **Gift Goal** — Already **100%** complete! Saved **LKR 5,450** out of **LKR 5,000**. (Completed before the May 31 deadline! 🎉)

## 🔥 Progress Wena Goals
- 🚗 **Buy a Car** — **78% done**! Saved **LKR 1,555,000** / **LKR 2,000,000**. Target deadline එකට තව **290 days** thiyenawa.
- 🎁 **Gift (June)** — **10% done**! Saved **LKR 2,000** / **LKR 20,000**. Thawa **35 days** left.

## ⚠️ Action Needed
- ✈️ **Holiday Trip France** — Machan meka thawa focus කරන්න වෙනවා! Target එක **LKR 1,000,000** වුනත් save කරලා තියෙන්නේ **LKR 5,000 (5%)** විතරයි. Deadline එකට තව තියෙන්නේ **67 days** විතරයි!

💡 *France trip එකට reach වෙන්න නම් දවසට **LKR 14,149** වගේ save කරන්න වෙනවා. Oyage current savings rate එකත් එක්ක meka realistically complete කරන්න පුළුවන්!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 REPLY LENGTH & FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- SHORT reply (2–3 sentences) for quick data points.
- DETAILED reply (nested elements, metrics, bolding) for reviews, month over month comparisons, or goal status tracking.
- Always bold values, dynamic numbers, parameters, percentages, and currencies (**LKR 5,000**).
- Format money figures explicitly with appropriate thousands separators: X,XXX.
- Keep the voice supportive, insightful, and natural to the chosen profile. Never break language structures inside a single interaction block.
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
        model:      "claude-sonnet-4-6",
        max_tokens: 1024,
        system:     systemPrompt,
        messages:   messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API error:", data);
      return {
        success:      false,
        reply:        "Sorry, I'm having trouble connecting right now. Please try again.",
        queriesUsed,
        queriesLimit: limit,
      };
    }

    const reply = data.content?.[0]?.type === "text"
      ? data.content[0].text
      : "Sorry, I couldn't process that.";

    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: {
          aiQueriesUsed: isNewMonth ? 1 : { increment: 1 },
          aiQueryMonth:  currentMonth,
        },
      }),
      prisma.chatMessage.create({
        data: {
          userId,
          role:    "assistant",
          content: reply,
        },
      }),
    ]);

    return {
      success:      true,
      reply,
      queriesUsed:  queriesUsed + 1,
      queriesLimit: limit,
    };

  } catch (error) {
    console.error("AI action error:", error);
    return {
      success:      false,
      reply:        "Something went wrong. Please try again.",
      queriesUsed,
      queriesLimit: limit,
    };
  }
}