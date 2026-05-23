// QuickAIInsights.tsx
"use client";

import { useRouter } from "next/navigation";

export default function QuickAIInsights() {
  const router = useRouter();

  const insights = [
    {
      text: "Your dining out jumped 68% this month vs March. Cutting it by 30% could save LKR 4,200 — reach your laptop goal 6 weeks early!",
    },
  ];

  const suggestions = [
    { emoji: "🤖", text: "Why did I overspend on food?" },
    { emoji: "📊", text: "Show me April vs March" },
    { emoji: "🎯", text: "How to reach my goals faster?" },
  ];

  return (
    <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
      <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px] mb-3">Quick AI insights</div>

      {/* AI Insight Box */}
      <div className="bg-gradient-to-r from-[#EEF0FD] to-[#F0F7FF] border border-[#C7C3F8] rounded-lg p-3 mb-3 text-[12px] text-[#4A4568] leading-relaxed">
        <strong className="text-[#5B4FE8]">💡 AI Coach says:</strong> {insights[0].text}
      </div>

      {/* Suggestion Buttons */}
      <div className="flex flex-col gap-1.5">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => router.push("/dashboard/chat")}
            className="text-left px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#D1CCFF] rounded-lg hover:border-[#5B4FE8] hover:bg-[#EEF0FD] hover:text-[#3C3489] transition-all"
          >
            {suggestion.emoji} {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}