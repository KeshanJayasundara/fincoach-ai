"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { X, Check, AlertTriangle, Loader2, Eye, EyeOff, Search, Pencil, CheckCircle2 } from "lucide-react";
import { ROLE_ICON_OPTIONS, getRoleIcon } from "@/lib/roleIcons";
import ProfessionCard from "@/components/onboarding/ProfessionCard";
import {
  deleteAccount,
  updateName,
  updateEmail,
  updateCurrency,
  updatePassword,
  getNotificationSettings,
  updateNotificationSetting,
  type NotificationSettings,
} from "@/actions/settings";
import { ALL_CURRENCIES, getCurrencyDisplayName } from "@/lib/currencies";

type Role = {
  id: string;
  roleName: string;
  displayName: string;
  emoji: string | null; // icon key (e.g. "doctor") or "other"
  isPrimary: boolean;
};

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const [notifications, setNotifications] = useState<NotificationSettings>({
    monthlyReport: true,
    goalMilestones: false,
    weeklyDigest: false,
  });
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [savingKey, setSavingKey] = useState<keyof NotificationSettings | null>(null);

  useEffect(() => {
    getNotificationSettings()
      .then(setNotifications)
      .catch(() => showToast("Couldn't load notification settings"))
      .finally(() => setLoadingNotifications(false));
  }, []);

  // ── Profile edit modals ──
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const toggleNotification = async (key: keyof NotificationSettings) => {
    const newValue = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: newValue }));
    setSavingKey(key);
    try {
      await updateNotificationSetting(key, newValue);
    } catch {
      // Revert on failure so the switch reflects what's actually saved.
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
      showToast("Failed to save. Please try again.");
    } finally {
      setSavingKey(null);
    }
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

  // ── Full name ──
  const openNameModal = () => {
    setNameInput(session?.user?.name || "");
    setNameError(null);
    setShowNameModal(true);
  };

  const submitName = async () => {
    if (!nameInput.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    setSavingName(true);
    setNameError(null);
    try {
      await updateName(nameInput.trim());
      await updateSession(); // refresh session so the new name shows immediately
      setShowNameModal(false);
      showToast("Name updated successfully");
    } catch (err: any) {
      setNameError(err.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  // ── Email ──
  const openEmailModal = () => {
    setEmailInput(session?.user?.email || "");
    setEmailPassword("");
    setShowEmailPassword(false);
    setEmailError(null);
    setShowEmailModal(true);
  };

  const submitEmail = async () => {
    if (!emailInput.trim()) {
      setEmailError("Email cannot be empty.");
      return;
    }
    setSavingEmail(true);
    setEmailError(null);
    try {
      await updateEmail(emailInput.trim(), emailPassword);
      await updateSession();
      setShowEmailModal(false);
      showToast("Email updated successfully");
    } catch (err: any) {
      setEmailError(err.message || "Failed to update email.");
    } finally {
      setSavingEmail(false);
    }
  };

  // ── Base currency ──
  const openCurrencyModal = () => {
    setSelectedCurrency(session?.user?.currency || "USD");
    setCurrencySearch("");
    setCurrencyError(null);
    setShowCurrencyModal(true);
  };

  const submitCurrency = async () => {
    setSavingCurrency(true);
    setCurrencyError(null);
    try {
      await updateCurrency(selectedCurrency);
      await updateSession();
      setShowCurrencyModal(false);
      showToast("Currency updated successfully");
    } catch (err: any) {
      setCurrencyError(err.message || "Failed to update currency.");
    } finally {
      setSavingCurrency(false);
    }
  };

  const filteredCurrencies = currencySearch.trim()
    ? ALL_CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
          c.name.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : ALL_CURRENCIES;

  // ── Password ──
  const openPasswordModal = () => {
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setPasswordError(null);
    setShowPasswordModal(true);
  };

  const submitPassword = async () => {
    if (newPasswordInput.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError("New passwords don't match.");
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    try {
      await updatePassword(currentPasswordInput, newPasswordInput);
      setShowPasswordModal(false);
      showToast("Password updated successfully");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }
    if (!deletePassword) {
      setDeleteError("Please enter your current password.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccount(deletePassword);
      // Account + all related data is gone — sign out and send them home.
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-white border border-[#BBF7D0] shadow-lg rounded-xl px-4 py-3 text-[13px] font-medium text-[#1A1635] animate-[toastIn_0.2s_ease]">
          <CheckCircle2 size={16} className="text-[#16A34A] flex-shrink-0" />
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
                <button
                  onClick={openNameModal}
                  className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all"
                >
                  Edit
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Email</div>
                  <div className="text-[11px] text-[#8B87A8]">{session?.user?.email || "—"}</div>
                </div>
                <button
                  onClick={openEmailModal}
                  className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all"
                >
                  Edit
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Base currency</div>
                  <div className="text-[11px] text-[#8B87A8]">
                    {session?.user?.currency || "USD"} — {getCurrencyDisplayName(session?.user?.currency || "USD")}
                  </div>
                </div>
                <button
                  onClick={openCurrencyModal}
                  className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Password</div>
                  <div className="text-[11px] text-[#8B87A8]">Keep your account secure</div>
                </div>
                <button
                  onClick={openPasswordModal}
                  className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all"
                >
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
            {loadingNotifications ? (
              <div className="bg-white border border-[#EAE8FB] rounded-xl overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[54px] border-b border-[#EAE8FB] last:border-b-0 animate-pulse bg-[#F8F7FF]" />
                ))}
              </div>
            ) : (
            <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Monthly auto report</div>
                  <div className="text-[11px] text-[#8B87A8]">Sent last day of month</div>
                </div>
                <button
                  onClick={() => toggleNotification("monthlyReport")}
                  disabled={savingKey === "monthlyReport"}
                  className={`w-9 h-5 rounded-full relative transition-all disabled:opacity-50 ${notifications.monthlyReport ? "bg-[#5B4FE8]" : "bg-[#EAE8FB]"}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${notifications.monthlyReport ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8FB]">
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1635]">Goal milestones</div>
                  <div className="text-[11px] text-[#8B87A8]">At 50%, 75%, 100% completion</div>
                </div>
                <button
                  onClick={() => toggleNotification("goalMilestones")}
                  disabled={savingKey === "goalMilestones"}
                  className={`w-9 h-5 rounded-full relative transition-all disabled:opacity-50 ${notifications.goalMilestones ? "bg-[#5B4FE8]" : "bg-[#EAE8FB]"}`}
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
                  disabled={savingKey === "weeklyDigest"}
                  className={`w-9 h-5 rounded-full relative transition-all disabled:opacity-50 ${notifications.weeklyDigest ? "bg-[#5B4FE8]" : "bg-[#EAE8FB]"}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${notifications.weeklyDigest ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
            )}
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
                <button
                  onClick={() => {
                    setDeleteConfirmText("");
                    setDeletePassword("");
                    setShowDeletePassword(false);
                    setDeleteError(null);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-1.5 text-[12px] font-medium text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded-lg hover:bg-[#FECACA] transition-all"
                >
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

      {/* Edit Full Name Modal */}
      {showNameModal && (
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !savingName) setShowNameModal(false); }}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-[400px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[15px] font-bold text-[#1A1635]">Edit full name</div>
              <button onClick={() => setShowNameModal(false)} className="text-[#8B87A8] leading-none">
                <X size={18} strokeWidth={2.25} />
              </button>
            </div>

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">Full name</label>
            <input
              className="w-full px-3 py-2 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setNameError(null); }}
              disabled={savingName}
              autoFocus
            />

            {nameError && <div className="text-[11px] text-[#DC2626] mt-2">{nameError}</div>}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNameModal(false)}
                disabled={savingName}
                className="px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitName}
                disabled={savingName}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#5B4FE8] rounded-lg hover:bg-[#7B72EC] transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingName && <Loader2 size={13} className="animate-spin" />}
                {savingName ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Email Modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !savingEmail) setShowEmailModal(false); }}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-[400px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[15px] font-bold text-[#1A1635]">Edit email</div>
              <button onClick={() => setShowEmailModal(false)} className="text-[#8B87A8] leading-none">
                <X size={18} strokeWidth={2.25} />
              </button>
            </div>

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">New email</label>
            <input
              type="email"
              className="w-full px-3 py-2 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all mb-3"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setEmailError(null); }}
              disabled={savingEmail}
              autoFocus
            />

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">Current password</label>
            <div className="relative">
              <input
                type={showEmailPassword ? "text" : "password"}
                className="w-full px-3 py-2 pr-9 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
                placeholder="Enter your password"
                value={emailPassword}
                onChange={(e) => { setEmailPassword(e.target.value); setEmailError(null); }}
                disabled={savingEmail}
              />
              <button
                type="button"
                onClick={() => setShowEmailPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B87A8] hover:text-[#4A4568]"
                tabIndex={-1}
              >
                {showEmailPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[10.5px] text-[#8B87A8] mt-1">Signed in with Google? Leave this blank.</p>

            {emailError && <div className="text-[11px] text-[#DC2626] mt-2">{emailError}</div>}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={savingEmail}
                className="px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitEmail}
                disabled={savingEmail}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#5B4FE8] rounded-lg hover:bg-[#7B72EC] transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingEmail && <Loader2 size={13} className="animate-spin" />}
                {savingEmail ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Base Currency Modal */}
      {showCurrencyModal && (
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !savingCurrency) setShowCurrencyModal(false); }}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-[440px] max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[15px] font-bold text-[#1A1635]">Change base currency</div>
              <button onClick={() => setShowCurrencyModal(false)} className="text-[#8B87A8] leading-none">
                <X size={18} strokeWidth={2.25} />
              </button>
            </div>

            <div className="relative mb-3">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex">
                <Search size={14} className="text-[#8B87A8]" />
              </span>
              <input
                className="w-full pl-8 pr-3 py-2 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
                placeholder="Search currency..."
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto pr-1">
              {filteredCurrencies.map((c) => (
                <div
                  key={c.code}
                  onClick={() => setSelectedCurrency(c.code)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer text-[12px] transition-all ${
                    selectedCurrency === c.code
                      ? "border-[#5B4FE8] bg-[#EEF0FD]"
                      : "border-[#EAE8FB] hover:bg-[#F8F7FF]"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#1A1635]">{c.code}</div>
                    <div className="text-[10.5px] text-[#8B87A8]">{c.name}</div>
                  </div>
                  {selectedCurrency === c.code && <Check size={14} className="text-[#5B4FE8]" strokeWidth={2.5} />}
                </div>
              ))}
            </div>

            {currencyError && <div className="text-[11px] text-[#DC2626] mt-2">{currencyError}</div>}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCurrencyModal(false)}
                disabled={savingCurrency}
                className="px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCurrency}
                disabled={savingCurrency}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#5B4FE8] rounded-lg hover:bg-[#7B72EC] transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingCurrency && <Loader2 size={13} className="animate-spin" />}
                {savingCurrency ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !savingPassword) setShowPasswordModal(false); }}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-[400px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[15px] font-bold text-[#1A1635]">Update password</div>
              <button onClick={() => setShowPasswordModal(false)} className="text-[#8B87A8] leading-none">
                <X size={18} strokeWidth={2.25} />
              </button>
            </div>

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">Current password</label>
            <div className="relative mb-3">
              <input
                type={showCurrentPw ? "text" : "password"}
                className="w-full px-3 py-2 pr-9 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
                placeholder="Leave blank if signed in with Google"
                value={currentPasswordInput}
                onChange={(e) => { setCurrentPasswordInput(e.target.value); setPasswordError(null); }}
                disabled={savingPassword}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B87A8] hover:text-[#4A4568]"
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">New password</label>
            <div className="relative mb-3">
              <input
                type={showNewPw ? "text" : "password"}
                className="w-full px-3 py-2 pr-9 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
                placeholder="At least 8 characters"
                value={newPasswordInput}
                onChange={(e) => { setNewPasswordInput(e.target.value); setPasswordError(null); }}
                disabled={savingPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B87A8] hover:text-[#4A4568]"
                tabIndex={-1}
              >
                {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">Confirm new password</label>
            <input
              type={showNewPw ? "text" : "password"}
              className="w-full px-3 py-2 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#5B4FE8] outline-none transition-all"
              value={confirmPasswordInput}
              onChange={(e) => { setConfirmPasswordInput(e.target.value); setPasswordError(null); }}
              disabled={savingPassword}
            />

            {passwordError && <div className="text-[11px] text-[#DC2626] mt-2">{passwordError}</div>}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={savingPassword}
                className="px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitPassword}
                disabled={savingPassword}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#5B4FE8] rounded-lg hover:bg-[#7B72EC] transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingPassword && <Loader2 size={13} className="animate-spin" />}
                {savingPassword ? "Saving…" : "Update password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setShowDeleteModal(false); }}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-[440px] shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-[#DC2626]" strokeWidth={2.25} />
              </div>
              <div className="text-[15px] font-bold text-[#1A1635]">Delete your account?</div>
            </div>

            <p className="text-[12px] text-[#4A4568] leading-relaxed mb-3">
              This permanently deletes your account and all associated data —
              transactions, goals, portfolio assets, chat history, and reports.
              This action <strong>cannot be undone</strong>.
            </p>

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              className="w-full px-3 py-2 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#DC2626] outline-none transition-all"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => { setDeleteConfirmText(e.target.value); setDeleteError(null); }}
              disabled={deleting}
              autoFocus
            />

            <label className="block text-[11px] font-semibold text-[#4A4568] mb-1.5 mt-3">
              Current password
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 pr-9 text-[13px] text-[#1A1635] border border-[#D1CCFF] rounded-lg bg-[#F8F7FF] focus:bg-white focus:border-[#DC2626] outline-none transition-all"
                type={showDeletePassword ? "text" : "password"}
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }}
                disabled={deleting}
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B87A8] hover:text-[#4A4568]"
                tabIndex={-1}
              >
                {showDeletePassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[10.5px] text-[#8B87A8] mt-1">
              Signed in with Google? Leave this blank.
            </p>

            {deleteError && (
              <div className="text-[11px] text-[#DC2626] mt-2">{deleteError}</div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-3 py-2 text-[12px] font-medium text-[#4A4568] bg-white border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#DC2626] rounded-lg hover:bg-[#B91C1C] transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? "Deleting…" : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}