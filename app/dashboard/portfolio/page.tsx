// page.tsx
"use client";

export default function PortfolioPage() {
  const assets = [
    { name: "Bitcoin", type: "Crypto · 0.0015 BTC", value: 142000, change: 14.2, icon: "₿", bg: "#FEF3C7", textColor: "text-amber-600" },
    { name: "S&P 500 ETF", type: "Stock · 5 units", value: 185000, change: 8.3, icon: "📈", bg: "#DBEAFE", textColor: "text-blue-600" },
    { name: "Fixed Deposit", type: "Bank · 12 months", value: 50000, change: 9.0, icon: "🏦", bg: "#DCFCE7", textColor: "text-green-600" },
    { name: "Ethereum", type: "Crypto · 0.08 ETH", value: 28500, change: -3.1, icon: "Ξ", bg: "#FEE2E2", textColor: "text-red-500" },
    { name: "Gold (digital)", type: "Commodity · 2g", value: 23000, change: 4.5, icon: "💎", bg: "#F3E8FF", textColor: "text-purple-600" },
  ];

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalPL = 28500;
  const totalPLPercent = 7.12;

  const categories = [
    { name: "Stocks / ETF", percent: 43, color: "#3B82F6" },
    { name: "Crypto", percent: 40, color: "#F59E0B" },
    { name: "Fixed Deposit", percent: 12, color: "#22C55E" },
    { name: "Commodity", percent: 5, color: "#EC4899" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Total value</div>
          <div className="text-[18px] font-bold text-[#1A1635]">LKR {totalValue.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-[#16A34A]">↑ LKR 12,400 this month</div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Total P&amp;L</div>
          <div className="text-[18px] font-bold text-[#16A34A]">+LKR {totalPL.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-[#16A34A]">+{totalPLPercent}% overall</div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Assets held</div>
          <div className="text-[18px] font-bold text-[#1A1635]">{assets.length}</div>
          <div className="text-[11px] font-semibold text-[#8B87A8]">2 categories</div>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Holdings Card */}
        <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#EAE8FB]">
            <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px]">Holdings</div>
            <span className="inline-flex items-center px-2 py-0.5 bg-[#EEF0FD] text-[#3C3489] text-[11px] font-semibold rounded-full">
              {assets.length} assets
            </span>
          </div>
          <div className="divide-y divide-[#EAE8FB]">
            {assets.map((asset, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: asset.bg }}
                >
                  <span className={asset.textColor}>{asset.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1A1635]">{asset.name}</div>
                  <div className="text-[11px] text-[#8B87A8]">{asset.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#1A1635] font-mono">LKR {asset.value.toLocaleString()}</div>
                  <div className={`text-[11px] font-semibold ${asset.change > 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                    {asset.change > 0 ? "+" : ""}{asset.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Breakdown Card */}
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px] mb-4">Portfolio breakdown</div>
          
          {/* Category Rows */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: cat.color }}
                />
                <div className="text-[12px] text-[#4A4568] flex-1">{cat.name}</div>
                <div className="flex-1 h-1 bg-[#EAE8FB] rounded-full overflow-hidden">
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

          {/* AI Advice Box */}
          <div className="bg-gradient-to-r from-[#EEF0FD] to-[#F0F7FF] border border-[#C7C3F8] rounded-lg px-3 py-2.5 mt-4 text-[12px] text-[#4A4568] leading-relaxed">
            <strong className="text-[#5B4FE8]">💡 AI says:</strong> Your crypto (40%) is higher than recommended for your income profile. Consider rebalancing to 20-25% for lower risk.
          </div>
        </div>
      </div>
    </div>
  );
}