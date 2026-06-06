// Bank-transfer payment details + WhatsApp contact for the manual-activation flow.
// Offices transfer the annual fee to this account, send the receipt over WhatsApp,
// and the admin activates the subscription from /super-admin.
//
// Fill these in here (or override via env vars without editing code). Leave a value
// empty and it will simply be hidden in the UI.
export const BANK_DETAILS = {
  // اسم البنك — e.g. "مصرف الراجحي"
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "",
  // اسم صاحب الحساب — must match the registered account holder
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "",
  // رقم الآيبان — e.g. "SA0000000000000000000000"
  iban: process.env.NEXT_PUBLIC_BANK_IBAN || "",
  // رقم الحساب (اختياري)
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "",
};

// WhatsApp number that receives the transfer receipts (international format,
// digits only, no +). e.g. "9665XXXXXXXX". Used to build wa.me links.
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";

// Build a prefilled WhatsApp link, or null if no number is configured.
export function whatsappLink(message: string): string | null {
  if (!SUPPORT_WHATSAPP) return null;
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function hasBankDetails(): boolean {
  return Boolean(BANK_DETAILS.iban || BANK_DETAILS.accountNumber);
}
