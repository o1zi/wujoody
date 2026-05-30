// Background clips dedicated to the landing page (separate from office presets).
// Files live in public/landing-backgrounds/ — see that folder's README.
//
// To add one:
//   1) drop the video in public/landing-backgrounds/<file>.mp4
//   2) add an entry to RAW below
//   3) (optional, for scroll-scrub) extract 16fps frames into
//      public/landing-backgrounds/<id>/f000.jpg ... and set frameCount.

import type { ResolvedPreset } from "@/lib/bg-presets";

type Raw = { id: string; name: string; src: string; frameCount: number };

function frameList(id: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/landing-backgrounds/${id}/f${String(i).padStart(3, "0")}.jpg`);
}

const RAW: Raw[] = [
  // { id: "hero1", name: "خلفية الهبوط ١", src: "/landing-backgrounds/hero1.mp4", frameCount: 0 },
];

export const LANDING_PRESETS: ResolvedPreset[] = RAW.map((p) => ({ ...p, frames: frameList(p.id, p.frameCount) }));
