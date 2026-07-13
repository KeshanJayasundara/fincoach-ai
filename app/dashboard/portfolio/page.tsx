"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getAssets } from "@/actions/portfolio";

interface Asset {
  id: string;
  name: string;
  category: string;
  units: string | null;
  value: number;
  costBasis: number;
  currency: string;
}

// Visual style per category — keeps icons/colors consistent across the app
// without needing to store them in the database.
const CATEGORY_STYLE: Record<
  string,
  { icon: string; bg: string; textColor: string; chartColor: string }
> = {
  "Crypto":                 { icon: "₿",  bg: "#FEF3C7", textColor: "text-amber-600",  chartColor: "#F59E0B" },
  "Stock / ETF":             { icon: "📈", bg: "#DBEAFE", textColor: "text-blue-600",   chartColor: "#3B82F6" },
  "Bank / Fixed Deposit":    { icon: "🏦", bg: "#DCFCE7", textColor: "text-green-600",  chartColor: "#22C55E" },
  "Commodity":               { icon: "💎", bg: "#F3E8FF", textColor: "text-purple-600", chartColor: "#EC4899" },
  "Other":                   { icon: "📦", bg: "#F1F5F9", textColor: "text-slate-600",  chartColor: "#64748B" },
};

const FALLBACK_STYLE = CATEGORY_STYLE["Other"];

export default function PortfolioPage() {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "USD";

  const [assets, setAssets]   = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const loadAssets = useCallback(async () => {
    try {
      setError("");
      const data = await getAssets();
      setAssets(data as Asset[]);
    } catch {
      setError("Couldn't load your portfolio. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Refetch whenever a new asset is added from the topbar's Add Asset modal.
  useEffect(() => {
    const handler = () => loadAssets();
    window.addEventListener("fincoach:asset-added", handler);
    return () => window.removeEventListener("fincoach:asset-added", handler);
  }, [loadAssets]);

  // ── Derived stats ──
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  const totalPL = assets.reduce(
    (sum, a) => sum + (a.value - a.costBasis),
    0
  );
  const totalCostBasis = assets.reduce((sum, a) => sum + a.costBasis, 0);
  const totalPLPercent = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0;

  const categoryTotals = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.value;
    return acc;
  }, {});

  const categories = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      percent: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      color: (CATEGORY_STYLE[name] || FALLBACK_STYLE).chartColor,
    }))
    .sort((a, b) => b.value - a.value);

  const distinctCategoryCount = categories.length;

  // Simple, rule-based advice — flags any category over 30% of the portfolio.
  const heaviestCategory = categories[0];
  const aiAdvice =
    heaviestCategory && heaviestCategory.percent > 30
      ? `Your ${heaviestCategory.name.toLowerCase()} (${heaviestCategory.percent}%) is higher than recommended for a balanced portfolio. Consider rebalancing to 20-25% for lower risk.`
      : "Your portfolio looks reasonably balanced across categories. Keep monitoring as values change.";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#EAE8FB] rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#EAE8FB] rounded-xl p-6 text-center text-[13px] text-[#8B87A8]">
        {error}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white border border-[#EAE8FB] rounded-xl p-10 text-center">
        <div className="text-[14px] font-semibold text-[#1A1635] mb-1">No assets yet</div>
        <div className="text-[12px] text-[#8B87A8]">
          Use the "Add Asset" button above to add your first holding.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Total value</div>
          <div className="text-[18px] font-bold text-[#1A1635]">{currency} {totalValue.toLocaleString()}</div>
          <div className={`text-[11px] font-semibold ${totalPL >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {totalPL >= 0 ? "↑" : "↓"} {currency} {Math.abs(totalPL).toLocaleString()} overall
          </div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Total P&amp;L</div>
          <div className={`text-[18px] font-bold ${totalPL >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {totalPL >= 0 ? "+" : "-"}{currency} {Math.abs(totalPL).toLocaleString()}
          </div>
          <div className={`text-[11px] font-semibold ${totalPL >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {totalPL >= 0 ? "+" : ""}{totalPLPercent.toFixed(2)}% overall
          </div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Assets held</div>
          <div className="text-[18px] font-bold text-[#1A1635]">{assets.length}</div>
          <div className="text-[11px] font-semibold text-[#8B87A8]">
            {distinctCategoryCount} {distinctCategoryCount === 1 ? "category" : "categories"}
          </div>
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
            {assets.map((asset) => {
              const style = CATEGORY_STYLE[asset.category] || FALLBACK_STYLE;
              const prev = asset.costBasis;
              const change = prev > 0 ? ((asset.value - prev) / prev) * 100 : 0;

              return (
                <div key={asset.id} className="flex items-center gap-2.5 p-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: style.bg }}
                  >
                    <span className={style.textColor}>{style.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#1A1635]">{asset.name}</div>
                    <div className="text-[11px] text-[#8B87A8]">
                      {asset.category}{asset.units ? ` · ${asset.units}` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-[#1A1635] font-mono">
                      {currency} {asset.value.toLocaleString()}
                    </div>
                    <div className={`text-[11px] font-semibold ${change >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                      {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
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
            <strong className="text-[#5B4FE8]">💡 AI says:</strong> {aiAdvice}
          </div>
        </div>
      </div>
    </div>
  );
}