// Shape of a LAW-FIRM site's editable content + defaults. Law counterpart to
// clinic-content.ts. Stored as JSON in site_content.content; the office `kind`
// ("law") decides which model/editor/renderer is used. Theme/media/brand/
// contact mirror the other verticals so shared machinery is reused.

export type LawContent = {
  theme: {
    accent: "navy" | "maroon" | "bronze" | "sage";
    accentHex?: string | null;
    font?: string;
    cardStyle?: "glass" | "solid" | "outline";
    cardRadius?: "sharp" | "soft" | "round";
    cardTint?: string | null;
    layout?: "hayba" | "adala"; // law page templates (see law templates)
  };
  seo: { googleVerification: string };
  media: { bgVideo: string | null; bgMode: "video" | "frames" | "solid"; frames: string[] | null; solid: "white" | "black" };
  brand: { ar: string; en: string; logo: string | null };
  coordinates: { lat: string; lng: string; label: string };
  hero: { eyebrow: string; title: string; subtitle: string; image: string | null; meta: { value: string; label: string }[] };
  about: { lead: string; body: string; image: string | null; side: { k: string; v: string }[] };
  // Practice areas (التخصصات القانونية).
  practiceAreas: { title: string; lead: string; items: { title: string; desc: string }[] };
  // Lawyers section heading — the lawyers themselves are managed in the dashboard.
  lawyers: { title: string; lead: string };
  // Public fee list (consultations / services).
  fees: { lead: string; unit: string; note: string; items: { name: string; price: string; note?: string }[] };
  stats: { value: string; suffix: string; label: string; en: string }[];
  process: { title: string; desc: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  credentials: { lead: string; badges: { label: string; value: string }[]; clients: { name: string; logo: string | null }[] };
  faq: { items: { q: string; a: string }[] };
  // Consultation booking section copy (engine lives in the appointments tables).
  booking: { title: string; lead: string; note: string };
  // Confidential case-evaluation form copy.
  intake: { title: string; lead: string; note: string };
  contact: {
    phone: string; phoneNote: string; email: string; emailNote: string; office: string; officeNote: string;
    social: string; socialNote: string; whatsapp: string; tiktok: string; snapchat: string; instagram: string; linkedin: string; mapQuery: string;
  };
  visible: {
    about: boolean; practiceAreas: boolean; lawyers: boolean; fees: boolean; stats: boolean; process: boolean;
    testimonials: boolean; credentials: boolean; faq: boolean; booking: boolean; intake: boolean; contact: boolean;
  };
};

export const lawDefaultContent: LawContent = {
  theme: { accent: "navy", accentHex: null, font: "markazi", cardStyle: "solid", cardRadius: "soft", cardTint: null, layout: "hayba" },
  seo: { googleVerification: "" },
  media: { bgVideo: null, bgMode: "solid", frames: null, solid: "white" },
  brand: { ar: "مكتب العدالة", en: "AL-ADALA LAW", logo: null },
  coordinates: { lat: "24.7136°N", lng: "46.6753°E", label: "RIYADH · KSA" },
  hero: {
    eyebrow: "محاماة واستشارات قانونية — الرياض",
    title: "حقّك محفوظ، وقضيتك بأيدٍ أمينة",
    subtitle:
      "نخبة من المحامين والمستشارين القانونيين بخبرة طويلة في الترافع والاستشارات وصياغة العقود — احجز استشارتك اليوم بسرّية تامة.",
    image: null,
    meta: [
      { value: "+500", label: "قضية ناجحة" },
      { value: "18", label: "عاماً من الخبرة" },
      { value: "98%", label: "رضا العملاء" },
    ],
  },
  about: {
    lead: "نؤمن أن لكل قضية حقاً يستحق الدفاع عنه — بخبرةٍ، وحرصٍ، وسرّيةٍ تامة.",
    body: "تأسس مكتبنا لتقديم خدمات قانونية متكاملة للأفراد والشركات. نرافق عملاءنا من الاستشارة الأولى وحتى صدور الحكم أو إتمام التسوية، بفريقٍ من المحامين المرخّصين وخبرة عميقة بالأنظمة السعودية.",
    image: null,
    side: [
      { k: "EST.", v: "تأسس عام 2007 في مدينة الرياض" },
      { k: "LICENSE", v: "مرخّص لدى الهيئة السعودية للمحامين ووزارة العدل" },
      { k: "TEAM", v: "محامون ومستشارون قانونيون معتمدون" },
      { k: "SCOPE", v: "قضايا الأفراد والشركات · ترافع واستشارات وعقود" },
    ],
  },
  practiceAreas: {
    title: "مجالات ممارسة تغطّي كل احتياجاتك القانونية.",
    lead: "خبرة متخصّصة في مختلف فروع القانون، تحت سقفٍ واحد وبأيدٍ موثوقة.",
    items: [
      { title: "القانون التجاري والشركات", desc: "تأسيس الشركات، العقود التجارية، الاندماج والاستحواذ، وحوكمة الشركات." },
      { title: "الأحوال الشخصية", desc: "الطلاق، الحضانة، النفقة، الوصايا، وقسمة المواريث وفق الشريعة والنظام." },
      { title: "القضايا العمّالية", desc: "تمثيل العمّال وأصحاب العمل، مكافأة نهاية الخدمة، والفصل التعسّفي." },
      { title: "القضايا العقارية", desc: "نزاعات الملكية، عقود البيع والإيجار، والتطوير والمقاولات." },
      { title: "القضايا الجزائية", desc: "الدفاع الجنائي، التمثيل أمام النيابة والمحاكم، وحماية الحقوق." },
      { title: "التحكيم وفضّ النزاعات", desc: "التحكيم التجاري، الوساطة، وحلّ النزاعات بكفاءة وسرّية." },
    ],
  },
  lawyers: { title: "فريقنا القانوني", lead: "محامون ومستشارون بخبرات عميقة، يضعون قضيتك في المقام الأول." },
  fees: {
    lead: "أتعاب واضحة وشفافة. الاستشارة الأولى بسعرٍ تنافسي.",
    unit: "ر.س",
    note: "الأتعاب تقديرية وتختلف حسب طبيعة القضية بعد دراسة الملف.",
    items: [
      { name: "استشارة قانونية (حضوري/عن بُعد)", price: "300" },
      { name: "صياغة ومراجعة عقد", price: "750" },
      { name: "تأسيس شركة", price: "2500", note: "حسب نوع الكيان" },
      { name: "الترافع في قضية", price: "حسب القضية" },
    ],
  },
  stats: [
    { value: "18", suffix: "+", label: "عاماً من الخبرة", en: "YEARS" },
    { value: "500", suffix: "+", label: "قضية ناجحة", en: "CASES" },
    { value: "12", suffix: "", label: "محامياً ومستشاراً", en: "LAWYERS" },
    { value: "98", suffix: "%", label: "رضا العملاء", en: "SATISFACTION" },
  ],
  process: [
    { title: "التواصل والتقييم", desc: "تعرض قضيتك بسرّية، ونقيّم موقفك القانوني ونوضّح الخيارات." },
    { title: "دراسة الملف", desc: "نحلّل المستندات والأنظمة ذات العلاقة ونضع استراتيجية واضحة." },
    { title: "الترافع والتفاوض", desc: "نمثّلك أمام الجهات المختصة ونفاوض لتحقيق أفضل نتيجة." },
    { title: "الحكم أو التسوية", desc: "متابعة حتى صدور الحكم أو إتمام التسوية وتنفيذها." },
  ],
  testimonials: [
    { quote: "أدار المحامي قضيتي باحترافية عالية وسرّية تامة، وكسبنا الدعوى. أنصح بهم بشدة.", name: "عبدالله الدوسري", role: "قضية تجارية — الرياض" },
    { quote: "استشارة دقيقة وصياغة عقد محكمة وفّرت علينا نزاعاً مستقبلياً. شكراً لكم.", name: "نورة القحطاني", role: "صاحبة شركة — جدة" },
    { quote: "تابعوا قضيتي العمّالية خطوة بخطوة وحصلت على حقوقي كاملة. فريق يستحق الثقة.", name: "سعود المالكي", role: "قضية عمّالية — الدمام" },
  ],
  credentials: {
    lead: "اعتمادات وتراخيص تمنح عملاءنا الثقة الكاملة.",
    badges: [
      { label: "الهيئة السعودية للمحامين", value: "مكتب مرخّص" },
      { label: "وزارة العدل", value: "معتمد" },
      { label: "رقم القيد", value: "—" },
      { label: "سنة التأسيس", value: "2007" },
    ],
    clients: [],
  },
  faq: {
    items: [
      { q: "هل تحافظون على سرّية القضية؟", a: "نعم، السرّية التامة مبدأ أساسي لدينا. كل ما تشاركه معنا محمي بسرّية مهنية كاملة قبل وبعد التوكيل." },
      { q: "كيف أبدأ مع المكتب؟", a: "اعرض قضيتك عبر النموذج السرّي أو احجز استشارة، وسيتواصل معك أحد المحامين لتقييم موقفك القانوني." },
      { q: "هل المكتب مرخّص؟", a: "نعم، المكتب مرخّص لدى الهيئة السعودية للمحامين ومعتمد لدى وزارة العدل، ويعمل وفق الأنظمة المعتمدة في المملكة." },
      { q: "كيف تُحتسب الأتعاب؟", a: "تختلف حسب نوع القضية وتعقيدها. بعد دراسة الملف نزوّدك بعرض أتعاب واضح قبل البدء، دون رسوم خفية." },
      { q: "هل تقدّمون استشارات عن بُعد؟", a: "نعم، نوفّر الاستشارات حضورياً أو هاتفياً أو عبر الاتصال المرئي حسب ما يناسبك." },
    ],
  },
  booking: { title: "احجز استشارتك القانونية", lead: "اختر الخدمة والوقت المناسب، وسنستقبلك في الموعد بسرّية تامة.", note: "ستصلك رسالة تأكيد بعد الحجز." },
  intake: { title: "اعرض قضيتك بسرّية", lead: "صِف قضيتك باختصار وسيتواصل معك أحد المحامين لتقييم موقفك القانوني.", note: "🔒 كل ما ترسله يُعامل بسرّية مهنية تامة." },
  contact: {
    phone: "+966 11 000 0000",
    phoneNote: "الأحد – الخميس · 9ص – 6م",
    email: "info@adala.sa",
    emailNote: "للاستفسارات والمواعيد",
    office: "Riyadh · KSA",
    officeNote: "طريق الملك فهد، الرياض",
    social: "@adala.sa",
    socialNote: "تابعنا على المنصات",
    whatsapp: "", tiktok: "", snapchat: "", instagram: "", linkedin: "", mapQuery: "",
  },
  visible: {
    about: true, practiceAreas: true, lawyers: true, fees: true, stats: true, process: true,
    testimonials: true, credentials: true, faq: true, booking: true, intake: true, contact: true,
  },
};

// Deep-merge stored law content over defaults so partial edits still render.
export function mergeLawContent(stored: unknown): LawContent {
  if (!stored || typeof stored !== "object") return lawDefaultContent;
  const s = stored as Record<string, unknown>;
  const d = lawDefaultContent;
  const pick = <T,>(key: keyof LawContent, fallback: T): T =>
    (s[key] !== undefined && s[key] !== null ? (s[key] as T) : fallback);
  return {
    theme: { ...d.theme, ...(pick("theme", {}) as object) },
    seo: { ...d.seo, ...(pick("seo", {}) as object) },
    media: { ...d.media, ...(pick("media", {}) as object) },
    brand: { ...d.brand, ...(pick("brand", {}) as object) },
    coordinates: { ...d.coordinates, ...(pick("coordinates", {}) as object) },
    hero: { ...d.hero, ...(pick("hero", {}) as object) },
    about: { ...d.about, ...(pick("about", {}) as object) },
    practiceAreas: { ...d.practiceAreas, ...(pick("practiceAreas", {}) as object) },
    lawyers: { ...d.lawyers, ...(pick("lawyers", {}) as object) },
    fees: { ...d.fees, ...(pick("fees", {}) as object) },
    stats: pick("stats", d.stats),
    process: pick("process", d.process),
    testimonials: pick("testimonials", d.testimonials),
    credentials: { ...d.credentials, ...(pick("credentials", {}) as object) },
    faq: { ...d.faq, ...(pick("faq", {}) as object) },
    booking: { ...d.booking, ...(pick("booking", {}) as object) },
    intake: { ...d.intake, ...(pick("intake", {}) as object) },
    contact: { ...d.contact, ...(pick("contact", {}) as object) },
    visible: { ...d.visible, ...(pick("visible", {}) as object) },
  };
}
