"use client";

import { useState, useEffect } from "react";
import { Trash2, Pencil, Check, Loader2 } from "lucide-react";
import { getGoals, updateGoalProgress, deleteGoal } from "@/actions/goals";

const getStatusStyles = (progress: number) => {
  if (progress >= 80) return { bg: "#DCFCE7", color: "#14532D", label: "Ahead" };
  if (progress >= 30) return { bg: "#DCFCE7", color: "#14532D", label: "On track" };
  if (progress >= 5)  return { bg: "#FEF3C7", color: "#78350F", label: "Needs attention" };
  return { bg: "#DBEAFE", color: "#1E3A8A", label: "New" };
};

const getBarColor = (progress: number) => {
  if (progress >= 80) return "from-green-500 to-emerald-400";
  if (progress >= 30) return "from-[#5B4FE8] to-[#9B93F5]";
  if (progress >= 5)  return "from-amber-500 to-yellow-400";
  return "from-blue-500 to-sky-400";
};

function UpdateProgressModal({ goal, onClose, onSuccess }: { goal: any; onClose: () => void; onSuccess: () => void }) {
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const previewProgress = addAmount
    ? Math.min(Math.round(((goal.currentAmount + parseFloat(addAmount)) / goal.targetAmount) * 100), 100)
    : Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

  const handleSubmit = async () => {
    const val = parseFloat(addAmount);
    if (isNaN(val) || val <= 0) { setError("Please enter a valid amount."); return; }
    setLoading(true);
    try {
      await updateGoalProgress(goal.id, val);
      onSuccess();
      onClose();
    } catch { setError("Failed to update progress."); }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#EAE8FB]">
          <div>
            <h2 className="text-[15px] font-bold text-[#1A1635]">Update Progress</h2>
            <p className="text-[11px] text-[#8B87A8] mt-0.5">{goal.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] text-[#8B87A8] hover:text-[#1A1635] hover:border-[#C7C3F8] transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex gap-1 p-3 bg-[#F8F7FF] border-b border-[#EAE8FB]">
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[12px] font-semibold bg-white text-[#5B4FE8] shadow-sm border border-[#EAE8FB]">
            📊 Savings Progress
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* Already saved info */}
          <div className="bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl px-4 py-3 flex justify-between text-[12px]">
            <span className="text-[#8B87A8]">Already saved</span>
            <span className="font-bold text-[#5B4FE8]">LKR {goal.currentAmount.toLocaleString()}</span>
          </div>

          {/* Add amount input */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Add Amount
            </label>
            <div className="flex gap-2">
              <div className="px-3 py-2.5 text-[12px] font-semibold border border-[#D1CCFF] rounded-lg bg-white text-[#4A4568] w-20 flex items-center justify-center">
                LKR
              </div>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                min={1}
                className="flex-1 px-3 py-2.5 text-[14px] font-semibold border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
              />
            </div>
          </div>

          {/* Progress preview */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Progress Preview
            </label>
            <div className="bg-[#EEF0FD] rounded-xl p-3">
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-[#4A4568]">
                  LKR {addAmount
                    ? (goal.currentAmount + parseFloat(addAmount || "0")).toLocaleString()
                    : goal.currentAmount.toLocaleString()}
                </span>
                <span className="font-bold text-[#5B4FE8]">{previewProgress}%</span>
              </div>
              <div className="h-1.5 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5B4FE8] to-[#9B93F5] rounded-full transition-all duration-300"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
              {addAmount && parseFloat(addAmount) > 0 && (
                <div className="text-[11px] text-[#5B4FE8] font-semibold mt-2">
                  +LKR {parseFloat(addAmount).toLocaleString()} added → {previewProgress}% complete
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
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
              {loading ? "Saving…" : "Save Progress"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    setLoading(true);
    try { setGoals(await getGoals()); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try { await deleteGoal(id); loadGoals(); }
    catch { alert("Failed to delete goal"); }
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1635]">Savings Goals</h1>
        <p className="text-[#8B87A8] text-sm">Track your financial targets</p>
      </div>

      {/* AI Banner */}
      <div className="bg-gradient-to-r from-[#1A1635] to-[#2D2756] rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 bg-[#5B4FE8]/30 rounded-lg flex items-center justify-center text-base flex-shrink-0">🤖</div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[#C7C3F8] mb-0.5">AI Goal Coach</div>
          <div className="text-[12px] text-white/60 leading-relaxed">
            Saving an extra <strong className="text-[#9B93F5]">LKR 4,200/month</strong> (by cutting dining 30%) would hit all goals faster!
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-[#8B87A8]">Loading goals...</div>
      )}

      {!loading && goals.length === 0 && (
        <div className="text-center py-10 text-[13px] text-[#8B87A8]">No goals found</div>
      )}

      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const statusStyle = getStatusStyles(progress);
            const barColor = getBarColor(progress);
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <div key={goal.id} className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#1A1635] tracking-[-0.2px] truncate">{goal.name}</div>
                    <div className="text-[11px] text-[#8B87A8] mt-0.5">
                      {goal.deadline
                        ? `Target: ${new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                        : "No deadline set"}
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full shrink-0"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="font-bold text-[#1A1635] font-mono">LKR {goal.currentAmount.toLocaleString()}</span>
                  <span className="text-[#8B87A8] font-mono">of LKR {goal.targetAmount.toLocaleString()}</span>
                </div>

                <div className="h-1.5 bg-[#EAE8FB] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[#8B87A8] mt-2 flex-wrap gap-1">
                  <span>{progress}% complete</span>
                  <span>LKR {remaining.toLocaleString()} remaining</span>
                </div>

                <div className="bg-gradient-to-r from-[#EEF0FD] to-[#F0F7FF] border border-[#C7C3F8] rounded-lg px-3 py-2 mt-2.5 text-[12px] text-[#4A4568] leading-relaxed">
                  <strong className="text-[#5B4FE8]">💡</strong>{" "}
                  {progress >= 80
                    ? "You're ahead of schedule! Keep it up 🎉"
                    : progress >= 30
                    ? "At current rate, you can finish this goal on time!"
                    : "Increase your monthly savings to reach this goal faster."}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedGoal(goal)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#EEF0FD] hover:bg-[#E0DDFC] text-[#5B4FE8] text-[12px] font-semibold rounded-xl transition-colors"
                  >
                    <Pencil size={13} /> Update Progress
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedGoal && (
        <UpdateProgressModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onSuccess={loadGoals}
        />
      )}
    </div>
  );
}