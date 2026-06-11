// Shape of a CLINIC site's editable content + sensible defaults. This is the
// clinic counterpart to site-content.ts (which stays engineering-flavored). A
// clinic office stores this same JSON shape in site_content.content; the `kind`
// column on the office decides which model/editor/renderer is used.
//
// Theme/media/brand/coordinates/seo/contact are intentionally identical in
// shape to SiteContent so the shared theming + media + contact machinery can be
// reused without forking it.

export type ClinicContent = {
  theme: {
    accent: "azure" | "sage" | "bronze" | "terracotta";
    accentHex?: string | null;
    font?: string;
    cardStyle?: "glass" | "solid" | "outline";
    cardRadius?: "sharp" | "soft" | "round";
    cardTint?: string | null;
    layout?: "safa" | "luxe"; // clinic page template
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
    title: string; // big headline (separate from the brand name)
    subtitle: string;
    image: string | null; // hero image (shown in the framed slot)
    meta: { value: string; label: string }[];
  };
  about: {
    lead: string;
    body: string;
    image: string | null; // photo beside the about text (optional)
    side: { k: string; v: string }[];
  };
  // Medical services / specialties offered by the clinic.
  specialties: {
    title: string;
    lead: string;
    items: { title: string; desc: string }[];
  };
  // Doctors section heading only — the actual doctors (name/specialty/photo)
  // are managed in the dashboard (clinic_doctors table) so booking + the public
  // site share one source of truth.
  doctors: {
    title: string;
    lead: string;
  };
  // Before / after case gallery (image pairs).
  results: {
    title: string;
    lead: string;
    items: { title: string; before: string | null; after: string | null }[];
  };
  // Public price list (consultations / packages).
  prices: {
    lead: string;
    unit: string;
    note: string;
    items: { name: string; price: string; note?: string }[];
  };
  stats: { value: string; suffix: string; label: string; en: string }[];
  // The patient journey (steps).
  process: { title: string; desc: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  // Health accreditations / trust badges + partner logos.
  credentials: {
    lead: string;
    badges: { label: string; value: string }[];
    clients: { name: string; logo: string | null }[];
  };
  faq: { items: { q: string; a: string }[] };
  // Copy for the booking section; the actual appointment engine lives in its own
  // tables (Phase 3) — this only configures the public block's text.
  booking: { title: string; lead: string; note: string };
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
    specialties: boolean;
    doctors: boolean;
    results: boolean;
    prices: boolean;
    stats: boolean;
    process: boolean;
    testimonials: boolean;
    credentials: boolean;
    faq: boolean;
    booking: boolean;
    contact: boolean;
  };
};

