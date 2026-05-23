"use client";

import { useEffect } from "react";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Ticker from "@/components/landing/Ticker";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function Home() {
  useEffect(() => {
    // Reveal on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    // Nav scroll effect
    const handleScroll = () => {
      const nav = document.querySelector("nav");
      if (nav) nav.style.boxShadow = window.scrollY > 40 ? "0 4px 32px rgba(0,0,0,0.4)" : "none";
    };
    window.addEventListener("scroll", handleScroll);

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector((a as HTMLAnchorElement).getAttribute("href")!);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style jsx global>{`
        /* Extra-small breakpoint (390px) */
        @media (min-width: 390px) {
          .xs\\:block { display: block; }
          .xs\\:flex { display: flex; }
          .xs\\:hidden { display: none; }
          .xs\\:w-auto { width: auto; }
          .xs\\:max-w-sm { max-width: 24rem; }
          .xs\\:text-\\[44px\\] { font-size: 44px; }
        }

        body, * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .grad-border {
          background: linear-gradient(#13102E, #13102E) padding-box,
                      linear-gradient(135deg, #5B4FE8, #9B93F5, #5B4FE8) border-box;
          border: 1.5px solid transparent;
        }
        .hero-orb {
          background: radial-gradient(ellipse at center, rgba(91,79,232,0.28) 0%, rgba(91,79,232,0.08) 50%, transparent 70%);
        }
        .glow-card:hover {
          box-shadow: 0 0 0 1px rgba(91,79,232,0.4), 0 20px 60px rgba(91,79,232,0.15);
        }
        .btn-shimmer {
          background-size: 200% auto;
          background-image: linear-gradient(90deg, #5B4FE8 0%, #9B93F5 40%, #7B72EC 60%, #5B4FE8 100%);
          transition: background-position 0.5s, transform 0.2s, box-shadow 0.2s;
        }
        .btn-shimmer:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(91,79,232,0.45);
        }
        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.35;
          mix-blend-mode: overlay;
        }
        .stat-val {
          background: linear-gradient(135deg, #fff, #C7C3F8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .price-pop {
          background: linear-gradient(160deg, rgba(91,79,232,0.18), rgba(91,79,232,0.06));
          box-shadow: 0 0 0 1.5px rgba(91,79,232,0.5), 0 24px 64px rgba(91,79,232,0.18);
        }
        .feat-icon {
          background: linear-gradient(135deg, rgba(91,79,232,0.15), rgba(91,79,232,0.05));
          border: 1px solid rgba(91,79,232,0.2);
        }
        .nav-glass {
          background: rgba(19,16,46,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .mockup-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }
        @keyframes scrollDown {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(6px); }
        }
        .scroll-dot { animation: scrollDown 1.8s ease-in-out infinite; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-inner { animation: ticker 22s linear infinite; }
        .ticker-inner:hover { animation-play-state: paused; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

        /* Prevent horizontal overflow on mobile */
        html, body { overflow-x: hidden; }

        /* Touch targets — ensure interactive elements are at least 44px */
        button, a { min-height: 36px; }

        /* Tap highlight removal for cleaner mobile feel */
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div className="bg-[#0D0B1A] text-white overflow-x-hidden">
        <LandingNav />
        <Hero />
        <Ticker />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
        <Footer />
      </div>
    </>
  );
}