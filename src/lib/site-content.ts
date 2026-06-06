// Shape of an office site's editable content + sensible defaults (from the Awtad template).

export type SiteContent = {
  theme: {
    accent: "bronze" | "terracotta" | "azure" | "sage";
    accentHex?: string | null; // custom accent color; overrides the preset when set
    font?: string; // key from SITE_FONTS
    cardStyle?: "glass" | "solid" | "outline";
    cardRadius?: "sharp" | "soft" | "round";
    cardTint?: string | null; // hex tint for the cards (transparency preserved on glass)
    layout?: "cinematic" | "minimal" | "luxe" | "corporate" | "editorial" | "bold" | "heritage" | "kinetic" | "aurora" | "blueprint" | "deco" | "concrete"; // page template
  };
  seo: { googleVerification: string };
  media: {
    bgVideo: string | null;
    bgMode: "video" | "frames" | "solid";
    frames: string[] | null;
    solid: "white" | "black";
  };
  brand: { ar: string; en: string; logo: string | null };
  coordinates: { lat: string; lng: string; label: string };
  hero: {
    eyebrow: string;
    subtitle: string;
    meta: { value: string; label: string }[];
  };
  about: {
    lead: string;
    body: string;
    side: { k: string; v: string }[];
  };
  services: {
    title: string;
    lead: string;
    items: { title: string; desc: string }[];
  };
  stats: { value: string; suffix: string; label: string; en: string }[];
  process: { title: string; desc: string }[];
  projects: {
    items: {
      tag: string;
      title: string;
      meta: string;
      image: string | null;
      body?: string; // case-study description (Pro)
      details?: { k: string; v: string }[]; // client/year/scope (Pro)
      gallery?: (string | null)[]; // extra images (Pro)
    }[];
  };
  team: {
    items: { name: string; role: string; roleEn: string; image: string | null }[];
  };
  testimonials: { quote: string; name: string; role: string }[];
  credentials: {
    lead: string;
    badges: { label: string; value: string }[];
    clients: { name: string; logo: string | null }[];
  };
  faq: { items: { q: string; a: string }[] };
  calculator: {
    lead: string;
    unit: string;
    note: string;
    types: { name: string; price: number }[]; // price per m²
    levels: { name: string; factor: number }[]; // finishing multiplier
  };
  contact: {
    phone: string;
    phoneNote: string;
    email: string;
    emailNote: string;
    office: string;
    officeNote: string;
    social: string;
    socialNote: string;
    whatsapp: string;
    tiktok: string;
    snapchat: string;
    instagram: string;
    linkedin: string;
    mapQuery: string;
  };
  visible: {
    about: boolean;
    services: boolean;
    stats: boolean;
    process: boolean;
    projects: boolean;
    team: boolean;
    testimonials: boolean;
    credentials: boolean;
    faq: boolean;
    booking: boolean;
    calculator: boolean;
    blog: boolean;
    contact: boolean;
  };
};

