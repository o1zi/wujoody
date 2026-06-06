// Best-effort in-memory fixed-window rate limiter. On serverless each instance
// keeps its own counters, so this blocks naive rapid-fire abuse hitting a warm
// instance and adds a first line of defense with zero setup. For hard
// cross-instance guarantees, back it with Redis / Vercel KV / a DB later.

type Entry = { count: number; reset: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  let e = buckets.get(key);
  if (!e || e.reset <= now) {
    e = { count: 0, reset: now + windowMs };
    buckets.set(key, e);
  }
  e.count++;

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
  }

  if (e.count > limit) return { ok: false, retryAfter: Math.max(1, Math.ceil((e.reset - now) / 1000)) };
  return { ok: true, retryAfter: 0 };
}

// Extract the client IP from common proxy headers (Vercel sets x-forwarded-for).
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0].trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}
