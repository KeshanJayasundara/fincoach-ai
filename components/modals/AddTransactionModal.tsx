// components/modals/AddTransactionModal.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X, PenLine, Camera, Upload, ChevronDown, Check,
  Loader2, Search, RotateCcw, Sparkles, AlertCircle,
  Edit3, Save,
} from "lucide-react";
import { addTransaction } from "@/actions/transactions";
import {
  TransactionType,
  TransactionCategory,
  Currency,
  IncomeCategoriesList,
  ExpenseCategoriesList,
} from "@/lib/enums";

type Tab = "manual" | "scan" | "import";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── All valid enum values as a flat list (used by AI prompt) ───────────────
const ALL_EXPENSE_VALUES  = ExpenseCategoriesList as string[];
const ALL_INCOME_VALUES   = IncomeCategoriesList  as string[];
const ALL_CATEGORY_VALUES = [...ALL_INCOME_VALUES, ...ALL_EXPENSE_VALUES];

// ─── Match a raw string from Claude back to a valid TransactionCategory ──────
function matchCategory(raw: string): TransactionCategory | "" {
  if (!raw) return "";
  const normalised = raw.trim().toLowerCase();
  const found = ALL_CATEGORY_VALUES.find(
    (v) => v.toLowerCase() === normalised,
  );
  return (found as TransactionCategory) ?? "";
}

// ─── Infer transaction type from category ────────────────────────────────────
function inferType(cat: TransactionCategory | ""): TransactionType {
  if (!cat) return TransactionType.Expense;
  return (ALL_INCOME_VALUES as string[]).includes(cat)
    ? TransactionType.Income
    : TransactionType.Expense;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("manual");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#EAE8FB] shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-[#1A1635]">
              Add Transaction
            </h2>
            <p className="text-[11px] text-[#8B87A8] mt-0.5">
              Choose how to add your transaction
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] text-[#8B87A8] hover:text-[#1A1635] hover:border-[#C7C3F8] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-3 bg-[#F8F7FF] border-b border-[#EAE8FB] shrink-0">
          {(["manual", "scan", "import"] as Tab[]).map((tab) => {
            const config = {
              manual: { icon: PenLine, label: "Manual" },
              scan:   { icon: Camera,  label: "Scan Bill" },
              import: { icon: Upload,  label: "Import File" },
            }[tab];
            const Icon = config.icon;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[12px] font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#5B4FE8] shadow-sm border border-[#EAE8FB]"
                    : "text-[#8B87A8] hover:text-[#4A4568]"
                }`}
              >
                <Icon size={13} />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1">
          {activeTab === "manual" && (
            <ManualTab onClose={onClose} onSuccess={onSuccess} />
          )}
          {activeTab === "scan" && (
            <ScanTab onClose={onClose} onSuccess={onSuccess} />
          )}
          {activeTab === "import" && (
            <ImportTab onClose={onClose} onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  SEARCHABLE CATEGORY DROPDOWN (shared)                  */
/* ─────────────────────────────────────────────────────── */
interface CategoryDropdownProps {
  categories: TransactionCategory[];
  value: TransactionCategory | "";
  onChange: (val: TransactionCategory | "") => void;
  transactionType: TransactionType;
}

function CategoryDropdown({
  categories,
  value,
  onChange,
  transactionType,
}: CategoryDropdownProps) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const containerRef          = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
    onChange("");
    setSearch("");
  }, [transactionType]);

  const filtered = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase()),
  );

  const isExpense   = transactionType === TransactionType.Expense;
  const accentColor = isExpense ? "#DC2626" : "#16A34A";
  const accentBg    = isExpense ? "#FEE2E2" : "#DCFCE7";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-[12px] font-medium border rounded-lg bg-white transition-colors outline-none ${
          open ? "border-[#5B4FE8]" : "border-[#D1CCFF]"
        } ${value ? "text-[#1A1635]" : "text-[#C4C0DC]"}`}
      >
        <span className="truncate">
          {value ? (
            <span className="flex items-center gap-2">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: accentBg, color: accentColor }}
              >
                {isExpense ? "Expense" : "Income"}
              </span>
              {value}
            </span>
          ) : (
            "Select category…"
          )}
        </span>
        <ChevronDown
          size={13}
          className={`text-[#8B87A8] shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#D1CCFF] rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2 border-b border-[#EAE8FB]">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
              style={{ background: accentBg, color: accentColor }}
            >
              {isExpense ? "🔴" : "🟢"}{" "}
              {isExpense ? "Expense" : "Income"} categories
            </span>
            <span className="text-[10px] text-[#8B87A8]">
              {categories.length} total
            </span>
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
                <button
                  onClick={() => setSearch("")}
                  className="text-[#8B87A8] hover:text-[#4A4568]"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-44 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(cat);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between transition-colors ${
                      value === cat
                        ? "bg-[#EEF0FD] text-[#5B4FE8] font-semibold"
                        : "text-[#4A4568] hover:bg-[#F8F7FF]"
                    }`}
                  >
                    {cat}
                    {value === cat && (
                      <Check size={12} className="text-[#5B4FE8] shrink-0" />
                    )}
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

