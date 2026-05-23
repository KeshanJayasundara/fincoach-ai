export default function Pricing() {
  return (
    <section id="pricing" className="py-14 sm:py-20 px-4 sm:px-5 bg-gradient-to-b from-[#0F0D22] to-[#0D0B1A]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 reveal">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] text-[#9B93F5] font-semibold tracking-widest uppercase mb-4 bg-[#5B4FE8]/10 border border-[#5B4FE8]/25 rounded-full px-3 sm:px-4 py-1.5">Pricing</div>
          <h2 className="font-display text-[30px] sm:text-[38px] md:text-[44px] font-black tracking-[-1.5px] leading-tight mb-2 sm:mb-3">Simple, honest pricing</h2>
          <p className="text-[13px] sm:text-[14px] text-white/35 font-light">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 reveal">
          {/* Free */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white/4 border border-white/8 hover:border-white/14 transition-all">
            <div className="font-display text-[15px] font-bold mb-1 tracking-tight">Free</div>
            <div className="flex items-end gap-1 my-4 sm:my-5">
              <span className="font-display text-[38px] sm:text-[42px] font-black tracking-[-2px] leading-none">$0</span>
              <span className="text-[13px] text-white/35 mb-2">/month</span>
            </div>
            <div className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8">
              {["Manual transactions", "Basic dashboard", "10 AI queries / month", "1 report / day on-demand"].map(f => (
                <div key={f} className="flex items-center gap-2 sm:gap-2.5 text-[12px] sm:text-[13px] text-white/55">
                  <span className="w-4 h-4 rounded-full bg-[#5B4FE8]/25 flex items-center justify-center text-[9px] text-[#9B93F5] flex-shrink-0">✓</span>{f}
                </div>
              ))}
              {["Multi-role support", "Bill scanning"].map(f => (
                <div key={f} className="flex items-center gap-2 sm:gap-2.5 text-[12px] sm:text-[13px] text-white/20">
                  <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[9px] text-white/20 flex-shrink-0">✗</span>{f}
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-xl border border-white/15 text-[13px] font-semibold text-white/70 hover:bg-white/6 hover:text-white hover:border-white/25 transition-all">
              Get started free
            </button>
          </div>

          {/* Pro */}
          <div className="price-pop p-6 sm:p-7 rounded-2xl relative mt-4 sm:mt-0">
            <div className="absolute -top-3 left-5 sm:left-6 bg-gradient-to-r from-[#5B4FE8] to-[#9B93F5] text-white text-[10px] font-display font-bold tracking-widest uppercase px-3 py-1 rounded-full">Most Popular</div>
            <div className="font-display text-[15px] font-bold mb-1 tracking-tight">Pro</div>
            <div className="flex items-end gap-1 my-4 sm:my-5">
              <span className="font-display text-[38px] sm:text-[42px] font-black tracking-[-2px] leading-none">$9</span>
              <span className="text-[13px] text-white/35 mb-2">/month</span>
            </div>
            <div className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8">
              {["Everything in Free", "Unlimited AI chat", "Multi-role support", "Bill scanning", "3 reports / day on-demand", "Priority email support"].map(f => (
                <div key={f} className="flex items-center gap-2 sm:gap-2.5 text-[12px] sm:text-[13px] text-white/70">
                  <span className="w-4 h-4 rounded-full bg-[#5B4FE8]/40 flex items-center justify-center text-[9px] text-[#9B93F5] flex-shrink-0">✓</span>{f}
                </div>
              ))}
            </div>
            <button className="btn-shimmer w-full py-3 rounded-xl text-[13px] font-display font-bold text-white tracking-tight">Start Pro →</button>
          </div>
        </div>
      </div>
    </section>
  );
}