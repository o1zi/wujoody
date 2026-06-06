// Registry of available site templates (page renderers). The office picks one
// via content.theme.layout; the tenant page + editor read from here. Only the
// implemented templates are listed — unknown/legacy values fall back to the
// default (cinematic).

export type TemplateId = "cinematic" | "editorial" | "luxe" | "heritage" | "kinetic" | "aurora" | "blueprint" | "deco" | "concrete" | "atelier";

export type SiteTemplate = {
  id: TemplateId;
  name: string; // Arabic label shown in the editor
  tagline: string; // short description
  stylesheet: string; // /public path to its CSS
  defaultFont: string; // SITE_FONTS key used when the office hasn't chosen one
  dark: boolean; // for the editor swatch
};

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: "cinematic",
    name: "سينمائي",
    tagline: "غامق · خلفية فيديو متحركة · إحساس معماري درامي",
    stylesheet: "/site-template/site.css",
    defaultFont: "readex",
    dark: true,
  },
  {
    id: "editorial",
    name: "تحريري",
    tagline: "فاتح · طباعة ضخمة · إحساس مجلّة معمارية فاخرة",
    stylesheet: "/site-template/editorial.css",
    defaultFont: "ibmar",
    dark: false,
  },
  {
    id: "luxe",
    name: "فخم",
    tagline: "غامق ناعم · ذهبي شامبانيا · خط شعري أنيق وإحساس فاخر",
    stylesheet: "/site-template/luxe.css",
    defaultFont: "markazi",
    dark: true,
  },
  {
    id: "heritage",
    name: "تراثي",
    tagline: "تراث سعودي · مثلّثات نجدية · طيني دافئ وخط كوفي معماري",
    stylesheet: "/site-template/heritage.css",
    defaultFont: "reemkufi",
    dark: false,
  },
  {
    id: "kinetic",
    name: "حركي",
    tagline: "استوديو جريء · أشرطة متحركة وختم دوّار · حروف ضخمة وإبداع غير تقليدي",
    stylesheet: "/site-template/kinetic.css",
    defaultFont: "changa",
    dark: false,
  },
  {
    id: "aurora",
    name: "زجاجي",
    tagline: "تدرّجات أورورا متحركة · بطاقات زجاجية مصنفرة · إحساس عصري ساحر",
    stylesheet: "/site-template/aurora.css",
    defaultFont: "tajawal",
    dark: false,
  },
  {
    id: "blueprint",
    name: "مخطط",
    tagline: "لوحة هندسية · شبكة درافتنق وخطوط أبعاد · أزرق مخطط وخانة عنوان",
    stylesheet: "/site-template/blueprint.css",
    defaultFont: "ibmar",
    dark: true,
  },
  {
    id: "deco",
    name: "ديكو",
    tagline: "آرت ديكو · أخضر زمردي وذهبي · إطارات مزدوجة وزخارف متناظرة",
    stylesheet: "/site-template/deco.css",
    defaultFont: "elmessiri",
    dark: true,
  },
  {
    id: "concrete",
    name: "خرساني",
    tagline: "عمارة خام · خرسانة رمادية وملمس حقيقي · حدود سميكة وظلال صلبة",
    stylesheet: "/site-template/concrete.css",
    defaultFont: "almarai",
    dark: false,
  },
  {
    id: "atelier",
    name: "أتيليه ✦ الأرقى",
    tagline: "القالب الرائد · إضاءة تتبع المؤشر · عناوين متحركة وحركة راقية جداً",
    stylesheet: "/site-template/atelier.css",
    defaultFont: "markazi",
    dark: true,
  },
];

const DEFAULT_TEMPLATE = SITE_TEMPLATES[0];

// All template ids — used by plan caps to express "every template allowed".
export const TEMPLATE_IDS: TemplateId[] = SITE_TEMPLATES.map((t) => t.id);

export function resolveTemplate(layout?: string | null): SiteTemplate {
  return SITE_TEMPLATES.find((t) => t.id === layout) ?? DEFAULT_TEMPLATE;
}
