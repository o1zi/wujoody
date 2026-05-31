// Arabic web-font registry for the per-office site theme. Each entry maps a
// stable key (stored in content.theme.font) to its CSS family name and the
// Google Fonts query used to load it.

export type SiteFont = { key: string; label: string; family: string; query: string };

export const SITE_FONTS: SiteFont[] = [
  { key: "readex", label: "ريدكس برو (افتراضي)", family: "'Readex Pro'", query: "Readex+Pro:wght@300;400;500;600;700" },
  { key: "cairo", label: "القاهرة", family: "'Cairo'", query: "Cairo:wght@400;500;600;700" },
  { key: "tajawal", label: "تجوّل", family: "'Tajawal'", query: "Tajawal:wght@400;500;700" },
  { key: "almarai", label: "المراعي", family: "'Almarai'", query: "Almarai:wght@400;700;800" },
  { key: "ibmar", label: "IBM بلكس عربي", family: "'IBM Plex Sans Arabic'", query: "IBM+Plex+Sans+Arabic:wght@400;500;600;700" },
  { key: "notokufi", label: "نوتو كوفي", family: "'Noto Kufi Arabic'", query: "Noto+Kufi+Arabic:wght@400;500;700" },
  { key: "elmessiri", label: "المسيري", family: "'El Messiri'", query: "El+Messiri:wght@400;500;600;700" },
  { key: "changa", label: "تشنقا", family: "'Changa'", query: "Changa:wght@400;500;600;700" },
  { key: "reemkufi", label: "ريم كوفي", family: "'Reem Kufi'", query: "Reem+Kufi:wght@400;500;600;700" },
  { key: "markazi", label: "مركزي", family: "'Markazi Text'", query: "Markazi+Text:wght@400;500;600;700" },
  { key: "amiri", label: "أميري (كلاسيكي)", family: "'Amiri'", query: "Amiri:wght@400;700" },
  { key: "rakkas", label: "ركّاس (عناوين)", family: "'Rakkas'", query: "Rakkas" },
];

export function fontByKey(key?: string | null): SiteFont {
  return SITE_FONTS.find((f) => f.key === key) ?? SITE_FONTS[0];
}

// Build a single Google Fonts stylesheet URL for one or more font keys.
export function googleFontsHref(keys: string[]): string {
  const families = [...new Set(keys)].map((k) => `family=${fontByKey(k).query}`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
