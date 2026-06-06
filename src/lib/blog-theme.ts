import type { CSSProperties } from "react";
import { fontByKey } from "@/lib/site-fonts";
import { resolveTemplate } from "@/lib/site-templates";
import type { SiteContent } from "@/lib/site-content";

// Per-template blog palette (matches each template's signature look).
type Palette = { bg: string; surf: string; text: string; text2: string; hair: string; accent: string };

const PALETTES: Record<string, Palette> = {
  cinematic: { bg: "#06070A", surf: "rgba(255,255,255,.04)", text: "#F1ECE2", text2: "rgba(255,255,255,.64)", hair: "rgba(255,255,255,.12)", accent: "#C2974E" },
  editorial: { bg: "#F4F1EA", surf: "#ECE7DB", text: "#15110C", text2: "#4A4338", hair: "rgba(21,17,12,.14)", accent: "#B5803A" },
  luxe: { bg: "#0C0E13", surf: "#161A22", text: "#ECE6DC", text2: "#B7AE9F", hair: "rgba(236,230,220,.12)", accent: "#C9A86A" },
  heritage: { bg: "#EDE3CE", surf: "#FBF5E9", text: "#33271B", text2: "#6E5C49", hair: "rgba(51,39,27,.16)", accent: "#B25430" },
  kinetic: { bg: "#ECE8DF", surf: "#E4DFD3", text: "#121110", text2: "#4B4842", hair: "rgba(18,17,16,.18)", accent: "#E8462E" },
  aurora: { bg: "#E9EDF5", surf: "#F3F5FA", text: "#1B2130", text2: "#535E76", hair: "rgba(27,33,48,.12)", accent: "#6D5DF6" },
  blueprint: { bg: "#0B2A45", surf: "#0E3253", text: "#E6EFF8", text2: "#A6BFD6", hair: "rgba(214,233,249,.18)", accent: "#54C5E8" },
  deco: { bg: "#082019", surf: "#0F342A", text: "#EEE7D5", text2: "#A7BBAE", hair: "rgba(201,162,75,.3)", accent: "#C9A24B" },
  concrete: { bg: "#CBC7BE", surf: "#D3CFC6", text: "#26241F", text2: "#5B574E", hair: "rgba(38,36,31,.2)", accent: "#B5462A" },
  atelier: { bg: "#141110", surf: "#1B1714", text: "#F1E9D8", text2: "#C7BDA9", hair: "rgba(241,233,216,.16)", accent: "#C77B43" },
};

function validHex(h?: string | null): boolean {
  return !!h && /^#?[0-9a-f]{6}$/i.test(h.trim());
}

// Resolve the blog's CSS variables + font from the office's template/theme.
export function blogTheme(theme: SiteContent["theme"]): { style: CSSProperties; fontKey: string } {
  const tpl = resolveTemplate(theme.layout);
  const p = PALETTES[tpl.id] || PALETTES.cinematic;
  const accent = validHex(theme.accentHex) ? (theme.accentHex as string) : p.accent;
  const fontKey = theme.font || tpl.defaultFont;
  const style = {
    ["--bg"]: p.bg,
    ["--surf"]: p.surf,
    ["--text"]: p.text,
    ["--text-2"]: p.text2,
    ["--hair"]: p.hair,
    ["--accent"]: accent,
    fontFamily: fontByKey(fontKey).family,
  } as CSSProperties;
  return { style, fontKey };
}
