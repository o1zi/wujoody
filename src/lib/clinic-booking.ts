// Booking engine helpers — pure functions (no server deps) so they're testable
// and usable from both the API routes and the client widget.
//
// All clinic times are treated as Asia/Riyadh (UTC+3, no DST). A slot is a
// minute-of-day in that local time; appointments are stored as absolute
// timestamptz built from `${date}T${HH:MM}:00+03:00`.

// A doctor as shown publicly (and selectable in booking). Managed in the
// dashboard (clinic_doctors); the public site + booking widget both read it.
export type PublicDoctor = { id: string; name: string; specialty: string | null; image: string | null };

export const RIYADH_OFFSET_MIN = 180; // UTC+3
const DAY_MIN = 24 * 60;
const MS_PER_MIN = 60_000;

export type ClinicHours = {
  weekday: number; // 0=Sunday … 6=Saturday
  is_open: boolean;
  start_min: number;
  end_min: number;
  slot_min: number;
};

export const DEFAULT_HOURS: Omit<ClinicHours, "weekday"> = {
  is_open: true,
  start_min: 9 * 60, // 09:00
  end_min: 22 * 60, // 22:00
  slot_min: 30,
};

export function minToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMin(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

// Weekday (0=Sun..6=Sat) for a "YYYY-MM-DD" date, evaluated in Riyadh local time.
export function weekdayOf(dateISO: string): number {
  // Noon UTC+3 keeps us safely inside the calendar day regardless of rounding.
  const d = new Date(`${dateISO}T12:00:00+03:00`);
  return d.getUTCDay();
}

// Riyadh-local "YYYY-MM-DD" for an absolute time (defaults to now).
export function riyadhDateISO(at: number = Date.now()): string {
  return new Date(at + RIYADH_OFFSET_MIN * MS_PER_MIN).toISOString().slice(0, 10);
}

// Riyadh-local minute-of-day for an absolute time (defaults to now).
export function riyadhMinuteOfDay(at: number = Date.now()): number {
  const shifted = at + RIYADH_OFFSET_MIN * MS_PER_MIN;
  return Math.floor((shifted % (DAY_MIN * MS_PER_MIN)) / MS_PER_MIN);
}

// Absolute timestamptz string for a clinic-local date + minute-of-day.
export function toRiyadhTimestamp(dateISO: string, min: number): string {
  return `${dateISO}T${minToHHMM(min)}:00+03:00`;
}

// Compute the bookable slot start-minutes for a date.
// - `hours`: the weekday's row, or null to use DEFAULT_HOURS.
// - `bookedCountByMin`: how many appointments already occupy each start-minute.
// - `capacity`: max concurrent appointments per slot (e.g. number of doctors).
// - `now`: current absolute time (to hide past slots for today).
export function computeSlots(opts: {
  dateISO: string;
  hours: ClinicHours | null;
  bookedCountByMin: Record<number, number>;
  capacity: number;
  now?: number;
}): string[] {
  const { dateISO, hours, bookedCountByMin } = opts;
  const cap = Math.max(1, opts.capacity);
  const now = opts.now ?? Date.now();
  const h = hours ?? { weekday: weekdayOf(dateISO), ...DEFAULT_HOURS };
  if (!h.is_open) return [];

  const step = h.slot_min > 0 ? h.slot_min : 30;
  const isToday = riyadhDateISO(now) === dateISO;
  const nowMin = riyadhMinuteOfDay(now);

  const out: string[] = [];
  for (let m = h.start_min; m + step <= h.end_min; m += step) {
    if (isToday && m <= nowMin) continue; // no past/at-now slots
    if ((bookedCountByMin[m] ?? 0) >= cap) continue; // fully booked
    out.push(minToHHMM(m));
  }
  return out;
}
