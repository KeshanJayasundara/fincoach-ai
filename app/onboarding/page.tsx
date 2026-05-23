"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding } from "@/actions/onboarding";

import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import ProfessionCard from "@/components/onboarding/ProfessionCard";
import IncomeCard from "@/components/onboarding/IncomeCard";
import CurrencyCard from "@/components/onboarding/CurrencyCard";
import AuthLogo from "@/components/auth/AuthLogo";
import AuthSubtitle from "@/components/auth/AuthSubtitle";

const currNames: Record<string, string> = {
  LKR: "Sri Lankan Rupee (Rs)", USD: "US Dollar ($)", EUR: "Euro (€)",
  GBP: "British Pound (£)", AED: "UAE Dirham (د.إ)", SGD: "Singapore Dollar (S$)",
  INR: "Indian Rupee (₹)", JPY: "Japanese Yen (¥)", CNY: "Chinese Yuan (¥)",
  KRW: "South Korean Won (₩)", MYR: "Malaysian Ringgit (RM)", THB: "Thai Baht (฿)",
  AUD: "Australian Dollar (A$)", SAR: "Saudi Riyal (ر.س)", PKR: "Pakistani Rupee (₨)",
  CAD: "Canadian Dollar (C$)", MXN: "Mexican Peso ($)", BRL: "Brazilian Real (R$)",
  CHF: "Swiss Franc (Fr)", SEK: "Swedish Krona (kr)", NOK: "Norwegian Krone (kr)",
  TRY: "Turkish Lira (₺)", HKD: "Hong Kong Dollar (HK$)",
};

const chipStyles = [
  { bg: "#EEF0FD", color: "#3C3489", border: "#C7C3F8" },
  { bg: "#DCFCE7", color: "#14532D", border: "#86EFAC" },
];

const professions = [
  { em: "🏥", name: "Doctor" },
  { em: "💻", name: "Software Engineer" },
  { em: "🎓", name: "Student" },
  { em: "🩺", name: "Nurse" },
  { em: "🧑‍💼", name: "Freelancer" },
  { em: "📚", name: "Teacher" },
  { em: "🏢", name: "Business Owner" },
  { em: "⚙️", name: "Engineer" },
  { em: "⚖️", name: "Lawyer" },
  { em: "📊", name: "Accountant" },
  { em: "💊", name: "Pharmacist" },
  { em: "🎨", name: "Designer" },
  { em: "🌴", name: "Retired" },
  { em: "🏛️", name: "Government" },
  { em: "📣", name: "Marketing" },
  { em: "🏗️", name: "Architect" },
  { em: "✏️", name: "Other" },
];

const modalProfessions = [
  { em: "💻", name: "Software Engineer" },
  { em: "🎓", name: "Student" },
  { em: "🩺", name: "Nurse" },
  { em: "🧑‍💼", name: "Freelancer" },
  { em: "📚", name: "Teacher" },
  { em: "🏢", name: "Business Owner" },
  { em: "⚙️", name: "Engineer" },
  { em: "⚖️", name: "Lawyer" },
  { em: "🏛️", name: "Architect" },
  { em: "📊", name: "Accountant" },
  { em: "🎨", name: "Designer" },
  { em: "💼", name: "Consultant" },
  { em: "💊", name: "Pharmacist" },
  { em: "📣", name: "Marketing" },
  { em: "📖", name: "Tutor" },
  { em: "🌴", name: "Retired" },
];

const incomes = [
  { em: "💼", label: "Fixed Salary", desc: "Monthly salary — predictable, stable income" },
  { em: "📈", label: "Variable Income", desc: "Freelance, commission, gig work" },
  { em: "🔀", label: "Mixed Income", desc: "Salary + side income" },
  { em: "🏪", label: "Business Owner", desc: "Self-employed / business profit" },
];

