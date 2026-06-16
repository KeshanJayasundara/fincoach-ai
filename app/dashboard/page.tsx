// app/dashboard/page.tsx
import { getDashboardData } from "@/actions/dashboard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SpendingChart from "@/components/dashboard/SpendingChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import QuickAIInsights from "@/components/dashboard/QuickAIInsights";
import SpendingBreakdown from "@/components/dashboard/SpendingBreakdown";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-4">
      {/* Stats Grid - 3 columns */}
      <StatsGrid stats={data.stats} />

      {/* 2x2 Grid for Charts - matches original FinCoach layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income vs Expenses Chart */}
        <SpendingChart chart={data.chart} stats={data.stats} />

        {/* Spending Breakdown + Savings Rate */}
        <SpendingBreakdown categories={data.categories} stats={data.stats} />
      </div>

      {/* 2x2 Grid - Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <RecentTransactions transactions={data.recentTransactions} />

        {/* Quick AI Insights */}
        <QuickAIInsights />
      </div>
    </div>
  );
}