// Ready-made background clips bundled with the app and served from the CDN
// (NOT Supabase storage) — every office can pick one with zero storage cost.
//
// Each preset has BOTH:
//   - src    : the video file, used for the fast "native video" background.
//   - frames : a pre-extracted 16fps JPG sequence, used for the smooth
//              "scroll-scrub" background (moves with scroll, like Awtad).
//
// To add a preset:
//   1) drop the video in public/backgrounds/<file>.mp4
//   2) extract frames at 16fps into public/backgrounds/<id>/f000.jpg ... (see README)
//   3) add an entry below with the correct frameCount.

export type BgPreset = {
  id: string;
  name: string;
  src: string;
  frameCount: number;
};

export type ResolvedPreset = BgPreset & { frames: string[] };

function frameList(id: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/backgrounds/${id}/f${String(i).padStart(3, "0")}.jpg`);
}

const RAW: BgPreset[] = [
  { id: "tower", name: "برج إنشائي", src: "/backgrounds/tower.mp4", frameCount: 160 },
  { id: "skyscraper", name: "ناطحة سحاب", src: "/backgrounds/skyscraper.mp4", frameCount: 160 },
  { id: "road", name: "طريق بين التلال", src: "/backgrounds/coverr-a-road-through-the-hills-6377-1080p.mp4", frameCount: 394 },
  { id: "fog", name: "جبال في الضباب", src: "/backgrounds/coverr-mountains-in-the-fog-2696-1080p.mp4", frameCount: 362 },
  { id: "timelapse", name: "تايم لابس", src: "/backgrounds/coverr-temp-zna6gen-3-alpha-2777358279-a-dynamic-time-lapse-mp4-5453-1080p.mp4", frameCount: 85 },
  { id: "town", name: "مدينة خلف الجبال", src: "/backgrounds/coverr-town-behind-the-mountains-8495-1080p.mp4", frameCount: 324 },
];

export const BG_PRESETS: ResolvedPreset[] = RAW.map((p) => ({ ...p, frames: frameList(p.id, p.frameCount) }));

export function isPreset(src: string | null | undefined): boolean {
  return !!src && BG_PRESETS.some((p) => p.src === src);
}
