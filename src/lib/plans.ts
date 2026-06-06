// Plan TYPES + a code fallback. The source of truth is the `plans` table in
// the DB (see supabase/plans.sql); these fallbacks are used only if the table
// is missing/empty. The capability LOGIC stays in code; only the values come
// from the DB. This file is import-safe from client components (types only).

import { SECTION_KEYS, STANDARD_SECTIONS } from "@/lib/sections";

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
  aiMonthlyLimit: number; // max AI generations per office per month
  monthlyReport: boolean; // monthly performance email — Premium
  sections: string[]; // which site sections this plan may use (see lib/sections)
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
  profilePdf: true, customDomain: true, crm: true, aiContent: true, aiMonthlyLimit: 10, monthlyReport: true,
  sections: [...SECTION_KEYS],
};

export const FALLBACK_PLANS: Plan[] = [
  {
    code: "basic",
    name: "الأساسية",
    price: 990,
    currency: "SAR",
    period: "سنوياً",
    durationDays: 365,
    paymentLink: "",
    sallaProductId: "",
    caps: {
      solidOnly: true, presets: false, presetLimit: 0, upload: false,
      whatsapp: false, booking: false, blog: false, projectDetails: false, badges: false,
      profilePdf: false, customDomain: false, crm: false, aiContent: false, aiMonthlyLimit: 0, monthlyReport: false,
      sections: [...STANDARD_SECTIONS],
    },
    features: [
      "موقع احترافي بنطاق فرعي خاص",
      "أنماط تصميم جاهزة + خط ولون قابلان للتخصيص",
      "محرّر محتوى متكامل (من نحن، الخدمات، المشاريع، الفريق…)",
      "نموذج تواصل + إشعار بريد وتيليجرام فوري",
      "تحسين الظهور في جوجل (SEO + خريطة موقع)",
      "أزرار تواصل (واتساب/تيك توك/سناب)",
    ],
  },
  {
    code: "pro",
    name: "الاحترافية",
    price: 1990,
    currency: "SAR",
    period: "سنوياً",
    durationDays: 365,
    highlight: true,
    paymentLink: "",
    sallaProductId: "",
    caps: {
      solidOnly: false, presets: true, presetLimit: 5, upload: false,
      whatsapp: true, booking: true, blog: true, projectDetails: true, badges: true,
      profilePdf: true, customDomain: true, crm: false, aiContent: false, aiMonthlyLimit: 0, monthlyReport: false,
      sections: [...SECTION_KEYS],
    },
    features: [
      "كل مزايا الأساسية",
      "خلفيات فيديو سينمائية + حركة مع التمرير + خريطة",
      "وصول العملاء عبر واتساب فوراً + حجز استشارة",
      "حاسبة تقدير التكلفة + صفحات مشاريع تفصيلية",
      "شارات اعتماد + بروفايل المكتب PDF",
      "مدوّنة للـSEO + ربط نطاقك الخاص (.com/.sa)",
    ],
  },
  {
    code: "premium",
    name: "بريميوم",
    price: 3490,
    currency: "SAR",
    period: "سنوياً",
    durationDays: 365,
    paymentLink: "",
    sallaProductId: "",
    caps: {
      solidOnly: false, presets: true, presetLimit: Infinity, upload: true,
      whatsapp: true, booking: true, blog: true, projectDetails: true, badges: true,
      profilePdf: true, customDomain: true, crm: true, aiContent: true, aiMonthlyLimit: 10, monthlyReport: true,
      sections: [...SECTION_KEYS],
    },
    features: [
      "كل مزايا الاحترافية",
      "رفع فيديو/صور خلفية خاصة بك",
      "إدارة العملاء المحتملين (CRM) + تصدير CSV",
      "كتابة محتوى موقعك بالذكاء الاصطناعي",
      "تقرير أداء شهري بالبريد",
      "أولوية في الدعم الفني",
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePlan(row: any): Plan {
  const caps = row.caps || {};
  // Allowed sections: explicit list, else backward-compat default derived from
  // the legacy badges/booking/blog flags.
  let sections: string[];
  if (Array.isArray(caps.sections)) {
    sections = caps.sections.map(String).filter((s: string) => SECTION_KEYS.includes(s));
  } else {
    sections = [...STANDARD_SECTIONS];
    if (caps.badges) sections.push("credentials");
    if (caps.booking) sections.push("booking");
    if (caps.blog) sections.push("blog");
  }
  const has = (k: string) => sections.includes(k);
  return {
    code: row.code,
    name: row.name,
    price: Number(row.price),
    currency: row.currency || "SAR",
    period: row.period || "سنوياً",
    durationDays: row.duration_days ?? 365,
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
      // booking/blog/badges follow the allowed-sections list (single source).
      booking: has("booking"),
      blog: has("blog"),
      badges: has("credentials"),
      projectDetails: !!caps.projectDetails,
      profilePdf: !!caps.profilePdf,
      customDomain: !!caps.customDomain,
      crm: !!caps.crm,
      aiContent: !!caps.aiContent,
      aiMonthlyLimit: caps.aiMonthlyLimit == null ? (caps.aiContent ? 10 : 0) : Number(caps.aiMonthlyLimit),
      monthlyReport: !!caps.monthlyReport,
      sections,
    },
  };
}
