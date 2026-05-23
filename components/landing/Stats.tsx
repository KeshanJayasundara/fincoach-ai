export default function Stats() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-5">
      <div className="max-w-4xl mx-auto reveal" id="stats">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {[
            { val: "32+", label: "Currencies" },
            { val: "AI",  label: "Personalized advice" },
            { val: "∞",  label: "Transaction tracking" },
            { val: "$0", label: "To get started" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center p-4 sm:p-6 rounded-2xl bg-white/3 border border-white/6 hover:border-[#5B4FE8]/30 transition-all">
              <div className="stat-val font-display text-2xl sm:text-3xl font-black mb-1">{val}</div>
              <div className="text-[11px] sm:text-[12px] text-white/35 font-medium leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}