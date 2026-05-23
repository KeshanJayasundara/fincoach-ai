"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingNav() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50 px-4 md:px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <div className="font-display text-[17px] font-bold tracking-tight">
            <span className="text-[21px] font-bold text-white tracking-[-0.4px]">Fin</span>
            <span className="text-[21px] font-bold tracking-[-0.4px] text-[#5B4FE8]">Coach</span>
            <span className="text-[21px] font-bold text-white tracking-[-0.4px]">AI</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex mt-5 items-center gap-7 text-[13px] text-white/50 font-medium">
            <a href="#features" className="hover:text-white/90 transition-colors">Features</a>
            <a href="#how" className="hover:text-white/90 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white/90 transition-colors">Pricing</a>
          </div>

          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => router.push("/login")}
              className="text-[12.5px] text-white/60 font-medium px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 hover:text-white/80 transition-all"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push("/register")}
              className="btn-shimmer text-[12.5px] font-semibold text-white px-4 py-2 rounded-lg"
            >
              Get started free →
            </button>
          </div>

          {/* Mobile: Get started + Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => router.push("/register")}
              className="btn-shimmer text-[11.5px] font-semibold text-white px-3 py-2 rounded-lg"
            >
              Get started →
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg border border-white/10 bg-white/5"
              aria-label="Toggle menu"
            >
              <span className={`block w-4 h-[1.5px] bg-white/70 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`}></span>
              <span className={`block w-4 h-[1.5px] bg-white/70 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
              <span className={`block w-4 h-[1.5px] bg-white/70 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-14 left-0 right-0 z-40 nav-glass border-t border-white/6 transition-all duration-300 sm:hidden ${menuOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-2"}`}>
        <div className="px-5 py-5 flex flex-col gap-1">
          {[
            { href: "#features", label: "Features" },
            { href: "#how", label: "How it works" },
            { href: "#pricing", label: "Pricing" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-[14px] text-white/60 font-medium px-3 py-3 rounded-xl hover:bg-white/5 hover:text-white/90 transition-all"
            >
              {label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-white/6">
            <button
              onClick={() => { router.push("/login"); setMenuOpen(false); }}
              className="w-full text-[13px] text-white/60 font-medium px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white/80 transition-all mb-2"
            >
              Sign in
            </button>
            <button
              onClick={() => { router.push("/register"); setMenuOpen(false); }}
              className="btn-shimmer w-full text-[13px] font-semibold text-white px-4 py-3 rounded-xl"
            >
              Get started free →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}