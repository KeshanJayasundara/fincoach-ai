export default function HowItWorks() {
  return (
    <section id="how" className="py-14 sm:py-20 px-4 sm:px-5 bg-[#0F0D22]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-14 reveal">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] text-[#9B93F5] font-semibold tracking-widest uppercase mb-4 bg-[#5B4FE8]/10 border border-[#5B4FE8]/25 rounded-full px-3 sm:px-4 py-1.5">How it works</div>
          <h2 className="font-display text-[30px] sm:text-[38px] md:text-[44px] font-black tracking-[-1.5px] leading-tight">Up in 3 minutes flat</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 reveal">
          {/* Step 1 */}
          <div className="relative">
            {/* Connector line — desktop only */}
            <div className="hidden sm:block absolute top-[18px] right-0 w-1/2 h-px bg-gradient-to-r from-[#5B4FE8]/40 to-transparent"></div>
            {/* Mobile: vertical connector */}
            <div className="sm:hidden absolute left-[17px] top-12 w-px h-[calc(100%+16px)] bg-gradient-to-b from-[#5B4FE8]/30 to-transparent"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center font-display font-black text-[13px] flex-shrink-0 z-10">1</div>
              <div className="h-px flex-1 bg-white/6 sm:hidden"></div>
            </div>
            <div className="sm:pl-0 pl-12">
              <h3 className="font-display font-bold text-[15px] mb-2 tracking-tight">Create your profile</h3>
              <p className="text-[13px] text-white/45 font-light leading-relaxed">Register, choose your profession and base currency. Takes under 60 seconds.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="hidden sm:block absolute top-[18px] right-0 w-1/2 h-px bg-gradient-to-r from-[#5B4FE8]/40 to-transparent"></div>
            <div className="sm:hidden absolute left-[17px] top-12 w-px h-[calc(100%+16px)] bg-gradient-to-b from-[#5B4FE8]/30 to-transparent"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center font-display font-black text-[13px] flex-shrink-0 z-10">2</div>
              <div className="h-px flex-1 bg-white/6 sm:hidden"></div>
            </div>
            <div className="sm:pl-0 pl-12">
              <h3 className="font-display font-bold text-[15px] mb-2 tracking-tight">Log your transactions</h3>
              <p className="text-[13px] text-white/45 font-light leading-relaxed">Add manually, scan a bill, or import a CSV. AI auto-categorizes everything.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center font-display font-black text-[13px] flex-shrink-0">3</div>
              <div className="h-px flex-1 bg-white/6 sm:hidden"></div>
            </div>
            <div className="sm:pl-0 pl-12">
              <h3 className="font-display font-bold text-[15px] mb-2 tracking-tight">Let AI coach you</h3>
              <p className="text-[13px] text-white/45 font-light leading-relaxed">Ask your AI coach anything. Get insights, goal forecasts, and smart spending tips.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}