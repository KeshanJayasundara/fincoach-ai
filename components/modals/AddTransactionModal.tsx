"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  X, PenLine, Camera, Upload, ChevronDown, Check,
  Loader2, Search, RotateCcw, Sparkles, AlertCircle,
  Edit3, Save, Trash2, FileWarning,
} from "lucide-react";
import { addTransaction, importTransactions } from "@/actions/transactions";
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

const ALL_EXPENSE_VALUES  = ExpenseCategoriesList as string[];
const ALL_INCOME_VALUES   = IncomeCategoriesList  as string[];
const ALL_CATEGORY_VALUES = [...ALL_INCOME_VALUES, ...ALL_EXPENSE_VALUES];

function matchCategory(raw: string): TransactionCategory | "" {
  if (!raw) return "";
  const normalised = raw.trim().toLowerCase();
  const found = ALL_CATEGORY_VALUES.find(
    (v) => v.toLowerCase() === normalised,
  );
  return (found as TransactionCategory) ?? "";
}

function inferType(cat: TransactionCategory | ""): TransactionType {
  if (!cat) return TransactionType.Expense;
  return (ALL_INCOME_VALUES as string[]).includes(cat)
    ? TransactionType.Income
    : TransactionType.Expense;
}

// ─── Image compression helper ────────────────────────────────────────────────
// Resizes to max 800px on the longest side and compresses to JPEG q=0.72.
// Reduces a typical phone photo from ~4 MB → ~120 KB before sending to Claude.
async function compressImage(
  dataUrl: string,
  maxPx = 800,
  quality = 0.72,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Return raw base64 only (strip the data:image/jpeg;base64, prefix)
      resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
    };
    img.src = dataUrl;
  });
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
      <div
        className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92dvh] flex flex-col">
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
/*  SEARCHABLE CATEGORY DROPDOWN                           */
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
          className={`text-[#8B87A8] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#D1CCFF] rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2 border-b border-[#EAE8FB]">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
              style={{ background: accentBg, color: accentColor }}
            >
              {isExpense ? "🔴" : "🟢"} {isExpense ? "Expense" : "Income"} categories
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

          <ul className="max-h-44 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => { onChange(cat); setOpen(false); setSearch(""); }}
                    className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between transition-colors ${
                      value === cat
                        ? "bg-[#EEF0FD] text-[#5B4FE8] font-semibold"
                        : "text-[#4A4568] hover:bg-[#F8F7FF]"
                    }`}
                  >
                    {cat}
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
  const [type, setType]               = useState<TransactionType>(prefill?.type ?? TransactionType.Expense);
  const [amount, setAmount]           = useState(prefill?.amount ?? "");
  const [currency, setCurrency]       = useState<Currency>(prefill?.currency ?? Currency.LKR);
  const [category, setCategory]       = useState<TransactionCategory | "">(prefill?.category ?? "");
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [date, setDate]               = useState(prefill?.date ?? new Date().toISOString().slice(0, 10));
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

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

      <div>
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-wider mb-1.5 block">
          Description <span className="font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Monthly rent payment"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635] placeholder:text-[#C4C0DC]"
        />
      </div>

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
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
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

async function scanReceiptWithAI(base64Image: string): Promise<ScannedData> {
  const today = new Date().toISOString().slice(0, 10);

  const response = await fetch("/api/scan-receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image }),
  });

  const json = await response.json();

  if (!response.ok || json.error) {
    throw new Error(json.error || `Server error: ${response.status}`);
  }

  const parsed = json.result;

  const category  = matchCategory(parsed.category ?? "");
  const type      = parsed.type === "income"
    ? TransactionType.Income
    : TransactionType.Expense;
  const finalType = category ? inferType(category) : type;

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
    rawText:     JSON.stringify(parsed),
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
  type Stage = "idle" | "captured" | "scanning" | "review" | "error";
  const [stage, setStage]       = useState<Stage>("idle");
  const [preview, setPreview]   = useState<string | null>(null);
  const [base64, setBase64]     = useState<string>("");
  const [scanned, setScanned]   = useState<ScannedData | null>(null);
  const [errMsg, setErrMsg]     = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState("");

  const [rType,   setRType]   = useState<TransactionType>(TransactionType.Expense);
  const [rAmount, setRAmount] = useState("");
  const [rCur,    setRCur]    = useState<Currency>(Currency.LKR);
  const [rCat,    setRCat]    = useState<TransactionCategory | "">("");
  const [rDesc,   setRDesc]   = useState("");
  const [rDate,   setRDate]   = useState(new Date().toISOString().slice(0, 10));

  const inputRef = useRef<HTMLInputElement>(null);
  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

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

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  // ── Compress on capture before storing base64 ────────────────────────────
  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl); // keep full-res preview for display

      // Compress to ~120 KB before sending to Claude
      const compressed = await compressImage(dataUrl);
      setBase64(compressed);
      setStage("captured");
    };
    reader.readAsDataURL(file);
  };

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

  return (
    <div className="p-5 space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={isTouchDevice ? "environment" : undefined}
        className="fixed opacity-0 pointer-events-none w-0 h-0"
        onChange={handleCapture}
      />

      {/* ── IDLE ── */}
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
              <div key={tip} className="flex items-center gap-2 text-[11px] text-[#4A4568]">
                <div className="w-1 h-1 rounded-full bg-[#9B93F5]" />
                {tip}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CAPTURED ── */}
      {stage === "captured" && preview && (
        <>
          <div className="relative rounded-xl overflow-hidden border border-[#EAE8FB]">
            <img src={preview} alt="Receipt" className="w-full object-cover max-h-56" />
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

      {/* ── SCANNING ── */}
      {stage === "scanning" && (
        <div className="flex flex-col items-center justify-center gap-4 py-10">
          {preview && (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#EAE8FB] opacity-60">
              <img src={preview} alt="Scanning" className="w-full h-full object-cover" />
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

      {/* ── ERROR ── */}
      {stage === "error" && (
        <>
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-3 flex items-start gap-2.5">
            <AlertCircle size={14} className="text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <div className="text-[12px] font-semibold text-[#7F1D1D]">Scan failed</div>
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

      {/* ── REVIEW ── */}
      {stage === "review" && scanned && (
        <div className="space-y-4">
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
                style={{ background: confidencePill.bg, color: confidencePill.color }}
              >
                {confidencePill.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {preview && (
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#EAE8FB] shrink-0">
                <img src={preview} alt="Receipt" className="w-full h-full object-cover" />
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

          {!editMode ? (
            <div className="bg-[#F8F7FF] rounded-xl border border-[#EAE8FB] divide-y divide-[#EAE8FB]">
              {[
                {
                  label: "Type",
                  value: rType === TransactionType.Expense ? "Expense" : "Income",
                  chip: true,
                  chipBg:    rType === TransactionType.Expense ? "#FEE2E2" : "#DCFCE7",
                  chipColor: rType === TransactionType.Expense ? "#DC2626" : "#16A34A",
                },
                { label: "Amount",      value: `${rCur} ${parseFloat(rAmount || "0").toLocaleString()}` },
                { label: "Category",    value: rCat || "—" },
                { label: "Description", value: rDesc || "—" },
                {
                  label: "Date",
                  value: rDate
                    ? new Date(rDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })
                    : "—",
                },
              ].map((row: any) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
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
            <div className="space-y-3">
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
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving…" : "Confirm & Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  IMPORT TAB — real file parsing + editable preview       */
/* ─────────────────────────────────────────────────────── */

interface ParsedRow {
  id: string;
  date: string;               // yyyy-mm-dd
  amount: string;              // kept as string for the editable input
  description: string;
  category: TransactionCategory | "";
  type: TransactionType;
  currency: Currency;
  include: boolean;
}

// Finds a column header matching any of the given candidate names
// (case-insensitive, exact match first, then partial/contains match).
function findKey(keys: string[], candidates: string[]): string | null {
  const normalised = keys.map((k) => ({ orig: k, norm: k.trim().toLowerCase() }));
  for (const c of candidates) {
    const exact = normalised.find((k) => k.norm === c);
    if (exact) return exact.orig;
  }
  for (const c of candidates) {
    const partial = normalised.find((k) => k.norm.includes(c));
    if (partial) return partial.orig;
  }
  return null;
}

// Strips currency symbols/commas/whitespace and parses a number.
// Handles values like "LKR 12,500.00", "-2,000", or a raw number.
function parseAmountValue(raw: any): number {
  if (typeof raw === "number") return raw;
  if (raw === null || raw === undefined || raw === "") return 0;
  const cleaned = String(raw).replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

// Normalises a cell value into a yyyy-mm-dd string.
// Handles JS Date objects (from cellDates:true), Excel serial numbers,
// and plain date strings.
function parseDateValue(raw: any): string {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10);
  }
  if (typeof raw === "number") {
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
    }
  }
  if (typeof raw === "string" && raw.trim()) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return "";
}

// Reads a CSV/XLS/XLSX file and returns normalised, best-effort rows.
// Column headers are auto-detected from common variants used by
// bank/expense-tracker exports.
async function parseImportFile(
  file: File,
): Promise<{ rows: ParsedRow[]; skipped: number }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], skipped: 0 };

  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  const rows: ParsedRow[] = [];
  let skipped = 0;

  raw.forEach((r, idx) => {
    const keys = Object.keys(r);
    const dateKey   = findKey(keys, ["date", "transaction date", "posted date", "value date"]);
    const descKey   = findKey(keys, ["description", "narration", "details", "particulars", "memo", "remarks"]);
    const catKey    = findKey(keys, ["category", "type of expense"]);
    const debitKey  = findKey(keys, ["debit", "withdrawal", "money out", "dr"]);
    const creditKey = findKey(keys, ["credit", "deposit", "money in", "cr"]);
    const amountKey = findKey(keys, ["amount", "value"]);

    const date = dateKey ? parseDateValue(r[dateKey]) : "";

    let signedAmount = 0;
    if (debitKey || creditKey) {
      const debit  = debitKey  ? parseAmountValue(r[debitKey])  : 0;
      const credit = creditKey ? parseAmountValue(r[creditKey]) : 0;
      signedAmount = credit > 0 ? credit : -debit;
    } else if (amountKey) {
      signedAmount = parseAmountValue(r[amountKey]);
    }

    // Skip rows we can't make sense of at all (no date or zero amount).
    if (!date || signedAmount === 0) {
      skipped++;
      return;
    }

    const rawCategory     = catKey ? String(r[catKey]) : "";
    const matchedCategory = matchCategory(rawCategory);
    const type = matchedCategory
      ? inferType(matchedCategory)
      : signedAmount < 0
        ? TransactionType.Expense
        : TransactionType.Income;

    rows.push({
      id:          `row-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      amount:      Math.abs(signedAmount).toFixed(2),
      description: descKey ? String(r[descKey]).slice(0, 120) : "",
      category:    matchedCategory,
      type,
      currency:    Currency.LKR,
      include:     true,
    });
  });

  return { rows, skipped };
}

function ImportTab({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  type Stage = "select" | "parsing" | "preview" | "saving" | "done" | "error";

  const [stage, setStage]         = useState<Stage>("select");
  const [file, setFile]           = useState<File | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [rows, setRows]           = useState<ParsedRow[]>([]);
  const [skipped, setSkipped]     = useState(0);
  const [errMsg, setErrMsg]       = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setStage("parsing");
    setErrMsg("");
    try {
      const { rows: parsed, skipped: sk } = await parseImportFile(f);
      if (parsed.length === 0) {
        setErrMsg(
          "No valid transactions found in this file. Make sure it has recognisable columns like date, amount, and description.",
        );
        setStage("error");
        return;
      }
      setRows(parsed);
      setSkipped(sk);
      setStage("preview");
    } catch (e: any) {
      setErrMsg(
        e.message || "Failed to read this file. Make sure it's a valid CSV or Excel file.",
      );
      setStage("error");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const updateRow = (id: string, patch: Partial<ParsedRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleAll = (include: boolean) => {
    setRows((prev) => prev.map((r) => ({ ...r, include })));
  };

  const includedRows = rows.filter((r) => r.include);
  const readyRows     = includedRows.filter((r) => r.category && parseFloat(r.amount) > 0);
  const needsAttention = includedRows.length - readyRows.length;

  const handleSaveAll = async () => {
    setStage("saving");
    setErrMsg("");
    try {
      const payload = readyRows.map((r) => ({
        type:        r.type,
        amount:      parseFloat(r.amount),
        currency:    r.currency,
        category:    r.category as TransactionCategory,
        description: r.description,
        date:        r.date,
      }));

      if (payload.length === 0) {
        setErrMsg("No valid rows to import. Assign a category and amount to at least one row.");
        setStage("preview");
        return;
      }

      const result = await importTransactions(payload);
      setSavedCount(result.count);
      setStage("done");
    } catch (e: any) {
      setErrMsg(e.message || "Failed to save transactions.");
      setStage("preview");
    }
  };

  const reset = () => {
    setStage("select");
    setFile(null);
    setRows([]);
    setSkipped(0);
    setErrMsg("");
    setSavedCount(0);
  };

  return (
    <div className="p-5 space-y-4">
      {/* ── SELECT ── */}
      {stage === "select" && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              dragging
                ? "border-[#5B4FE8] bg-[#F0EEFF]"
                : "border-[#C7C3F8] hover:border-[#5B4FE8] hover:bg-[#F8F7FF]"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EEF0FD] flex items-center justify-center">
              <Upload size={24} className="text-[#5B4FE8]" />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-bold text-[#1A1635]">Drop your file here</div>
              <div className="text-[11px] text-[#8B87A8] mt-0.5">
                or click to browse · CSV, XLS, XLSX
              </div>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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
              Column headers like{" "}
              <span className="font-mono">date, amount, description, category</span>{" "}
              (or <span className="font-mono">debit/credit</span>) are auto-detected.
              You&apos;ll get to review and fix everything before it&apos;s saved.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* ── PARSING ── */}
      {stage === "parsing" && (
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <Loader2 size={22} className="animate-spin text-[#5B4FE8]" />
          <div className="text-[13px] font-semibold text-[#1A1635]">Reading your file…</div>
          <p className="text-[11px] text-[#8B87A8]">{file?.name}</p>
        </div>
      )}

      {/* ── ERROR ── */}
      {stage === "error" && (
        <>
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-3 flex items-start gap-2.5">
            <FileWarning size={14} className="text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <div className="text-[12px] font-semibold text-[#7F1D1D]">Import failed</div>
              <div className="text-[11px] text-[#991B1B] mt-0.5">{errMsg}</div>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full py-2.5 text-[12px] font-semibold text-[#5B4FE8] border border-[#C7C3F8] rounded-lg hover:bg-[#F8F7FF] transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={12} /> Try a different file
          </button>
        </>
      )}

      {/* ── PREVIEW ── */}
      {stage === "preview" && (
        <div className="space-y-3">
          <div className="bg-[#EEF0FD] border border-[#C7C3F8] rounded-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#3C3489]">
                {rows.length} transaction{rows.length !== 1 ? "s" : ""} detected
              </span>
              {skipped > 0 && (
                <span className="text-[10.5px] text-[#8B87A8]">
                  {skipped} row{skipped !== 1 ? "s" : ""} skipped
                </span>
              )}
            </div>
            {needsAttention > 0 && (
              <p className="text-[10.5px] text-[#7F1D1D] mt-1">
                {needsAttention} row{needsAttention !== 1 ? "s" : ""} need a category before they can be saved.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8B87A8] px-0.5">
            <span>{includedRows.length} of {rows.length} selected</span>
            <div className="flex gap-3">
              <button onClick={() => toggleAll(true)} className="font-semibold text-[#5B4FE8] hover:underline">
                Select all
              </button>
              <button onClick={() => toggleAll(false)} className="font-semibold text-[#8B87A8] hover:underline">
                Deselect all
              </button>
            </div>
          </div>

          <div className="border border-[#EAE8FB] rounded-xl divide-y divide-[#EAE8FB] max-h-[340px] overflow-y-auto">
            {rows.map((row) => {
              const categories =
                row.type === TransactionType.Income ? IncomeCategoriesList : ExpenseCategoriesList;
              const needsCategory = !row.category;

              return (
                <div key={row.id} className={`p-3 space-y-2 ${!row.include ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={(e) => updateRow(row.id, { include: e.target.checked })}
                      className="shrink-0 accent-[#5B4FE8]"
                    />
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, { date: e.target.value })}
                      className="text-[11px] border border-[#D1CCFF] rounded-lg px-2 py-1.5 outline-none focus:border-[#5B4FE8] text-[#4A4568]"
                    />
                    <div className="flex bg-[#F8F7FF] rounded-lg p-0.5 gap-0.5">
                      {[TransactionType.Expense, TransactionType.Income].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => updateRow(row.id, { type: t, category: "" })}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            row.type === t
                              ? t === TransactionType.Expense
                                ? "bg-[#FEE2E2] text-[#DC2626]"
                                : "bg-[#DCFCE7] text-[#16A34A]"
                              : "text-[#8B87A8]"
                          }`}
                        >
                          {t === TransactionType.Expense ? "Exp" : "Inc"}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                      className="w-20 text-[11px] font-semibold border border-[#D1CCFF] rounded-lg px-2 py-1.5 outline-none focus:border-[#5B4FE8] text-[#1A1635] ml-auto"
                    />
                    <button
                      onClick={() => removeRow(row.id)}
                      className="shrink-0 p-1.5 text-[#8B87A8] hover:text-red-600 rounded-lg hover:bg-[#FEF2F2] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={row.category}
                      onChange={(e) => updateRow(row.id, { category: e.target.value as TransactionCategory })}
                      className={`flex-1 text-[11px] border rounded-lg px-2 py-1.5 outline-none bg-white ${
                        needsCategory ? "border-[#FCA5A5] text-[#DC2626]" : "border-[#D1CCFF] text-[#4A4568]"
                      }`}
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => updateRow(row.id, { description: e.target.value })}
                      placeholder="Description"
                      className="flex-1 text-[11px] border border-[#D1CCFF] rounded-lg px-2 py-1.5 outline-none focus:border-[#5B4FE8] text-[#1A1635] placeholder:text-[#C4C0DC]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {errMsg && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {errMsg}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={reset}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors"
            >
              Start over
            </button>
            <button
              onClick={handleSaveAll}
              disabled={readyRows.length === 0}
              className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload size={13} /> Import {readyRows.length} transaction{readyRows.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* ── SAVING ── */}
      {stage === "saving" && (
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <Loader2 size={22} className="animate-spin text-[#5B4FE8]" />
          <div className="text-[13px] font-semibold text-[#1A1635]">Saving transactions…</div>
        </div>
      )}

      {/* ── DONE ── */}
      {stage === "done" && (
        <div className="space-y-4">
          <div className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl px-4 py-3 flex items-center gap-2">
            <Check size={14} className="text-[#16A34A]" />
            <span className="text-[12px] font-semibold text-[#14532D]">
              {savedCount} transaction{savedCount !== 1 ? "s" : ""} imported successfully!
            </span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#8B87A8]">File</span>
            <span className="font-bold text-[#1A1635] truncate max-w-180px">{file?.name}</span>
          </div>
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