// page.tsx
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getAssets } from "@/actions/portfolio";
import type { Asset } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faChartLine,
  faBuildingColumns,
  faGem,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// ── category → icon/color mapping (display only, not stored in DB) ──
const CATEGORY_STYLE: Record<string, { icon: IconDefinition; bg: string; textColor: string; barColor: string }> = {
  "Crypto":                { icon: faCoins,          bg: "#FEF3C7", textColor: "text-amber-600",  barColor: "#F59E0B" },
  "Stock / ETF":            { icon: faChartLine,       bg: "#DBEAFE", textColor: "text-blue-600",   barColor: "#3B82F6" },
  "Bank / Fixed Deposit":    { icon: faBuildingColumns, bg: "#DCFCE7", textColor: "text-green-600",  barColor: "#22C55E" },
  "Commodity":               { icon: faGem,             bg: "#F3E8FF", textColor: "text-purple-600", barColor: "#EC4899" },
  "Other":                   { icon: faBoxArchive,      bg: "#F1F5F9", textColor: "text-slate-600",  barColor: "#64748B" },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLE[category] || CATEGORY_STYLE["Other"];
}

interface DisplayAsset {
  id: string;
  name: string;
  type: string;
  value: number;
  change: number;
  icon: IconDefinition;
  bg: string;
  textColor: string;
}

export default async function PortfolioPage() {
  const session = await auth();

  const currency = session?.user?.id
    ? (await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferredCurrency: true },
      }))?.preferredCurrency || "USD"
    : "USD";

  const rawAssets: Asset[] = await getAssets();

  // ── derive display fields (change %, icon/color) from real DB rows ──
  const assets: DisplayAsset[] = rawAssets.map((a) => {
    const style = getCategoryStyle(a.category);
    const change = a.costBasis > 0 ? ((a.value - a.costBasis) / a.costBasis) * 100 : 0;
    return {
      id: a.id,
      name: a.name,
      type: `${a.category}${a.units ? " · " + a.units : ""}`,
      value: a.value,
      change: Math.round(change * 10) / 10,
      icon: style.icon,
      bg: style.bg,
      textColor: style.textColor,
    };
  });

  const totalValue: number = assets.reduce((sum: number, asset: DisplayAsset) => sum + asset.value, 0);
  const totalCost: number = rawAssets.reduce((sum: number, a: Asset) => sum + a.costBasis, 0);
  const totalPL: number = totalValue - totalCost;
  const totalPLPercent: number = totalCost > 0 ? Math.round((totalPL / totalCost) * 1000) / 10 : 0;

  // ── category breakdown, computed from real data ──
  const categoryTotals: Record<string, number> = rawAssets.reduce(
    (acc: Record<string, number>, a: Asset) => {
      acc[a.category] = (acc[a.category] || 0) + a.value;
      return acc;
    },
    {} as Record<string, number>
  );

  const categories = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    percent: totalValue > 0 ? Math.round((value / totalValue) * 1000) / 10 : 0,
    color: getCategoryStyle(name).barColor,
  }));

  // simple rebalancing nudge: flag any category over 35% of the portfolio
  const overweight = categories.find((c) => c.percent > 35);

  return (
    <div className="space-y-4">
      {/* Stats Grid - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Total value</div>
          <div className="text-[18px] font-bold text-[#1A1635]">{currency} {totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Total P&amp;L</div>
          <div className={`text-[18px] font-bold ${totalPL >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {totalPL >= 0 ? "+" : ""}{currency} {totalPL.toLocaleString()}
          </div>
          <div className={`text-[11px] font-semibold ${totalPL >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {totalPL >= 0 ? "+" : ""}{totalPLPercent}% overall
          </div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Assets held</div>
          <div className="text-[18px] font-bold text-[#1A1635]">{assets.length}</div>
          <div className="text-[11px] font-semibold text-[#8B87A8]">{categories.length} categories</div>
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

          {assets.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-[#8B87A8]">
              No assets yet — click "Add Asset" up top to get started.
            </div>
          ) : (
            <div className="divide-y divide-[#EAE8FB]">
              {assets.map((asset: DisplayAsset) => (
                <div key={asset.id} className="flex items-center gap-2.5 p-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: asset.bg }}
                  >
                    <FontAwesomeIcon icon={asset.icon} className={asset.textColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#1A1635]">{asset.name}</div>
                    <div className="text-[11px] text-[#8B87A8]">{asset.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-[#1A1635] font-mono">
                      {currency} {asset.value.toLocaleString()}
                    </div>
                    <div className={`text-[11px] font-semibold ${asset.change > 0 ? "text-[#16A34A]" : asset.change < 0 ? "text-[#DC2626]" : "text-[#8B87A8]"}`}>
                      {asset.change > 0 ? "+" : ""}{asset.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Breakdown Card */}
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px] mb-4">Portfolio breakdown</div>

          {categories.length === 0 ? (
            <div className="text-[12px] text-[#8B87A8] text-center py-6">No data yet.</div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <div className="text-[12px] text-[#4A4568] flex-1">{cat.name}</div>
                  <div className="flex-1 h-1 bg-[#EAE8FB] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.percent}%`, background: cat.color }} />
                  </div>
                  <div className="text-[12px] font-semibold text-[#1A1635] font-mono w-10 text-right">
                    {cat.percent}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Advice Box - only shows when something is actually overweight */}
          {overweight && (
            <div className="bg-gradient-to-r from-[#EEF0FD] to-[#F0F7FF] border border-[#C7C3F8] rounded-lg px-3 py-2.5 mt-4 text-[12px] text-[#4A4568] leading-relaxed">
              <strong className="text-[#5B4FE8]">
                <FontAwesomeIcon icon={faGem} className="mr-1" />
                AI says:
              </strong>{" "}
              Your {overweight.name} ({overweight.percent}%) is higher than recommended for a balanced portfolio. Consider rebalancing to 20-25% for lower risk.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}