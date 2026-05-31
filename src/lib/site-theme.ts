import type { CSSProperties } from "react";
import type { SiteContent } from "./site-content";
import { fontByKey } from "./site-fonts";

const ACCENTS: Record<string, { hex: string; rgb: string }> = {
  bronze: { hex: "#C2974E", rgb: "194,151,78" },
  terracotta: { hex: "#D9774E", rgb: "217,119,78" },
  azure: { hex: "#4C7DF0", rgb: "76,125,240" },
  sage: { hex: "#8FA66E", rgb: "143,166,110" },
};
const CARD_RADIUS: Record<string, string> = { sharp: "6px", soft: "16px", round: "28px" };

function hexToRgb(hex?: string | null): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

// Same theme variables/attributes SiteView applies — reused on blog pages so
// they match the office's site exactly (accent, font, card style/tint/radius).
export function themeAttrs(theme: SiteContent["theme"]): {
  style: CSSProperties;
  dataCard: string;
  dataFont: string;
} {
  const preset = ACCENTS[theme.accent] ?? ACCENTS.bronze;
  const customRgb = hexToRgb(theme.accentHex);
  const accent = customRgb ? { hex: theme.accentHex as string, rgb: customRgb } : preset;
  const style = {
    ["--accent"]: accent.hex,
    ["--accent-rgb"]: accent.rgb,
    ["--card-radius"]: CARD_RADIUS[theme.cardRadius ?? "soft"] ?? CARD_RADIUS.soft,
    ["--card-rgb"]: hexToRgb(theme.cardTint) ?? "16,20,28",
    fontFamily: fontByKey(theme.font).family,
  } as CSSProperties;
  return { style, dataCard: theme.cardStyle ?? "glass", dataFont: theme.font || "readex" };
}
