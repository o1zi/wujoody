// Payment methods supported via Salla. Shown on the landing page.
// To use the OFFICIAL logo for any method: drop an image in public/payments/
// (e.g. /payments/mada.svg) and set its `logo` path here — it replaces the text chip.
export type PayMethod = { id: string; name: string; logo?: string };

export const PAYMENT_METHODS: PayMethod[] = [
  { id: "mada", name: "مدى", logo: "/payments/Mada-01.svg" },
  { id: "applepay", name: "Apple Pay", logo: "/payments/Apple Pay-01.svg" },
  { id: "visa", name: "VISA", logo: "/payments/Visa-01.svg" },
  { id: "mastercard", name: "Mastercard", logo: "/payments/Mastercard-01.svg" },
  { id: "stcpay", name: "STC Pay", logo: "/payments/STC-pay.svg" },
  { id: "tabby", name: "tabby", logo: "/payments/Tabby.svg" },
  { id: "tamara", name: "tamara", logo: "/payments/Tamara.svg" },
  { id: "googlepay", name: "Google Pay", logo: "/payments/Google Pay-01.svg" },
  { id: "amex", name: "American Express" },
  { id: "sadad", name: "سداد" },
];
