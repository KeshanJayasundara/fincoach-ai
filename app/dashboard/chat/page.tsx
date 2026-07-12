"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendAIMessage, getAIUsage, getChatHistory, type ChatMessage } from "@/actions/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faRobot,
  faChartPie,
  faBullseye,
  faLightbulb,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const WELCOME_MESSAGE: Message = {
  id:      "welcome",
  role:    "ai",
  content: "Hello! 👋 I'm FinCoach AI. I have access to your real financial data. Ask me anything about your spending, savings, or goals!",
};

const SUGGESTIONS = [
  { icon: faChartPie,  text: "Show my spending breakdown" },
  { icon: faBullseye,  text: "How do I reach my goals faster?" },
  { icon: faLightbulb, text: "Tips to save more this month" },
  { icon: faEnvelope,  text: "Summarize my finances" },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input,    setInput]    = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [queriesUsed,  setQueriesUsed]  = useState(0);
  const [queriesLimit, setQueriesLimit] = useState(10);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Fetch current usage + this month's saved chat history on mount.
  useEffect(() => {
    getAIUsage()
      .then(({ queriesUsed, queriesLimit }) => {
        setQueriesUsed(queriesUsed);
        setQueriesLimit(queriesLimit);
      })
      .catch(() => {
        // Silently ignore — chat still works, count just won't be shown accurately.
      });

    getChatHistory()
      .then((history) => {
        if (history.length > 0) {
          setMessages([
            WELCOME_MESSAGE,
            ...history.map((m) => ({
              id:      m.id,
              role:    (m.role === "user" ? "user" : "ai") as "user" | "ai",
              content: m.content,
            })),
          ]);
        }
      })
      .catch(() => {
        // Silently ignore — falls back to just the welcome message.
      })
      .finally(() => setIsLoadingHistory(false));
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const buildHistory = (msgs: Message[]): ChatMessage[] =>
    msgs.slice(1).map(m => ({
      role:    m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  const limitReached = queriesUsed >= queriesLimit;

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping || limitReached) return;

    const userMsg: Message = { id: `local-${Date.now()}`, role: "user", content };
    const updatedMessages  = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = buildHistory(updatedMessages);
      const result  = await sendAIMessage(history);

      setMessages(prev => [
        ...prev,
        { id: `local-${Date.now() + 1}`, role: "ai", content: result.reply },
      ]);

      setQueriesUsed(result.queriesUsed);
      setQueriesLimit(result.queriesLimit);

      window.dispatchEvent(
        new CustomEvent("fincoach:queries-update", {
          detail: { queriesLeft: result.queriesLimit - result.queriesUsed },
        })
      );
    } catch {
      setMessages(prev => [
        ...prev,
        { id: `local-${Date.now() + 1}`, role: "ai", content: "Sorry, something went wrong. Please try again." },
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
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4 bg-[#F8F7FF]"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-[#C4BFFF] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#9B93F5] rounded-full animate-bounce [animation-delay:0.15s]" />
              <div className="w-2 h-2 bg-[#7B72EC] rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI Avatar */}
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <FontAwesomeIcon icon={faRobot} className="text-xs" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] text-[13px] leading-relaxed
                  ${msg.role === "user"
                    ? "bg-[#5B4FE8] text-white rounded-2xl rounded-br-none shadow-sm px-3.5 py-2.5"
                    : "bg-white border border-[#EAE8FB] text-[#1A1635] rounded-2xl rounded-bl-none shadow-sm overflow-hidden"
                  }`}
              >
                {/* AI bubble header */}
                {msg.role === "ai" && (
                  <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1.5 border-b border-[#F0EEFF]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B93F5]" />
                    <span className="text-[10px] text-[#8B87A8] font-semibold tracking-wide uppercase">FinCoach AI</span>
                  </div>
                )}

                {/* Content */}
                <div className={msg.role === "ai" ? "px-3.5 py-2.5" : ""}>
                  {msg.role === "ai" ? (
                    <div className="
                      prose prose-sm max-w-none
                      prose-p:my-1.5 prose-p:leading-relaxed prose-p:text-[13px] prose-p:text-[#1A1635]
                      prose-strong:text-[#3C3489] prose-strong:font-semibold
                      prose-em:text-[#5B4FE8] prose-em:not-italic prose-em:font-normal
                      prose-ul:my-1.5 prose-ul:pl-4 prose-ul:space-y-1
                      prose-ol:my-1.5 prose-ol:pl-4 prose-ol:space-y-1
                      prose-li:text-[13px] prose-li:text-[#1A1635] prose-li:leading-relaxed
                      prose-headings:text-[#1A1635] prose-headings:font-semibold
                      prose-h2:text-[13px] prose-h2:mt-3 prose-h2:mb-2 prose-h2:pb-1 prose-h2:border-b prose-h2:border-[#EAE8FB]
                      prose-h3:text-[12px] prose-h3:mt-2 prose-h3:mb-1 prose-h3:text-[#5B4FE8]
                      prose-hr:border-[#EAE8FB] prose-hr:my-2
                      prose-code:text-[#5B4FE8] prose-code:bg-[#F0EEFF] prose-code:px-1 prose-code:rounded prose-code:text-[11px]
                    ">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ children }) => (
                            <h2 className="text-[13px] font-semibold text-[#1A1635] mt-3 mb-2 pb-1.5 border-b border-[#EAE8FB] flex items-center gap-1.5">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-[12px] font-semibold text-[#5B4FE8] mt-2.5 mb-1">
                              {children}
                            </h3>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-[#3C3489]">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="not-italic text-[#6B64A8] text-[12px]">{children}</em>
                          ),
                          ul: ({ children }) => (
                            <ul className="my-1.5 pl-3 space-y-1 list-none">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="my-1.5 pl-4 space-y-1 list-decimal">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-[13px] leading-relaxed flex gap-1.5 items-start before:content-['▸'] before:text-[#9B93F5] before:text-[10px] before:mt-0.5 before:shrink-0">
                              <span>{children}</span>
                            </li>
                          ),
                          p: ({ children }) => (
                            <p className="my-1.5 leading-relaxed text-[13px]">{children}</p>
                          ),
                          hr: () => (
                            <hr className="border-[#EAE8FB] my-2.5" />
                          ),
                          code: ({ children }) => (
                            <code className="text-[#5B4FE8] bg-[#F0EEFF] px-1.5 py-0.5 rounded text-[11px] font-mono">
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-[#9B93F5] pl-3 my-2 text-[#6B64A8] text-[12px] italic">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="text-[13px]">{msg.content}</span>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 shadow-sm">
                  K
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-white shrink-0 shadow-sm">
              <FontAwesomeIcon icon={faRobot} className="text-xs" />
            </div>
            <div className="bg-white border border-[#EAE8FB] rounded-2xl rounded-bl-none shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1.5 border-b border-[#F0EEFF]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9B93F5]" />
                <span className="text-[10px] text-[#8B87A8] font-semibold tracking-wide uppercase">FinCoach AI</span>
              </div>
              <div className="px-4 py-3 flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-[#C4BFFF] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#9B93F5] rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-[#7B72EC] rounded-full animate-bounce [animation-delay:0.3s]" />
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
              disabled={isTyping || limitReached}
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
          placeholder={limitReached ? "Monthly limit reached..." : "Ask about your finances..."}
          disabled={isTyping || limitReached}
          className="flex-1 px-4 py-2.5 bg-[#F8F7FF] border border-[#D1CCFF] rounded-xl text-[13px] text-[#1A1635] outline-none focus:border-[#5B4FE8] focus:bg-white transition-all disabled:opacity-50 min-w-0"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping || limitReached}
          className="w-10 h-10 bg-[#5B4FE8] text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#7B72EC] active:bg-[#534AB7] transition-all shrink-0"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
        </button>
      </div>
    </div>
  );
}