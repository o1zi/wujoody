// The platform serves more than one business vertical. Every office row carries
// a `kind` that decides which sections, content defaults, templates, dashboard
// pages and copy it gets. This file is the single source of truth for the
// per-vertical labels/copy and is import-safe from client components (no server
// deps) so both the public registration form and server code can use it.

export type Vertical = "engineering" | "clinic";

export const VERTICALS: Vertical[] = ["engineering", "clinic"];

export const DEFAULT_VERTICAL: Vertical = "engineering";

export type VerticalConfig = {
  kind: Vertical;
  /** "مكتب هندسي" / "عيادة" — singular noun for the business. */
  label: string;
  /** "المكاتب الهندسية" / "العيادات" — plural, used in super-admin/listings. */
  labelPlural: string;
  /** "المكتب" / "العيادة" — the entity with the definite article. */
  entityLabel: string;
  /** Emoji marker used in pickers until we ship real icons. */
  icon: string;
  /** Registration screen copy. */
  registerTitle: string;
  registerSubtitle: string;
  /** Label + placeholder for the business-name field on registration. */
  nameFieldLabel: string;
  namePlaceholder: string;
  /** Fallback name used if the trigger ever provisions without an explicit name. */
  defaultName: string;
  /** Short one-liner shown under the option in the type picker. */
  pickerHint: string;
};

export const VERTICAL_CONFIG: Record<Vertical, VerticalConfig> = {
  engineering: {
    kind: "engineering",
    label: "مكتب هندسي",
    labelPlural: "المكاتب الهندسية",
    entityLabel: "المكتب",
    icon: "🏛️",
    registerTitle: "أنشئ مكتبك",
    registerSubtitle: "دقائق معدودة ويصبح موقعك جاهزاً.",
    nameFieldLabel: "اسم المكتب — OFFICE NAME",
    namePlaceholder: "مكتب أوتاد الهندسي",
    defaultName: "مكتب هندسي",
    pickerHint: "موقع للمكتب + معرض مشاريع + عملاء محتملين",
  },
  clinic: {
    kind: "clinic",
    label: "عيادة",
    labelPlural: "العيادات",
    entityLabel: "العيادة",
    icon: "🩺",
    registerTitle: "أنشئ عيادتك",
    registerSubtitle: "دقائق معدودة ويصبح موقع عيادتك جاهزاً لاستقبال الحجوزات.",
    nameFieldLabel: "اسم العيادة — CLINIC NAME",
    namePlaceholder: "عيادة الابتسامة",
    defaultName: "عيادة",
    pickerHint: "موقع للعيادة + حجز مواعيد + إدارة الأطباء",
  },
};

export function isVertical(v: unknown): v is Vertical {
  return v === "engineering" || v === "clinic";
}

/** Coerce an unknown/legacy value to a valid vertical config (defaults to engineering). */
export function verticalConfig(kind: string | null | undefined): VerticalConfig {
  return VERTICAL_CONFIG[isVertical(kind) ? kind : DEFAULT_VERTICAL];
}

/** Normalize an arbitrary value to a stored vertical (defaults to engineering). */
export function asVertical(kind: string | null | undefined): Vertical {
  return isVertical(kind) ? kind : DEFAULT_VERTICAL;
}
