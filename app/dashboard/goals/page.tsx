// page.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const goals = [
  {
    id: 1,
    title: "Emergency Fund",
    target: 150000,
    current: 36000,
    deadline: "Sep 2026",
    color: "from-green-500 to-emerald-400",
    progress: 24,
    status: "on-track",
    statusLabel: "On track",
    aiMessage: "At current rate, done 2 months early if you save LKR 4,200 more/month."
  },
  {
    id: 2,
    title: "Laptop Upgrade",
    target: 45000,
    current: 24000,
    deadline: "Jun 2026",
    color: "from-[#5B4FE8] to-[#9B93F5]",
    progress: 53,
    status: "ahead",
    statusLabel: "Ahead",
    aiMessage: "🎉 You're ahead of schedule! On track to finish 1 month early."
  },
  {
    id: 3,
    title: "Bali Holiday",
    target: 60000,
    current: 9000,
    deadline: "Dec 2026",
    color: "from-amber-500 to-yellow-400",
    progress: 15,
    status: "behind",
    statusLabel: "Needs attention",
    aiMessage: "⚠️ Behind schedule. Need LKR 6,500 more/month to hit December target."
  },
  {
    id: 4,
    title: "Medical Equipment",
    target: 200000,
    current: 5000,
    deadline: "Mar 2027",
    color: "from-blue-500 to-sky-400",
    progress: 2.5,
    status: "new",
    statusLabel: "New",
    aiMessage: "💡 Allocate LKR 18,000/mo from your income to reach this."
  }
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "ahead":
      return { bg: "#DCFCE7", color: "#14532D", label: "Ahead" };
    case "behind":
      return { bg: "#FEF3C7", color: "#78350F", label: "Needs attention" };
    case "new":
      return { bg: "#DBEAFE", color: "#1E3A8A", label: "New" };
    default:
      return { bg: "#DCFCE7", color: "#14532D", label: "On track" };
  }
};

export default function GoalsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredGoals = activeFilter === "all" 
    ? goals 
    : goals.filter(g => g.status === activeFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      

      {/* AI Goal Coach Banner */}
      <div className="bg-gradient-to-r from-[#1A1635] to-[#2D2756] rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 bg-[#5B4FE8]/30 rounded-lg flex items-center justify-center text-base flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[#C7C3F8] mb-0.5">AI Goal Coach</div>
          <div className="text-[12px] text-white/52 leading-relaxed">
            Saving an extra <strong className="text-[#9B93F5]">LKR 4,200/month</strong> (by cutting dining 30%) would hit all 3 goals by <strong className="text-[#9B93F5]">July 2026!</strong>
          </div>
        </div>
      </div>

      {/* Goals Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => {
          const statusStyle = getStatusStyles(goal.status);
          return (
            <div key={goal.id} className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-[14px] font-bold text-[#1A1635] tracking-[-0.2px]">{goal.title}</div>
                  <div className="text-[11px] text-[#8B87A8] mt-0.5">Target: {goal.deadline}</div>
                </div>
                <span 
                  className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full"
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {statusStyle.label}
                </span>
              </div>

              {/* Amounts */}
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="font-bold text-[#1A1635] font-mono">LKR {goal.current.toLocaleString()}</span>
                <span className="text-[#8B87A8] font-mono">of LKR {goal.target.toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-[#EAE8FB] rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${goal.color} rounded-full`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              {/* Meta Info */}
              <div className="flex justify-between text-[11px] text-[#8B87A8] mt-2 flex-wrap gap-1">
                <span>{goal.progress}% complete</span>
                <span>AI: {goal.status === "ahead" ? "Done May 2026 ✓" : goal.status === "behind" ? "Need LKR 6,500/mo more" : "Done Sep 2026"}</span>
              </div>

              {/* AI Insight Box */}
              <div className="bg-gradient-to-r from-[#EEF0FD] to-[#F0F7FF] border border-[#C7C3F8] rounded-lg px-3 py-2 mt-2.5 text-[12px] text-[#4A4568] leading-relaxed">
                <strong className="text-[#5B4FE8]">💡</strong> {goal.aiMessage}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}