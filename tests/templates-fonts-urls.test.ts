import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SITE_TEMPLATES, resolveTemplate } from "@/lib/site-templates";
import { fontByKey, googleFontsHref, SITE_FONTS } from "@/lib/site-fonts";
import { tenantUrl, tenantLabel } from "@/lib/urls";
import { normalizePhone } from "@/lib/phone";

describe("site-templates", () => {
  it("ships 10 templates each with a stylesheet + valid default font", () => {
    expect(SITE_TEMPLATES).toHaveLength(10);
    const fontKeys = new Set(SITE_FONTS.map((f) => f.key));
    for (const t of SITE_TEMPLATES) {
      expect(t.stylesheet).toMatch(/^\/site-template\/.+\.css$/);
      expect(fontKeys.has(t.defaultFont)).toBe(true);
    }
  });

  it("resolveTemplate returns the match or falls back to cinematic", () => {
    expect(resolveTemplate("atelier").id).toBe("atelier");
    expect(resolveTemplate("nope").id).toBe("cinematic");
    expect(resolveTemplate(null).id).toBe("cinematic");
  });
});

describe("site-fonts", () => {
  it("fontByKey returns the default for unknown keys", () => {
    expect(fontByKey("changa").key).toBe("changa");
    expect(fontByKey("does-not-exist").key).toBe(SITE_FONTS[0].key);
  });

  it("googleFontsHref dedupes and builds a families query", () => {
    const href = googleFontsHref(["readex", "readex", "changa"]);
    expect(href).toContain("fonts.googleapis.com");
    expect(href.match(/family=/g)?.length).toBe(2);
  });
});

describe("urls", () => {
  const prev = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  afterEach(() => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = prev;
  });

  it("uses a path on *.vercel.app and a subdomain on a custom domain", () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "wujoody.vercel.app";
    expect(tenantUrl("atelier")).toBe("https://wujoody.vercel.app/s/atelier");
    expect(tenantLabel("atelier")).toBe("wujoody.vercel.app/s/atelier");

    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "wujood.sa";
    expect(tenantUrl("atelier")).toBe("https://atelier.wujood.sa");

    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000";
    expect(tenantUrl("atelier")).toBe("http://atelier.localhost:3000");
  });
});

describe("phone", () => {
  it("normalizes Saudi formats to the last 9 digits", () => {
    expect(normalizePhone("+966 50 123 4567")).toBe("501234567");
    expect(normalizePhone("0501234567")).toBe("501234567");
    expect(normalizePhone("966501234567")).toBe("501234567");
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone(null)).toBe("");
  });
});
