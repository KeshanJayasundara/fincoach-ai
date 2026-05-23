export default function Footer() {
  return (
    <footer className="border-t border-white/6 py-6 sm:py-8 px-4 sm:px-5">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="font-display text-[15px] font-bold tracking-tight">
          <span className="text-[21px] font-bold text-white tracking-[-0.4px]">Fin</span>
            <span className="text-[21px] font-bold tracking-[-0.4px] text-[#5B4FE8]">Coach</span>
            <span className="text-[21px] font-bold text-white tracking-[-0.4px]">AI</span>
        </div>
        <div className="text-[11px] sm:text-[12px] text-white/20 text-center leading-relaxed">
          © 2026 FinCoach AI · Not financial advice ·{" "}
          <span className="cursor-pointer hover:text-white/40 transition-colors">Privacy</span> ·{" "}
          <span className="cursor-pointer hover:text-white/40 transition-colors">Terms</span>
        </div>
        <div className="flex gap-4 sm:gap-4 text-[12px] text-white/25">
          <a href="#features" className="hover:text-white/50 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white/50 transition-colors">Pricing</a>
        </div>
      </div>
    </footer>
  );
}