const popularCurrencies = [
  { code: "USD", name: "$ · US Dollar" },
  { code: "EUR", name: "€ · Euro" },
  { code: "GBP", name: "£ · British Pound" },
  { code: "AED", name: "د.إ · UAE Dirham" },
  { code: "SGD", name: "S$ · Singapore" },
  { code: "LKR", name: "Rs · Sri Lanka" },
];

const asiaPacificCurrencies = [
  { code: "INR", name: "₹ · India" },
  { code: "JPY", name: "¥ · Japan" },
  { code: "CNY", name: "¥ · China" },
  { code: "KRW", name: "₩ · South Korea" },
  { code: "MYR", name: "RM · Malaysia" },
  { code: "THB", name: "฿ · Thailand" },
  { code: "AUD", name: "A$ · Australia" },
  { code: "NZD", name: "NZ$ · New Zealand" },
  { code: "PKR", name: "₨ · Pakistan" },
  { code: "BDT", name: "৳ · Bangladesh" },
  { code: "NPR", name: "₨ · Nepal" },
  { code: "MMK", name: "K · Myanmar" },
  { code: "VND", name: "₫ · Vietnam" },
  { code: "PHP", name: "₱ · Philippines" },
  { code: "IDR", name: "Rp · Indonesia" },
  { code: "HKD", name: "HK$ · Hong Kong" },
  { code: "TWD", name: "NT$ · Taiwan" },
  { code: "MOP", name: "P · Macau" },
  { code: "KHR", name: "៛ · Cambodia" },
  { code: "LAK", name: "₭ · Laos" },
  { code: "BND", name: "B$ · Brunei" },
  { code: "MNT", name: "₮ · Mongolia" },
  { code: "AFN", name: "؋ · Afghanistan" },
  { code: "FJD", name: "FJ$ · Fiji" },
  { code: "PGK", name: "K · Papua New Guinea" },
  { code: "WST", name: "WS$ · Samoa" },
  { code: "TOP", name: "T$ · Tonga" },
  { code: "SBD", name: "SI$ · Solomon Islands" },
  { code: "VUV", name: "VT · Vanuatu" },
];

const middleEastCurrencies = [
  { code: "SAR", name: "ر.س · Saudi Arabia" },
  { code: "QAR", name: "ر.ق · Qatar" },
  { code: "KWD", name: "د.ك · Kuwait" },
  { code: "BHD", name: ".د.ب · Bahrain" },
  { code: "OMR", name: "ر.ع. · Oman" },
  { code: "JOD", name: "JD · Jordan" },
  { code: "IQD", name: "ع.د · Iraq" },
  { code: "IRR", name: "﷼ · Iran" },
  { code: "ILS", name: "₪ · Israel" },
  { code: "LBP", name: "ل.ل · Lebanon" },
  { code: "SYP", name: "£S · Syria" },
  { code: "YER", name: "﷼ · Yemen" },
];

const europeCurrencies = [
  { code: "CHF", name: "Fr · Switzerland" },
  { code: "SEK", name: "kr · Sweden" },
  { code: "NOK", name: "kr · Norway" },
  { code: "DKK", name: "kr · Denmark" },
  { code: "TRY", name: "₺ · Turkey" },
  { code: "PLN", name: "zł · Poland" },
  { code: "CZK", name: "Kč · Czech Republic" },
  { code: "HUF", name: "Ft · Hungary" },
  { code: "RON", name: "lei · Romania" },
  { code: "BGN", name: "лв · Bulgaria" },
  { code: "HRK", name: "kn · Croatia" },
  { code: "RSD", name: "дин · Serbia" },
  { code: "UAH", name: "₴ · Ukraine" },
  { code: "RUB", name: "₽ · Russia" },
  { code: "GEL", name: "₾ · Georgia" },
  { code: "AMD", name: "֏ · Armenia" },
  { code: "AZN", name: "₼ · Azerbaijan" },
  { code: "KZT", name: "₸ · Kazakhstan" },
  { code: "UZS", name: "so'm · Uzbekistan" },
  { code: "MDL", name: "L · Moldova" },
  { code: "ALL", name: "L · Albania" },
  { code: "MKD", name: "ден · North Macedonia" },
  { code: "BAM", name: "KM · Bosnia" },
  { code: "ISK", name: "kr · Iceland" },
];

