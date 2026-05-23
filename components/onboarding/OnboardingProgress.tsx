"use client";

interface OnboardingProgressProps {
  currentStep: number; // 1 = Profession, 2 = Income, 3 = Currency
}

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const getDotClass = (step: number) => {
    if (step < currentStep) return "dot-done";
    if (step === currentStep) return "dot-active";
    return "dot-pend";
  };

  const getLblClass = (step: number) => {
    if (step === currentStep) return "lbl-active";
    return "lbl-pend";
  };

  return (
    <>
      <style>{`
        .dot-done  { width:28px;height:28px;border-radius:50%;background:#5B4FE8;color:#ffffff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .dot-active { width:28px;height:28px;border-radius:50%;background:#5B4FE8;color:#ffffff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 0 4px #EEF0FD; }
        .dot-pend  { width:28px;height:28px;border-radius:50%;background:#E2E8F0;color:#94A3B8;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .lbl-active { font-size:11px;font-weight:600;color:#5B4FE8;white-space:nowrap; }
        .lbl-pend   { font-size:11px;font-weight:600;color:#94A3B8;white-space:nowrap; }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "26px", overflowX: "auto" }}>
        {/* Step 1 — Account (always done) */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          <div className="dot-done">✓</div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#8B87A8", whiteSpace: "nowrap" }}>Account</div>
        </div>
        <div style={{ flex: 1, height: "1px", background: "#EAE8FB", minWidth: "12px" }} />

        {/* Step 2 — Profession */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          <div className={getDotClass(1)}>{currentStep > 1 ? "✓" : "2"}</div>
          <div className={getLblClass(1)}>Profession</div>
        </div>
        <div style={{ flex: 1, height: "1px", background: "#EAE8FB", minWidth: "12px" }} />

        {/* Step 3 — Income */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          <div className={getDotClass(2)}>{currentStep > 2 ? "✓" : "3"}</div>
          <div className={getLblClass(2)}>Income</div>
        </div>
        <div style={{ flex: 1, height: "1px", background: "#EAE8FB", minWidth: "12px" }} />

        {/* Step 4 — Currency */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          <div className={getDotClass(3)}>4</div>
          <div className={getLblClass(3)}>Currency</div>
        </div>
      </div>
    </>
  );
}