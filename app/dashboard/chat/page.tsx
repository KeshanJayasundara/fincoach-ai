"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendAIMessage, type ChatMessage } from "@/actions/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faRobot,
  faBolt,
  faChartPie,
  faBullseye,
  faLightbulb,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

const SUGGESTIONS = [
  { icon: faChartPie,  text: "Show my spending breakdown" },
  { icon: faBullseye,  text: "How do I reach my goals faster?" },
  { icon: faLightbulb, text: "Tips to save more this month" },
  { icon: faEnvelope,  text: "Summarize my finances" },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id:      1,
      role:    "ai",
      content: "Hello! 👋 I'm FinCoach AI. I have access to your real financial data. Ask me anything about your spending, savings, or goals!",
    },
  ]);
  const [input,    setInput]    = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const buildHistory = (msgs: Message[]): ChatMessage[] =>
    msgs
      .slice(1)
      .map(m => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: Message = { id: Date.now(), role: "user", content };
    const updatedMessages  = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = buildHistory(updatedMessages);
      const result  = await sendAIMessage(history);

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: "ai", content: result.reply },
      ]);

      // Fire event so AppTopbar can update its queriesLeft display
      window.dispatchEvent(
        new CustomEvent("fincoach:queries-update", {
          detail: { queriesLeft: result.queriesLimit - result.queriesUsed },
        })
      );
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id:      Date.now() + 1,
          role:    "ai",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F7FF] min-h-0">

      {/* ── Messages ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3.5 bg-[#F8F7FF]"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* AI Avatar */}
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white shrink-0 mt-1">
                <FontAwesomeIcon icon={faRobot} className="text-xs" />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed
                ${msg.role === "user"
                  ? "bg-[#5B4FE8] text-white rounded-2xl rounded-br-none shadow-sm"
                  : "bg-white border border-[#EAE8FB] text-[#1A1635] rounded-2xl rounded-bl-none shadow-sm"
                }`}
            >
              {msg.role === "ai" && (
                <div className="text-[10px] text-[#8B87A8] mb-1.5 font-semibold flex items-center gap-1">
                  <FontAwesomeIcon icon={faRobot} className="text-[#9B93F5]" />
                  FinCoach AI
                </div>
              )}

              {msg.role === "ai" ? (
                <div className="
                  prose prose-sm max-w-none
                  prose-p:my-1 prose-p:leading-relaxed
                  prose-strong:text-[#3C3489] prose-strong:font-semibold
                  prose-ul:my-1 prose-ul:pl-4
                  prose-ol:my-1 prose-ol:pl-4
                  prose-li:my-0.5
                  prose-headings:text-[#1A1635]
                  text-[13px] text-[#1A1635]
                ">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span className="text-[13px]">{msg.content}</span>
              )}
            </div>

            {/* User Avatar */}
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                K
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white shrink-0">
              <FontAwesomeIcon icon={faRobot} className="text-xs" />
            </div>
            <div className="bg-white border border-[#EAE8FB] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-[#9B93F5] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#9B93F5] rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-[#9B93F5] rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Suggestion Pills ── */}
      <div className="px-3 sm:px-5 py-2.5 bg-white border-t border-[#EAE8FB] shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              onClick={() => sendMessage(s.text)}
              disabled={isTyping}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-[#4A4568] bg-white border border-[#D1CCFF] rounded-full hover:border-[#5B4FE8] hover:bg-[#EEF0FD] hover:text-[#3C3489] transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <FontAwesomeIcon icon={s.icon} className="text-[#9B93F5] text-[10px]" />
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ── */}
      <div className="flex gap-2 px-3 sm:px-5 py-3 bg-white border-t border-[#EAE8FB] shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your finances..."
          disabled={isTyping}
          className="flex-1 px-4 py-2.5 bg-[#F8F7FF] border border-[#D1CCFF] rounded-xl text-[13px] text-[#1A1635] outline-none focus:border-[#5B4FE8] focus:bg-white transition-all disabled:opacity-50 min-w-0"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 bg-[#5B4FE8] text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#7B72EC] active:bg-[#534AB7] transition-all shrink-0"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
        </button>
      </div>
    </div>
  );
}