const americasCurrencies = [
  { code: "CAD", name: "C$ · Canada" },
  { code: "MXN", name: "$ · Mexico" },
  { code: "BRL", name: "R$ · Brazil" },
  { code: "ARS", name: "$ · Argentina" },
  { code: "CLP", name: "$ · Chile" },
  { code: "COP", name: "$ · Colombia" },
  { code: "PEN", name: "S/ · Peru" },
  { code: "VES", name: "Bs · Venezuela" },
  { code: "UYU", name: "$U · Uruguay" },
  { code: "PYG", name: "₲ · Paraguay" },
  { code: "BOB", name: "Bs · Bolivia" },
  { code: "GTQ", name: "Q · Guatemala" },
  { code: "CRC", name: "₡ · Costa Rica" },
  { code: "HNL", name: "L · Honduras" },
  { code: "NIO", name: "C$ · Nicaragua" },
  { code: "PAB", name: "B/. · Panama" },
  { code: "DOP", name: "RD$ · Dominican Republic" },
  { code: "CUP", name: "$ · Cuba" },
  { code: "HTG", name: "G · Haiti" },
  { code: "JMD", name: "J$ · Jamaica" },
  { code: "TTD", name: "TT$ · Trinidad & Tobago" },
  { code: "BBD", name: "Bds$ · Barbados" },
  { code: "GYD", name: "G$ · Guyana" },
  { code: "SRD", name: "$· Suriname" },
];

const africaCurrencies = [
  { code: "ZAR", name: "R · South Africa" },
  { code: "NGN", name: "₦ · Nigeria" },
  { code: "GHS", name: "₵ · Ghana" },
  { code: "KES", name: "KSh · Kenya" },
  { code: "TZS", name: "TSh · Tanzania" },
  { code: "UGX", name: "USh · Uganda" },
  { code: "ETB", name: "Br · Ethiopia" },
  { code: "MAD", name: "د.م. · Morocco" },
  { code: "DZD", name: "دج · Algeria" },
  { code: "TND", name: "DT · Tunisia" },
  { code: "EGP", name: "E£ · Egypt" },
  { code: "LYD", name: "LD · Libya" },
  { code: "SDG", name: "ج.س. · Sudan" },
  { code: "AOA", name: "Kz · Angola" },
  { code: "ZMW", name: "ZK · Zambia" },
  { code: "ZWL", name: "Z$ · Zimbabwe" },
  { code: "MZN", name: "MT · Mozambique" },
  { code: "BWP", name: "P · Botswana" },
  { code: "NAD", name: "N$ · Namibia" },
  { code: "MWK", name: "MK · Malawi" },
  { code: "RWF", name: "Fr · Rwanda" },
  { code: "XOF", name: "CFA · West Africa (UEMOA)" },
  { code: "XAF", name: "CFA · Central Africa (CEMAC)" },
  { code: "MGA", name: "Ar · Madagascar" },
  { code: "MUR", name: "₨ · Mauritius" },
  { code: "SCR", name: "₨ · Seychelles" },
  { code: "CVE", name: "$ · Cape Verde" },
  { code: "GMD", name: "D · Gambia" },
  { code: "SLL", name: "Le · Sierra Leone" },
  { code: "GNF", name: "Fr · Guinea" },
  { code: "SOS", name: "Sh · Somalia" },
  { code: "DJF", name: "Fr · Djibouti" },
  { code: "ERN", name: "Nkf · Eritrea" },
  { code: "LSL", name: "L · Lesotho" },
  { code: "SZL", name: "E · Eswatini" },
];

