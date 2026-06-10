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

  it("basic plan is limited to the editorial template; pro/premium get all", () => {
    const byCode = Object.fromEntries(FALLBACK_PLANS.map((p) => [p.code, p]));
    expect(byCode.basic.caps.templates).toEqual(["editorial"]);
    expect(byCode.pro.caps.templates.length).toBeGreaterThan(1);
    expect(byCode.pro.caps.templates).toContain("editorial");
    expect(byCode.premium.caps.templates.length).toBeGreaterThan(1);
  });

  it("3D viewer is off for Basic, on for Pro/Premium, and defaults to projectDetails", () => {
    const byCode = Object.fromEntries(FALLBACK_PLANS.map((p) => [p.code, p]));
    expect(byCode.basic.caps.models3d).toBe(false);
    expect(byCode.pro.caps.models3d).toBe(true);
    expect(byCode.premium.caps.models3d).toBe(true);
    // A legacy plan row without models3d follows projectDetails.
    expect(normalizePlan({ code: "x", name: "x", price: 1, caps: { projectDetails: true }, features: [] }).caps.models3d).toBe(true);
    expect(normalizePlan({ code: "y", name: "y", price: 1, caps: { projectDetails: false }, features: [] }).caps.models3d).toBe(false);
  });

  it("normalizePlan keeps an explicit templates list but defaults missing ones to all", () => {
    const restricted = normalizePlan({ code: "basic", name: "x", price: 990, caps: { templates: ["editorial", "bogus"] }, features: [] });
    expect(restricted.caps.templates).toEqual(["editorial"]); // invalid id filtered out

    const legacy = normalizePlan({ code: "old", name: "x", price: 100, caps: {}, features: [] });
    expect(legacy.caps.templates.length).toBeGreaterThan(1); // no list → every template
  });
});
