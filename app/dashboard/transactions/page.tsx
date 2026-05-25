"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronDown, X, Check, Trash2 } from "lucide-react";
import { getTransactions, deleteTransaction } from "@/actions/transactions";
import {
  TransactionType,
  TransactionCategory,
  IncomeCategoriesList,
  ExpenseCategoriesList,
} from "@/lib/enums";

function currentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getAvailableMonthKeys() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function txMonthKey(tx: any): string {
  const raw = tx.date;
  if (!raw) return "";
  if (raw instanceof Date) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  return String(raw).slice(0, 7);
}

function getPrevMonthKey(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 2, 1); // m-2 because m is 1-based, and we want prev month (0-based - 1)
  const py = d.getFullYear();
  const pm = String(d.getMonth() + 1).padStart(2, "0");
  return `${py}-${pm}`;
}

function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("default", { month: "long" });
}

function formatTxDate(raw: any): string {
  if (!raw) return "";
  if (raw instanceof Date) {
    return raw.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }
  const plain = String(raw).slice(0, 10);
  const [y, m, d] = plain.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const getCategoryIcon = (category: string): { icon: string; bg: string } => {
  const icons: Record<string, { icon: string; bg: string }> = {
    "Salary / Income":        { icon: "💼", bg: "#DCFCE7" },
    "Freelance Income":       { icon: "💻", bg: "#DBEAFE" },
    "Business Income":        { icon: "🏢", bg: "#D1FAE5" },
    "Investment Returns":     { icon: "📈", bg: "#DCFCE7" },
    "Rental Income":          { icon: "🏠", bg: "#FEF9C3" },
    "Dividends":              { icon: "💹", bg: "#DCFCE7" },
    "Bonus / Incentive":      { icon: "🎁", bg: "#FEE2E2" },
    "Side Hustle":            { icon: "⚡", bg: "#EDE9FE" },
    "Government Benefit":     { icon: "🏛️", bg: "#DBEAFE" },
    "Pension":                { icon: "👴", bg: "#FEF3C7" },
    "Gift Received":          { icon: "🎀", bg: "#FCE7F3" },
    "Refund / Cashback":      { icon: "↩️", bg: "#DCFCE7" },
    "Other Income":           { icon: "💰", bg: "#F3E8FF" },
    "Food & Grocery":         { icon: "🛒", bg: "#FEF3C7" },
    "Dining Out":             { icon: "🍕", bg: "#EEF0FD" },
    "Coffee & Snacks":        { icon: "☕", bg: "#FEF3C7" },
    "Takeaway / Delivery":    { icon: "🥡", bg: "#FEE2E2" },
    "Alcohol & Bar":          { icon: "🍺", bg: "#FEF9C3" },
    "Rent / Mortgage":        { icon: "🏠", bg: "#DBEAFE" },
    "Utilities":              { icon: "⚡", bg: "#FEE2E2" },
    "Internet & Phone":       { icon: "📶", bg: "#EDE9FE" },
    "Home Maintenance":       { icon: "🔧", bg: "#FEF3C7" },
    "Home Insurance":         { icon: "🛡️", bg: "#DBEAFE" },
    "Furniture & Appliances": { icon: "🛋️", bg: "#F3E8FF" },
    "Transport":              { icon: "🚗", bg: "#FEF9C3" },
    "Fuel & Parking":         { icon: "⛽", bg: "#FEE2E2" },
    "Public Transport":       { icon: "🚌", bg: "#DBEAFE" },
    "Taxi / Ride Share":      { icon: "🚕", bg: "#FEF3C7" },
    "Vehicle Maintenance":    { icon: "🔩", bg: "#F3E8FF" },
    "Vehicle Insurance":      { icon: "🛡️", bg: "#DBEAFE" },
    "Health & Medical":       { icon: "🏥", bg: "#E0E7FF" },
    "Pharmacy":               { icon: "💊", bg: "#FEE2E2" },
    "Gym & Fitness":          { icon: "💪", bg: "#DCFCE7" },
    "Mental Health":          { icon: "🧠", bg: "#EDE9FE" },
    "Dental & Vision":        { icon: "🦷", bg: "#DBEAFE" },
    "Health Insurance":       { icon: "🛡️", bg: "#D1FAE5" },
    "Education":              { icon: "📚", bg: "#DBEAFE" },
    "Tuition & Courses":      { icon: "🎓", bg: "#EDE9FE" },
    "Books & Supplies":       { icon: "📖", bg: "#FEF3C7" },
    "Online Learning":        { icon: "💡", bg: "#DBEAFE" },
    "Entertainment":          { icon: "🎬", bg: "#EDE9FE" },
    "Streaming Services":     { icon: "📺", bg: "#FEE2E2" },
    "Gaming":                 { icon: "🎮", bg: "#EEF0FD" },
    "Hobbies & Leisure":      { icon: "🎨", bg: "#FCE7F3" },
    "Events & Concerts":      { icon: "🎟️", bg: "#FEF3C7" },
    "Shopping":               { icon: "🛍️", bg: "#FCE7F3" },
    "Clothing & Fashion":     { icon: "👗", bg: "#EDE9FE" },
    "Electronics & Tech":     { icon: "📱", bg: "#DBEAFE" },
    "Personal Care & Beauty": { icon: "💄", bg: "#FCE7F3" },
    "Gift Given":             { icon: "🎁", bg: "#FEF3C7" },
    "Travel":                 { icon: "✈️", bg: "#DBEAFE" },
    "Flights":                { icon: "🛫", bg: "#EDE9FE" },
    "Hotels & Stay":          { icon: "🏨", bg: "#FEF9C3" },
    "Travel Activities":      { icon: "🗺️", bg: "#DCFCE7" },
    "Business Expense":       { icon: "💼", bg: "#DBEAFE" },
    "Software & Tools":       { icon: "🖥️", bg: "#EDE9FE" },
    "Marketing & Ads":        { icon: "📣", bg: "#FEE2E2" },
    "Office Supplies":        { icon: "🖊️", bg: "#FEF3C7" },
    "Professional Fees":      { icon: "⚖️", bg: "#DBEAFE" },
    "Loan Repayment":         { icon: "🏦", bg: "#FEE2E2" },
    "Credit Card Bill":       { icon: "💳", bg: "#FEE2E2" },
    "Bank Fees":              { icon: "🏧", bg: "#FEF3C7" },
    "Taxes":                  { icon: "📋", bg: "#FEE2E2" },
    "Savings & Deposit":      { icon: "🐷", bg: "#DCFCE7" },
    "Charity & Donation":     { icon: "❤️", bg: "#FCE7F3" },
    "Childcare":              { icon: "👶", bg: "#FEF9C3" },
    "Pet Care":               { icon: "🐾", bg: "#DCFCE7" },
    "Family Support":         { icon: "👨‍👩‍👧", bg: "#DBEAFE" },
    "Other":                  { icon: "📄", bg: "#F3E8FF" },
  };
  return icons[category] ?? { icon: "📄", bg: "#F3E8FF" };
};

const getCategoryBadge = (category: string): { label: string; bg: string; color: string } => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    "Salary / Income":        { label: "Salary",      bg: "#DCFCE7", color: "#14532D" },
    "Freelance Income":       { label: "Freelance",   bg: "#DBEAFE", color: "#1E3A8A" },
    "Business Income":        { label: "Business",    bg: "#D1FAE5", color: "#064E3B" },
    "Investment Returns":     { label: "Investment",  bg: "#DCFCE7", color: "#14532D" },
    "Rental Income":          { label: "Rental",      bg: "#FEF9C3", color: "#713F12" },
    "Dividends":              { label: "Dividend",    bg: "#DCFCE7", color: "#14532D" },
    "Bonus / Incentive":      { label: "Bonus",       bg: "#FEE2E2", color: "#7F1D1D" },
    "Side Hustle":            { label: "Side Hustle", bg: "#EDE9FE", color: "#4C1D95" },
    "Government Benefit":     { label: "Govt",        bg: "#DBEAFE", color: "#1E3A8A" },
    "Pension":                { label: "Pension",     bg: "#FEF3C7", color: "#78350F" },
    "Gift Received":          { label: "Gift",        bg: "#FCE7F3", color: "#831843" },
    "Refund / Cashback":      { label: "Refund",      bg: "#DCFCE7", color: "#14532D" },
    "Other Income":           { label: "Income",      bg: "#DCFCE7", color: "#14532D" },
    "Food & Grocery":         { label: "Grocery",     bg: "#FEF3C7", color: "#78350F" },
    "Dining Out":             { label: "Dining",      bg: "#EEF0FD", color: "#3C3489" },
    "Coffee & Snacks":        { label: "Coffee",      bg: "#FEF3C7", color: "#78350F" },
    "Takeaway / Delivery":    { label: "Takeaway",    bg: "#FEE2E2", color: "#7F1D1D" },
    "Alcohol & Bar":          { label: "Alcohol",     bg: "#FEF9C3", color: "#713F12" },
    "Rent / Mortgage":        { label: "Rent",        bg: "#DBEAFE", color: "#1E3A8A" },
    "Utilities":              { label: "Utilities",   bg: "#FEE2E2", color: "#7F1D1D" },
    "Internet & Phone":       { label: "Internet",    bg: "#EDE9FE", color: "#4C1D95" },
    "Home Maintenance":       { label: "Maintenance", bg: "#FEF3C7", color: "#78350F" },
    "Home Insurance":         { label: "Insurance",   bg: "#DBEAFE", color: "#1E3A8A" },
    "Furniture & Appliances": { label: "Furniture",   bg: "#F3E8FF", color: "#4A4568" },
    "Transport":              { label: "Transport",   bg: "#FEF9C3", color: "#713F12" },
    "Fuel & Parking":         { label: "Fuel",        bg: "#FEE2E2", color: "#7F1D1D" },
    "Public Transport":       { label: "Public",      bg: "#DBEAFE", color: "#1E3A8A" },
    "Taxi / Ride Share":      { label: "Taxi",        bg: "#FEF3C7", color: "#78350F" },
    "Vehicle Maintenance":    { label: "Vehicle",     bg: "#F3E8FF", color: "#4A4568" },
    "Vehicle Insurance":      { label: "Insurance",   bg: "#DBEAFE", color: "#1E3A8A" },
    "Health & Medical":       { label: "Medical",     bg: "#FEE2E2", color: "#7F1D1D" },
    "Pharmacy":               { label: "Pharmacy",    bg: "#FEE2E2", color: "#7F1D1D" },
    "Gym & Fitness":          { label: "Gym",         bg: "#DCFCE7", color: "#14532D" },
    "Mental Health":          { label: "Mental",      bg: "#EDE9FE", color: "#4C1D95" },
    "Dental & Vision":        { label: "Dental",      bg: "#DBEAFE", color: "#1E3A8A" },
    "Health Insurance":       { label: "Insurance",   bg: "#D1FAE5", color: "#064E3B" },
    "Education":              { label: "Education",   bg: "#DBEAFE", color: "#1E3A8A" },
    "Tuition & Courses":      { label: "Tuition",     bg: "#EDE9FE", color: "#4C1D95" },
    "Books & Supplies":       { label: "Books",       bg: "#FEF3C7", color: "#78350F" },
    "Online Learning":        { label: "Online",      bg: "#DBEAFE", color: "#1E3A8A" },
    "Entertainment":          { label: "Fun",         bg: "#EDE9FE", color: "#4C1D95" },
    "Streaming Services":     { label: "Streaming",   bg: "#FEE2E2", color: "#7F1D1D" },
    "Gaming":                 { label: "Gaming",      bg: "#EEF0FD", color: "#3C3489" },
    "Hobbies & Leisure":      { label: "Hobbies",     bg: "#FCE7F3", color: "#831843" },
    "Events & Concerts":      { label: "Events",      bg: "#FEF3C7", color: "#78350F" },
    "Shopping":               { label: "Shopping",    bg: "#FCE7F3", color: "#831843" },
    "Clothing & Fashion":     { label: "Clothing",    bg: "#EDE9FE", color: "#4C1D95" },
    "Electronics & Tech":     { label: "Electronics", bg: "#DBEAFE", color: "#1E3A8A" },
    "Personal Care & Beauty": { label: "Beauty",      bg: "#FCE7F3", color: "#831843" },
    "Gift Given":             { label: "Gift",        bg: "#FEF3C7", color: "#78350F" },
    "Travel":                 { label: "Travel",      bg: "#DBEAFE", color: "#1E3A8A" },
    "Flights":                { label: "Flights",     bg: "#EDE9FE", color: "#4C1D95" },
    "Hotels & Stay":          { label: "Hotels",      bg: "#FEF9C3", color: "#713F12" },
    "Travel Activities":      { label: "Activities",  bg: "#DCFCE7", color: "#14532D" },
    "Business Expense":       { label: "Business",    bg: "#DBEAFE", color: "#1E3A8A" },
    "Software & Tools":       { label: "Software",    bg: "#EDE9FE", color: "#4C1D95" },
    "Marketing & Ads":        { label: "Marketing",   bg: "#FEE2E2", color: "#7F1D1D" },
    "Office Supplies":        { label: "Office",      bg: "#FEF3C7", color: "#78350F" },
    "Professional Fees":      { label: "Pro Fees",    bg: "#DBEAFE", color: "#1E3A8A" },
    "Loan Repayment":         { label: "Loan",        bg: "#FEE2E2", color: "#7F1D1D" },
    "Credit Card Bill":       { label: "Credit",      bg: "#FEE2E2", color: "#7F1D1D" },
    "Bank Fees":              { label: "Bank Fee",    bg: "#FEF3C7", color: "#78350F" },
    "Taxes":                  { label: "Tax",         bg: "#FEE2E2", color: "#7F1D1D" },
    "Savings & Deposit":      { label: "Savings",     bg: "#DCFCE7", color: "#14532D" },
    "Charity & Donation":     { label: "Charity",     bg: "#FCE7F3", color: "#831843" },
    "Childcare":              { label: "Childcare",   bg: "#FEF9C3", color: "#713F12" },
    "Pet Care":               { label: "Pet",         bg: "#DCFCE7", color: "#14532D" },
    "Family Support":         { label: "Family",      bg: "#DBEAFE", color: "#1E3A8A" },
    "Other":                  { label: "Other",       bg: "#F3E8FF", color: "#4A4568" },
  };
  return map[category] ?? { label: "Other", bg: "#F3E8FF", color: "#4A4568" };
};

