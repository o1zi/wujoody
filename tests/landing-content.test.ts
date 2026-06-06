import { describe, it, expect } from "vitest";
import { mergeLanding, defaultLanding } from "@/lib/landing-content";

describe("landing-content", () => {
  it("returns defaults for empty input", () => {
    expect(mergeLanding(null)).toEqual(defaultLanding);
    expect(mergeLanding("x")).toEqual(defaultLanding);
  });

  it("overlays stored hero/pricing over defaults", () => {
    const c = mergeLanding({ hero: { subtitle: "وصف مخصّص" }, pricing: { title: "باقاتنا" } });
    expect(c.hero.subtitle).toBe("وصف مخصّص");
    expect(c.hero.eyebrow).toBe(defaultLanding.hero.eyebrow); // default kept
    expect(c.pricing.title).toBe("باقاتنا");
    expect(c.features.items.length).toBeGreaterThan(0); // untouched
  });

  it("keeps a string footerTag and ignores a non-string one", () => {
    expect(mergeLanding({ footerTag: "نصّي" }).footerTag).toBe("نصّي");
    expect(mergeLanding({ footerTag: 123 }).footerTag).toBe(defaultLanding.footerTag);
  });
});
