// Payment methods supported via Salla. Shown on the landing page.
// To use the OFFICIAL logo for any method: drop an image in public/payments/
// (e.g. /payments/mada.svg) and set its `logo` path here — it replaces the text chip.
export type PayMethod = { id: string; name: string; logo?: string };

export const PAYMENT_METHODS: PayMethod[] = [
  { id: "mada", name: "مدى" },
  { id: "applepay", name: "Apple Pay" },
  { id: "visa", name: "VISA" },
  { id: "mastercard", name: "Mastercard" },
  { id: "stcpay", name: "STC Pay" },
  { id: "tabby", name: "tabby" },
  { id: "tamara", name: "tamara" },
  { id: "amex", name: "American Express" },
  { id: "googlepay", name: "Google Pay" },
  { id: "sadad", name: "سداد" },
];