/* ─────────────────────────────────────────────────────── */
/*  MANUAL TAB                                             */
/* ─────────────────────────────────────────────────────── */
function ManualTab({
  onClose,
  onSuccess,
  prefill,
}: {
  onClose: () => void;
  onSuccess?: () => void;
  prefill?: {
    type?: TransactionType;
    amount?: string;
    currency?: Currency;
    category?: TransactionCategory | "";
    description?: string;
    date?: string;
  };
}) {
  const [type, setType]             = useState<TransactionType>(prefill?.type ?? TransactionType.Expense);
  const [amount, setAmount]         = useState(prefill?.amount ?? "");
  const [currency, setCurrency]     = useState<Currency>(prefill?.currency ?? Currency.LKR);
  const [category, setCategory]     = useState<TransactionCategory | "">(prefill?.category ?? "");
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [date, setDate]             = useState(prefill?.date ?? new Date().toISOString().slice(0, 10));
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // Update fields if prefill changes (e.g. after scan)
  useEffect(() => {
    if (!prefill) return;
    if (prefill.type)        setType(prefill.type);
    if (prefill.amount)      setAmount(prefill.amount);
    if (prefill.currency)    setCurrency(prefill.currency);
    if (prefill.category)    setCategory(prefill.category);
    if (prefill.description) setDescription(prefill.description);
    if (prefill.date)        setDate(prefill.date);
  }, [prefill]);

  const categories =
    type === TransactionType.Income ? IncomeCategoriesList : ExpenseCategoriesList;

  const handleSubmit = async () => {
    if (!amount || !category) {
      setError("Amount and category are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await addTransaction({
        type,
        amount:      parseFloat(amount),
        currency,
        category:    category as TransactionCategory,
        description,
        date,
      });
      onSuccess?.();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to add transaction.");
    }
    setLoading(false);
  };

  return (
    <div className="p-5 space-y-4">
      {/* Type Toggle */}
      <div>
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
          Type
        </label>
        <div className="flex bg-[#F8F7FF] rounded-xl p-1 gap-1">
          {[TransactionType.Expense, TransactionType.Income].map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setCategory(""); }}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                type === t
                  ? t === TransactionType.Expense
                    ? "bg-[#FEE2E2] text-[#DC2626] shadow-sm"
                    : "bg-[#DCFCE7] text-[#16A34A] shadow-sm"
                  : "text-[#8B87A8] hover:text-[#4A4568]"
              }`}
            >
              {t === TransactionType.Expense ? "Expense" : "Income"}
            </button>
          ))}
        </div>
      </div>

      {/* Amount + Currency */}
      <div>
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
          Amount
        </label>
        <div className="flex gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="px-3 py-2.5 text-[12px] font-semibold border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none text-[#4A4568] w-20"
          >
            {Object.values(Currency).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2.5 text-[14px] font-semibold border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
          Category
        </label>
        <CategoryDropdown
          categories={categories}
          value={category}
          onChange={setCategory}
          transactionType={type}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
          Description{" "}
          <span className="font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Monthly rent payment"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
        />
      </div>

      {/* Date */}
      <div>
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635]"
        />
      </div>

      {error && (
        <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-1 pb-1">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Check size={13} />
          )}
          {loading ? "Saving…" : "Save Transaction"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  SCAN TAB                                               */
/* ─────────────────────────────────────────────────────── */

interface ScannedData {
  amount: string;
  currency: Currency;
  category: TransactionCategory | "";
  type: TransactionType;
  description: string;
  date: string;
  rawText: string;
  confidence: "high" | "medium" | "low";
}

// Build the AI prompt — injects all valid category values so Claude can pick exactly
function buildScanPrompt(): string {
  return `You are a receipt/bill OCR and categorisation assistant for a personal finance app.

