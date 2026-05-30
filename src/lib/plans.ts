// Subscription plans. Each plan maps to a product/payment link in your Salla store.
// 1) Create the products in Salla, 2) put their payment-link URLs + product IDs here.

export type Plan = {
  code: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  // The Salla "quick payment" link for this product (Salla dashboard > product > payment link).
  paymentLink: string;
  // Salla product id — used to match incoming webhooks to this plan.
  sallaProductId: string;
  // How many days a successful payment grants.
  durationDays: number;
};

export const PLANS: Plan[] = [
  {
    code: "monthly",
    name: "الباقة الشهرية",
    price: 199,
    currency: "SAR",
    period: "شهرياً",
    durationDays: 30,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_MONTHLY",
    sallaProductId: "REPLACE_MONTHLY_PRODUCT_ID",
    features: [
      "موقع مكتب كامل بنطاق فرعي",
      "محرر محتوى متكامل",
      "تحديثات فورية",
      "دعم فني",
    ],
  },
  {
    code: "yearly",
    name: "الباقة السنوية",
    price: 1990,
    currency: "SAR",
    period: "سنوياً",
    durationDays: 365,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_YEARLY",
    sallaProductId: "REPLACE_YEARLY_PRODUCT_ID",
    features: [
      "كل مزايا الباقة الشهرية",
      "شهرين مجاناً",
      "أولوية في الدعم",
      "نطاق مخصص (قريباً)",
    ],
  },
];

export function getPlan(code: string): Plan | undefined {
  return PLANS.find((p) => p.code === code);
}

export function getPlanByProductId(productId: string): Plan | undefined {
  return PLANS.find((p) => p.sallaProductId === String(productId));
}