export const clinicDefaultContent: ClinicContent = {
  theme: { accent: "azure", accentHex: null, font: "readex", cardStyle: "solid", cardRadius: "round", cardTint: null, layout: "safa" },
  seo: { googleVerification: "" },
  media: { bgVideo: null, bgMode: "solid", frames: null, solid: "white" },
  brand: { ar: "عيادة", en: "CLINIC", logo: null },
  coordinates: { lat: "24.7136°N", lng: "46.6753°E", label: "RIYADH · KSA" },
  hero: {
    eyebrow: "عيادة معتمدة · رعاية بمعايير عالمية",
    title: "عناية طبية تليق بك، في مكانٍ يبعث على الطمأنينة",
    subtitle:
      "نخبة من الاستشاريين، أحدث التقنيات، وتجربة رعاية مُصمَّمة حول راحتك. احجز موعدك اليوم واختبر فرقاً حقيقياً في العناية بصحتك وصحة عائلتك.",
    image: null,
    meta: [
      { value: "12", label: "تخصص طبي" },
      { value: "8K+", label: "مريض سعيد" },
      { value: "15", label: "عاماً من العناية" },
    ],
  },
  about: {
    lead: "نعتني بك كما نعتني بأهلنا — تشخيص دقيق، علاج بأحدث التقنيات، وفريق يصغي لك.",
    body: "تأسست العيادة لتقديم رعاية صحية متكاملة بمعايير عالمية. نوفّر بيئة مريحة وآمنة، وفريقاً من الاستشاريين والأخصائيين، وأجهزة حديثة تضمن لك أفضل النتائج وأقل وقت انتظار.",
    image: null,
    side: [
      { k: "EST.", v: "تأسست عام 2010 في مدينة الرياض" },
      { k: "LICENSE", v: "مرخّصة من وزارة الصحة وهيئة التخصصات الصحية" },
      { k: "TEAM", v: "استشاريون وأخصائيون معتمدون" },
      { k: "CARE", v: "تعقيم وفق أعلى معايير السلامة" },
    ],
  },
  specialties: {
    title: "تخصصات وخدمات طبية متكاملة.",
    lead: "كل ما تحتاجه من رعاية تحت سقف واحد، بأيدٍ متخصصة وأجهزة حديثة.",
    items: [
      { title: "طب وتجميل الأسنان", desc: "تنظيف، حشوات تجميلية، تبييض، وابتسامة هوليوود." },
      { title: "تقويم الأسنان", desc: "تقويم معدني وشفاف لجميع الأعمار بخطة علاج واضحة." },
      { title: "زراعة الأسنان", desc: "زراعة فورية ومتأخرة بأنظمة عالمية معتمدة." },
      { title: "علاج الجذور والعصب", desc: "علاج دقيق وغير مؤلم بأحدث الأجهزة." },
      { title: "طب الأطفال", desc: "عناية لطيفة بأسنان الأطفال في جوٍّ مريح." },
      { title: "الجلدية والتجميل", desc: "عناية بالبشرة وحلول تجميلية آمنة بإشراف مختص." },
    ],
  },
  doctors: {
    title: "نخبة من الأطباء",
    lead: "فريق طبي معتمد، يضع راحتك وسلامتك أولاً.",
  },
  results: {
    title: "قبل وبعد",
    lead: "نتائج حقيقية لمرضانا — بإذنهم ومشاركتهم.",
    items: [
      { title: "ابتسامة هوليوود", before: null, after: null },
      { title: "تقويم شفاف", before: null, after: null },
    ],
  },
  prices: {
    lead: "أسعار واضحة وشفافة. الكشف والاستشارة بأسعار تنافسية.",
    unit: "ر.س",
    note: "الأسعار تقديرية وقد تختلف حسب الحالة. الكشف يحدد الخطة النهائية.",
    items: [
      { name: "كشف واستشارة", price: "100" },
      { name: "تنظيف وتلميع الأسنان", price: "250" },
      { name: "تبييض بالليزر", price: "900" },
      { name: "حشوة تجميلية", price: "200", note: "للسن الواحد" },
    ],
  },
  stats: [
    { value: "15", suffix: "+", label: "عاماً من العناية", en: "YEARS" },
    { value: "8", suffix: "K+", label: "مريض سعيد", en: "PATIENTS" },
    { value: "12", suffix: "", label: "تخصصاً طبياً", en: "SPECIALTIES" },
    { value: "98", suffix: "%", label: "رضا المرضى", en: "SATISFACTION" },
  ],
  process: [
    { title: "احجز موعدك", desc: "اختر الخدمة والوقت المناسب لك بضغطة زر." },
    { title: "الكشف والتشخيص", desc: "فحص دقيق وخطة علاج واضحة بالتكلفة والمدة." },
    { title: "العلاج", desc: "علاج مريح بأحدث الأجهزة وأعلى معايير التعقيم." },
    { title: "المتابعة", desc: "متابعة بعد العلاج لضمان أفضل النتائج وراحتك." },
  ],
  testimonials: [
    { quote: "أفضل تجربة علاج أسنان مررت بها. الفريق محترف والمكان نظيف ومريح، والنتيجة فاقت توقعاتي.", name: "محمد القحطاني", role: "مريض — تقويم أسنان" },
    { quote: "تعاملهم راقٍ من أول مكالمة. شرحوا لي كل شيء بوضوح ولم أشعر بأي ألم. أنصح بهم بشدة.", name: "نورة الشمري", role: "مريضة — زراعة أسنان" },
    { quote: "حجزت موعدي أونلاين بسهولة، والانتظار كان بسيطاً. ابتسامتي تغيّرت تماماً.", name: "سعود المطيري", role: "مريض — ابتسامة هوليوود" },
  ],
  credentials: {
    lead: "اعتمادات وشهادات تمنحك الثقة والطمأنينة.",
    badges: [
      { label: "وزارة الصحة", value: "مرخّصة" },
      { label: "هيئة التخصصات الصحية", value: "معتمدة" },
      { label: "رقم الترخيص", value: "—" },
      { label: "سنة التأسيس", value: "2010" },
    ],
    clients: [],
  },
  faq: {
    items: [
      { q: "كيف أحجز موعداً؟", a: "اضغط على «احجز موعد»، اختر الخدمة والطبيب والوقت المناسب، وأدخل بياناتك — وسنؤكد لك الموعد فوراً." },
      { q: "هل تقبلون التأمين الطبي؟", a: "نتعامل مع عدد من شركات التأمين. تواصل معنا للتأكد من تغطية تأمينك قبل الموعد." },
      { q: "هل الكشف مؤلم؟", a: "نحرص على راحتك التامة. الكشف فحص بسيط وغير مؤلم، ونستخدم أحدث التقنيات لتقليل أي إزعاج أثناء العلاج." },
      { q: "كم تستغرق مدة العلاج؟", a: "تختلف حسب الحالة. بعد الكشف نزوّدك بخطة علاج واضحة بالمدة والتكلفة." },
      { q: "ما مواعيد العمل؟", a: "نعمل يومياً وفق أوقات محددة تظهر عند الحجز. اختر الوقت المتاح الأنسب لك." },
    ],
  },
  booking: {
    title: "احجز موعدك الآن",
    lead: "اختر الخدمة والوقت المناسب، وسنستقبلك في الموعد.",
    note: "ستصلك رسالة تأكيد بعد الحجز.",
  },
  contact: {
    phone: "+966 11 000 0000",
    phoneNote: "يومياً · 9ص – 10م",
    email: "hello@clinic.sa",
    emailNote: "للاستفسارات والمواعيد",
    office: "Riyadh · KSA",
    officeNote: "طريق الملك فهد، الرياض",
    social: "@clinic.sa",
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
    specialties: true,
    doctors: true,
    results: true,
    prices: true,
    stats: true,
    process: true,
    testimonials: true,
    credentials: true,
    faq: true,
    booking: true,
    contact: true,
  },
};

