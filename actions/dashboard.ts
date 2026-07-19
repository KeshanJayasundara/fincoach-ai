"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/enums";

export type DashboardStats = {
  currentIncome: number;
  currentExpense: number;
  netSavings: number;
  savingsRate: number;
  incomeChange: number;
  expenseChange: number;
};

export type CategoryData = {
  name: string;
  amount: number;
  percent: number;
};

export type ChartData = {
  month: string;
  income: number;
  expense: number;
};

export type RecentTransaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
};

export type DashboardData = {
  stats: DashboardStats;
  categories: CategoryData[];
  chart: ChartData[];
  recentTransactions: RecentTransaction[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const lastStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd      = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [currentTxns, lastTxns, allTxns, recentTxns] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: currentStart, lte: currentEnd } },
      select: { type: true, amountBase: true, category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: lastStart, lte: lastEnd } },
      select: { type: true, amountBase: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      select: { type: true, amountBase: true, date: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        amountBase: true,
        category: true,
        description: true,
        date: true,
      },
    }),
  ]);

  // ── Stats ──
  const currentIncome  = currentTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amountBase, 0);
  const currentExpense = currentTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);
  const lastIncome     = lastTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amountBase, 0);
  const lastExpense    = lastTxns.filter(t => t.type === TransactionType.Expense).reduce((s, t) => s + t.amountBase, 0);

  const netSavings    = currentIncome - currentExpense;
  const savingsRate   = currentIncome > 0 ? Math.round((netSavings / currentIncome) * 100 * 10) / 10 : 0;
  const incomeChange  = lastIncome  > 0 ? Math.round(((currentIncome  - lastIncome)  / lastIncome)  * 1000) / 10 : 0;
  const expenseChange = lastExpense > 0 ? Math.round(((currentExpense - lastExpense) / lastExpense) * 1000) / 10 : 0;

  // ── Spending categories ──
  const categoryMap: Record<string, number> = {};
  currentTxns
    .filter(t => t.type === TransactionType.Expense)
    .forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amountBase;
    });

  const categories: CategoryData[] = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: currentExpense > 0 ? Math.round((amount / currentExpense) * 100) : 0,
    }));

  // ── Chart: last 6 months ──
  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short" });
    monthlyMap[key] = { income: 0, expense: 0 };
  }
  allTxns.forEach(t => {
    const key = new Date(t.date).toLocaleString("default", { month: "short" });
    if (!monthlyMap[key]) return;
    if (t.type === TransactionType.Income)  monthlyMap[key].income  += t.amountBase;
    if (t.type === TransactionType.Expense) monthlyMap[key].expense += t.amountBase;
  });

  const chart: ChartData[] = Object.entries(monthlyMap).map(([month, v]) => ({
    month,
    income:  v.income,
    expense: v.expense,
  }));

  // ── Recent transactions ──
  const recentTransactions: RecentTransaction[] = recentTxns.map(t => ({
    id:       t.id,
    name:     t.description || t.category,
    category: t.category,
    date:     new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    amount:   t.amountBase,
    type:     t.type === TransactionType.Income ? "income" : "expense",
  }));

  return { stats: { currentIncome, currentExpense, netSavings, savingsRate, incomeChange, expenseChange }, categories, chart, recentTransactions };
}