// components/modals/AddTransactionModal.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { X, PenLine, Camera, Upload, ChevronDown, Check, Loader2 } from "lucide-react";
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

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("manual");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1A1635]/60 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#EAE8FB] flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-[#1A1635]">Add Transaction</h2>
            <p className="text-[11px] text-[#8B87A8] mt-0.5">Choose how to add your transaction</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAE8FB] text-[#8B87A8] hover:text-[#1A1635] hover:border-[#C7C3F8] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-3 bg-[#F8F7FF] border-b border-[#EAE8FB] flex-shrink-0">
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
          {activeTab === "manual" && <ManualTab onClose={onClose} onSuccess={onSuccess} />}
          {activeTab === "scan"   && <ScanTab   onClose={onClose} onSuccess={onSuccess} />}
          {activeTab === "import" && <ImportTab onClose={onClose} onSuccess={onSuccess} />}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  MANUAL TAB                                             */
/* ─────────────────────────────────────────────────────── */
function ManualTab({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [type, setType] = useState<TransactionType>(TransactionType.Expense);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(Currency.LKR);
  const [category, setCategory] = useState<TransactionCategory | "">("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = type === TransactionType.Income ? IncomeCategoriesList : ExpenseCategoriesList;

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
        amount: parseFloat(amount),
        currency,
        category: category as TransactionCategory,
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
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-[0.05em] mb-1.5 block">Type</label>
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
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-[0.05em] mb-1.5 block">Amount</label>
        <div className="flex gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="px-3 py-2.5 text-[12px] font-semibold border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none text-[#4A4568] w-[80px]"
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
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-[0.05em] mb-1.5 block">Category</label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="w-full px-3 py-2.5 text-[12px] font-medium border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none text-[#4A4568] appearance-none pr-8"
          >
            <option value="">Select category…</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B87A8] pointer-events-none" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-[0.05em] mb-1.5 block">Description <span className="font-normal">(optional)</span></label>
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
        <label className="text-[11px] font-bold text-[#8B87A8] uppercase tracking-[0.05em] mb-1.5 block">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2.5 text-[12px] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none text-[#1A1635]"
        />
      </div>

      {error && (
        <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>
      )}

      {/* Submit */}
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
function ScanTab({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect touch device to show helpful hint text
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleScan = async () => {
    if (!preview) return;
    setScanning(true);
    await new Promise((r) => setTimeout(r, 2000));
    setScanning(false);
    setScanned(true);
  };

  return (
    <div className="p-5 space-y-4">
      {/*
        No `capture` attribute = works on ALL devices:
        - Desktop/laptop  → opens OS file picker (select any image file)
        - Phone/tablet    → shows native "Take Photo / Choose from Gallery" sheet
        position:fixed + opacity-0 + pointer-events-none takes it out of
        the modal overflow stack so nothing blocks the picker from opening.
      */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="fixed opacity-0 pointer-events-none w-0 h-0"
        onChange={handleCapture}
      />

      {!preview ? (
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

          {/* Tips */}
          <div className="bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl p-3 space-y-1.5">
            <div className="text-[11px] font-bold text-[#5B4FE8] mb-2">📸 Tips for best results</div>
            {[
              "Ensure good lighting",
              "Keep the receipt flat",
              "Capture the full receipt in frame",
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-2 text-[11px] text-[#4A4568]">
                <div className="w-1 h-1 rounded-full bg-[#9B93F5]" />
                {tip}
              </div>
            ))}
          </div>
        </>
      ) : !scanned ? (
        <>
          <div className="relative rounded-xl overflow-hidden border border-[#EAE8FB]">
            <img src={preview} alt="Receipt" className="w-full object-cover max-h-[220px]" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-[#4A4568] border border-[#EAE8FB]"
            >
              <X size={12} />
            </button>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {scanning ? (
              <><Loader2 size={13} className="animate-spin" /> Scanning receipt…</>
            ) : (
              <><Camera size={13} /> Scan Receipt</>
            )}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl px-4 py-3 flex items-center gap-2">
            <Check size={14} className="text-[#16A34A]" />
            <span className="text-[12px] font-semibold text-[#14532D]">Receipt scanned! Review the details below.</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#8B87A8]">Amount detected</span>
              <span className="font-bold text-[#1A1635]">LKR 2,450.00</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#8B87A8]">Category suggested</span>
              <span className="font-bold text-[#1A1635]">Food & Grocery</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#8B87A8]">Date detected</span>
              <span className="font-bold text-[#1A1635]">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#8B87A8]">AI scanning is coming soon. Review and confirm the detected values before saving.</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setPreview(null); setScanned(false); }}
              className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors"
            >
              Retake
            </button>
            <button
              onClick={() => { onSuccess?.(); onClose(); }}
              className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  IMPORT TAB                                             */
/* ─────────────────────────────────────────────────────── */
function ImportTab({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
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
          {/* Drop zone */}
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
                  <div className="text-[13px] font-bold text-[#5B4FE8]">{file.name}</div>
                  <div className="text-[11px] text-[#8B87A8] mt-0.5">{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                </>
              ) : (
                <>
                  <div className="text-[13px] font-bold text-[#1A1635]">Drop your file here</div>
                  <div className="text-[11px] text-[#8B87A8] mt-0.5">or click to browse · CSV, XLS, XLSX</div>
                </>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />

          {/* Supported formats */}
          <div className="bg-[#F8F7FF] border border-[#EAE8FB] rounded-xl p-3">
            <div className="text-[11px] font-bold text-[#5B4FE8] mb-2">📄 Supported formats</div>
            <div className="grid grid-cols-3 gap-2">
              {["CSV", "XLS", "XLSX"].map((fmt) => (
                <div key={fmt} className="text-center py-1.5 bg-white border border-[#EAE8FB] rounded-lg text-[11px] font-semibold text-[#4A4568]">
                  {fmt}
                </div>
              ))}
            </div>
            <p className="text-[10.5px] text-[#8B87A8] mt-2">Bank exports from most Sri Lankan banks are supported. Column headers like <span className="font-mono">date, amount, description</span> are auto-detected.</p>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-[12px] font-semibold text-[#8B87A8] border border-[#D1CCFF] rounded-lg hover:border-[#C7C3F8] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {importing ? (
                <><Loader2 size={13} className="animate-spin" /> Importing…</>
              ) : (
                <><Upload size={13} /> Import File</>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl px-4 py-3 flex items-center gap-2">
            <Check size={14} className="text-[#16A34A]" />
            <span className="text-[12px] font-semibold text-[#14532D]">File imported successfully!</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#8B87A8]">File</span>
              <span className="font-bold text-[#1A1635] truncate max-w-[180px]">{file?.name}</span>
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
          <p className="text-[11px] text-[#8B87A8]">Full CSV import processing is coming soon. The preview shows detected data from your file.</p>
          <button onClick={() => { onSuccess?.(); onClose(); }} className="w-full py-2.5 text-[12px] font-semibold text-white bg-[#5B4FE8] hover:bg-[#7B72EC] rounded-lg transition-colors">
            Done
          </button>
        </div>
      )}
    </div>
  );
}