// Single source of truth for whether an office's public site is live.

export type SubLike = { status?: string | null; ends_at?: string | null } | null | undefined;

// A site is live only when the office is active AND its latest subscription is
// still valid. A subscription closes the site if it's no longer "active"
// (expired/cancelled), or if its term has elapsed (ends_at in the past) even
// before any cron flips its status. An active office with NO subscription row at
// all (e.g. a manual/comp activation) stays live.
export function siteLiveState(
  officeStatus: string,
  sub: SubLike,
  now: number = Date.now(),
): { live: boolean; expired: boolean } {
  const endsPassed = !!sub?.ends_at && new Date(sub.ends_at).getTime() <= now;
  const subLapsed = !!sub && ((sub.status ?? "") !== "active" || endsPassed);
  return { live: officeStatus === "active" && !subLapsed, expired: subLapsed };
}
