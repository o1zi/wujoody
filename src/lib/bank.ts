// Bank-transfer payment settings for the manual-activation flow. Offices
// transfer the annual fee to this account, send the receipt over WhatsApp, and
// the admin activates the subscription from /super-admin.
//
// The source of truth is the `payment` row in app_settings (edited from
// /super-admin/payment). These env vars are only a fallback used before the
// admin has saved anything. This file is import-safe from client components.

export type PaymentSettings = {
  bankName: string; // اسم البنك
  accountName: string; // اسم صاحب الحساب
  iban: string; // رقم الآيبان
  accountNumber: string; // رقم الحساب (اختياري)
  whatsapp: string; // رقم واتساب لاستقبال الإيصالات (دولي، أرقام فقط)
  instructions: string; // ملاحظة/تعليمات إضافية تُعرض للعميل (اختياري)
};

export const DEFAULT_PAYMENT: PaymentSettings = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "",
  iban: process.env.NEXT_PUBLIC_BANK_IBAN || "",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "",
  whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "",
  instructions: "",
};

// Merge a stored settings object over the defaults so partial saves still work.
export function mergePayment(stored: unknown): PaymentSettings {
  if (!stored || typeof stored !== "object") return DEFAULT_PAYMENT;
  const s = stored as Record<string, unknown>;
  const pick = (k: keyof PaymentSettings) =>
    typeof s[k] === "string" ? (s[k] as string) : DEFAULT_PAYMENT[k];
  return {
    bankName: pick("bankName"),
    accountName: pick("accountName"),
    iban: pick("iban"),
    accountNumber: pick("accountNumber"),
    whatsapp: pick("whatsapp"),
    instructions: pick("instructions"),
  };
}

// Build a prefilled WhatsApp link, or null if the number is missing/invalid.
export function whatsappLink(message: string, number: string): string | null {
  const n = (number || "").replace(/\D/g, "");
  if (n.length < 8) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function hasBankDetails(p: PaymentSettings): boolean {
  return Boolean(p.iban || p.accountNumber);
}
