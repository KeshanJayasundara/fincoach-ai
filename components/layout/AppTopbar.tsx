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
        // ✅ Opens modal instead of navigating
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
      <header className="h-[58px] bg-white border-b border-[#EAE8FB] flex items-center justify-between px-4 md:px-5 sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[#EAE8FB] bg-white text-[#4A4568] flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-[15px] font-bold text-[#1A1635] tracking-[-0.2px] whitespace-nowrap">
              {title}
            </h1>
            {greeting && (
              <p className="text-[11px] text-[#8B87A8] -mt-0.5 hidden sm:block">{greeting}</p>
            )}
          </div>

          {/* Role Pill - Only show on Dashboard */}
          {pathname === "/dashboard" && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF0FD] border border-[#C7C3F8] rounded-full cursor-pointer text-[11.5px] font-bold text-[#3C3489] whitespace-nowrap ml-2">
              🏥 Healthcare
              <span className="text-[10px] opacity-70">▾</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Add Button - Only show on specific pages */}
          {showAddButton && addAction && (
            <button
              onClick={addAction}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4FE8] hover:bg-[#7B72EC] text-white rounded-lg text-[12px] font-medium transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Transaction
            </button>
          )}

          {/* AI Query Counter - Only show on Chat page */}
          {pathname.includes("/chat") && (
            <div className="text-[11px] text-[#8B87A8] font-medium bg-[#F8F7FF] px-2 py-1 rounded-full whitespace-nowrap">
              ⚡ 3 queries left
            </div>
          )}

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-[#EAE8FB] bg-white text-[#8B87A8] flex-shrink-0">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications}
              </div>
            )}
          </button>

          {/* User Avatar */}
          <div
            onClick={() => router.push("/dashboard/settings")}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-[13px] font-bold cursor-pointer flex-shrink-0"
          >
            K
          </div>
        </div>
      </header>

      {/* ✅ Add Transaction Modal — rendered at root level to avoid z-index stacking issues */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          // Optionally trigger a page refresh or data reload here
          // e.g. router.refresh() if you need server component revalidation
        }}
      />
    </>
  );
}