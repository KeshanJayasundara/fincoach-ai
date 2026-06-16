// SpendingBreakdown.tsx
"use client";

import { CategoryData, DashboardStats } from "@/actions/dashboard";

interface Props {
  categories: CategoryData[];
  stats: DashboardStats;
}

const CATEGORY_COLORS = ["#5B4FE8", "#22C55E", "#F59E0B", "#3B82F6", "#EC4899"];

export default function SpendingBreakdown({ categories, stats }: Props) {
  const savingsRate   = stats.savingsRate;
  const totalExpenses = stats.currentExpense;
  const totalSavings  = stats.netSavings;

  const categoriesWithColor = categories.map((cat, idx) => ({
    ...cat,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  return (
    <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px]">Spending breakdown</div>
        <div className="bg-[#DCFCE7] rounded-full px-2.5 py-1 text-[11px] font-bold text-[#14532D]">
          {savingsRate}% saved
        </div>
      </div>

      {/* Expense vs Savings Combined Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-[#8B87A8] mb-1.5 font-medium">
          <span>Expenses LKR {totalExpenses.toLocaleString()}</span>
          <span>Savings LKR {totalSavings.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[#FEE2E2] relative">
          <div
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-[#22C55E] to-[#4ADE80] rounded-l-full"
            style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1.5">
          <span className="text-[#DC2626] font-semibold">▓ {Math.round(100 - savingsRate)}% expenses</span>
          <span className="text-[#16A34A] font-semibold">{savingsRate}% savings ▓</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        {categoriesWithColor.length > 0 ? (
          categoriesWithColor.map((cat) => (
            <div key={cat.name} className="flex items-center gap-2 py-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <div className="text-[12px] text-[#4A4568] flex-1 min-w-0">{cat.name}</div>
              <div className="flex-1 h-1 bg-[#EAE8FB] rounded-full overflow-hidden min-w-[60px]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${cat.percent}%`, background: cat.color }}
                />
              </div>
              <div className="text-[12px] font-semibold text-[#1A1635] font-mono w-10 text-right">
                {cat.percent}%
              </div>
            </div>
          ))
        ) : (
          <div className="text-[12px] text-[#8B87A8] text-center py-4">No expenses this month</div>
        )}
      </div>
    </div>
  );
}