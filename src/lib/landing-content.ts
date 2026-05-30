// Editable content for the platform landing page. Stored in app_settings
// (key='landing') in the DB; falls back to these defaults if absent.
// Feature icons are fixed in code and mapped by index.

export type LandingContent = {
  media: { bgMode: "video" | "frames" | "solid"; bgVideo: string | null; frames: string[] | null; solid: "white" | "black" };
  brand: { ar: string; en: string };
  hero: { eyebrow: string; subtitle: string; meta: { value: string; label: string }[] };
  features: { title: string; lead: string; items: { title: string; desc: string }[] };
  steps: { title: string; items: { title: string; desc: string }[] };
  pricing: { title: string; lead: string };
  cta: { title: string; lead: string; button: string };
  footerTag: string;
};

export const defaultLanding: LandingContent = {
  media: { bgMode: "video", bgVideo: null, frames: null, solid: "black" },
  brand: { ar: "وجود", en: "WUJOOD" },
  hero: {
    eyebrow: "ENGINEERING OFFICES — SAAS PLATFORM · RIYADH",
    subtitle:
      "موقع احترافي لمكتبك الهندسي بنطاقٍ فرعي خاص — سجّل، اشترك بالدفع عبر سلة، وخصّص موقعك من لوحة واحدة. بلا خبرة تقنية.",
    meta: [
      { value: "5+", label: "قوالب جاهزة" },
      { value: "24h", label: "تفعيل خلال يوم" },
      { value: "RTL", label: "دعم عربي كامل" },
    ],
  },
  features: {
    title: "كل ما يحتاجه مكتبك، في منصّة واحدة.",
    lead: "أدوات متكاملة لإطلاق موقع احترافي وإدارته دون تعقيد.",
    items: [
      { title: "نطاق فرعي خاص", desc: "موقع مكتبك على نطاقٍ فرعي مستقل، جاهز فور الاشتراك." },
      { title: "محرّر متكامل", desc: "عدّل النصوص والخدمات والمشاريع والفريق من لوحة واحدة." },
      { title: "خلفيات سينمائية", desc: "فيديو يتحرك مع التمرير، أو خلفية أنيقة — بنقرة." },
      { title: "صندوق عملاء", desc: "كل طلب تواصل يصلك في لوحتك وعلى بريدك فوراً." },
      { title: "تهيئة لجوجل", desc: "وصف ومعاينة وبيانات منظّمة تجعل مكتبك يظهر في البحث." },
      { title: "دفع آمن عبر سلة", desc: "اشترك وادفع عبر سلة، ويُفعّل موقعك تلقائياً." },
    ],
  },
  steps: {
    title: "من التسجيل إلى موقعٍ حيّ.",
    items: [
      { title: "سجّل واحجز نطاقك", desc: "أنشئ حساباً واختر النطاق الفرعي لمكتبك." },
      { title: "اشترك وادفع عبر سلة", desc: "اختر باقتك وأكمل الدفع برابط سلة الآمن." },
      { title: "عدّل وانطلق", desc: "خصّص محتوى موقعك من اللوحة، وموقعك يصبح حياً فوراً." },
    ],
  },
  pricing: {
    title: "باقات تناسب كل مكتب.",
    lead: "الدفع آمن عبر سلة، ويُفعّل موقعك تلقائياً بعد الدفع.",
  },
  cta: {
    title: "جاهز لإطلاق موقع مكتبك؟",
    lead: "أنشئ حسابك خلال دقائق، وابدأ باستقبال عملائك من موقعٍ يليق بمكتبك.",
    button: "أنشئ مكتبك الآن",
  },
  footerTag: "منصّة سعودية لإطلاق مواقع المكاتب الهندسية بنطاقٍ فرعي خاص خلال دقائق.",
};

export function mergeLanding(stored: unknown): LandingContent {
  if (!stored || typeof stored !== "object") return defaultLanding;
  const s = stored as Record<string, unknown>;
  const d = defaultLanding;
  const obj = <T,>(k: keyof LandingContent, fb: T): T =>
    s[k] && typeof s[k] === "object" && !Array.isArray(s[k]) ? ({ ...(fb as object), ...(s[k] as object) } as T) : fb;
  return {
    media: { ...d.media, ...(obj("media", d.media) as object) },
    brand: obj("brand", d.brand),
    hero: { ...d.hero, ...(obj("hero", d.hero) as object) },
    features: { ...d.features, ...(obj("features", d.features) as object) },
    steps: { ...d.steps, ...(obj("steps", d.steps) as object) },
    pricing: { ...d.pricing, ...(obj("pricing", d.pricing) as object) },
    cta: { ...d.cta, ...(obj("cta", d.cta) as object) },
    footerTag: typeof s.footerTag === "string" ? (s.footerTag as string) : d.footerTag,
  };
}
