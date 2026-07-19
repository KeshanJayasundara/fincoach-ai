"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPenToSquare,
  faCheck,
  faSpinner,
  faRobot,
  faBullseye,
  faCircleExclamation,
  faCircleCheck,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
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

/* ── Delete Confirm Modal (matches transaction delete design, with loading state) ── */
function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl z-10 w-full max-w-sm mx-auto p-6">
        <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mx-auto mb-4">
          <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
        </div>
        <h3 className="text-[15px] font-bold text-[#1A1635] text-center mb-2">Delete Goal</h3>
        <p className="text-[13px] text-[#8B87A8] text-center mb-1">{message}</p>
        <p className="text-[12px] text-[#C4C0DC] text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 text-[13px] font-semibold text-[#4A4568] border border-[#D1CCFF] rounded-xl hover:bg-[#F8F7FF] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faTrash} className="text-[12px]" />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Update Progress Modal (auto-reloads via onSuccess → loadGoals) ── */
function UpdateProgressModal({
  goal,
  onClose,
  onSuccess,
}: {
  goal: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentProgress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  const previewProgress = addAmount && !isNaN(parseFloat(addAmount))
    ? Math.min(Math.round(((goal.currentAmount + parseFloat(addAmount)) / goal.targetAmount) * 100), 100)
    : currentProgress;

  const handleSubmit = async () => {
    const val = parseFloat(addAmount);
    if (isNaN(val) || val <= 0) { setError("Please enter a valid amount."); return; }
    setLoading(true);
    try {
      await updateGoalProgress(goal.id, val);
      // FIX: call onSuccess first (triggers loadGoals), THEN close modal
      // so the UI re-fetches before the modal disappears
      await onSuccess();
      onClose();
    } catch {
      setError("Failed to update progress.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#EAE8FB]">
          <div>
            <h2 className="text-[15px] font-bold text-[#1A1635]">Update Progress</h2>
            <p className="text-[11px] text-[#8B87A8] mt-0.5 truncate max-w-55">{goal.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] text-[#8B87A8] hover:text-[#1A1635] hover:border-[#C7C3F8] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex gap-1 p-3 bg-[#F8F7FF] border-b border-[#EAE8FB]">
          <div className="flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-[12px] font-semibold bg-white text-[#5B4FE8] shadow-sm border border-[#EAE8FB]">
            <FontAwesomeIcon icon={faBullseye} />
            Savings Progress
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* Already saved */}
          <div className="bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl px-4 py-3 flex justify-between items-center text-[12px]">
            <span className="text-[#8B87A8]">Already saved</span>
            <span className="font-bold text-[#5B4FE8]">LKR {goal.currentAmount.toLocaleString()}</span>
          </div>

          {/* Add Amount */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Add Amount
            </label>
            <div className="flex gap-2">
              <div className="px-3 py-3 text-[12px] font-semibold border border-[#D1CCFF] rounded-lg bg-white text-[#4A4568] w-20 flex items-center justify-center shrink-0">
                LKR
              </div>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={addAmount}
                onChange={(e) => { setAddAmount(e.target.value); setError(""); }}
                min={1}
                className="flex-1 px-3 py-3 text-[14px] font-semibold border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
              />
            </div>
          </div>

          {/* Progress Preview */}
          <div>
            <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
              Progress Preview
            </label>
            <div className="bg-[#EEF0FD] rounded-xl p-3">
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-[#4A4568] font-mono">
                  LKR {(goal.currentAmount + (parseFloat(addAmount) || 0)).toLocaleString()}
                </span>
                <span className="font-bold text-[#5B4FE8]">{previewProgress}%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
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
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1 pb-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-[13px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-xl hover:border-[#C7C3F8] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 text-[13px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                : <FontAwesomeIcon icon={faCheck} />}
              {loading ? "Saving…" : "Save Progress"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { loadGoals(); }, []);

  // Returns a Promise so UpdateProgressModal can await it before closing
  const loadGoals = async () => {
    setLoading(true);
    try { setGoals(await getGoals()); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteGoal(deleteTarget.id);
      setDeleteTarget(null);
      loadGoals();
    } catch {
      setDeleteTarget(null);
    }
    setDeleteLoading(false);
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline set";
    try {
      const date = new Date(deadline);
      if (isNaN(date.getTime())) return "No deadline set";
      return `Target: ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } catch {
      return "No deadline set";
    }
  };

  return (
    <div className="space-y-4 pb-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1635]">Savings Goals</h1>
        <p className="text-[#8B87A8] text-sm">Track your financial targets</p>
      </div>

      {/* AI Banner
      <div className="bg-gradient-to-r from-[#1A1635] to-[#2D2756] rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#5B4FE8]/30 rounded-lg flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faRobot} className="text-[#9B93F5] text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[#C7C3F8] mb-0.5">AI Goal Coach</div>
          <div className="text-[12px] text-white/60 leading-relaxed">
            Saving an extra <strong className="text-[#9B93F5]">LKR 4,200/month</strong> would hit all goals faster!
          </div>
        </div>
      </div>  */}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#8B87A8]">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl text-[#9B93F5]" />
          <p className="text-sm">Loading goals...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 bg-[#EEF0FD] rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faBullseye} className="text-2xl text-[#9B93F5]" />
          </div>
          <p className="text-[13px] text-[#8B87A8]">No goals found</p>
          <p className="text-[12px] text-[#C7C3F8]">Tap Add Goal above to get started</p>
        </div>
      )}

      {/* Goals Grid */}
      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const statusStyle = getStatusStyles(progress);
            const barColor = getBarColor(progress);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const statusIcon = progress >= 80 ? faCircleCheck : faCircleExclamation;

            return (
              <div
                key={goal.id}
                className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)] flex flex-col gap-3"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#1A1635] tracking-[-0.2px] truncate">{goal.name}</div>
                    <div className="text-[11px] text-[#8B87A8] mt-0.5">{formatDeadline(goal.deadline)}</div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full shrink-0 whitespace-nowrap"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    <FontAwesomeIcon icon={statusIcon} className="text-[9px]" />
                    {statusStyle.label}
                  </span>
                </div>

                {/* Amounts */}
                <div className="flex justify-between text-[12px]">
                  <span className="font-bold text-[#1A1635] font-mono">LKR {goal.currentAmount.toLocaleString()}</span>
                  <span className="text-[#8B87A8] font-mono">of LKR {goal.targetAmount.toLocaleString()}</span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="h-2 bg-[#EAE8FB] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8B87A8] mt-1.5">
                    <span>{progress}% complete</span>
                    <span>LKR {remaining.toLocaleString()} remaining</span>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="bg-gradient-to-r from-[#EEF0FD] to-[#F0F7FF] border border-[#C7C3F8] rounded-lg px-3 py-2.5 text-[12px] text-[#4A4568] leading-relaxed flex items-start gap-2">
                  <FontAwesomeIcon icon={faLightbulb} className="text-[#5B4FE8] mt-0.5 shrink-0" />
                  <span>
                    {progress >= 80
                      ? "You're ahead of schedule! Keep it up 🎉"
                      : progress >= 30
                      ? "At current rate, you can finish this goal on time!"
                      : "Increase your monthly savings to reach this goal faster."}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGoal(goal)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#EEF0FD] active:bg-[#D8D4FB] hover:bg-[#E0DDFC] text-[#5B4FE8] text-[12px] font-semibold rounded-xl transition-colors"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    Update Progress
                  </button>
                  <button
                    onClick={() => setDeleteTarget(goal)}
                    className="flex items-center justify-center min-w-11 min-h-11 px-4 bg-red-50 active:bg-red-200 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedGoal && (
        <UpdateProgressModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onSuccess={loadGoals}   // loadGoals is async → modal awaits it before closing
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.name}" goal will be permanently deleted.`}
          onConfirm={handleDelete}
          onCancel={() => !deleteLoading && setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}