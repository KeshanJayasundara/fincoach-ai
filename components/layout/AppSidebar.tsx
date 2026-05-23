"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, CreditCard, MessageSquare, Target, PieChart, FileText, Settings, LogOut, X } from "lucide-react";

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

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await signOut({ redirectTo: "/login" });
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
        className={`w-55 bg-[#13102E] h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
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

        <div className="mt-auto pt-2 pb-4 px-2 border-t border-white/10">
          <div className="bg-[#5B4FE8]/10 border border-[#5B4FE8]/30 rounded-2xl p-4 mx-2">
            <div className="text-xs font-semibold text-white/80">Free plan</div>
            <div className="text-[11px] text-white/40 mt-1">7 / 10 AI queries used</div>
            <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div className="h-full w-[70%] bg-linear-to-r from-[#5B4FE8] to-[#9B93F5] rounded-full" />
            </div>
            <div className="text-[10px] text-white/40 mt-1.5">3 queries left this month</div>
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