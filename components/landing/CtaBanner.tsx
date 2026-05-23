export default function CtaBanner() {
  return (
    <section id="app-section" className="py-14 sm:py-24 px-4 sm:px-5">
      <div className="max-w-3xl mx-auto reveal">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 md:p-14 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(91,79,232,0.22) 0%, rgba(91,79,232,0.08) 60%, rgba(19,16,46,0.6) 100%)",
            border: "1.5px solid rgba(91,79,232,0.35)",
            boxShadow: "0 0 80px rgba(91,79,232,0.18)"
          }}>
          <div className="absolute -top-16 -right-16 w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-[#5B4FE8]/20 blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-28 sm:w-40 h-28 sm:h-40 rounded-full bg-[#9B93F5]/15 blur-3xl"></div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🚀</div>
            <h2 className="font-display text-[26px] sm:text-[30px] md:text-[38px] font-black tracking-[-1.5px] leading-tight mb-2 sm:mb-3">
              Start taking control<br />of your money today
            </h2>
            <p className="text-[13px] sm:text-[14px] text-white/45 font-light max-w-xs sm:max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
              Free forever. No credit card required. Set up in under 3 minutes.
            </p>
            <button className="btn-shimmer font-display text-[13px] sm:text-[14px] font-bold text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl tracking-tight w-full sm:w-auto max-w-[280px]">
              Create your free account →
            </button>
            <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3 sm:gap-5 text-[11px] sm:text-[12px] text-white/25 flex-wrap">
              <span>✓ No credit card</span>
              <span className="w-1 h-1 rounded-full bg-white/15 hidden xs:block"></span>
              <span>✓ Free forever plan</span>
              <span className="w-1 h-1 rounded-full bg-white/15 hidden xs:block"></span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}