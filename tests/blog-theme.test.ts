import { describe, it, expect } from "vitest";
import { blogTheme } from "@/lib/blog-theme";
import { defaultContent } from "@/lib/site-content";

const baseTheme = defaultContent.theme;

describe("blog-theme", () => {
  it("resolves CSS variables + a font for a known template", () => {
    const { style, fontKey } = blogTheme({ ...baseTheme, layout: "editorial", font: "ibmar" });
    const s = style as Record<string, string>;
    expect(s["--bg"]).toBe("#F4F1EA");
    expect(s["--accent"]).toBeTruthy();
    expect(fontKey).toBe("ibmar");
  });

  it("falls back to the template default font when none is set", () => {
    const { fontKey } = blogTheme({ ...baseTheme, layout: "atelier", font: undefined });
    expect(fontKey).toBe("markazi"); // atelier's defaultFont
  });

  it("a custom accentHex overrides the template's signature accent", () => {
    const { style } = blogTheme({ ...baseTheme, layout: "luxe", accentHex: "#123456" });
    expect((style as Record<string, string>)["--accent"]).toBe("#123456");
  });

  it("an invalid accentHex is ignored", () => {
    const { style } = blogTheme({ ...baseTheme, layout: "cinematic", accentHex: "not-a-color" });
    expect((style as Record<string, string>)["--accent"]).toBe("#C2974E");
  });
});
