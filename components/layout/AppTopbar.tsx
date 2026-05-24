"use client";

import { useState } from "react";
import { Bell, Menu, Plus, X, Check, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import { createGoal } from "@/actions/goals";

interface AppTopbarProps {
  onMenuClick: () => void;
}

function AddGoalModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name || !targetAmount) {
      setError("Goal name and target amount are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || undefined,
      });
      setName(""); setTargetAmount(""); setDeadline("");
      onSuccess?.();
      onClose();
    } catch {
      setError("Failed to create goal.");
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#EAE8FB] shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-[#1A1635]">Create New Goal</h2>
            <p className="text-[11px] text-[#8B87A8] mt-0.5">Set a savings target to work towards</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] text-[#8B87A8] hover:text-[#1A1635] hover:border-[#C7C3F8] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab-style header strip */}
        <div className="flex gap-1 p-3 bg-[#F8F7FF] border-b border-[#EAE8FB] shrink-0">
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[12px] font-semibold bg-white text-[#5B4FE8] shadow-sm border border-[#EAE8FB]">
            🎯 Savings Goal
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Goal Name */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Buy a Car, Emergency Fund..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC] bg-white"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">Target Amount</label>
            <div className="flex gap-2">
              <div className="px-3 py-2.5 text-[12px] font-semibold border border-[#D1CCFF] rounded-lg bg-white text-[#4A4568] w-20 flex items-center justify-center">
                LKR
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="flex-1 px-3 py-2.5 text-[14px] font-semibold border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Deadline <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635]"
            />
          </div>

          {/* AI Tip */}
          <div className="bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl p-3">
            <div className="text-[11px] font-bold text-[#5B4FE8] mb-1.5">🤖 AI Goal Tips</div>
            {["Set a realistic deadline to stay motivated", "Break big goals into monthly savings targets", "Link your goal to a specific saving category"].map((tip) => (
              <div key={tip} className="flex items-center gap-2 text-[11px] text-[#4A4568] mb-1">
                <div className="w-1 h-1 rounded-full bg-[#9B93F5] shrink-0" />
                {tip}
              </div>
            ))}
          </div>

          {error && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1 pb-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {loading ? "Creating…" : "Create Goal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications] = useState(3);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const getPageConfig = () => {
    if (pathname === "/dashboard")
      return { title: "Dashboard", showAddButton: false, addAction: null, greeting: "Good morning, Dr. Kasun 👋" };
    if (pathname.includes("/transactions"))
      return { title: "Transactions", showAddButton: true, addAction: () => setShowAddModal(true), greeting: null };
    if (pathname.includes("/chat"))
      return { title: "AI Coach", showAddButton: false, addAction: null, greeting: null };
    if (pathname.includes("/goals"))
      return { title: "Savings Goals", showAddButton: true, addAction: () => setShowAddGoalModal(true), greeting: null };
    if (pathname.includes("/portfolio"))
      return { title: "Portfolio", showAddButton: true, addAction: () => router.push("/dashboard/portfolio/add"), greeting: null };
    if (pathname.includes("/reports"))
      return { title: "Financial Reports", showAddButton: false, addAction: null, greeting: null };
    if (pathname.includes("/settings"))
      return { title: "Settings", showAddButton: false, addAction: null, greeting: null };
    return { title: "Dashboard", showAddButton: false, addAction: null, greeting: "Good morning, Dr. Kasun 👋" };
  };

  const { title, showAddButton, addAction, greeting } = getPageConfig();
  const addButtonLabel = pathname.includes("/goals") ? "Add Goal" : "Add Transaction";

  return (
    <>
      <header className="h-14 md:h-14.5 bg-white border-b border-[#EAE8FB] flex items-center justify-between px-3 md:px-5 sticky top-0 z-30 shrink-0">

        {/* Left */}
        <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] bg-white text-[#4A4568] shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-[14px] md:text-[15px] font-bold text-[#1A1635] tracking-[-0.2px] truncate">{title}</h1>
            {greeting && (
              <p className="text-[10px] md:text-[11px] text-[#8B87A8] -mt-0.5 hidden sm:block truncate">{greeting}</p>
            )}
          </div>

          {pathname === "/dashboard" && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-[#EEF0FD] border border-[#C7C3F8] rounded-full cursor-pointer text-[11px] md:text-[11.5px] font-bold text-[#3C3489] whitespace-nowrap shrink-0 ml-1 md:ml-2">
              🏥 Healthcare
              <span className="text-[10px] opacity-70">▾</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {showAddButton && addAction && (
            <button
              onClick={addAction}
              className="flex items-center justify-center gap-1.5 w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 bg-[#5B4FE8] hover:bg-[#7B72EC] text-white rounded-lg text-[12px] font-medium transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">{addButtonLabel}</span>
            </button>
          )}

          {pathname.includes("/chat") && (
            <>
              <div className="flex sm:hidden items-center justify-center w-8 h-8 bg-[#F8F7FF] rounded-lg border border-[#EAE8FB]">
                <span className="text-[11px]">⚡</span>
              </div>
              <div className="hidden sm:block text-[11px] text-[#8B87A8] font-medium bg-[#F8F7FF] px-2 py-1 rounded-full whitespace-nowrap border border-[#EAE8FB]">
                ⚡ 3 queries left
              </div>
            </>
          )}

          <button className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-[#EAE8FB] bg-white text-[#8B87A8] shrink-0">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications}
              </div>
            )}
          </button>

          <div
            onClick={() => router.push("/dashboard/settings")}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-[12px] md:text-[13px] font-bold cursor-pointer shrink-0"
          >
            K
          </div>
        </div>
      </header>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => router.refresh()}
      />

      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}