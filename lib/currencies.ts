export interface CurrencyOption {
  code: string;
  name: string;
}

export const CURRENCY_NAMES: Record<string, string> = {
  LKR: "Sri Lankan Rupee (Rs)", USD: "US Dollar ($)", EUR: "Euro (€)",
  GBP: "British Pound (£)", AED: "UAE Dirham (د.إ)", SGD: "Singapore Dollar (S$)",
  INR: "Indian Rupee (₹)", JPY: "Japanese Yen (¥)", CNY: "Chinese Yuan (¥)",
  KRW: "South Korean Won (₩)", MYR: "Malaysian Ringgit (RM)", THB: "Thai Baht (฿)",
  AUD: "Australian Dollar (A$)", SAR: "Saudi Riyal (ر.س)", PKR: "Pakistani Rupee (₨)",
  CAD: "Canadian Dollar (C$)", MXN: "Mexican Peso ($)", BRL: "Brazilian Real (R$)",
  CHF: "Swiss Franc (Fr)", SEK: "Swedish Krona (kr)", NOK: "Norwegian Krone (kr)",
  TRY: "Turkish Lira (₺)", HKD: "Hong Kong Dollar (HK$)",
};

export const popularCurrencies: CurrencyOption[] = [
  { code: "USD", name: "$ · US Dollar" },
  { code: "EUR", name: "€ · Euro" },
  { code: "GBP", name: "£ · British Pound" },
  { code: "AED", name: "د.إ · UAE Dirham" },
  { code: "SGD", name: "S$ · Singapore" },
  { code: "LKR", name: "Rs · Sri Lanka" },
];

export const asiaPacificCurrencies: CurrencyOption[] = [
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
  { code: "HKD", name: "HK$ · Hong Kong" },
];

export const middleEastCurrencies: CurrencyOption[] = [
  { code: "SAR", name: "ر.س · Saudi Arabia" },
  { code: "QAR", name: "ر.ق · Qatar" },
  { code: "KWD", name: "د.ك · Kuwait" },
  { code: "BHD", name: ".د.ب · Bahrain" },
  { code: "OMR", name: "ر.ع. · Oman" },
  { code: "JOD", name: "JD · Jordan" },
];

export const europeCurrencies: CurrencyOption[] = [
  { code: "CHF", name: "Fr · Switzerland" },
  { code: "SEK", name: "kr · Sweden" },
  { code: "NOK", name: "kr · Norway" },
  { code: "DKK", name: "kr · Denmark" },
  { code: "TRY", name: "₺ · Turkey" },
  { code: "PLN", name: "zł · Poland" },
];

export const americasCurrencies: CurrencyOption[] = [
  { code: "CAD", name: "C$ · Canada" },
  { code: "MXN", name: "$ · Mexico" },
  { code: "BRL", name: "R$ · Brazil" },
  { code: "ARS", name: "$ · Argentina" },
];

export const africaCurrencies: CurrencyOption[] = [
  { code: "ZAR", name: "R · South Africa" },
  { code: "NGN", name: "₦ · Nigeria" },
  { code: "KES", name: "KSh · Kenya" },
  { code: "EGP", name: "E£ · Egypt" },
];

export const ALL_CURRENCIES: CurrencyOption[] = [
  ...popularCurrencies,
  ...asiaPacificCurrencies,
  ...middleEastCurrencies,
  ...europeCurrencies,
  ...americasCurrencies,
  ...africaCurrencies,
];

export function getCurrencyDisplayName(code: string): string {
  return CURRENCY_NAMES[code] || code;
}