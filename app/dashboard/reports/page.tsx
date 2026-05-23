// page.tsx
"use client";

import { useState } from "react";

const reportHistory = [
  { month: "April 2026 — Combined", sent: "Manual · Today · 3:12 PM", status: "manual" },
  { month: "March 2026 — Combined", sent: "Auto · Mar 31", status: "auto" },
  { month: "February 2026 — Combined", sent: "Auto · Feb 28", status: "auto" },
  { month: "January 2026 — Combined", sent: "Auto · Jan 31", status: "auto" },
];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("Apr 2026");

  const months = ["Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026", "Dec 2025"];

  return (
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
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border
                    ${selectedMonth === month 
                      ? "bg-[#5B4FE8] text-white border-[#5B4FE8]" 
                      : "bg-white border-[#D1CCFF] text-[#4A4568] hover:border-[#5B4FE8] hover:bg-[#EEF0FD]"
                    }`}
                >
                  {month}
                </button>
              ))}
            </div>

            {/* Combined Report Card */}
            <div className="bg-[#EEF0FD] border border-[#C7C3F8] rounded-xl p-3.5 flex items-center gap-3 mb-3.5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5B4FE8] to-[#9B93F5] flex items-center justify-center text-lg flex-shrink-0">
                📊
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#3C3489]">Combined Report</div>
                <div className="text-[11px] text-[#534AB7]">All roles · Income + Expenses together</div>
              </div>
              <div className="text-[13px] font-bold text-[#3C3489] flex-shrink-0">Selected</div>
            </div>

            {/* Info Box */}
            <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-lg px-3 py-2 mb-3.5 text-[12px] text-[#14532D]">
              ✅ <strong>One report per month</strong> — Auto-sent on the last day. Request anytime for any past month.
            </div>

            {/* Email Info */}
            <div className="bg-[#F8F7FF] rounded-lg px-3 py-2.5 mb-3.5">
              <div className="text-[12px] text-[#8B87A8]">Sending to: <strong className="text-[#1A1635]">kasun@gmail.com</strong></div>
              <div className="text-[11px] text-[#8B87A8] mt-0.5">Arrives in inbox within ~30 seconds</div>
            </div>

            {/* Send Button */}
            <button className="w-full bg-[#5B4FE8] hover:bg-[#7B72EC] text-white py-2.5 rounded-lg text-[14px] font-semibold transition-all">
              📧 Send Combined Report
            </button>
          </div>
        </div>

        {/* Report History Card */}
        <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#EAE8FB]">
            <div className="text-[14px] font-bold text-[#1A1635] tracking-[-0.1px]">Report history</div>
          </div>
          
          <div className="divide-y divide-[#EAE8FB]">
            {reportHistory.map((report, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] flex items-center justify-center text-sm flex-shrink-0">
                  📊
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1A1635]">{report.month}</div>
                  <div className="text-[11px] text-[#8B87A8]">{report.sent}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                  report.status === "manual" 
                    ? "bg-[#EEF0FD] text-[#3C3489]" 
                    : "bg-[#DCFCE7] text-[#14532D]"
                }`}>
                  {report.status === "manual" ? "Manual" : "Auto"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}