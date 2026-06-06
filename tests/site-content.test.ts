import { describe, it, expect } from "vitest";
import { mergeContent, clampMedia, clampTemplate, isPresetUrl, isUploadedUrl, defaultContent } from "@/lib/site-content";
import { DEFAULT_CAPS } from "@/lib/plans";

describe("site-content", () => {
  it("mergeContent returns defaults for empty/invalid input", () => {
    expect(mergeContent(null)).toEqual(defaultContent);
    expect(mergeContent("nope")).toEqual(defaultContent);
  });

  it("mergeContent deep-merges partial theme/brand over defaults", () => {
    const c = mergeContent({ theme: { layout: "editorial" }, brand: { ar: "مكتبي" } });
    expect(c.theme.layout).toBe("editorial");
    expect(c.theme.accent).toBe(defaultContent.theme.accent); // default kept
    expect(c.brand.ar).toBe("مكتبي");
    expect(c.brand.en).toBe(defaultContent.brand.en); // default kept
    expect(c.services.items.length).toBeGreaterThan(0); // untouched section from defaults
  });

  it("clampMedia forces solid background when the plan is solidOnly", () => {
    const withVideo = mergeContent({ media: { bgMode: "video", bgVideo: "/x.mp4", frames: null, solid: "black" } });
    const clamped = clampMedia(withVideo, { ...DEFAULT_CAPS, solidOnly: true });
    expect(clamped.media.bgMode).toBe("solid");
    expect(clamped.media.bgVideo).toBeNull();
  });

  it("clampMedia keeps media allowed for full caps", () => {
    const c = mergeContent({ media: { bgMode: "frames", frames: ["/backgrounds/a.jpg"], bgVideo: null, solid: "black" } });
    const out = clampMedia(c, DEFAULT_CAPS);
    expect(out.media.bgMode).toBe("frames");
  });

  it("clampTemplate forces a disallowed template onto an allowed one", () => {
    const c = mergeContent({ theme: { layout: "atelier" } });
    const basic = clampTemplate(c, { ...DEFAULT_CAPS, templates: ["editorial"] });
    expect(basic.theme.layout).toBe("editorial"); // atelier not allowed → editorial
  });

  it("clampTemplate leaves an allowed template untouched", () => {
    const c = mergeContent({ theme: { layout: "atelier" } });
    const out = clampTemplate(c, DEFAULT_CAPS); // all templates allowed
    expect(out.theme.layout).toBe("atelier");
  });

  it("url helpers classify preset vs uploaded media", () => {
    expect(isPresetUrl("/backgrounds/clip.mp4")).toBe(true);
    expect(isPresetUrl("https://x/storage/v1/object/public/site-media/a.mp4")).toBe(false);
    expect(isUploadedUrl("https://x/storage/v1/object/public/site-media/a.mp4")).toBe(true);
    expect(isUploadedUrl("/backgrounds/clip.mp4")).toBe(false);
  });
});
