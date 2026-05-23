// SpendingChart.tsx
"use client";

export default function SpendingChart() {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const incomes = [52, 60, 55, 70, 62, 90];
  const expenses = [34, 42, 38, 48, 44, 58];

  const maxHeight = 90;

  return (
    <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px]">Income vs Expenses</div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8B87A8]">
            <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-b from-[#5B4FE8] to-[#9B93F5]"></div>
            Income
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#8B87A8]">
            <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-b from-[#EF4444] to-[#FCA5A5]"></div>
            Expense
          </div>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="flex items-end gap-2 h-[110px] pb-2">
        {months.map((month, idx) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 h-[90px] w-full justify-center">
              <div
                className="w-[40%] rounded-t-sm bg-gradient-to-b from-[#5B4FE8] to-[#9B93F5]"
                style={{ height: `${(incomes[idx] / maxHeight) * 90}px` }}
              />
              <div
                className="w-[40%] rounded-t-sm bg-gradient-to-b from-[#EF4444] to-[#FCA5A5]"
                style={{ height: `${(expenses[idx] / maxHeight) * 90}px` }}
              />
            </div>
            <div className="text-[9px] text-[#C4C1DC] font-mono">{month}</div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-[#EAE8FB]">
        <div className="flex-1 text-center bg-[#EEF0FD] rounded-lg py-2">
          <div className="text-[10px] font-semibold text-[#3C3489]">Income</div>
          <div className="text-[14px] font-bold text-[#3C3489] font-mono">185K</div>
        </div>
        <div className="flex-1 text-center bg-[#FEE2E2] rounded-lg py-2">
          <div className="text-[10px] font-semibold text-[#7F1D1D]">Expenses</div>
          <div className="text-[14px] font-bold text-[#7F1D1D] font-mono">92.4K</div>
        </div>
        <div className="flex-1 text-center bg-[#DCFCE7] rounded-lg py-2">
          <div className="text-[10px] font-semibold text-[#14532D]">Saved</div>
          <div className="text-[14px] font-bold text-[#14532D] font-mono">92.6K</div>
        </div>
      </div>
    </div>
  );
}