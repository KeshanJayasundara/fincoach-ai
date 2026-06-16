// StatsGrid.tsx
"use client";

import { DashboardStats } from "@/actions/dashboard";

interface Props {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: Props) {
  const items = [
    {
      label:      "💰 Total Income",
      value:      `LKR ${stats.currentIncome.toLocaleString()}`,
      change:     `${stats.incomeChange >= 0 ? "+" : ""}${stats.incomeChange}% vs last month`,
      changeType: stats.incomeChange >= 0 ? "up" : "down",
      badge:      "All Roles",
    },
    {
      label:      "💳 Total Expenses",
      value:      `LKR ${stats.currentExpense.toLocaleString()}`,
      change:     `${stats.expenseChange >= 0 ? "+" : ""}${stats.expenseChange}% vs last month`,
      changeType: stats.expenseChange <= 0 ? "up" : "down",
      badge:      null,
    },
    {
      label:      "🏦 Net Savings",
      value:      `LKR ${stats.netSavings.toLocaleString()}`,
      change:     `Savings rate: ${stats.savingsRate}%`,
      changeType: stats.netSavings >= 0 ? "up" : "down",
      badge:      null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[12px] font-medium text-[#8B87A8]">{stat.label}</div>
            {stat.badge && (
              <span className="text-[10px] bg-[#EEF0FD] text-[#3C3489] px-2 py-0.5 rounded-full font-bold">
                {stat.badge}
              </span>
            )}
          </div>
          <div className="text-[22px] font-bold text-[#1A1635] tracking-[-0.5px] mb-1">
            {stat.value}
          </div>
          <div className={`text-[11px] font-semibold ${stat.changeType === "up" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {stat.changeType === "up" ? "↑" : "↓"} {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
}