const allCurrencies = [
  ...popularCurrencies,
  ...asiaPacificCurrencies,
  ...middleEastCurrencies,
  ...europeCurrencies,
  ...americasCurrencies,
  ...africaCurrencies,
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [primaryProf, setPrimaryProf] = useState("Doctor");
  const [primaryEm, setPrimaryEm] = useState("🏥");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customProf, setCustomProf] = useState("");
  const [additionalRoles, setAdditionalRoles] = useState<{ prof: string; em: string }[]>([]);

  const [selectedIncome, setSelectedIncome] = useState("Fixed Salary");
  const [selectedIncomeEm, setSelectedIncomeEm] = useState("💼");

  const [selectedCurrency, setSelectedCurrency] = useState("LKR");
  const [currSearch, setCurrSearch] = useState("");

  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [modalSelected, setModalSelected] = useState<{ prof: string; em: string } | null>(null);
  const [modalCustom, setModalCustom] = useState("");
  const [showModalCustomInput, setShowModalCustomInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleProfClick = (name: string, em: string) => {
    if (name === "Other") {
      setShowCustomInput(true);
      setPrimaryProf(customProf || "Custom Profession");
      setPrimaryEm("✏️");
    } else {
      setShowCustomInput(false);
      setPrimaryProf(name);
      setPrimaryEm(em);
      setCustomProf("");
    }
  };

  const displayedPrimaryProf = showCustomInput ? (customProf || "Custom profession") : primaryProf;

  const openAddRoleModal = () => {
    if (additionalRoles.length >= 2) return;
    setModalSelected(null);
    setModalCustom("");
    setShowModalCustomInput(false);
    setShowAddRoleModal(true);
  };

  const closeAddRoleModal = () => {
    setShowAddRoleModal(false);
    setModalSelected(null);
    setModalCustom("");
    setShowModalCustomInput(false);
  };

  const confirmAddRole = () => {
    const roleName = showModalCustomInput ? modalCustom.trim() : modalSelected?.prof;
    const roleEm = showModalCustomInput ? "✏️" : modalSelected?.em ?? "👤";
    if (!roleName) return;
    setAdditionalRoles([...additionalRoles, { prof: roleName, em: roleEm }]);
    closeAddRoleModal();
  };

  const removeRole = (index: number) => {
    setAdditionalRoles(additionalRoles.filter((_, i) => i !== index));
  };

  const filteredCurrencies = currSearch.trim()
    ? allCurrencies.filter(c =>
        c.code.toLowerCase().includes(currSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(currSearch.toLowerCase())
      )
    : null;

  const goToDashboard = () => router.push("/dashboard");

  const handleFinishOnboarding = async () => {
    setLoading(true);
    setError("");
    try {
      await saveOnboarding({
        primaryProfession: showCustomInput ? customProf || "Custom Profession" : primaryProf,
        secondaryRoles: additionalRoles.map(r => r.prof),
        incomeType: selectedIncome,
        preferredCurrency: selectedCurrency,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save your details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addedProfs = additionalRoles.map(r => r.prof);
  const availableModalProfs = modalProfessions.filter(
    p => p.name !== primaryProf && !addedProfs.includes(p.name)
  );

  const modalCanConfirm = showModalCustomInput ? modalCustom.trim().length > 0 : modalSelected !== null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #C7C3F8; border-radius: 99px; }
        .ob-step { animation: obFadeIn 0.2s ease; }
        @keyframes obFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .modal-pcard { border: 2px solid #E2E8F0; border-radius: 12px; padding: 10px 6px; cursor: pointer; transition: all 0.15s; text-align: center; background: #ffffff; }
        .modal-pcard:hover { border-color: #818CF8; background: #EEF0FD; }
        .modal-pcard.sel { border-color: #5B4FE8; background: #EEF0FD; }
        .ob-btn-ghost { padding: 10px 16px; border: 1px solid #D1CCFF; border-radius: 8px; background: #ffffff; color: #4A4568; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .15s; }
        .ob-btn-primary { padding: 10px 16px; border: none; border-radius: 8px; background: #5B4FE8; color: #ffffff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all .15s; }
        .ob-inp { width: 100%; padding: 10px 12px; border: 1px solid #D1CCFF; border-radius: 9px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1A1635; background: #F8F7FF; outline: none; transition: all .15s; }
        .ob-inp:focus { border-color: #5B4FE8; background: #ffffff; box-shadow: 0 0 0 3px rgba(91,79,232,0.10); }
        .curr-section-hdr { grid-column: 1 / -1; font-size: 10px; font-weight: 700; color: #8B87A8; text-transform: uppercase; letter-spacing: .08em; padding: 6px 0 2px; }
        .curr-section-hdr:first-child { padding-top: 4px; }

        /* ── Mobile responsive ── */
        .ob-prof-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-bottom: 10px; }
        .ob-income-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .ob-curr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-height: 220px; overflow-y: auto; padding-right: 2px; }
        .ob-modal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-bottom: 12px; }
        .ob-btn-row { display: flex; gap: 8px; justify-content: space-between; flex-wrap: wrap; }
        .ob-btn-row-end { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
        .ob-btn-right-group { display: flex; gap: 7px; flex-wrap: wrap; }
        .ob-card { background: #ffffff; border-radius: 20px; padding: 28px 28px 32px; width: 100%; max-width: 620px; box-shadow: 0 8px 32px rgba(91,79,232,0.13); }

        @media (max-width: 480px) {
          .ob-card { border-radius: 16px; padding: 20px 16px 24px; }
          .ob-prof-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
          .ob-income-grid { grid-template-columns: 1fr; gap: 8px; }
          .ob-curr-grid { grid-template-columns: repeat(2, 1fr); max-height: 200px; }
          .ob-modal-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
          .ob-btn-row { flex-direction: column-reverse; gap: 8px; }
          .ob-btn-row-end { flex-direction: column; }
          .ob-btn-right-group { flex-direction: column; width: 100%; }
          .ob-btn-ghost { width: 100%; text-align: center; padding: 12px 16px; font-size: 14px; }
          .ob-btn-primary { width: 100%; text-align: center; padding: 12px 16px; font-size: 14px; }
          .ob-finish-btn { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F8F7FF", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", fontFamily: "'Outfit', sans-serif" }}>
        <div className="ob-card">
          <AuthLogo />
          <AuthSubtitle text="Your Details" />
          <OnboardingProgress currentStep={step} />

          {/* STEP 1: Profession */}
          {step === 1 && (
            <div className="ob-step">
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1A1635", marginBottom: "3px", letterSpacing: "-0.3px" }}>What's your primary profession?</div>
              <div style={{ fontSize: "13px", color: "#8B87A8", marginBottom: "14px" }}>AI will personalise advice for your role.</div>

              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#8B87A8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "10px" }}>Popular professions</div>

              <div className="ob-prof-grid">
                {professions.map((prof) => (
                  <ProfessionCard
                    key={prof.name}
                    em={prof.em}
                    name={prof.name}
                    isSelected={prof.name === "Other" ? showCustomInput : primaryProf === prof.name && !showCustomInput}
                    onClick={() => handleProfClick(prof.name, prof.em)}
                  />
                ))}
              </div>

              {showCustomInput && (
                <div style={{ marginTop: "10px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4A4568", marginBottom: "5px" }}>Enter your profession</label>
                  <input
                    className="ob-inp"
                    type="text"
                    placeholder="e.g. Dentist, Pilot, Chef..."
                    value={customProf}
                    onChange={e => {
                      setCustomProf(e.target.value);
                      setPrimaryProf(e.target.value || "Custom Profession");
                    }}
                  />
                </div>
              )}

              <div style={{ background: "#EEF0FD", border: "1px solid #C7C3F8", borderRadius: "10px", padding: "11px 14px", marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "20px" }}>{primaryEm}</span>
                <div style={{ flex: 1, minWidth: "80px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#3C3489" }}>Primary profession</div>
                  <div style={{ fontSize: "13px", color: "#534AB7", fontWeight: 600 }}>{displayedPrimaryProf}</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", background: "#EEF0FD", color: "#3C3489", fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "999px", letterSpacing: ".01em", whiteSpace: "nowrap" }}>Primary ✓</span>
              </div>

              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1A1635" }}>
                    Additional roles{" "}
                    <span style={{ color: "#8B87A8", fontWeight: 400, fontSize: "12px" }}>(optional, max 2)</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px", minHeight: "28px" }}>
                  {additionalRoles.map((role, i) => {
                    const st = chipStyles[i % chipStyles.length];
                    return (
                      <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontFamily: "'Outfit', sans-serif" }}>
                        <span>{role.em}</span>
                        <span>{role.prof}</span>
                        <button onClick={() => removeRole(i)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6, fontSize: "10px", marginLeft: "2px", color: "inherit", lineHeight: 1, padding: 0 }}>✕</button>
                      </div>
                    );
                  })}
                </div>

                {additionalRoles.length < 2 ? (
                  <button onClick={openAddRoleModal} className="ob-btn-ghost" style={{ width: "auto" }}>
                    + Add additional role
                  </button>
                ) : (
                  <div style={{ fontSize: "11px", color: "#D97706", fontWeight: 600, marginTop: "4px" }}>✓ Maximum 2 additional roles added</div>
                )}
              </div>

              <div className="ob-btn-row" style={{ marginTop: "18px" }}>
                <button className="ob-btn-ghost" onClick={goToDashboard}>Skip for now</button>
                <button className="ob-btn-primary" onClick={() => setStep(2)}>Next: Income type →</button>
              </div>
            </div>
          )}

          {/* STEP 2: Income */}
          {step === 2 && (
            <div className="ob-step">
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1A1635", marginBottom: "3px", letterSpacing: "-0.3px" }}>What's your income type?</div>
              <div style={{ fontSize: "13px", color: "#8B87A8", marginBottom: "16px" }}>Helps AI give better budgeting and savings advice.</div>

              <div className="ob-income-grid">
                {incomes.map((inc) => (
                  <IncomeCard
                    key={inc.label}
                    em={inc.em}
                    label={inc.label}
                    desc={inc.desc}
                    isSelected={selectedIncome === inc.label}
                    onClick={() => {
                      setSelectedIncome(inc.label);
                      setSelectedIncomeEm(inc.em);
                    }}
                  />
                ))}
              </div>

              <div className="ob-btn-row">
                <button className="ob-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <div className="ob-btn-right-group">
                  <button className="ob-btn-ghost" onClick={goToDashboard}>Skip for now</button>
                  <button className="ob-btn-primary" onClick={() => setStep(3)}>Next: Currency →</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Currency */}
          {step === 3 && (
            <div className="ob-step">
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1A1635", marginBottom: "3px", letterSpacing: "-0.3px" }}>Choose your base currency</div>
              <div style={{ fontSize: "13px", color: "#8B87A8", marginBottom: "12px" }}>All transactions converted to this currency.</div>

              <div style={{ position: "relative", marginBottom: "10px" }}>
                <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
                <input
                  className="ob-inp"
                  style={{ paddingLeft: "34px" }}
                  type="text"
                  placeholder="Search currency or country..."
                  value={currSearch}
                  onChange={e => setCurrSearch(e.target.value)}
                />
              </div>

              <div className="ob-curr-grid">
                {filteredCurrencies ? (
                  filteredCurrencies.map(c => (
                    <CurrencyCard key={c.code} code={c.code} name={c.name} isSelected={selectedCurrency === c.code} onClick={() => setSelectedCurrency(c.code)} />
                  ))
                ) : (
                  <>
                    <div className="curr-section-hdr">⭐ Popular</div>
                    {popularCurrencies.map(c => (
                      <CurrencyCard key={c.code} code={c.code} name={c.name} isSelected={selectedCurrency === c.code} onClick={() => setSelectedCurrency(c.code)} />
                    ))}
                    <div className="curr-section-hdr">🌏 Asia Pacific</div>
                    {asiaPacificCurrencies.map(c => (
                      <CurrencyCard key={c.code} code={c.code} name={c.name} isSelected={selectedCurrency === c.code} onClick={() => setSelectedCurrency(c.code)} />
                    ))}
                    <div className="curr-section-hdr">🕌 Middle East</div>
                    {middleEastCurrencies.map(c => (
                      <CurrencyCard key={c.code} code={c.code} name={c.name} isSelected={selectedCurrency === c.code} onClick={() => setSelectedCurrency(c.code)} />
                    ))}
                    <div className="curr-section-hdr">🌍 Africa</div>
                    {africaCurrencies.map(c => (
                      <CurrencyCard key={c.code} code={c.code} name={c.name} isSelected={selectedCurrency === c.code} onClick={() => setSelectedCurrency(c.code)} />
                    ))}
                    <div className="curr-section-hdr">🌎 Americas</div>
                    {americasCurrencies.map(c => (
                      <CurrencyCard key={c.code} code={c.code} name={c.name} isSelected={selectedCurrency === c.code} onClick={() => setSelectedCurrency(c.code)} />
                    ))}
                    <div className="curr-section-hdr">🌐 Europe</div>
                    {europeCurrencies.map(c => (
                      <CurrencyCard key={c.code} code={c.code} name={c.name} isSelected={selectedCurrency === c.code} onClick={() => setSelectedCurrency(c.code)} />
                    ))}
                  </>
                )}
              </div>

              <div className="ob-btn-row" style={{ marginTop: "16px" }}>
                <button className="ob-btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="ob-btn-primary ob-finish-btn"
                  style={{ flex: 1, maxWidth: "220px" }}
                >
                  {loading ? "Saving..." : "🚀 Go to Dashboard →"}
                </button>
              </div>

              {error && <p style={{ color: "#ef4444", textAlign: "center", marginTop: "16px", fontSize: "13px" }}>{error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* ADD ROLE MODAL */}
      {showAddRoleModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) closeAddRoleModal(); }}
        >
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "480px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(91,79,232,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1A1635" }}>Add an additional role</div>
              <button onClick={closeAddRoleModal} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#8B87A8", lineHeight: 1 }}>✕</button>
            </div>

            <div className="ob-modal-grid">
              {availableModalProfs.map(p => (
                <div
                  key={p.name}
                  className={`modal-pcard${modalSelected?.prof === p.name && !showModalCustomInput ? " sel" : ""}`}
                  onClick={() => { setModalSelected({ prof: p.name, em: p.em }); setShowModalCustomInput(false); }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "4px" }}>{p.em}</div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "#4A4568", lineHeight: 1.2 }}>{p.name}</div>
                </div>
              ))}
              <div
                className={`modal-pcard${showModalCustomInput ? " sel" : ""}`}
                onClick={() => { setShowModalCustomInput(true); setModalSelected(null); }}
              >
                <div style={{ fontSize: "22px", marginBottom: "4px" }}>✏️</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "#4A4568", lineHeight: 1.2 }}>Other</div>
              </div>
            </div>

            {showModalCustomInput && (
              <div style={{ marginBottom: "12px" }}>
                <input
                  className="ob-inp"
                  type="text"
                  placeholder="e.g. Photographer, Pilot, Chef..."
                  value={modalCustom}
                  onChange={e => setModalCustom(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="ob-btn-ghost" onClick={closeAddRoleModal} style={{ width: "auto" }}>Cancel</button>
              <button
                className="ob-btn-primary"
                onClick={confirmAddRole}
                disabled={!modalCanConfirm}
                style={{ opacity: modalCanConfirm ? 1 : 0.5, width: "auto" }}
              >
                Add role
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}