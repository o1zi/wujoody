import { describe, it, expect } from "vitest";
import { normalizePlan, FALLBACK_PLANS, DEFAULT_CAPS } from "@/lib/plans";

describe("plans", () => {
  it("FALLBACK_PLANS are annual with no Salla fields", () => {
    expect(FALLBACK_PLANS).toHaveLength(3);
    for (const p of FALLBACK_PLANS) {
      expect(p.period).toBe("سنوياً");
      expect(p.durationDays).toBe(365);
      // Salla fields were removed.
      expect((p as Record<string, unknown>).paymentLink).toBeUndefined();
      expect((p as Record<string, unknown>).sallaProductId).toBeUndefined();
    }
    expect(FALLBACK_PLANS.map((p) => p.price)).toEqual([990, 1990, 3490]);
  });

  it("DEFAULT_CAPS grants all features and sections", () => {
    expect(DEFAULT_CAPS.crm).toBe(true);
    expect(DEFAULT_CAPS.aiContent).toBe(true);
    expect(DEFAULT_CAPS.customDomain).toBe(true);
    expect(DEFAULT_CAPS.sections.length).toBeGreaterThan(0);
  });

  it("normalizePlan fills sensible defaults", () => {
    const p = normalizePlan({ code: "basic", name: "الأساسية", price: "990", caps: {}, features: ["a"] });
    expect(p.price).toBe(990);
    expect(p.currency).toBe("SAR");
    expect(p.period).toBe("سنوياً");
    expect(p.durationDays).toBe(365);
    expect(p.features).toEqual(["a"]);
  });

  it("normalizePlan derives section flags from the allowed-sections list", () => {
    const p = normalizePlan({
      code: "pro",
      name: "الاحترافية",
      price: 1990,
      caps: { whatsapp: true, sections: ["about", "services", "booking", "blog", "credentials"] },
      features: [],
    });
    expect(p.caps.whatsapp).toBe(true);
    expect(p.caps.booking).toBe(true);
    expect(p.caps.blog).toBe(true);
    expect(p.caps.badges).toBe(true); // credentials -> badges
  });
});
