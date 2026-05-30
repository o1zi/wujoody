// Subscription tiers. Each maps to a product/payment link in your Salla store.
// `caps` controls feature gating (enforced in the editor and at render time).

export type PlanCaps = {
  solidOnly: boolean; // background limited to a solid white/black color
  presets: boolean; // can pick ready-made background clips
  presetLimit: number; // how many presets are usable (Infinity = all)
  upload: boolean; // can upload own video/image/frames
};

export type Plan = {
  code: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  durationDays: number;
  paymentLink: string;
  sallaProductId: string;
  features: string[];
  caps: PlanCaps;
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    code: "basic",
    name: "الأساسية",
    price: 99,
    currency: "SAR",
    period: "شهرياً",
    durationDays: 30,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_BASIC",
    sallaProductId: "REPLACE_BASIC_PRODUCT_ID",
    caps: { solidOnly: true, presets: false, presetLimit: 0, upload: false },
    features: [
      "موقع مكتب كامل بنطاق فرعي",
      "خلفية أنيقة (بيضاء أو سوداء)",
      "محرّر محتوى متكامل",
      "صندوق رسائل العملاء + إشعار بريدي",
      "تحسين الظهور في جوجل (SEO)",
      "أزرار تواصل (واتساب/تيك توك/سناب)",
    ],
  },
  {
    code: "pro",
    name: "الاحترافية",
    price: 199,
    currency: "SAR",
    period: "شهرياً",
    durationDays: 30,
    highlight: true,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_PRO",
    sallaProductId: "REPLACE_PRO_PRODUCT_ID",
    caps: { solidOnly: false, presets: true, presetLimit: 5, upload: false },
    features: [
      "كل مزايا الأساسية",
      "٥ خلفيات فيديو سينمائية جاهزة",
      "خلفية تتحرك مع التمرير",
      "خريطة موقع المكتب (جوجل)",
      "معرض مشاريع بنقر للتكبير",
    ],
  },
  {
    code: "premium",
    name: "بريميوم",
    price: 349,
    currency: "SAR",
    period: "شهرياً",
    durationDays: 30,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_PREMIUM",
    sallaProductId: "REPLACE_PREMIUM_PRODUCT_ID",
    caps: { solidOnly: false, presets: true, presetLimit: Infinity, upload: true },
    features: [
      "كل مزايا الاحترافية",
      "جميع خلفيات الفيديو الجاهزة",
      "رفع فيديو/صور خلفية خاصة بك",
      "تحويل فيديوك لحركة مع التمرير",
      "أولوية في الدعم الفني",
      "نطاق مخصّص (قريباً)",
    ],
  },
];

const DEFAULT_CAPS: PlanCaps = { solidOnly: false, presets: true, presetLimit: Infinity, upload: true };

export function getPlan(code: string): Plan | undefined {
  return PLANS.find((p) => p.code === code);
}

export function getPlanByProductId(productId: string): Plan | undefined {
  return PLANS.find((p) => p.sallaProductId === String(productId));
}

// Capabilities for a plan code. Unknown/legacy codes get the most permissive
// caps so existing offices don't lose features unexpectedly.
export function getPlanCaps(code: string | null | undefined): PlanCaps {
  if (!code) return DEFAULT_CAPS;
  return getPlan(code)?.caps ?? DEFAULT_CAPS;
}
