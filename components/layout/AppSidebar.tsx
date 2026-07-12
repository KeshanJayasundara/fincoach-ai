"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, CreditCard, MessageSquare, Target, PieChart, FileText, Settings, LogOut, X } from "lucide-react";
import { getAIUsage } from "@/actions/ai";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/chat", label: "AI Coach", icon: MessageSquare },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [queriesUsed,  setQueriesUsed]  = useState<number | null>(null);
  const [queriesLimit, setQueriesLimit] = useState<number | null>(null);

  // Fetch current usage on mount so the widget shows real numbers
  // instead of hardcoded placeholders.
  useEffect(() => {
    getAIUsage()
      .then(({ queriesUsed, queriesLimit }) => {
        setQueriesUsed(queriesUsed);
        setQueriesLimit(queriesLimit);
      })
      .catch(() => {
        // Silently ignore — sidebar still works, usage just won't show.
      });
  }, []);

  // Live-update whenever the chat page sends a message.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ queriesLeft: number }>).detail;
      if (detail && typeof detail.queriesLeft === "number" && queriesLimit !== null) {
        setQueriesUsed(queriesLimit - detail.queriesLeft);
      }
    };

    window.addEventListener("fincoach:queries-update", handler);
    return () => window.removeEventListener("fincoach:queries-update", handler);
  }, [queriesLimit]);

  const hasUsage   = queriesUsed !== null && queriesLimit !== null;
  const queriesLeft = hasUsage ? Math.max(queriesLimit! - queriesUsed!, 0) : null;
  const usagePct    = hasUsage && queriesLimit! > 0
    ? Math.min(Math.round((queriesUsed! / queriesLimit!) * 100), 100)
    : 0;
  const planLabel   = hasUsage && queriesLimit! >= 999 ? "Pro plan" : "Free plan";

  const handleNavigation = (href: string) => {
    if (href === "/dashboard/transactions") {
      const currentMonth = new Date().toISOString().slice(0, 7);
      sessionStorage.setItem("txFilterMonth", currentMonth);
    }
    router.push(href);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-55 bg-[#13102E] fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ height: '100dvh' }}
      >
        {/* Logo + mobile close button */}
        <div className="px-4 py-5 pb-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-white tracking-tight">
              Fin<span className="text-[#9B93F5]">Coach</span>
            </div>
            <div className="text-[10.5px] text-white/30 mt-0.5">AI Finance Manager</div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Main</div>
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <div
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center gap-2.5 mx-2 my-0.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium
                  ${isActive
                    ? "bg-[#5B4FE8]/20 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-[#9B93F5]" : "opacity-70"}`} />
                {item.label}
              </div>
            );
          })}

          <div className="px-3 pb-1 pt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Finance</div>
          {navItems.slice(4, 7).map((item) => {
            const isActive = pathname === item.href;
            return (
              <div
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center gap-2.5 mx-2 my-0.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium
                  ${isActive
                    ? "bg-[#5B4FE8]/20 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-[#9B93F5]" : "opacity-70"}`} />
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div
          className="mt-auto pt-2 px-2 border-t border-white/10"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div className="bg-[#5B4FE8]/10 border border-[#5B4FE8]/30 rounded-2xl p-4 mx-2">
            <div className="text-xs font-semibold text-white/80">
              {hasUsage ? planLabel : "Free plan"}
            </div>
            <div className="text-[11px] text-white/40 mt-1">
              {hasUsage ? `${queriesUsed} / ${queriesLimit} AI queries used` : "Loading usage…"}
            </div>
            <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5B4FE8] to-[#9B93F5] rounded-full transition-all duration-300"
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <div className="text-[10px] text-white/40 mt-1.5">
              {hasUsage ? `${queriesLeft} queries left this month` : ""}
            </div>
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center gap-3 mx-2 mt-4 px-3 py-3 rounded-xl cursor-pointer transition-all text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </div>
        </div>
      </aside>
    </>
  );
}