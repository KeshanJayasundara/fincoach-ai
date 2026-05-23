// page.tsx
"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    monthlyReport: true,
    spendingAlerts: true,
    goalMilestones: false,
    weeklyDigest: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const roles = [
    { emoji: "🏥", name: "Healthcare", type: "Primary", income: "Doctor · Fixed income" },
    { emoji: "💻", name: "Freelancer", type: "Additional", income: "IT Consultant · Variable" },
  ];

  return (
    <div className="space-y-4">
      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column - Profile & Roles */}
        <div className="space-y-4">
          {/* Profile Section */}
          <div>
            <div className="text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.08em] mb-2">Profile</div>
            <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Full name</div>
                  <div className="text-[11px] text-[#8B87A8]">Dr. Kasun Silva</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all">
                  Edit
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Email</div>
                  <div className="text-[11px] text-[#8B87A8]">kasun@gmail.com</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all">
                  Edit
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Base currency</div>
                  <div className="text-[11px] text-[#8B87A8]">LKR — Sri Lankan Rupee</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Password</div>
                  <div className="text-[11px] text-[#8B87A8]">Last changed 3 months ago</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* My Roles Section */}
          <div>
            <div className="text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.08em] mb-2">My roles</div>
            <div className="space-y-1.5">
              {roles.map((role, idx) => (
                <div key={idx} className="bg-white border border-[#EAE8FB] rounded-xl p-3.5 flex items-center gap-2.5 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
                  <div className="w-10 h-10 rounded-lg bg-[#EEF0FD] flex items-center justify-center text-base flex-shrink-0">
                    {role.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#1A1635]">
                      {role.name}
                      {role.type === "Primary" && (
                        <span className="inline-flex items-center ml-1.5 px-1.5 py-0.5 bg-[#EEF0FD] text-[#3C3489] text-[9px] font-bold rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8B87A8]">{role.income}</div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button className="px-3 py-1 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all">
                      Edit
                    </button>
                    {role.type !== "Primary" && (
                      <button className="px-3 py-1 text-[12px] font-medium text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded-lg hover:bg-[#FECACA] transition-all">
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-2 px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#D1CCFF] rounded-xl hover:bg-[#EEF0FD] hover:border-[#5B4FE8] transition-all">
              + Add another role
            </button>
          </div>
        </div>

        {/* Right Column - Notifications & Plan */}
        <div className="space-y-4">
          {/* Notifications Section */}
          <div>
            <div className="text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.08em] mb-2">Notifications</div>
            <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Monthly auto report</div>
                  <div className="text-[11px] text-[#8B87A8]">Sent last day of month</div>
                </div>
                <button
                  onClick={() => toggleNotification("monthlyReport")}
                  className={`w-9 h-5 rounded-full relative transition-all ${notifications.monthlyReport ? "bg-[#5B4FE8]" : "bg-[#EAE8FB]"}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${notifications.monthlyReport ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Spending alerts</div>
                  <div className="text-[11px] text-[#8B87A8]">When spending exceeds budget</div>
                </div>
                <button
                  onClick={() => toggleNotification("spendingAlerts")}
                  className={`w-9 h-5 rounded-full relative transition-all ${notifications.spendingAlerts ? "bg-[#5B4FE8]" : "bg-[#EAE8FB]"}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${notifications.spendingAlerts ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Goal milestones</div>
                  <div className="text-[11px] text-[#8B87A8]">At 50%, 75%, 100% completion</div>
                </div>
                <button
                  onClick={() => toggleNotification("goalMilestones")}
                  className={`w-9 h-5 rounded-full relative transition-all ${notifications.goalMilestones ? "bg-[#5B4FE8]" : "bg-[#EAE8FB]"}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${notifications.goalMilestones ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Weekly digest</div>
                  <div className="text-[11px] text-[#8B87A8]">Weekly spending summary email</div>
                </div>
                <button
                  onClick={() => toggleNotification("weeklyDigest")}
                  className={`w-9 h-5 rounded-full relative transition-all ${notifications.weeklyDigest ? "bg-[#5B4FE8]" : "bg-[#EAE8FB]"}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${notifications.weeklyDigest ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Plan & Billing Section */}
          <div>
            <div className="text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.08em] mb-2">Plan &amp; billing</div>
            <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Current plan</div>
                  <div className="text-[11px] text-[#8B87A8]">Free · 10 AI queries/month</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#5B4FE8] rounded-lg hover:bg-[#7B72EC] transition-all">
                  Upgrade
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">AI queries used</div>
                  <div className="text-[11px] text-[#8B87A8]">7 of 10 this month</div>
                </div>
                <div className="w-20">
                  <div className="h-1.5 bg-[#EAE8FB] rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-[#D97706] rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Reports today</div>
                  <div className="text-[11px] text-[#8B87A8]">1 of 1 on-demand reports used</div>
                </div>
                <div className="w-20">
                  <div className="h-1.5 bg-[#EAE8FB] rounded-full overflow-hidden">
                    <div className="h-full w-full bg-[#DC2626] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <div className="text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.08em] mb-2">Danger zone</div>
            <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#DC2626]">Delete account</div>
                  <div className="text-[11px] text-[#8B87A8]">Permanently remove all data</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded-lg hover:bg-[#FECACA] transition-all">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}