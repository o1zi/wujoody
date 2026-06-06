// Registry of available site templates (page renderers). The office picks one
// via content.theme.layout; the tenant page + editor read from here. Only the
// implemented templates are listed — unknown/legacy values fall back to the
// default (cinematic).

export type TemplateId = "cinematic" | "editorial";

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
];

const DEFAULT_TEMPLATE = SITE_TEMPLATES[0];

export function resolveTemplate(layout?: string | null): SiteTemplate {
  return SITE_TEMPLATES.find((t) => t.id === layout) ?? DEFAULT_TEMPLATE;
}
