// components/layout/AppTopbar.tsx
"use client";

import { useState } from "react";
import { Bell, Menu, Plus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import AddTransactionModal from "@/components/modals/AddTransactionModal";

interface AppTopbarProps {
  onMenuClick: () => void;
}

export default function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications] = useState(3);
  const [showAddModal, setShowAddModal] = useState(false);

  const getPageConfig = () => {
    if (pathname === "/dashboard") {
      return { title: "Dashboard", showAddButton: false, addAction: null, greeting: "Good morning, Dr. Kasun 👋" };
    }
    if (pathname.includes("/transactions")) {
      return {
        title: "Transactions",
        showAddButton: true,
        addAction: () => setShowAddModal(true),
        greeting: null,
      };
    }
    if (pathname.includes("/chat")) {
      return { title: "AI Coach", showAddButton: false, addAction: null, greeting: null };
    }
    if (pathname.includes("/goals")) {
      return { title: "Savings Goals", showAddButton: true, addAction: () => router.push("/dashboard/goals/add"), greeting: null };
    }
    if (pathname.includes("/portfolio")) {
      return { title: "Portfolio", showAddButton: true, addAction: () => router.push("/dashboard/portfolio/add"), greeting: null };
    }
    if (pathname.includes("/reports")) {
      return { title: "Financial Reports", showAddButton: false, addAction: null, greeting: null };
    }
    if (pathname.includes("/settings")) {
      return { title: "Settings", showAddButton: false, addAction: null, greeting: null };
    }
    return { title: "Dashboard", showAddButton: false, addAction: null, greeting: "Good morning, Dr. Kasun 👋" };
  };

  const { title, showAddButton, addAction, greeting } = getPageConfig();

  return (
    <>
      <header className="h-14 md:h-14.5 bg-white border-b border-[#EAE8FB] flex items-center justify-between px-3 md:px-5 sticky top-0 z-30 shrink-0">

        {/* ── Left: hamburger + title + greeting + role pill ── */}
        <div className="flex items-center gap-2 md:gap-2.5 min-w-0">

          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuClick}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] bg-white text-[#4A4568] shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Title + greeting */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-[14px] md:text-[15px] font-bold text-[#1A1635] tracking-[-0.2px] truncate">
              {title}
            </h1>
            {greeting && (
              <p className="text-[10px] md:text-[11px] text-[#8B87A8] -mt-0.5 hidden sm:block truncate">
                {greeting}
              </p>
            )}
          </div>

          {/* Role pill — hidden on mobile, visible sm+ */}
          {pathname === "/dashboard" && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-[#EEF0FD] border border-[#C7C3F8] rounded-full cursor-pointer text-[11px] md:text-[11.5px] font-bold text-[#3C3489] whitespace-nowrap shrink-0 ml-1 md:ml-2">
              🏥 Healthcare
              <span className="text-[10px] opacity-70">▾</span>
            </div>
          )}
        </div>

        {/* ── Right: add button + badge + bell + avatar ── */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">

          {/* Add button — icon-only on mobile, full label on md+ */}
          {showAddButton && addAction && (
            <button
              onClick={addAction}
              className="flex items-center justify-center gap-1.5 w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 bg-[#5B4FE8] hover:bg-[#7B72EC] text-white rounded-lg text-[12px] font-medium transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">Add Transaction</span>
            </button>
          )}

          {/* AI Query Counter — pill on sm+, icon-only dot on mobile */}
          {pathname.includes("/chat") && (
            <>
              {/* mobile: compact */}
              <div className="flex sm:hidden items-center justify-center w-8 h-8 bg-[#F8F7FF] rounded-lg border border-[#EAE8FB]">
                <span className="text-[11px]">⚡</span>
              </div>
              {/* sm+: full pill */}
              <div className="hidden sm:block text-[11px] text-[#8B87A8] font-medium bg-[#F8F7FF] px-2 py-1 rounded-full whitespace-nowrap border border-[#EAE8FB]">
                ⚡ 3 queries left
              </div>
            </>
          )}

          {/* Notifications bell */}
          <button className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-[#EAE8FB] bg-white text-[#8B87A8] shrink-0">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications}
              </div>
            )}
          </button>

          {/* User avatar */}
          <div
            onClick={() => router.push("/dashboard/settings")}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-[12px] md:text-[13px] font-bold cursor-pointer shrink-0"
          >
            K
          </div>
        </div>
      </header>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          // e.g. router.refresh() for server component revalidation
        }}
      />
    </>
  );
}