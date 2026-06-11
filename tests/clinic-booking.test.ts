import { describe, it, expect } from "vitest";
import {
  computeSlots,
  hhmmToMin,
  minToHHMM,
  weekdayOf,
  riyadhMinuteOfDay,
  riyadhDateISO,
  toRiyadhTimestamp,
  DEFAULT_HOURS,
} from "@/lib/clinic-booking";

describe("clinic-booking time helpers", () => {
  it("converts between minutes and HH:MM", () => {
    expect(minToHHMM(540)).toBe("09:00");
    expect(minToHHMM(1320)).toBe("22:00");
    expect(hhmmToMin("09:30")).toBe(570);
    expect(hhmmToMin("9:5")).toBeNull(); // bad format
    expect(hhmmToMin("24:00")).toBeNull(); // out of range
  });

  it("computes weekday in Riyadh local time", () => {
    // 2026-06-12 is a Friday → getUTCDay 5.
    expect(weekdayOf("2026-06-12")).toBe(5);
  });

  it("builds a +03:00 timestamp", () => {
    expect(toRiyadhTimestamp("2026-06-12", 540)).toBe("2026-06-12T09:00:00+03:00");
  });

  it("maps an absolute time to Riyadh minute-of-day", () => {
    // 09:00 Riyadh = 06:00 UTC.
    const t = Date.parse("2026-06-12T06:00:00Z");
    expect(riyadhMinuteOfDay(t)).toBe(540);
    expect(riyadhDateISO(t)).toBe("2026-06-12");
  });
});

describe("computeSlots", () => {
  // A far-future date so "today" filtering never interferes.
  const future = "2099-01-02";

  it("generates evenly-spaced slots within the open window", () => {
    const slots = computeSlots({
      dateISO: future,
      hours: { weekday: weekdayOf(future), is_open: true, start_min: 540, end_min: 660, slot_min: 30 },
      bookedCountByMin: {},
      capacity: 1,
    });
    expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("uses default hours when none provided", () => {
    const slots = computeSlots({ dateISO: future, hours: null, bookedCountByMin: {}, capacity: 1 });
    expect(slots[0]).toBe("09:00");
    expect(slots).toContain("21:30");
    expect(slots).not.toContain("22:00"); // last slot must end by end_min
    expect(DEFAULT_HOURS.slot_min).toBe(30);
  });

  it("returns nothing on a closed day", () => {
    const slots = computeSlots({
      dateISO: future,
      hours: { weekday: weekdayOf(future), is_open: false, start_min: 540, end_min: 1320, slot_min: 30 },
      bookedCountByMin: {},
      capacity: 1,
    });
    expect(slots).toEqual([]);
  });

  it("hides a slot once it reaches capacity but keeps it while below", () => {
    const hours = { weekday: weekdayOf(future), is_open: true, start_min: 540, end_min: 630, slot_min: 30 };
    // capacity 2: 540 has 2 bookings (full), 570 has 1 (still open).
    const slots = computeSlots({ dateISO: future, hours, bookedCountByMin: { 540: 2, 570: 1 }, capacity: 2 });
    expect(slots).toEqual(["09:30", "10:00"]);
  });

  it("hides past slots for today", () => {
    // Pin 'now' to 2099-01-02 14:00 Riyadh (11:00 UTC).
    const now = Date.parse("2099-01-02T11:00:00Z");
    const slots = computeSlots({
      dateISO: "2099-01-02",
      hours: { weekday: weekdayOf("2099-01-02"), is_open: true, start_min: 540, end_min: 960, slot_min: 60 },
      bookedCountByMin: {},
      capacity: 1,
      now,
    });
    // 09:00–13:00 are in the past; only 15:00 (900) remains before 16:00 end.
    expect(slots).toEqual(["15:00"]);
  });
});
