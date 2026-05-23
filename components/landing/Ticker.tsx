export default function Ticker() {
  const items = [
    "32+ currencies supported",
    "AI personalized for your profession",
    "Multi-role financial tracking",
    "Bill scanning with AI extraction",
    "Monthly auto-reports to your inbox",
    "Smart goal tracking & projections",
  ];

  return (
    <div className="py-3 sm:py-4 border-y border-white/5 overflow-hidden bg-[#0A0818]">
      <div className="ticker-inner flex items-center gap-8 sm:gap-12 whitespace-nowrap" style={{ width: "max-content" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-[11px] sm:text-[12px] text-white/25 font-medium flex items-center gap-2 sm:gap-3">
            <span className="text-[#9B93F5] text-xs sm:text-sm">✦</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
}