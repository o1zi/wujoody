// Plan TYPES + a code fallback. The source of truth is the `plans` table in
// the DB (see supabase/plans.sql); these fallbacks are used only if the table
// is missing/empty. The capability LOGIC stays in code; only the values come
// from the DB. This file is import-safe from client components (types only).

export type PlanCaps = {
  solidOnly: boolean;
  presets: boolean;
  presetLimit: number; // Infinity = all
  upload: boolean;
  // Value features (Pro = first seven, Premium = all):
  whatsapp: boolean; // instant WhatsApp lead delivery
  booking: boolean; // request-a-consultation booking
  blog: boolean; // SEO blog/news
  projectDetails: boolean; // detailed project case-study pages
  badges: boolean; // accreditation / trust badges
  profilePdf: boolean; // auto-generated company-profile PDF
  customDomain: boolean; // connect-your-own-domain
  crm: boolean; // leads CRM (statuses, notes, export) — Premium
  aiContent: boolean; // AI content generation — Premium
  monthlyReport: boolean; // monthly performance email — Premium
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

export const DEFAULT_CAPS: PlanCaps = {
  solidOnly: false, presets: true, presetLimit: Infinity, upload: true,
  whatsapp: true, booking: true, blog: true, projectDetails: true, badges: true,
  profilePdf: true, customDomain: true, crm: true, aiContent: true, monthlyReport: true,
};

export const FALLBACK_PLANS: Plan[] = [
  {
    code: "basic",
    name: "الأساسية",
    price: 249,
    currency: "SAR",
    period: "شهرياً",
    durationDays: 30,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_BASIC",
    sallaProductId: "REPLACE_BASIC_PRODUCT_ID",
    caps: {
      solidOnly: true, presets: false, presetLimit: 0, upload: false,
      whatsapp: false, booking: false, blog: false, projectDetails: false, badges: false,
      profilePdf: false, customDomain: false, crm: false, aiContent: false, monthlyReport: false,
    },
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
    price: 499,
    currency: "SAR",
    period: "شهرياً",
    durationDays: 30,
    highlight: true,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_PRO",
    sallaProductId: "REPLACE_PRO_PRODUCT_ID",
    caps: {
      solidOnly: false, presets: true, presetLimit: 5, upload: false,
      whatsapp: true, booking: true, blog: true, projectDetails: true, badges: true,
      profilePdf: true, customDomain: true, crm: false, aiContent: false, monthlyReport: false,
    },
    features: [
      "كل مزايا الأساسية",
      "٥ خلفيات فيديو سينمائية جاهزة",
      "خلفية تتحرك مع التمرير + خريطة الموقع",
      "وصول العملاء عبر واتساب فوراً",
      "حجز استشارة + شارات اعتماد + بروفايل PDF",
      "صفحات مشاريع تفصيلية + مدوّنة للـSEO",
      "ربط نطاقك الخاص (.com/.sa)",
    ],
  },
  {
    code: "premium",
    name: "بريميوم",
    price: 899,
    currency: "SAR",
    period: "شهرياً",
    durationDays: 30,
    paymentLink: "https://salla.sa/your-store/checkout/REPLACE_PREMIUM",
    sallaProductId: "REPLACE_PREMIUM_PRODUCT_ID",
    caps: {
      solidOnly: false, presets: true, presetLimit: Infinity, upload: true,
      whatsapp: true, booking: true, blog: true, projectDetails: true, badges: true,
      profilePdf: true, customDomain: true, crm: true, aiContent: true, monthlyReport: true,
    },
    features: [
      "كل مزايا الاحترافية",
      "جميع خلفيات الفيديو + رفع خلفيتك الخاصة",
      "إدارة العملاء المحتملين (CRM مصغّر)",
      "كتابة محتوى موقعك بالذكاء الاصطناعي",
      "تقرير أداء شهري بالبريد",
      "أولوية في الدعم الفني",
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePlan(row: any): Plan {
  const caps = row.caps || {};
  return {
    code: row.code,
    name: row.name,
    price: Number(row.price),
    currency: row.currency || "SAR",
    period: row.period || "شهرياً",
    durationDays: row.duration_days ?? 30,
    paymentLink: row.payment_link || "",
    sallaProductId: row.salla_product_id || "",
    features: Array.isArray(row.features) ? row.features : [],
    highlight: !!row.highlight,
    caps: {
      solidOnly: !!caps.solidOnly,
      presets: caps.presets !== false,
      presetLimit: caps.presetLimit == null ? Infinity : Number(caps.presetLimit),
      upload: caps.upload !== false,
      whatsapp: !!caps.whatsapp,
      booking: !!caps.booking,
      blog: !!caps.blog,
      projectDetails: !!caps.projectDetails,
      badges: !!caps.badges,
      profilePdf: !!caps.profilePdf,
      customDomain: !!caps.customDomain,
      crm: !!caps.crm,
      aiContent: !!caps.aiContent,
      monthlyReport: !!caps.monthlyReport,
    },
  };
}