function ConfirmDeleteModal({
  transaction,
  onConfirm,
  onCancel,
  loading,
}: {
  transaction: any;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl z-10 w-full max-w-sm mx-auto p-6">
        <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-[15px] font-bold text-[#1A1635] text-center mb-2">Delete Transaction</h3>
        <p className="text-[13px] text-[#8B87A8] text-center mb-1">
          &ldquo;{transaction.description || transaction.category}&rdquo; will be permanently deleted.
        </p>
        <p className="text-[12px] text-[#C4C0DC] text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 text-[13px] font-semibold text-[#4A4568] border border-[#D1CCFF] rounded-xl hover:bg-[#F8F7FF] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterCategoryDropdownProps {
  categories: string[];
  value: "all" | TransactionCategory;
  onChange: (val: "all" | TransactionCategory) => void;
  filterType: "all" | TransactionType;
}

function FilterCategoryDropdown({
  categories,
  value,
  onChange,
  filterType,
}: FilterCategoryDropdownProps) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const containerRef        = useRef<HTMLDivElement>(null);
  const searchRef           = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    onChange("all");
    setSearch("");
  }, [filterType]);

  const filtered = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  const isIncome  = filterType === TransactionType.Income;
  const isExpense = filterType === TransactionType.Expense;
  const typeLabel = isIncome ? "Income" : isExpense ? "Expense" : "All";
  const typeBg    = isIncome ? "#DCFCE7" : isExpense ? "#FEE2E2" : "#EEF0FD";
  const typeColor = isIncome ? "#14532D" : isExpense ? "#7F1D1D" : "#3C3489";
  const typeEmoji = isIncome ? "🟢" : isExpense ? "🔴" : "🔵";

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium border rounded-lg bg-white transition-colors outline-none cursor-pointer ${
          open ? "border-[#5B4FE8]" : "border-[#D1CCFF]"
        } ${value !== "all" ? "text-[#1A1635]" : "text-[#4A4568]"}`}
      >
        <span className="truncate">{value === "all" ? "All categories" : value}</span>
        <ChevronDown
          size={13}
          className={`text-[#8B87A8] shrink-0 ml-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-220px bg-white border border-[#D1CCFF] rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2 border-b border-[#EAE8FB]">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
              style={{ background: typeBg, color: typeColor }}
            >
              {typeEmoji} {typeLabel} categories
            </span>
            <span className="text-[10px] text-[#8B87A8]">{categories.length} total</span>
          </div>
          <div className="px-3 py-2 border-b border-[#EAE8FB]">
            <div className="flex items-center gap-2 bg-[#F8F7FF] rounded-lg px-2.5 py-1.5">
              <Search size={12} className="text-[#8B87A8] shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="flex-1 bg-transparent text-[12px] text-[#1A1635] placeholder:text-[#C4C0DC] outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#8B87A8] hover:text-[#4A4568]">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => { onChange("all"); setOpen(false); setSearch(""); }}
                className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between transition-colors ${
                  value === "all" ? "bg-[#EEF0FD] text-[#5B4FE8] font-semibold" : "text-[#4A4568] hover:bg-[#F8F7FF]"
                }`}
              >
                All categories
                {value === "all" && <Check size={12} className="text-[#5B4FE8] shrink-0" />}
              </button>
            </li>
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => { onChange(cat as TransactionCategory); setOpen(false); setSearch(""); }}
                    className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between transition-colors ${
                      value === cat ? "bg-[#EEF0FD] text-[#5B4FE8] font-semibold" : "text-[#4A4568] hover:bg-[#F8F7FF]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{getCategoryIcon(cat).icon}</span>
                      {cat}
                    </span>
                    {value === cat && <Check size={12} className="text-[#5B4FE8] shrink-0" />}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-center text-[11px] text-[#8B87A8]">
                No categories match &quot;{search}&quot;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions]     = useState<any[]>([]);
  const [searchTerm, setSearchTerm]         = useState("");
  const [filterType, setFilterType]         = useState<"all" | TransactionType>("all");
  const [filterCategory, setFilterCategory] = useState<"all" | TransactionCategory>("all");

  // ── FIX: clamp stored month to valid options to prevent stale-month bug ──
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    if (typeof window === "undefined") return currentMonthKey();
    const stored = sessionStorage.getItem("txFilterMonth");
    if (stored && /^\d{4}-\d{2}$/.test(stored)) {
      const valid = getAvailableMonthKeys();
      if (valid.includes(stored)) return stored;
    }
    return currentMonthKey();
  });

  const [loading, setLoading]             = useState(true);
  const [deleteTarget, setDeleteTarget]   = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("txFilterMonth", filterMonth);
  }, [filterMonth]);

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const visibleCategories = useMemo(() => {
    if (filterType === TransactionType.Income)  return IncomeCategoriesList as string[];
    if (filterType === TransactionType.Expense) return ExpenseCategoriesList as string[];
    return [...IncomeCategoriesList, ...ExpenseCategoriesList] as string[];
  }, [filterType]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (tx.description ?? "").toLowerCase().includes(searchLower) ||
        tx.category.toLowerCase().includes(searchLower);
      const matchesType     = filterType === "all" || tx.type === filterType;
      const matchesCategory = filterCategory === "all" || tx.category === filterCategory;
      const matchesMonth    = txMonthKey(tx) === filterMonth;
      return matchesSearch && matchesType && matchesCategory && matchesMonth;
    });
  }, [transactions, searchTerm, filterType, filterCategory, filterMonth]);

  const cardMonthKey     = filterMonth;
  const prevCardMonthKey = getPrevMonthKey(cardMonthKey);

  const cardMonthTxs = useMemo(
    () => transactions.filter((t) => txMonthKey(t) === cardMonthKey),
    [transactions, cardMonthKey],
  );
  const prevCardMonthTxs = useMemo(
    () => transactions.filter((t) => txMonthKey(t) === prevCardMonthKey),
    [transactions, prevCardMonthKey],
  );

  const cardIncome  = cardMonthTxs.filter((t) => t.type === TransactionType.Income).reduce((s, t) => s + t.amount, 0);
  const cardExpense = cardMonthTxs.filter((t) => t.type === TransactionType.Expense).reduce((s, t) => s + t.amount, 0);
  const prevIncome  = prevCardMonthTxs.filter((t) => t.type === TransactionType.Income).reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevCardMonthTxs.filter((t) => t.type === TransactionType.Expense).reduce((s, t) => s + t.amount, 0);

  const incomePct  = prevIncome  > 0 ? (((cardIncome  - prevIncome)  / prevIncome)  * 100).toFixed(1) : null;
  const expensePct = prevExpense > 0 ? (((cardExpense - prevExpense) / prevExpense) * 100).toFixed(1) : null;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      loadTransactions();
    } catch {
      alert("Failed to delete transaction");
    }
    setDeleteLoading(false);
  };

  // ── FIX: use getAvailableMonthKeys() so the list is consistent with validation ──
  const getLastMonths = () => {
    return getAvailableMonthKeys().map((val) => {
      const [y, m] = val.split("-").map(Number);
      return {
        value: val,
        label: new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" }),
      };
    });
  };

  const activeFilters = [
    filterType     !== "all",
    filterCategory !== "all",
    searchTerm     !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterCategory("all");
  };

  // ── FIX: month filter chip now shows the actual filterMonth label, not a hardcoded value ──
  const filterMonthLabel = (() => {
    const [y, m] = filterMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
  })();

  const isNonCurrentMonth = filterMonth !== currentMonthKey();

  return (
    <div className="space-y-4">

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">{monthLabel(cardMonthKey)} income</div>
          <div className="text-[18px] font-bold text-[#1A1635]">LKR {cardIncome.toLocaleString()}</div>
          {incomePct !== null ? (
            <div className={`text-[11px] font-semibold ${parseFloat(incomePct) >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
              {parseFloat(incomePct) >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(incomePct))}% vs {monthLabel(prevCardMonthKey)}
            </div>
          ) : (
            <div className="text-[11px] text-[#8B87A8]">No data last month</div>
          )}
        </div>

        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">{monthLabel(cardMonthKey)} expenses</div>
          <div className="text-[18px] font-bold text-[#1A1635]">LKR {cardExpense.toLocaleString()}</div>
          {expensePct !== null ? (
            <div className={`text-[11px] font-semibold ${parseFloat(expensePct) <= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
              {parseFloat(expensePct) >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(expensePct))}% vs {monthLabel(prevCardMonthKey)}
            </div>
          ) : (
            <div className="text-[11px] text-[#8B87A8]">No data last month</div>
          )}
        </div>

        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">
            {activeFilters > 0 ? "Filtered results" : `${monthLabel(cardMonthKey)} transactions`}
          </div>
          <div className="text-[18px] font-bold text-[#1A1635]">
            {filteredTransactions.length}
          </div>
          <div className="text-[11px] font-semibold text-[#8B87A8]">
            {activeFilters > 0
              ? `of ${cardMonthTxs.length} total · ${activeFilters} filter${activeFilters > 1 ? "s" : ""} active`
              : `${cardMonthTxs.filter((t) => t.type === TransactionType.Expense).length} expenses · ${cardMonthTxs.filter((t) => t.type === TransactionType.Income).length} income`
            }
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
        <div className="flex flex-col gap-3">

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B87A8]" size={14} />
              <input
                type="text"
                placeholder="Search by description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[12px] text-[#1A1635] placeholder:text-[#C4C0DC] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B87A8] hover:text-[#4A4568]"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {activeFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-[#DC2626] border border-[#FCA5A5] bg-[#FEF2F2] rounded-lg hover:bg-[#FEE2E2] transition-colors"
              >
                <X size={11} />
                Clear ({activeFilters})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as "all" | TransactionType);
                setFilterCategory("all");
              }}
              className="w-full px-3 py-2 text-[12px] border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none cursor-pointer font-medium text-[#4A4568]"
            >
              <option value="all">All types</option>
              <option value={TransactionType.Expense}>Expense</option>
              <option value={TransactionType.Income}>Income</option>
            </select>

            <FilterCategoryDropdown
              categories={visibleCategories}
              value={filterCategory}
              onChange={setFilterCategory}
              filterType={filterType}
            />

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full col-span-2 sm:col-span-1 px-3 py-2 text-[12px] border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none cursor-pointer font-medium text-[#4A4568]"
            >
              {getLastMonths().map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* ── FIX: active filter chips — month chip only shown when not current month ── */}
          {(activeFilters > 0 || isNonCurrentMonth) && (
            <div className="flex flex-wrap gap-1.5">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EEF0FD] text-[#5B4FE8] text-[11px] font-semibold rounded-full">
                  🔍 &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm("")}><X size={10} /></button>
                </span>
              )}
              {filterType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EEF0FD] text-[#5B4FE8] text-[11px] font-semibold rounded-full">
                  {filterType === TransactionType.Expense ? "🔴" : "🟢"} {filterType}
                  <button onClick={() => { setFilterType("all"); setFilterCategory("all"); }}><X size={10} /></button>
                </span>
              )}
              {filterCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EEF0FD] text-[#5B4FE8] text-[11px] font-semibold rounded-full">
                  📂 {filterCategory}
                  <button onClick={() => setFilterCategory("all")}><X size={10} /></button>
                </span>
              )}
              {isNonCurrentMonth && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EEF0FD] text-[#5B4FE8] text-[11px] font-semibold rounded-full">
                  📅 {filterMonthLabel}
                  <button onClick={() => setFilterMonth(currentMonthKey())}><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">

        {!loading && filteredTransactions.length === 0 && (
          <div className="py-14 flex flex-col items-center gap-3 text-center px-4">
            <div className="text-3xl">🔍</div>
            <div className="text-[13px] font-semibold text-[#1A1635]">No transactions found</div>
            <div className="text-[11px] text-[#8B87A8]">
              {activeFilters > 0
                ? "Try adjusting your filters or clearing them."
                : "Add your first transaction using the button above."}
            </div>
            {activeFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-1 px-4 py-2 text-[12px] font-semibold text-[#5B4FE8] border border-[#C7C3F8] rounded-lg hover:bg-[#F8F7FF] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {(loading || filteredTransactions.length > 0) && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-600px">
              <thead>
                <tr className="border-b border-[#EAE8FB]">
                  <th className="text-left py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Description</th>
                  <th className="text-left py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Category</th>
                  <th className="text-left py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Date</th>
                  <th className="text-right py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Amount</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#EAE8FB]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#F8F7FF] animate-pulse" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-28 bg-[#F8F7FF] rounded animate-pulse" />
                            <div className="h-2 w-20 bg-[#F8F7FF] rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><div className="h-5 w-16 bg-[#F8F7FF] rounded-full animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-3 w-20 bg-[#F8F7FF] rounded animate-pulse" /></td>
                      <td className="py-3 px-4 text-right"><div className="h-3 w-24 bg-[#F8F7FF] rounded animate-pulse ml-auto" /></td>
                      <td className="py-3 px-4" />
                    </tr>
                  ))
                ) : (
                  filteredTransactions.map((tx) => {
                    const { icon, bg } = getCategoryIcon(tx.category);
                    const badge        = getCategoryBadge(tx.category);
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-[#EAE8FB] hover:bg-[#F8F7FF] transition-colors last:border-b-0"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                              style={{ background: bg }}
                            >
                              {icon}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#1A1635]">
                                {tx.description || tx.category}
                              </div>
                              <div className="text-[11px] text-[#8B87A8]">{tx.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-full"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[12px] text-[#8B87A8]">
                          {formatTxDate(tx.date)}
                        </td>
                        <td className={`py-3 px-4 text-right text-[13px] font-semibold font-mono ${
                          tx.type === TransactionType.Income ? "text-[#16A34A]" : "text-[#DC2626]"
                        }`}>
                          {tx.type === TransactionType.Income ? "+" : "-"}LKR{" "}
                          {tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setDeleteTarget(tx)}
                            className="p-1.5 text-[#8B87A8] hover:text-red-600 rounded-lg hover:bg-[#FEF2F2] transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          transaction={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}