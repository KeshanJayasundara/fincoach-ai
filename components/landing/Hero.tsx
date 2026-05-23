"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <section className="noise relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-5 overflow-hidden">
      <div className="hero-orb absolute top-[-10%] left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] md:w-[700px] h-[320px] sm:h-[500px] md:h-[700px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-[4%] sm:left-[8%] w-28 sm:w-48 h-28 sm:h-48 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ background: "rgba(91,79,232,0.1)" }}></div>
      <div className="absolute top-1/4 right-[3%] sm:right-[5%] w-20 sm:w-32 h-20 sm:h-32 rounded-full bg-[#9B93F5]/10 blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      {/* Square grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(91,79,232,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,79,232,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
        }}
      ></div>
      {/* Square grid dot accents at intersections */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(155,147,245,0.18) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%)",
        }}
      ></div>

      <div className="relative z-10 text-center max-w-[340px] xs:max-w-sm sm:max-w-xl md:max-w-3xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-[#5B4FE8]/15 border border-[#5B4FE8]/35 rounded-full px-3 sm:px-4 py-1.5 text-[11px] sm:text-[12px] text-[#9B93F5] font-semibold tracking-wide mb-5 sm:mb-7 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9B93F5] animate-pulse inline-block"></span>
          AI-Powered Finance Coach
        </div>

        <h1 className="font-display text-[38px] xs:text-[44px] sm:text-[56px] md:text-[68px] font-black leading-[1.08] tracking-[-2px] mb-4 sm:mb-5 animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          Your money,<br />
          <span style={{ background: "linear-gradient(135deg, #9B93F5 0%, #C7C3F8 50%, #7B72EC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            finally under<br />control
          </span>
        </h1>

        <p className="text-[14px] sm:text-[15px] md:text-[17px] text-white/48 leading-[1.75] max-w-[300px] sm:max-w-[420px] md:max-w-[500px] mx-auto mb-7 sm:mb-9 animate-fade-up font-light" style={{ animationDelay: "0.35s", opacity: 0 }}>
          Track spending, set goals, and get AI-powered advice tailored to your profession — for doctors, students, freelancers, and everyone in between.
        </p>

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap animate-fade-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
          <button
            onClick={() => router.push("/register")}
            className="btn-shimmer font-display text-[13px] sm:text-[14px] font-semibold text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl tracking-tight w-full xs:w-auto max-w-[260px]"
          >
            Start for free →
          </button>
          <button
            onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
            className="text-[13px] sm:text-[14px] text-white/65 font-semibold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl border border-white/12 bg-white/4 hover:bg-white/8 transition-all flex items-center justify-center gap-2 w-full xs:w-auto max-w-[260px]"
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">▶</span>
            See how it works
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-5 mt-6 sm:mt-8 text-[11px] sm:text-[12px] text-white/30 font-medium animate-fade-up flex-wrap" style={{ animationDelay: "0.65s", opacity: 0 }}>
          <span className="flex items-center gap-1.5"><span className="text-[#9B93F5]">✓</span> Free to start</span>
          <span className="w-1 h-1 rounded-full bg-white/15 hidden xs:block"></span>
          <span className="flex items-center gap-1.5"><span className="text-[#9B93F5]">✓</span> No credit card</span>
          <span className="w-1 h-1 rounded-full bg-white/15 hidden xs:block"></span>
          <span className="flex items-center gap-1.5"><span className="text-[#9B93F5]">✓</span> 32+ currencies</span>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="relative z-10 mt-10 sm:mt-14 w-full max-w-[340px] xs:max-w-sm sm:max-w-2xl md:max-w-4xl mx-auto animate-fade-up px-0" style={{ animationDelay: "0.75s", opacity: 0 }}>
        <div className="grad-border rounded-2xl p-2 sm:p-3 md:p-4 animate-float">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 px-1">
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-500/60"></div>
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-yellow-500/60"></div>
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-green-500/60"></div>
            <div className="flex-1 ml-2 sm:ml-3 h-4 sm:h-5 rounded-md bg-white/5 max-w-[140px] sm:max-w-[200px]"></div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2.5">
            <div className="mockup-card p-2 sm:p-3">
              <div className="text-[8px] sm:text-[10px] text-white/35 mb-1 sm:mb-1.5">Total Income</div>
              <div className="font-mono text-[11px] sm:text-[15px] text-[#9B93F5] font-medium">LKR 185,000</div>
              <div className="text-[7px] sm:text-[9px] text-green-400 mt-0.5 sm:mt-1">↑ 8.3% vs last month</div>
            </div>
            <div className="mockup-card p-2 sm:p-3">
              <div className="text-[8px] sm:text-[10px] text-white/35 mb-1 sm:mb-1.5">Expenses</div>
              <div className="font-mono text-[11px] sm:text-[15px] text-white font-medium">LKR 92,400</div>
              <div className="text-[7px] sm:text-[9px] text-red-400 mt-0.5 sm:mt-1">↑ 12.1% vs last month</div>
            </div>
            <div className="mockup-card p-2 sm:p-3">
              <div className="text-[8px] sm:text-[10px] text-white/35 mb-1 sm:mb-1.5">Net Savings</div>
              <div className="font-mono text-[11px] sm:text-[15px] text-green-400 font-medium">LKR 92,600</div>
              <div className="text-[7px] sm:text-[9px] text-white/40 mt-0.5 sm:mt-1">50.1% savings rate</div>
            </div>
          </div>

          {/* Chart + AI row */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
            <div className="col-span-3 mockup-card p-2 sm:p-3">
              <div className="text-[8px] sm:text-[10px] text-white/35 mb-1.5 sm:mb-2">Income vs Expenses</div>
              <div className="flex items-end gap-1 sm:gap-1.5" style={{ height: "32px" }}>
                {[
                  { inc: 23, exp: 16 },
                  { inc: 27, exp: 20 },
                  { inc: 25, exp: 17 },
                  { inc: 32, exp: 22 },
                  { inc: 44, exp: 28, active: true },
                ].map((bar, i) => (
                  <div key={i} className="flex gap-0.5 items-end" style={{ flex: 1 }}>
                    <div style={{ width: "50%", height: `${bar.inc * 0.72}px`, background: bar.active ? "rgba(91,79,232,0.7)" : "rgba(91,79,232,0.5)", borderRadius: "2px 2px 0 0", ...(bar.active ? { outline: "1px solid #5B4FE8" } : {}) }}></div>
                    <div style={{ width: "50%", height: `${bar.exp * 0.72}px`, background: bar.active ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.4)", borderRadius: "2px 2px 0 0" }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[7px] sm:text-[8px] text-white/20 font-mono">Nov</span>
                <span className="text-[7px] sm:text-[8px] text-white/20 font-mono">Dec</span>
                <span className="text-[7px] sm:text-[8px] text-white/20 font-mono">Jan</span>
                <span className="text-[7px] sm:text-[8px] text-white/20 font-mono">Feb</span>
                <span className="text-[7px] sm:text-[8px] text-[#9B93F5] font-mono">Apr●</span>
              </div>
            </div>
            <div className="col-span-2 mockup-card p-2 sm:p-3">
              <div className="text-[8px] sm:text-[10px] text-white/35 mb-1.5 sm:mb-2">AI Coach</div>
              <div className="text-[8px] sm:text-[9px] text-white/60 leading-relaxed bg-[#5B4FE8]/10 rounded-lg p-1.5 sm:p-2 border border-[#5B4FE8]/15">
                💡 Dining jumped <span className="text-[#9B93F5] font-semibold">68%</span> this month. Cut by 30% to save <span className="text-green-400">LKR 4,200</span>/mo!
              </div>
              <div className="mt-1.5 sm:mt-2 flex flex-col gap-1">
                <div className="h-1 sm:h-1.5 rounded-full bg-white/5 w-full overflow-hidden"><div className="h-full rounded-full" style={{ width: "53%", background: "linear-gradient(to right, #5B4FE8, #9B93F5)" }}></div></div>
                <div className="h-1 sm:h-1.5 rounded-full bg-white/5 w-full overflow-hidden"><div className="h-full rounded-full bg-green-500/60" style={{ width: "24%" }}></div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#5B4FE8]/20 blur-3xl rounded-full pointer-events-none"></div>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="scroll-dot w-1 h-1 rounded-full bg-white/60"></div>
        </div>
      </div>
    </section>
  );
}