// Deep-merge stored clinic content over defaults so partial edits still render.
export function mergeClinicContent(stored: unknown): ClinicContent {
  if (!stored || typeof stored !== "object") return clinicDefaultContent;
  const s = stored as Record<string, unknown>;
  const d = clinicDefaultContent;
  const pick = <T,>(key: keyof ClinicContent, fallback: T): T =>
    (s[key] !== undefined && s[key] !== null ? (s[key] as T) : fallback);
  return {
    theme: { ...d.theme, ...(pick("theme", {}) as object) },
    seo: { ...d.seo, ...(pick("seo", {}) as object) },
    media: { ...d.media, ...(pick("media", {}) as object) },
    brand: { ...d.brand, ...(pick("brand", {}) as object) },
    coordinates: { ...d.coordinates, ...(pick("coordinates", {}) as object) },
    hero: { ...d.hero, ...(pick("hero", {}) as object) },
    about: { ...d.about, ...(pick("about", {}) as object) },
    specialties: { ...d.specialties, ...(pick("specialties", {}) as object) },
    doctors: { ...d.doctors, ...(pick("doctors", {}) as object) },
    results: { ...d.results, ...(pick("results", {}) as object) },
    prices: { ...d.prices, ...(pick("prices", {}) as object) },
    stats: pick("stats", d.stats),
    process: pick("process", d.process),
    testimonials: pick("testimonials", d.testimonials),
    credentials: { ...d.credentials, ...(pick("credentials", {}) as object) },
    faq: { ...d.faq, ...(pick("faq", {}) as object) },
    booking: { ...d.booking, ...(pick("booking", {}) as object) },
    contact: { ...d.contact, ...(pick("contact", {}) as object) },
    visible: { ...d.visible, ...(pick("visible", {}) as object) },
  };
}
