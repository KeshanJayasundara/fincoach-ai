"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { X, Check } from "lucide-react";
import { ROLE_ICON_OPTIONS, getRoleIcon } from "@/lib/roleIcons";
import ProfessionCard from "@/components/onboarding/ProfessionCard";

type Role = {
  id: string;
  roleName: string;
  displayName: string;
  emoji: string | null; // icon key (e.g. "doctor") or "other"
  isPrimary: boolean;
};

export default function SettingsPage() {
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState({
    monthlyReport: true,
    spendingAlerts: true,
    goalMilestones: false,
    weeklyDigest: false,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Modal state (shared for add + edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formRoleName, setFormRoleName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formIconKey, setFormIconKey] = useState(ROLE_ICON_OPTIONS[0].key);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadRoles = () => {
    setLoadingRoles(true);
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data.roles || []))
      .catch(() => setRoleError("Failed to load roles"))
      .finally(() => setLoadingRoles(false));
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const archiveRole = async (id: string) => {
    const prev = roles;
    setRoles((r) => r.filter((role) => role.id !== id));

    const res = await fetch(`/api/roles/${id}`, { method: "PATCH" });
    if (!res.ok) {
      setRoles(prev);
      const data = await res.json().catch(() => ({}));
      setRoleError(data.error || "Failed to archive role");
    }
  };

  const openAddModal = () => {
    if (roles.length >= 2) return;
    setModalMode("add");
    setEditingId(null);
    setFormRoleName(ROLE_ICON_OPTIONS[0].name);
    setFormDisplayName("");
    setFormIconKey(ROLE_ICON_OPTIONS[0].key);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setModalMode("edit");
    setEditingId(role.id);
    setFormRoleName(role.roleName);
    setFormDisplayName(role.displayName);
    setFormIconKey(role.emoji || ROLE_ICON_OPTIONS[0].key);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submitModal = async () => {
    if (!formDisplayName.trim() || (modalMode === "add" && !formRoleName.trim())) {
      setFormError("Please fill in all fields");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (modalMode === "add") {
        const res = await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleName: formRoleName.trim(),
            displayName: formDisplayName.trim(),
            emoji: formIconKey,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to add role");
        }
      } else if (editingId) {
        const res = await fetch(`/api/roles/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: formDisplayName.trim(),
            emoji: formIconKey,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update role");
        }
      }

      setModalOpen(false);
      loadRoles();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const isOtherSelected = formIconKey === "other";

  return (
    <div className="space-y-4">
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
                  <div className="text-[11px] text-[#8B87A8]">{session?.user?.name || "—"}</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all">
                  Edit
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Email</div>
                  <div className="text-[11px] text-[#8B87A8]">{session?.user?.email || "—"}</div>
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

          {/* My Roles Section - DYNAMIC */}
          <div>
            <div className="text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.08em] mb-2">My roles</div>

            {roleError && (
              <div className="text-[11px] text-[#DC2626] mb-1.5 px-1">{roleError}</div>
            )}

            {loadingRoles ? (
              <div className="space-y-1.5">
                {[1, 2].map((i) => (
                  <div key={i} className="h-[62px] bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : roles.length === 0 ? (
              <div className="text-[12px] text-[#8B87A8] px-1 py-2">No roles yet.</div>
            ) : (
              <div className="space-y-1.5">
                {roles.map((role) => {
                  const RoleIcon = getRoleIcon(role.emoji);
                  return (
                    <div
                      key={role.id}
                      className="bg-white border border-[#EAE8FB] rounded-xl p-3.5 flex items-center gap-2.5 shadow-[0_1px_3px_rgba(91,79,232,0.07)]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#EEF0FD] flex items-center justify-center flex-shrink-0">
                        <RoleIcon size={18} className="text-[#5B4FE8]" strokeWidth={2.25} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[#1A1635]">
                          {role.roleName}
                          {role.isPrimary && (
                            <span className="inline-flex items-center ml-1.5 px-1.5 py-0.5 bg-[#EEF0FD] text-[#3C3489] text-[9px] font-bold rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8B87A8]">{role.displayName}</div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openEditModal(role)}
                          className="px-3 py-1 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all"
                        >
                          Edit
                        </button>
                        {!role.isPrimary && (
                          <button
                            onClick={() => archiveRole(role.id)}
                            className="px-3 py-1 text-[12px] font-medium text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded-lg hover:bg-[#FECACA] transition-all"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              disabled={roles.length >= 2 || loadingRoles}
              onClick={openAddModal}
              className="w-full mt-2 px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#D1CCFF] rounded-xl hover:bg-[#EEF0FD] hover:border-[#5B4FE8] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {roles.length >= 2 ? "Maximum 2 roles reached" : "+ Add another role"}
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

      {/* Add / Edit Role Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-[480px] max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[15px] font-bold text-[#1A1635]">
                {modalMode === "add" ? "Add a role" : "Edit role"}
              </div>
              <button onClick={closeModal} className="text-[#8B87A8] leading-none">
                <X size={18} strokeWidth={2.25} />
              </button>
            </div>

            {/* Icon picker — same ProfessionCard used in onboarding, includes "Other" */}
            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">Choose an icon</label>
              <div className="grid grid-cols-4 gap-1.5">
                {ROLE_ICON_OPTIONS.map(({ key, icon, name }) => (
                  <ProfessionCard
                    key={key}
                    icon={icon}
                    name={name}
                    isSelected={formIconKey === key}
                    onClick={() => {
                      setFormIconKey(key);
                      if (key !== "other") setFormRoleName(name);
                      else setFormRoleName("");
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Custom role name — shown only when "Other" is selected, and only in add mode */}
            {isOtherSelected && modalMode === "add" && (
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">Custom role name</label>
                <input
                  className="w-full px-3 py-2 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
                  placeholder="e.g. Photographer, Pilot, Chef..."
                  value={formRoleName}
                  onChange={(e) => setFormRoleName(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">Description</label>
              <input
                className="w-full px-3 py-2 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
                placeholder="e.g. IT Consultant · Variable"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
              />
            </div>

            {formError && <div className="text-[11px] text-[#DC2626] mb-2">{formError}</div>}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitModal}
                disabled={saving}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#5B4FE8] rounded-lg hover:bg-[#7B72EC] transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : modalMode === "add" ? "Add role" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}