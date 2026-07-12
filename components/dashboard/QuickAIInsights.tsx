// QuickAIInsights.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getQuickInsight } from "@/actions/quickInsight";
import { Bot, BarChart3, Target, Lightbulb } from "lucide-react";

const CACHE_KEY      = "fincoach_quick_insight";
const CACHE_TIME_KEY = "fincoach_quick_insight_time";
const ONE_HOUR_MS    = 60 * 60 * 1000;

const suggestions = [
  { icon: Bot, text: "Why did I overspend on food?" },
  { icon: BarChart3, text: "Show me this month vs last month" },
  { icon: Target, text: "How to reach my goals faster?" },
];

export default function QuickAIInsights() {
  const router = useRouter();
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached   = localStorage.getItem(CACHE_KEY);
    const cachedAt = localStorage.getItem(CACHE_TIME_KEY);
    const isFresh  = cachedAt && Date.now() - Number(cachedAt) < ONE_HOUR_MS;

    if (cached && isFresh) {
      setInsight(cached);
      setLoading(false);
      return;
    }

    getQuickInsight().then(text => {
      setInsight(text);
      localStorage.setItem(CACHE_KEY, text);
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
      <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px] mb-3">Quick AI insights</div>

      {/* AI Insight Box */}
      <div className="bg-gradient-to-r from-[#EEF0FD] to-[#F0F7FF] border border-[#C7C3F8] rounded-lg p-3 mb-3 text-[12px] text-[#4A4568] leading-relaxed min-h-[56px] flex items-start gap-1.5">
        <Lightbulb className="w-3.5 h-3.5 mt-[2px] flex-shrink-0 text-[#5B4FE8]" strokeWidth={2.25} />
        <span>
          <strong className="text-[#5B4FE8]">AI Coach says:</strong>{" "}
          {loading ? (
            <span className="inline-flex items-center gap-1 text-[#9B93F5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4BFFF] animate-bounce inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#9B93F5] animate-bounce inline-block [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7B72EC] animate-bounce inline-block [animation-delay:0.3s]" />
            </span>
          ) : (
            insight
          )}
        </span>
      </div>

      {/* Suggestion Buttons */}
      <div className="flex flex-col gap-1.5">
        {suggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={idx}
              onClick={() => router.push("/dashboard/chat")}
              className="text-left px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#D1CCFF] rounded-lg hover:border-[#5B4FE8] hover:bg-[#EEF0FD] hover:text-[#3C3489] transition-all flex items-center gap-2"
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0 text-[#8B87A8]" strokeWidth={2.25} />
              {suggestion.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}