export const defaultContent: SiteContent = {
  theme: { accent: "bronze", accentHex: null, font: "readex", cardStyle: "glass", cardRadius: "soft", cardTint: null, layout: "cinematic" },
  seo: { googleVerification: "" },
  media: { bgVideo: null, bgMode: "video", frames: null, solid: "black" },
  brand: { ar: "أوتاد", en: "AWTAD", logo: null },
  coordinates: { lat: "24.7136°N", lng: "46.6753°E", label: "RIYADH · KSA" },
  hero: {
    eyebrow: "ENGINEERING CONSULTANCY — EST. 2008 · RIYADH",
    subtitle:
      "نُهندِس الرسوخ، ونبني الطموح. مكتب استشاراتٍ هندسية متكامل — من الفكرة الأولى إلى تسليم المفتاح.",
    meta: [
      { value: "09", label: "خدمات هندسية" },
      { value: "240+", label: "مشروع منجز" },
      { value: "17", label: "عاماً من الخبرة" },
    ],
  },
  about: {
    lead: "كل بناءٍ عظيم يبدأ من وتدٍ راسخ. نحن نضع ذلك الوتد — هندسةً دقيقة، وتصميماً يحترم المكان، وإشرافاً لا يساوم على الجودة.",
    body: "تأسس المكتب ليجمع التخصصات الهندسية كافة تحت سقفٍ واحد. نرافق عملاءنا من الدراسة الأولى للأرض، مروراً بالتصميم والترخيص، وصولاً إلى الإشراف على التنفيذ وتسليم المشروع جاهزاً.",
    side: [
      { k: "EST.", v: "تأسس عام 2008 في مدينة الرياض" },
      { k: "LICENSE", v: "مكتب معتمد لدى الهيئة السعودية للمهندسين" },
      { k: "TEAM", v: "فريق متعدد التخصصات من المهندسين والمصممين" },
      { k: "SCOPE", v: "مشاريع سكنية · تجارية · حكومية · صناعية" },
    ],
  },
  services: {
    title: "خدماتٌ هندسية متكاملة، تحت سقفٍ واحد.",
    lead: "تخصصات تعمل بتناغم لتختصر عليك تعدد الجهات، وتضمن انسجام التصميم مع التنفيذ.",
    items: [
      { title: "التصميم المعماري", desc: "تصاميم تستجيب للسياق والوظيفة، من الفكرة الأولى إلى الواجهات والتفاصيل." },
      { title: "التصميم الإنشائي", desc: "أنظمة إنشائية آمنة واقتصادية، محسوبة بدقة وفق أحدث الأكواد." },
      { title: "الأنظمة الكهروميكانيكية", desc: "تصميم متكامل للكهرباء والميكانيكا والسباكة والتكييف (MEP)." },
      { title: "الإشراف على التنفيذ", desc: "متابعة ميدانية تضمن مطابقة المنفّذ للمصمَّم جودةً وزمناً وتكلفة." },
      { title: "إدارة المشاريع", desc: "تخطيط وجدولة وضبط للموارد، يحفظ المشروع ضمن النطاق والميزانية." },
      { title: "التصميم الداخلي والديكور", desc: "فراغات داخلية تُترجم الهوية، بمواد وإضاءة مدروسة حتى آخر تفصيل." },
      { title: "الاستشارات الهندسية", desc: "دراسات جدوى فنية، وحلول هندسية للمشاكل المعقدة، ورأي خبير محايد." },
      { title: "النمذجة الهندسية BIM", desc: "نمذجة معلومات البناء ثلاثية الأبعاد لتنسيق دقيق بين كل التخصصات." },
      { title: "الاستدامة وكفاءة الطاقة", desc: "حلول خضراء تقلّل استهلاك الطاقة وتدعم متطلبات الاستدامة." },
    ],
  },
  stats: [
    { value: "17", suffix: "+", label: "عاماً من الخبرة", en: "YEARS" },
    { value: "240", suffix: "+", label: "مشروعاً منجزاً", en: "PROJECTS" },
    { value: "1.8", suffix: "M", label: "متر مربع مُصمَّم", en: "SQ. METERS" },
    { value: "96", suffix: "%", label: "رضا العملاء", en: "SATISFACTION" },
  ],
  process: [
    { title: "الدراسة والتحليل", desc: "قراءة الموقع والاحتياج والميزانية، وصياغة رؤية واضحة للمشروع." },
    { title: "التصميم والهندسة", desc: "تطوير التصاميم المعمارية والإنشائية والكهروميكانيكية بتناغمٍ تام." },
    { title: "الترخيص والتنسيق", desc: "إنهاء التراخيص والمستندات، وتنسيق المقاولين والموردين." },
    { title: "الإشراف والتسليم", desc: "إشراف ميداني دقيق حتى التسليم النهائي وضمان جودة التنفيذ." },
  ],
  projects: {
    items: [
      { tag: "MIXED-USE", title: "برج أوتاد التجاري", meta: "RIYADH · 2024", image: null },
      { tag: "RESIDENTIAL", title: "فيلا الواحة", meta: "DIRIYAH · 2023", image: null },
      { tag: "GOVERNMENT", title: "المجمّع الإداري الحكومي", meta: "JEDDAH · 2022", image: null },
      { tag: "INDUSTRIAL", title: "مصنع المنطقة الثانية", meta: "DAMMAM · 2021", image: null },
    ],
  },
  team: {
    items: [
      { name: "م. عبدالعزيز الراشد", role: "الشريك المؤسس · رئيس مجلس الإدارة", roleEn: "FOUNDING PARTNER", image: null },
      { name: "م. ليان الحمد", role: "مديرة التصميم المعماري", roleEn: "HEAD OF ARCHITECTURE", image: null },
      { name: "م. فهد العتيبي", role: "رئيس الهندسة الإنشائية", roleEn: "STRUCTURAL LEAD", image: null },
      { name: "م. سارة المطيري", role: "مديرة إدارة المشاريع", roleEn: "PROJECTS DIRECTOR", image: null },
    ],
  },
  testimonials: [
    { quote: "تعاملنا معهم من الفكرة حتى التسليم. الالتزام بالجودة والمواعيد كان مذهلاً، والإشراف الميداني وفّر علينا الكثير.", name: "عبدالله الدوسري", role: "مالك مشروع — برج تجاري، الرياض" },
    { quote: "دقة التصميم الإنشائي والتنسيق بين التخصصات جعلت التنفيذ سلساً بلا مفاجآت. شركاء حقيقيون لا مجرّد مكتب.", name: "نورة القحطاني", role: "مديرة تطوير عقاري — جدة" },
    { quote: "حوّلوا فكرة بسيطة إلى مبنى نفخر به كل يوم. فريق يستمع، ويقترح، ويُنفّذ بإتقان.", name: "سعود المالكي", role: "عميل سكني — الدمام" },
  ],
  credentials: {
    lead: "اعتمادات وشهادات تمنح عملاءنا الثقة الكاملة.",
    badges: [
      { label: "الهيئة السعودية للمهندسين", value: "مكتب معتمد" },
      { label: "رقم الترخيص", value: "—" },
      { label: "تصنيف المقاولين", value: "—" },
      { label: "سنة التأسيس", value: "2008" },
    ],
    clients: [],
  },
  faq: {
    items: [
      { q: "ما الخدمات التي يقدّمها المكتب؟", a: "نقدّم خدمات هندسية متكاملة: التصميم المعماري والإنشائي، الأنظمة الكهروميكانيكية، الإشراف على التنفيذ، وإدارة المشاريع — من الفكرة حتى التسليم." },
      { q: "كم تستغرق مدة التصميم؟", a: "تختلف حسب حجم المشروع ونوعه. بعد الاجتماع الأول ودراسة المتطلبات نزوّدك بجدول زمني واضح بالمراحل والمواعيد." },
      { q: "هل المكتب معتمد لدى الجهات الرسمية؟", a: "نعم، المكتب معتمد لدى الهيئة السعودية للمهندسين، ونلتزم بالأكواد والاشتراطات المعتمدة في المملكة." },
      { q: "هل تشرفون على التنفيذ أم التصميم فقط؟", a: "نقدّم الخيارين: يمكنك الاكتفاء بالتصميم، أو إسناد الإشراف الميداني لنا لضمان مطابقة التنفيذ للمخططات جودةً وزمناً." },
      { q: "كيف أبدأ مشروعي معكم؟", a: "تواصل معنا عبر النموذج أو واتساب، وسنحدّد اجتماعاً أولياً لفهم احتياجك وتقديم عرض واضح بالخدمات والتكلفة." },
    ],
  },
  calculator: {
    lead: "احسب تقديراً أولياً لتكلفة خدمتك الهندسية بإدخال المساحة ونوع الخدمة.",
    unit: "ر.س",
    note: "هذا تقدير تقريبي غير مُلزم. للحصول على عرض دقيق تواصل معنا.",
    types: [
      { name: "تصميم معماري", price: 40 },
      { name: "تصميم معماري + إنشائي", price: 75 },
      { name: "تصميم + إشراف كامل", price: 130 },
    ],
    levels: [
      { name: "أساسي", factor: 1 },
      { name: "متميّز", factor: 1.3 },
      { name: "فاخر", factor: 1.7 },
    ],
  },
  contact: {
    phone: "+966 11 000 0000",
    phoneNote: "الأحد – الخميس · 8ص – 5م",
    email: "hello@awtad.sa",
    emailNote: "للاستفسارات والعروض",
    office: "Riyadh · KSA",
    officeNote: "طريق الملك فهد، الرياض",
    social: "@awtad.sa",
    socialNote: "تابعنا على المنصات",
    whatsapp: "",
    tiktok: "",
    snapchat: "",
    instagram: "",
    linkedin: "",
    mapQuery: "",
  },
  visible: {
    about: true,
    services: true,
    stats: true,
    process: true,
    projects: true,
    team: true,
    testimonials: true,
    credentials: true,
    faq: true,
    booking: true,
    calculator: true,
    blog: true,
    contact: true,
  },
};

