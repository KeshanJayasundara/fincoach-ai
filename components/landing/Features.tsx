import { Bot, Users, Globe, LayoutDashboard, Mail, ScanLine, type LucideIcon } from "lucide-react";

export default function Features() {
  const features: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: Bot, title: "AI Finance Coach", desc: "Ask anything about your money. Get personalized answers based on your actual spending data and profession." },
    { icon: Users, title: "Multi-Role Support", desc: "Doctor by day, freelancer by night? Track finances with intelligent role-tagging across all your income sources." },
    { icon: Globe, title: "Multi-Currency", desc: "LKR, USD, EUR, GBP and 28 more. All amounts auto-converted to your base currency in real time." },
    { icon: LayoutDashboard, title: "Smart Dashboard", desc: "Visual spending breakdowns, trend charts, and goal progress — all filterable by role or time period." },
    { icon: Mail, title: "Monthly Reports", desc: "One combined report auto-sent on the last day of every month. Request on-demand anytime for any past month." },
    { icon: ScanLine, title: "Bill Scanning", desc: "Scan a bill image and AI extracts amount, category, and date automatically. Zero manual entry needed." },
  ];

  return (
    <section id="features" className="py-14 sm:py-20 px-4 sm:px-5 bg-gradient-to-b from-transparent to-[#0F0D22]">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10 sm:mb-14 reveal">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] text-[#9B93F5] font-semibold tracking-widest uppercase mb-4 bg-[#5B4FE8]/10 border border-[#5B4FE8]/25 rounded-full px-3 sm:px-4 py-1.5">Features</div>
          <h2 className="font-display text-[30px] sm:text-[38px] md:text-[44px] font-black tracking-[-1.5px] leading-tight mb-3 sm:mb-4 px-2">
            Everything you need to<br />
            <span style={{ background: "linear-gradient(135deg, #9B93F5, #C7C3F8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              master your finances
            </span>
          </h2>
          <p className="text-[13px] sm:text-[15px] text-white/40 max-w-xs sm:max-w-md mx-auto font-light leading-relaxed px-2">
            Built for real people with complex lives — multiple incomes, multiple currencies, multiple goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 reveal">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glow-card p-5 sm:p-6 rounded-2xl bg-white/3 border border-white/7 transition-all duration-300 hover:bg-white/5 group">
              <div className="feat-icon w-10 sm:w-11 h-10 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#9B93F5]" strokeWidth={2} />
              </div>
              <h3 className="font-display text-[14px] sm:text-[15px] font-bold mb-1.5 sm:mb-2 tracking-tight">{title}</h3>
              <p className="text-[12px] sm:text-[13px] text-white/45 leading-relaxed font-light">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}