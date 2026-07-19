"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getQuickInsight } from "@/actions/quickInsight";
import { Bot, Lightbulb } from "lucide-react";

const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 min — server still enforces its own 1hr freshness window

export default function QuickAIInsights() {
  const router = useRouter();
  const [insight, setInsight] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refresh = () => {
    getQuickInsight()
      .then(({ text, suggestions }) => {
        if (!mounted.current) return;
        setInsight(text);
        setSuggestions(suggestions ?? []);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  };

  useEffect(() => {
    mounted.current = true;
    refresh();

    const interval = setInterval(refresh, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const askAboutThis = (question: string) => {
    router.push(`/dashboard/chat?q=${encodeURIComponent(question)}`);
  };

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

      {/* Suggestion Buttons — dynamic, derived per-user by getQuickInsight */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {suggestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => askAboutThis(question)}
              className="text-left px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#D1CCFF] rounded-lg hover:border-[#5B4FE8] hover:bg-[#EEF0FD] hover:text-[#3C3489] transition-all flex items-center gap-2"
            >
              <Bot className="w-3.5 h-3.5 flex-shrink-0 text-[#8B87A8]" strokeWidth={2.25} />
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}