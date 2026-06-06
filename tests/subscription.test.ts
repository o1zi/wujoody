import { describe, it, expect } from "vitest";
import { siteLiveState } from "@/lib/subscription";

const NOW = new Date("2026-06-06T00:00:00Z").getTime();
const future = "2026-12-01T00:00:00Z";
const past = "2026-01-01T00:00:00Z";

describe("siteLiveState", () => {
  it("is live for an active office with an active, in-term subscription", () => {
    expect(siteLiveState("active", { status: "active", ends_at: future }, NOW)).toEqual({ live: true, expired: false });
  });

  it("closes the site when the subscription status is expired (the bug)", () => {
    // Even though the office is still 'active', an expired subscription closes it.
    expect(siteLiveState("active", { status: "expired", ends_at: past }, NOW)).toEqual({ live: false, expired: true });
  });

  it("closes the site when an active subscription's term has elapsed", () => {
    expect(siteLiveState("active", { status: "active", ends_at: past }, NOW)).toEqual({ live: false, expired: true });
  });

  it("treats a cancelled subscription as lapsed", () => {
    expect(siteLiveState("active", { status: "cancelled", ends_at: future }, NOW)).toEqual({ live: false, expired: true });
  });

  it("stays live for an active office with no subscription (manual/comp)", () => {
    expect(siteLiveState("active", null, NOW)).toEqual({ live: true, expired: false });
  });

  it("is not live when the office itself isn't active", () => {
    expect(siteLiveState("pending", { status: "active", ends_at: future }, NOW)).toEqual({ live: false, expired: false });
    expect(siteLiveState("suspended", null, NOW)).toEqual({ live: false, expired: false });
  });
});