Analyse the receipt image and extract the following fields. Respond ONLY with a valid JSON object — no markdown, no explanation.

JSON shape:
{
  "amount": "<number as string, e.g. 2450.00>",
  "currency": "<one of: LKR, USD, EUR, GBP, AED, SGD, INR, AUD — default LKR if unclear>",
  "type": "<expense or income — almost always expense for a receipt>",
  "category": "<pick EXACTLY one value from the allowed list below>",
  "description": "<short merchant name or bill summary, max 60 chars>",
  "date": "<YYYY-MM-DD — today if not found on receipt>",
  "confidence": "<high | medium | low>"
}

ALLOWED CATEGORY VALUES (copy verbatim, case-sensitive):
${ALL_CATEGORY_VALUES.map((v) => `"${v}"`).join(", ")}

Rules:
- For supermarket / grocery receipts → "Food & Grocery"
- For restaurant / cafe receipts → "Dining Out" or "Coffee & Snacks"
- For pharmacy / chemist → "Pharmacy"
- For fuel stations → "Fuel & Parking"
- For utility bills (CEB, LECO, water) → "Utilities"
- For telecom bills (Dialog, Mobitel, SLT) → "Internet & Phone"
- For clothing stores → "Clothing & Fashion"
- For electronics shops → "Electronics & Tech"
- For ride-hailing (PickMe, Uber) → "Taxi / Ride Share"
- For hospital / medical → "Health & Medical"
- For streaming (Netflix, Spotify) → "Streaming Services"
- For hotel / accommodation → "Hotels & Stay"
- If genuinely unsure → "Other"
- If the amount is ambiguous or not found, set amount to "0"
- The date field must be ISO 8601 (YYYY-MM-DD)`;
}

async function scanReceiptWithAI(base64Image: string): Promise<ScannedData> {
  const today = new Date().toISOString().slice(0, 10);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type:   "image",
              source: {
                type:       "base64",
                media_type: "image/jpeg",
                data:       base64Image,
              },
            },
            { type: "text", text: buildScanPrompt() },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error: ${response.status} — ${err}`);
  }

  const data  = await response.json();
  const raw   = (data.content as any[])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/gi, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  const category  = matchCategory(parsed.category ?? "");
  const type      = parsed.type === "income"
    ? TransactionType.Income
    : TransactionType.Expense;
  const finalType = category ? inferType(category) : type;

  // Validate / normalise currency
  const validCurrencies = Object.values(Currency) as string[];
  const currency = validCurrencies.includes(parsed.currency)
    ? (parsed.currency as Currency)
    : Currency.LKR;

  return {
    amount:      String(parsed.amount ?? "0"),
    currency,
    category,
    type:        finalType,
    description: String(parsed.description ?? "").slice(0, 60),
    date:        /^\d{4}-\d{2}-\d{2}$/.test(parsed.date ?? "")
                   ? parsed.date
                   : today,
    rawText:     cleaned,
    confidence:  (["high", "medium", "low"] as const).includes(parsed.confidence)
                   ? parsed.confidence
                   : "low",
  };
}

