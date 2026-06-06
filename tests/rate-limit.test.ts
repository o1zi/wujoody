import { describe, it, expect, vi, afterEach } from "vitest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

describe("rate-limit", () => {
  afterEach(() => vi.useRealTimers());

  it("allows up to the limit then blocks", () => {
    const key = "test:allow-block";
    expect(rateLimit(key, 2, 60_000).ok).toBe(true); // 1
    expect(rateLimit(key, 2, 60_000).ok).toBe(true); // 2
    const blocked = rateLimit(key, 2, 60_000); // 3
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const key = "test:reset";
    expect(rateLimit(key, 1, 1000).ok).toBe(true);
    expect(rateLimit(key, 1, 1000).ok).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000).ok).toBe(true);
  });

  it("clientIp reads the first x-forwarded-for entry", () => {
    const req = new Request("https://x.test", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
    expect(clientIp(new Request("https://x.test"))).toBe("unknown");
  });
});
