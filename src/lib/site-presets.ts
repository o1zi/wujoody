// One-click design presets: each bundles a full look (font + accent + card
// style/radius/tint + background) applied to content.theme + content.media.
export type SitePreset = {
  key: string;
  label: string;
  font: string;
  accentHex: string;
  cardStyle: "glass" | "solid" | "outline";
  cardRadius: "sharp" | "soft" | "round";
  cardTint: string | null;
  solid: "black" | "white";
};

export const SITE_PRESETS: SitePreset[] = [
  { key: "royal", label: "ملكي داكن", font: "readex", accentHex: "#C2974E", cardStyle: "glass", cardRadius: "soft", cardTint: null, solid: "black" },
  { key: "gold", label: "ذهبي أنيق", font: "elmessiri", accentHex: "#CDA258", cardStyle: "glass", cardRadius: "round", cardTint: "#161310", solid: "black" },
  { key: "bold", label: "جريء داكن", font: "changa", accentHex: "#D9774E", cardStyle: "solid", cardRadius: "soft", cardTint: "#15171c", solid: "black" },
  { key: "modern", label: "عصري فاتح", font: "cairo", accentHex: "#4C7DF0", cardStyle: "solid", cardRadius: "round", cardTint: null, solid: "white" },
  { key: "clean", label: "معماري نظيف", font: "ibmar", accentHex: "#8FA66E", cardStyle: "outline", cardRadius: "sharp", cardTint: null, solid: "white" },
  { key: "calm", label: "هادئ أبيض", font: "tajawal", accentHex: "#0E7C7B", cardStyle: "outline", cardRadius: "round", cardTint: null, solid: "white" },
];