import type { PlanCaps } from "./plans";

export function isPresetUrl(u?: string | null): boolean {
  return !!u && u.startsWith("/backgrounds/");
}
export function isUploadedUrl(u?: string | null): boolean {
  return !!u && u.includes("/storage/v1/object/public/site-media/");
}

// Enforce a plan's background capabilities on the content (used at render time
// so downgraded offices can't keep features they no longer pay for).
export function clampMedia(c: SiteContent, caps: PlanCaps): SiteContent {
  const m = c.media;
  let allowed = true;

  if (caps.solidOnly) {
    allowed = m.bgMode === "solid";
  } else if (m.bgMode === "frames" && m.frames && m.frames.length) {
    allowed = isPresetUrl(m.frames[0]) ? caps.presets : caps.upload;
  } else if (m.bgVideo) {
    allowed = isPresetUrl(m.bgVideo) ? caps.presets : caps.upload;
  }
  // default built-in frame background (no custom media) stays allowed for non-basic.

  if (allowed) return c;
  return { ...c, media: { ...m, bgMode: "solid", bgVideo: null, frames: null } };
}

// Deep-merge stored content over defaults so partial edits still render fully.
export function mergeContent(stored: unknown): SiteContent {
  if (!stored || typeof stored !== "object") return defaultContent;
  const s = stored as Record<string, unknown>;
  const d = defaultContent;
  const pick = <T,>(key: keyof SiteContent, fallback: T): T =>
    (s[key] !== undefined && s[key] !== null ? (s[key] as T) : fallback);
  return {
    theme: { ...d.theme, ...(pick("theme", {}) as object) },
    seo: { ...d.seo, ...(pick("seo", {}) as object) },
    media: { ...d.media, ...(pick("media", {}) as object) },
    brand: { ...d.brand, ...(pick("brand", {}) as object) },
    coordinates: { ...d.coordinates, ...(pick("coordinates", {}) as object) },
    hero: { ...d.hero, ...(pick("hero", {}) as object) },
    about: { ...d.about, ...(pick("about", {}) as object) },
    services: { ...d.services, ...(pick("services", {}) as object) },
    stats: pick("stats", d.stats),
    process: pick("process", d.process),
    projects: { ...d.projects, ...(pick("projects", {}) as object) },
    team: { ...d.team, ...(pick("team", {}) as object) },
    testimonials: pick("testimonials", d.testimonials),
    credentials: { ...d.credentials, ...(pick("credentials", {}) as object) },
    faq: { ...d.faq, ...(pick("faq", {}) as object) },
    calculator: { ...d.calculator, ...(pick("calculator", {}) as object) },
    contact: { ...d.contact, ...(pick("contact", {}) as object) },
    visible: { ...d.visible, ...(pick("visible", {}) as object) },
  };
}