function ScanTab({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  // ── state machine: idle → captured → scanning → review ──
  type Stage = "idle" | "captured" | "scanning" | "review" | "error";
  const [stage, setStage]         = useState<Stage>("idle");
  const [preview, setPreview]     = useState<string | null>(null);   // data-URL
  const [base64, setBase64]       = useState<string>("");             // raw base64
  const [scanned, setScanned]     = useState<ScannedData | null>(null);
  const [errMsg, setErrMsg]       = useState("");
  const [editMode, setEditMode]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState("");

  // Editable review fields
  const [rType,    setRType]    = useState<TransactionType>(TransactionType.Expense);
  const [rAmount,  setRAmount]  = useState("");
  const [rCur,     setRCur]     = useState<Currency>(Currency.LKR);
  const [rCat,     setRCat]     = useState<TransactionCategory | "">("");
  const [rDesc,    setRDesc]    = useState("");
  const [rDate,    setRDate]    = useState(new Date().toISOString().slice(0, 10));

  const inputRef = useRef<HTMLInputElement>(null);
  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  // ── helpers ──────────────────────────────────────────────
  const reset = () => {
    setStage("idle");
    setPreview(null);
    setBase64("");
    setScanned(null);
    setErrMsg("");
    setEditMode(false);
    setSaveErr("");
  };

  const loadScannedIntoForm = (s: ScannedData) => {
    setRType(s.type);
    setRAmount(s.amount);
    setRCur(s.currency);
    setRCat(s.category);
    setRDesc(s.description);
    setRDate(s.date);
  };

  // ── file picker / camera ──────────────────────────────────
  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      // Extract raw base64 (strip "data:image/...;base64,")
      const b64 = dataUrl.split(",")[1] ?? "";
      setBase64(b64);
      setStage("captured");
    };
    reader.readAsDataURL(file);
  };

  // ── scan ─────────────────────────────────────────────────
  const handleScan = async () => {
    if (!base64) return;
    setStage("scanning");
    setErrMsg("");
    try {
      const result = await scanReceiptWithAI(base64);
      setScanned(result);
      loadScannedIntoForm(result);
      setStage("review");
    } catch (e: any) {
      setErrMsg(e.message ?? "Scanning failed. Please try again.");
      setStage("error");
    }
  };

  // ── save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!rAmount || !rCat) {
      setSaveErr("Amount and category are required.");
      return;
    }
    setSaveErr("");
    setSaving(true);
    try {
      await addTransaction({
        type:        rType,
        amount:      parseFloat(rAmount),
        currency:    rCur,
        category:    rCat as TransactionCategory,
        description: rDesc,
        date:        rDate,
      });
      onSuccess?.();
      onClose();
    } catch (e: any) {
      setSaveErr(e.message || "Failed to save transaction.");
    }
    setSaving(false);
  };

  const reviewCategories =
    rType === TransactionType.Income ? IncomeCategoriesList : ExpenseCategoriesList;

  const confidencePill = scanned && {
    high:   { label: "High confidence",   bg: "#DCFCE7", color: "#14532D" },
    medium: { label: "Medium confidence", bg: "#FEF3C7", color: "#78350F" },
    low:    { label: "Low confidence",    bg: "#FEE2E2", color: "#7F1D1D" },
  }[scanned.confidence];

  // ── render ────────────────────────────────────────────────
  return (
    <div className="p-5 space-y-4">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={isTouchDevice ? "environment" : undefined}
        className="fixed opacity-0 pointer-events-none w-0 h-0"
        onChange={handleCapture}
      />

      {/* ── IDLE: drop zone ── */}
      {stage === "idle" && (
        <>
          <div
            onClick={openPicker}
            className="border-2 border-dashed border-[#C7C3F8] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#5B4FE8] hover:bg-[#F8F7FF] transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EEF0FD] flex items-center justify-center">
              <Camera size={24} className="text-[#5B4FE8]" />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-bold text-[#1A1635]">
                {isTouchDevice ? "Take a Photo" : "Upload a Photo"}
              </div>
              <div className="text-[11px] text-[#8B87A8] mt-0.5">
                {isTouchDevice
                  ? "Capture your receipt or bill"
                  : "Select an image of your receipt or bill"}
              </div>
            </div>
          </div>

          <div className="bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl p-3 space-y-1.5">
            <div className="text-[11px] font-bold text-[#5B4FE8] mb-2">
              📸 Tips for best results
            </div>
            {[
              "Ensure good lighting — avoid shadows on text",
              "Keep the receipt flat and fully in frame",
              "AI will auto-detect amount, date & category",
            ].map((tip) => (
              <div
                key={tip}
                className="flex items-center gap-2 text-[11px] text-[#4A4568]"
              >
                <div className="w-1 h-1 rounded-full bg-[#9B93F5]" />
                {tip}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CAPTURED: preview + scan button ── */}
      {stage === "captured" && preview && (
        <>
          <div className="relative rounded-xl overflow-hidden border border-[#EAE8FB]">
            <img
              src={preview}
              alt="Receipt"
              className="w-full object-cover max-h-56"
            />
            <button
              onClick={reset}
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-[#4A4568] border border-[#EAE8FB]"
            >
              <X size={12} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} /> Retake
            </button>
            <button
              onClick={handleScan}
              className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={13} /> Scan with AI
            </button>
          </div>
        </>
      )}

      {/* ── SCANNING: loading state ── */}
      {stage === "scanning" && (
        <div className="flex flex-col items-center justify-center gap-4 py-10">
          {preview && (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#EAE8FB] opacity-60">
              <img
                src={preview}
                alt="Scanning"
                className="w-full h-full object-cover"
              />
              {/* Animated scan line */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute left-0 right-0 h-0.5 bg-[#5B4FE8]/70"
                  style={{ animation: "scanLine 1.5s ease-in-out infinite" }}
                />
              </div>
            </div>
          )}
          <style>{`
            @keyframes scanLine {
              0%   { top: 0%; }
              50%  { top: 95%; }
              100% { top: 0%; }
            }
          `}</style>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-[#1A1635]">
              <Loader2 size={14} className="animate-spin text-[#5B4FE8]" />
              Analysing receipt…
            </div>
            <p className="text-[11px] text-[#8B87A8] mt-1">
              AI is reading the amount, date, and category
            </p>
          </div>
        </div>
      )}

      {/* ── ERROR state ── */}
      {stage === "error" && (
        <>
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-3 flex items-start gap-2.5">
            <AlertCircle size={14} className="text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <div className="text-[12px] font-semibold text-[#7F1D1D]">
                Scan failed
              </div>
              <div className="text-[11px] text-[#991B1B] mt-0.5">{errMsg}</div>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full py-2.5 text-[12px] font-semibold text-[#5B4FE8] border border-[#C7C3F8] rounded-lg hover:bg-[#F8F7FF] transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={12} /> Try Again
          </button>
        </>
      )}

      {/* ── REVIEW: editable form pre-filled by AI ── */}
      {stage === "review" && scanned && (
        <div className="space-y-4">
          {/* Success + confidence banner */}
          <div className="bg-[#EEF0FD] border border-[#C7C3F8] rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#5B4FE8]" />
              <span className="text-[12px] font-semibold text-[#3C3489]">
                Receipt scanned successfully
              </span>
            </div>
            {confidencePill && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: confidencePill.bg,
                  color:      confidencePill.color,
                }}
              >
                {confidencePill.label}
              </span>
            )}
          </div>

          {/* Thumbnail + edit toggle */}
          <div className="flex items-center gap-3">
            {preview && (
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#EAE8FB] shrink-0">
                <img
                  src={preview}
                  alt="Receipt"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-[#1A1635] truncate">
                {rDesc || "Receipt"}
              </div>
              <div className="text-[11px] text-[#8B87A8]">
                Review and confirm the details below
              </div>
            </div>
            <button
              onClick={() => setEditMode((p) => !p)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                editMode
                  ? "bg-[#EEF0FD] text-[#5B4FE8] border-[#C7C3F8]"
                  : "text-[#8B87A8] border-[#D1CCFF] hover:border-[#C7C3F8]"
              }`}
            >
              <Edit3 size={11} />
              {editMode ? "Editing" : "Edit"}
            </button>
          </div>

          {/* ── Read-only summary OR editable form ── */}
          {!editMode ? (
            <div className="bg-[#F8F7FF] rounded-xl border border-[#EAE8FB] divide-y divide-[#EAE8FB]">
              {[
                {
                  label: "Type",
                  value: rType === TransactionType.Expense ? "Expense" : "Income",
                  chip: true,
                  chipBg:
                    rType === TransactionType.Expense ? "#FEE2E2" : "#DCFCE7",
                  chipColor:
                    rType === TransactionType.Expense ? "#DC2626" : "#16A34A",
                },
                { label: "Amount", value: `${rCur} ${parseFloat(rAmount || "0").toLocaleString()}` },
                { label: "Category", value: rCat || "—" },
                { label: "Description", value: rDesc || "—" },
                { label: "Date", value: rDate
                    ? new Date(rDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })
                    : "—",
                },
              ].map((row: any) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-[11px] text-[#8B87A8]">{row.label}</span>
                  {row.chip ? (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: row.chipBg, color: row.chipColor }}
                    >
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-[12px] font-semibold text-[#1A1635] text-right max-w-[55%] truncate">
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Full editable form */
            <div className="space-y-3">
              {/* Type */}
              <div>
                <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
                  Type
                </label>
                <div className="flex bg-[#F8F7FF] rounded-xl p-1 gap-1">
                  {[TransactionType.Expense, TransactionType.Income].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setRType(t); setRCat(""); }}
                      className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                        rType === t
                          ? t === TransactionType.Expense
                            ? "bg-[#FEE2E2] text-[#DC2626] shadow-sm"
                            : "bg-[#DCFCE7] text-[#16A34A] shadow-sm"
                          : "text-[#8B87A8] hover:text-[#4A4568]"
                      }`}
                    >
                      {t === TransactionType.Expense ? "Expense" : "Income"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount + Currency */}
              <div>
                <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
                  Amount
                </label>
                <div className="flex gap-2">
                  <select
                    value={rCur}
                    onChange={(e) => setRCur(e.target.value as Currency)}
                    className="px-3 py-2.5 text-[12px] font-semibold border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none text-[#4A4568] w-20"
                  >
                    {Object.values(Currency).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={rAmount}
                    onChange={(e) => setRAmount(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-[14px] font-semibold border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
                  Category
                </label>
                <CategoryDropdown
                  categories={reviewCategories}
                  value={rCat}
                  onChange={setRCat}
                  transactionType={rType}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
                  Description
                </label>
                <input
                  type="text"
                  value={rDesc}
                  onChange={(e) => setRDesc(e.target.value)}
                  className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
                  placeholder="e.g. Supermarket bill"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
                  Date
                </label>
                <input
                  type="date"
                  value={rDate}
                  onChange={(e) => setRDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635]"
                />
              </div>
            </div>
          )}

          {saveErr && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {saveErr}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={reset}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} /> Retake
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Saving…" : "Confirm & Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  IMPORT TAB (unchanged from original)                   */
/* ─────────────────────────────────────────────────────── */
function ImportTab({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [file, setFile]         = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setImporting(false);
    setImported(true);
  };

  return (
    <div className="p-5 space-y-4">
      {!imported ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              dragging
                ? "border-[#5B4FE8] bg-[#F0EEFF]"
                : file
                ? "border-[#9B93F5] bg-[#F8F7FF]"
                : "border-[#C7C3F8] hover:border-[#5B4FE8] hover:bg-[#F8F7FF]"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EEF0FD] flex items-center justify-center">
              <Upload size={24} className="text-[#5B4FE8]" />
            </div>
            <div className="text-center">
              {file ? (
                <>
                  <div className="text-[13px] font-bold text-[#5B4FE8]">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-[#8B87A8] mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB · Click to change
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[13px] font-bold text-[#1A1635]">
                    Drop your file here
                  </div>
                  <div className="text-[11px] text-[#8B87A8] mt-0.5">
                    or click to browse · CSV, XLS, XLSX
                  </div>
                </>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && setFile(e.target.files[0])
            }
          />

          <div className="bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl p-3">
            <div className="text-[11px] font-bold text-[#5B4FE8] mb-2">
              📄 Supported formats
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["CSV", "XLS", "XLSX"].map((fmt) => (
                <div
                  key={fmt}
                  className="text-center py-1.5 bg-white border border-[#EAE8FB] rounded-lg text-[11px] font-semibold text-[#4A4568]"
                >
                  {fmt}
                </div>
              ))}
            </div>
            <p className="text-[10.5px] text-[#8B87A8] mt-2">
              Bank exports from most Sri Lankan banks are supported. Column
              headers like{" "}
              <span className="font-mono">date, amount, description</span> are
              auto-detected.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Importing…
                </>
              ) : (
                <>
                  <Upload size={13} /> Import File
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl px-4 py-3 flex items-center gap-2">
            <Check size={14} className="text-[#16A34A]" />
            <span className="text-[12px] font-semibold text-[#14532D]">
              File imported successfully!
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#8B87A8]">File</span>
              <span className="font-bold text-[#1A1635] truncate max-w-[180px]">
                {file?.name}
              </span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#8B87A8]">Transactions found</span>
              <span className="font-bold text-[#1A1635]">24 rows</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#8B87A8]">Date range</span>
              <span className="font-bold text-[#1A1635]">Jan – May 2025</span>
            </div>
          </div>
          <p className="text-[11px] text-[#8B87A8]">
            Full CSV import processing is coming soon. The preview shows
            detected data from your file.
          </p>
          <button
            onClick={() => { onSuccess?.(); onClose(); }}
            className="w-full py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}