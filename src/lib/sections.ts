// The site sections that can be gated per plan (caps.sections) and toggled
// per office (content.visible). Order here is the display order in the editor.
export const SITE_SECTIONS: { key: string; label: string }[] = [
  { key: "about", label: "من نحن" },
  { key: "services", label: "الخدمات" },
  { key: "stats", label: "الأرقام" },
  { key: "process", label: "المنهجية" },
  { key: "projects", label: "المشاريع" },
  { key: "team", label: "الفريق" },
  { key: "testimonials", label: "الآراء" },
  { key: "credentials", label: "الاعتمادات" },
  { key: "faq", label: "الأسئلة الشائعة" },
  { key: "booking", label: "حجز استشارة" },
  { key: "calculator", label: "حاسبة التكلفة" },
  { key: "blog", label: "المدوّنة" },
  { key: "contact", label: "التواصل" },
];

export const SECTION_KEYS = SITE_SECTIONS.map((s) => s.key);

// Standard sections every plan gets by default (used for backward-compat when a
// plan row has no explicit caps.sections yet).
export const STANDARD_SECTIONS = [
  "about", "services", "stats", "process", "projects", "team", "testimonials", "faq", "contact",
];

// ---------- Clinic vertical ----------
// Clinics get a different set of sections (own keys). Order = editor display order.
export const CLINIC_SECTIONS: { key: string; label: string }[] = [
  { key: "about", label: "عن العيادة" },
  { key: "specialties", label: "التخصصات والخدمات" },
  { key: "doctors", label: "الأطباء" },
  { key: "results", label: "قبل وبعد" },
  { key: "prices", label: "الأسعار" },
  { key: "stats", label: "الأرقام" },
  { key: "process", label: "رحلة المريض" },
  { key: "testimonials", label: "آراء المرضى" },
  { key: "credentials", label: "الاعتمادات" },
  { key: "faq", label: "الأسئلة الشائعة" },
  { key: "booking", label: "حجز موعد" },
  { key: "contact", label: "التواصل" },
];

export const CLINIC_SECTION_KEYS = CLINIC_SECTIONS.map((s) => s.key);

// ---------- Law vertical ----------
export const LAW_SECTIONS: { key: string; label: string }[] = [
  { key: "about", label: "عن المكتب" },
  { key: "practiceAreas", label: "مجالات الممارسة" },
  { key: "lawyers", label: "المحامون" },
  { key: "fees", label: "الأتعاب" },
  { key: "stats", label: "الأرقام" },
  { key: "process", label: "رحلة القضية" },
  { key: "testimonials", label: "آراء العملاء" },
  { key: "credentials", label: "التراخيص" },
  { key: "faq", label: "الأسئلة الشائعة" },
  { key: "booking", label: "حجز استشارة" },
  { key: "intake", label: "اعرض قضيتك" },
  { key: "contact", label: "التواصل" },
];

export const LAW_SECTION_KEYS = LAW_SECTIONS.map((s) => s.key);

// Resolve the section list/keys for a given vertical.
export function sectionsForKind(kind: string | null | undefined) {
  if (kind === "clinic") return CLINIC_SECTIONS;
  if (kind === "law") return LAW_SECTIONS;
  return SITE_SECTIONS;
}
export function sectionKeysForKind(kind: string | null | undefined) {
  if (kind === "clinic") return CLINIC_SECTION_KEYS;
  if (kind === "law") return LAW_SECTION_KEYS;
  return SECTION_KEYS;
}
