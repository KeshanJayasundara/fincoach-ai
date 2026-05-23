// SpendingBreakdown.tsx
"use client";

export default function SpendingBreakdown() {
  const categories = [
    { name: "Food & Grocery", percent: 40, color: "#5B4FE8" },
    { name: "Transport", percent: 18, color: "#22C55E" },
    { name: "Dining Out", percent: 15, color: "#F59E0B" },
    { name: "Utilities", percent: 14, color: "#3B82F6" },
    { name: "Other", percent: 13, color: "#EC4899" },
  ];

  const totalExpenses = 92400;
  const totalSavings = 92600;
  const savingsRate = 50.1;

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
            style={{ width: `${savingsRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1.5">
          <span className="text-[#DC2626] font-semibold">▓ {100 - savingsRate}% expenses</span>
          <span className="text-[#16A34A] font-semibold">{savingsRate}% savings ▓</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        {categories.map((cat) => (
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
        ))}
      </div>
    </div>
  );
}