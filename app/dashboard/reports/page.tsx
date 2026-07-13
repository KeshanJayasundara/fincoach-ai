"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { generateMonthlyReport, getReportLogs } from "@/actions/reports";
import { BarChart3, Send, CheckCircle2, Mail, Loader2, History } from "lucide-react";

function getRecentMonths(count = 12) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "short", year: "numeric" }),
    };
  });
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const months = getRecentMonths(12);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const [sending, setSending] = useState(false);
  const [reportLogs, setReportLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Toast ──
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast(message);
    setToastType(type);
    window.setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadReportLogs();
  }, []);

  const loadReportLogs = async () => {
    setLoading(true);
    try {
      const logs = await getReportLogs();
      setReportLogs(logs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSendReport = async () => {
    setSending(true);
    try {
      const result = await generateMonthlyReport(selectedMonth);
      if (result.success) {
        showToast("Monthly report sent successfully");
        loadReportLogs();
      } else {
        // result.error carries the real, user-facing reason
        // (e.g. "already sent this month") — safe to show directly.
        showToast(result.error || "Failed to send report. Please try again.", "error");
      }
    } catch (err: any) {
      // Only truly unexpected failures land here now (e.g. "Unauthorized").
      showToast(err.message || "Something went wrong. Please try again.", "error");
    }
    setSending(false);
  };

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 bg-white border shadow-lg rounded-xl px-4 py-3 text-[13px] font-medium text-[#1A1635] animate-[toastIn_0.2s_ease] ${
            toastType === "success" ? "border-[#BBF7D0]" : "border-[#FECACA]"
          }`}
        >
          <CheckCircle2
            size={16}
            className={`flex-shrink-0 ${toastType === "success" ? "text-[#16A34A]" : "text-[#DC2626]"}`}
          />
          {toast}
        </div>
      )}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="space-y-4">
        {/* 2 Column Layout for Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Request Report Card */}
          <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#EAE8FB]">
              <div className="text-[14px] font-bold text-[#1A1635] tracking-[-0.1px]">Request a report</div>
              <span className="inline-flex items-center px-2 py-0.5 bg-[#EEF0FD] text-[#3C3489] text-[11px] font-semibold rounded-full">
                On-demand
              </span>
            </div>

            <div className="p-4">
              <div className="text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.08em] mb-2">Select month</div>

              {/* Month Chips */}
              <div className="flex gap-1.5 flex-wrap mb-4">
                {months.map((month) => (
                  <button
                    key={month.value}
                    onClick={() => setSelectedMonth(month.value)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border
                      ${selectedMonth === month.value
                        ? "bg-[#5B4FE8] text-white border-[#5B4FE8]"
                        : "bg-white border-[#D1CCFF] text-[#4A4568] hover:border-[#5B4FE8] hover:bg-[#EEF0FD]"
                      }`}
                  >
                    {month.label}
                  </button>
                ))}
              </div>

              {/* Combined Report Card */}
              <div className="bg-[#EEF0FD] border border-[#C7C3F8] rounded-xl p-3.5 flex items-center gap-3 mb-3.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#3C3489]">Combined Report</div>
                  <div className="text-[11px] text-[#534AB7]">All roles · Income + Expenses together</div>
                </div>
                <div className="text-[13px] font-bold text-[#3C3489] flex-shrink-0">Selected</div>
              </div>

              {/* Info Box */}
              <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-lg px-3 py-2 mb-3.5 flex items-start gap-2 text-[12px] text-[#14532D]">
                <CheckCircle2 className="w-4 h-4 mt-[1px] flex-shrink-0 text-[#16A34A]" strokeWidth={2.25} />
                <span>
                  <strong>One report per month</strong> — Auto-sent on the last day. Request anytime for any past month.
                </span>
              </div>

              {/* Email Info */}
              <div className="bg-[#F8F7FF] rounded-lg px-3 py-2.5 mb-3.5 flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-[2px] flex-shrink-0 text-[#8B87A8]" strokeWidth={2} />
                <div>
                  <div className="text-[12px] text-[#8B87A8]">
                    Sending to: <strong className="text-[#1A1635]">{session?.user?.email || "your account email"}</strong>
                  </div>
                  <div className="text-[11px] text-[#8B87A8] mt-0.5">Arrives in inbox within ~30 seconds</div>
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendReport}
                disabled={sending}
                className="w-full bg-[#5B4FE8] hover:bg-[#7B72EC] text-white py-2.5 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                    Sending Report...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={2.5} />
                    Send Combined Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report History Card */}
          <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#EAE8FB]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#8B87A8]" strokeWidth={2.25} />
                <div className="text-[14px] font-bold text-[#1A1635] tracking-[-0.1px]">Report history</div>
              </div>
            </div>

            <div className="divide-y divide-[#EAE8FB]">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-3 bg-[#EEF0FD] rounded w-2/5" />
                        <div className="h-2.5 bg-[#F1F0FA] rounded w-3/5" />
                      </div>
                      <div className="h-4 w-14 bg-[#EEF0FD] rounded-full flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : reportLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-16 h-16 bg-[#EEF0FD] rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-[#9B93F5]" strokeWidth={2} />
                  </div>
                  <p className="text-[13px] text-[#8B87A8]">No reports sent yet</p>
                  <p className="text-[12px] text-[#C7C3F8]">Sent reports will show up here</p>
                </div>
              ) : (
                reportLogs.map((report) => (
                  <div key={report.id} className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-[#5B4FE8]" strokeWidth={2.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#1A1635]">
                        {report.month} — Combined
                      </div>
                      <div className="text-[11px] text-[#8B87A8]">
                        Sent on {new Date(report.sentAt).toLocaleDateString()} ·{" "}
                        {new Date(report.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                        report.sentVia === "manual"
                          ? "bg-[#EEF0FD] text-[#3C3489]"
                          : "bg-[#DCFCE7] text-[#14532D]"
                      }`}
                    >
                      {report.sentVia === "manual" ? "Manual" : "Auto"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}