"use client";

import { useState, useEffect } from "react";
import { Bell, Menu, Plus, X, Check, Loader2, Target, Lightbulb } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import { createGoal } from "@/actions/goals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faBolt } from "@fortawesome/free-solid-svg-icons";

interface AppTopbarProps {
  onMenuClick: () => void;
}

/* ── Add Goal Modal ── */
function AddGoalModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName]                 = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim() || !targetAmount) {
      setError("Goal name and target amount are required.");
      return;
    }
    if (parseFloat(targetAmount) <= 0 || isNaN(parseFloat(targetAmount))) {
      setError("Please enter a valid target amount.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createGoal({
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || undefined,
      });
      setName(""); setTargetAmount(""); setDeadline("");
      onSuccess?.();
      onClose();
    } catch {
      setError("Failed to create goal. Please try again.");
    }
    setLoading(false);
  };

  const aiTips = [
    "Set a realistic deadline to stay motivated",
    "Break big goals into monthly savings targets",
    "Link your goal to a specific saving category",
  ];

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

        {/* Tab strip */}
        <div className="flex gap-1 p-3 bg-[#F8F7FF] border-b border-[#EAE8FB] shrink-0">
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[12px] font-semibold bg-white text-[#5B4FE8] shadow-sm border border-[#EAE8FB]">
            <Target size={12} />
            Savings Goal
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Goal Name */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Goal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Buy a Car, Emergency Fund..."
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC] bg-white transition-colors"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Target Amount
            </label>
            <div className="flex gap-2">
              <div className="px-3 py-2.5 text-[12px] font-semibold border border-[#D1CCFF] rounded-lg bg-white text-[#4A4568] w-20 flex items-center justify-center shrink-0">
                LKR
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => { setTargetAmount(e.target.value); setError(""); }}
                min={1}
                className="flex-1 px-3 py-2.5 text-[14px] font-semibold border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC] transition-colors"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Deadline{" "}
              <span className="font-normal normal-case text-[#C4C0DC]">(optional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] transition-colors"
            />
          </div>

          {/* AI Tips */}
          <div className="bg-gradient-to-r from-[#1A1635] to-[#2D2756] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 bg-[#5B4FE8]/30 rounded-md flex items-center justify-center shrink-0">
                <Lightbulb size={12} className="text-[#9B93F5]" />
              </div>
              <span className="text-[12px] font-bold text-[#C7C3F8]">AI Goal Tips</span>
            </div>
            {aiTips.map((tip) => (
              <div key={tip} className="flex items-start gap-2 text-[11px] text-white/60 mb-1.5 last:mb-0 leading-relaxed">
                <div className="w-1 h-1 rounded-full bg-[#9B93F5] shrink-0 mt-1.5" />
                {tip}
              </div>
            ))}
          </div>

          {error && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1 pb-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors disabled:opacity-50"
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

/* ── Topbar ── */
export default function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const [notifications]                         = useState(3);
  const [showAddModal, setShowAddModal]         = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [queriesLeft, setQueriesLeft]           = useState<number | null>(null);

  const isChat = pathname.includes("/chat");

  // Listen for query count updates fired from AIChatPage
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ queriesLeft: number }>).detail;
      setQueriesLeft(detail.queriesLeft);
    };
    window.addEventListener("fincoach:queries-update", handler);
    return () => window.removeEventListener("fincoach:queries-update", handler);
  }, []);

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
      {/* ── AI Coach header ── */}
      {isChat ? (
        <header className="h-14 bg-white border-b border-[#EAE8FB] sticky top-0 z-30 shrink-0">
          <div className="h-full px-3 md:px-4 flex items-center justify-between">

            {/* Left — hamburger + identity */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={onMenuClick}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] bg-white text-[#4A4568] shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white shrink-0">
                <FontAwesomeIcon icon={faRobot} className="text-base" />
              </div>
              <div>
                <div className="font-semibold text-[#1A1635] text-sm">FinCoach AI</div>
                <div className="text-[10px] text-[#8B87A8] font-medium">
                  Your real data
                </div>
              </div>
            </div>

            {/* queries left count part */}
            <div className="flex items-center">
              {queriesLeft !== null ? (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-[#F8F7FF] px-3 py-1.5 rounded-full border border-[#EAE8FB]">
                  <FontAwesomeIcon icon={faBolt} className="text-[#9B93F5] text-[10px]" />
                  <span className="text-[#5B4FE8]">{queriesLeft}</span>
                  <span className="text-[#8B87A8]">queries left</span>
                </div>
              ) : (
                <div className="h-7 w-28 rounded-full bg-[#EAE8FB] animate-pulse" />
              )}
            </div>

          </div>
        </header>
      ) : (
        /* ── Standard header ── */
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
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-[12px] md:text-[13px] font-bold cursor-pointer shrink-0"
            >
              K
            </div>
          </div>
        </header>
      )}

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