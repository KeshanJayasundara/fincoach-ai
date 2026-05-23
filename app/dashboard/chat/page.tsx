"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content: "Hello Dr. Kasun! 👋 I've analyzed your April spending. Combined income is LKR 185,000, expenses LKR 92,400. Your savings rate is a healthy 50.1%. What would you like to explore?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking + response
    setTimeout(() => {
      const aiResponses = [
        "Your dining expenses increased by 68% this month. Cutting dining by 30% could save LKR 4,200/month — reaching your Emergency Fund goal 2 months early!",
        "Based on your current savings rate (50.1%), you can reach your Laptop goal by mid-May if you continue this way.",
        "I noticed you have two income sources (Doctor + Freelance). Want me to show a breakdown by role?",
        "Good news! Your emergency fund is growing steadily. You're on track to hit LKR 150,000 by September.",
        "💡 AI Coach says: Your dining out jumped 68% this month vs March. Cutting it by 30% could save LKR 4,200 — reach your laptop goal 6 weeks early!",
      ];

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F7FF]">
      {/* Chat Header - matches FinCoach topbar style */}
      <div className="border-b border-[#EAE8FB] bg-white px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-lg">
            🤖
          </div>
          <div>
            <div className="font-semibold text-[#1A1635] text-sm tracking-[-0.1px]">FinCoach AI</div>
            <div className="text-[10px] text-[#8B87A8] font-medium">Powered by Claude · Your real data</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF0FD] border border-[#C7C3F8] rounded-full cursor-pointer">
            <span className="text-sm">🏥</span>
            <span className="text-[11px] font-bold text-[#3C3489]">Healthcare ▾</span>
          </div>
          <div className="text-[11px] text-[#8B87A8] font-medium bg-[#F8F7FF] px-2 py-1 rounded-full">⚡ 3 queries left</div>
        </div>
      </div>

      {/* Messages Area - matches FinCoach chat-msgs style */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3.5 bg-[#F8F7FF]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-sm flex-shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed
                ${
                  msg.role === "user"
                    ? "bg-[#5B4FE8] text-white rounded-2xl rounded-br-none"
                    : "bg-white border border-[#EAE8FB] text-[#1A1635] rounded-2xl rounded-bl-none"
                }`}
            >
              {msg.role === "ai" && (
                <div className="text-[10px] text-[#8B87A8] mb-1 font-medium">FinCoach AI</div>
              )}
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                K
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-sm flex-shrink-0">
              🤖
            </div>
            <div className="bg-white border border-[#EAE8FB] rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#8B87A8] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#8B87A8] rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-[#8B87A8] rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion pills - matches FinCoach sug-row style */}
      <div className="flex gap-2 flex-wrap px-5 py-3 bg-white border-t border-[#EAE8FB]">
        {["📊 Role breakdown", "🎯 Reach goals faster", "💡 April tips", "📧 Send me a report"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setInput(suggestion);
              setTimeout(() => sendMessage(), 50);
            }}
            className="px-3 py-1.5 text-[11px] font-medium text-[#4A4568] bg-white border border-[#D1CCFF] rounded-full hover:border-[#5B4FE8] hover:bg-[#EEF0FD] hover:text-[#3C3489] transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Area - matches FinCoach chat-inp-area style */}
      <div className="flex gap-2 px-5 py-3 bg-white border-t border-[#EAE8FB]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your finances..."
          className="flex-1 px-4 py-2.5 bg-[#F8F7FF] border border-[#D1CCFF] rounded-xl text-[13px] text-[#1A1635] outline-none focus:border-[#5B4FE8] focus:bg-white transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-10 h-10 bg-[#5B4FE8] text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#7B72EC] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}