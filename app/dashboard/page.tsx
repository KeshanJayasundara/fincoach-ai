// page.tsx
"use client";

import { useEffect, useState } from "react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SpendingChart from "@/components/dashboard/SpendingChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import QuickAIInsights from "@/components/dashboard/QuickAIInsights";
import SpendingBreakdown from "@/components/dashboard/SpendingBreakdown";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#5B4FE8] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#8B87A8] mt-4">Loading your financial overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid - 3 columns */}
      <StatsGrid />

      {/* 2x2 Grid for Charts - matches original FinCoach layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income vs Expenses Chart */}
        <SpendingChart />
        
        {/* Spending Breakdown + Savings Rate */}
        <SpendingBreakdown />
      </div>

      {/* 2x2 Grid - Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <RecentTransactions />
        
        {/* Quick AI Insights */}
        <QuickAIInsights />
      </div>
    </div>
  );
}