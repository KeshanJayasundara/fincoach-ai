// StatsGrid.tsx
"use client";

import { DashboardStats } from "@/actions/dashboard";
import { Wallet, CreditCard, PiggyBank, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface Props {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: Props) {
  const items: {
    icon: LucideIcon;
    label: string;
    value: string;
    change: string;
    changeType: "up" | "down";
    badge: string | null;
    bg: string;
    border: string;
    iconColor: string;
  }[] = [
    {
      icon:       Wallet,
      label:      "Total Income",
      value:      `LKR ${stats.currentIncome.toLocaleString()}`,
      change:     `${stats.incomeChange >= 0 ? "+" : ""}${stats.incomeChange}% vs last month`,
      changeType: stats.incomeChange >= 0 ? "up" : "down",
      badge:      "All Roles",
      bg:         "#EFF6FF",
      border:     "#BFDBFE",
      iconColor:  "#2563EB",
    },
    {
      icon:       CreditCard,
      label:      "Total Expenses",
      value:      `LKR ${stats.currentExpense.toLocaleString()}`,
      change:     `${stats.expenseChange >= 0 ? "+" : ""}${stats.expenseChange}% vs last month`,
      changeType: stats.expenseChange <= 0 ? "up" : "down",
      badge:      null,
      bg:         "#FEF2F2",
      border:     "#FECACA",
      iconColor:  "#DC2626",
    },
    {
      icon:       PiggyBank,
      label:      "Net Savings",
      value:      `LKR ${stats.netSavings.toLocaleString()}`,
      change:     `Savings rate: ${stats.savingsRate}%`,
      changeType: stats.netSavings >= 0 ? "up" : "down",
      badge:      null,
      bg:         "#F0FDF4",
      border:     "#BBF7D0",
      iconColor:  "#16A34A",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((stat, idx) => {
        const Icon = stat.icon;
        const TrendIcon = stat.changeType === "up" ? TrendingUp : TrendingDown;
        return (
          <div
            key={idx}
            className="border rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]"
            style={{ background: stat.bg, borderColor: stat.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: stat.iconColor }} strokeWidth={2.25} />
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
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${stat.changeType === "up" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
              <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
              {stat.change}
            </div>
          </div>
        );
      })}
    </div>
  );
}