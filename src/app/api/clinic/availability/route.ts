import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeSlots,
  riyadhMinuteOfDay,
  weekdayOf,
  type ClinicHours,
} from "@/lib/clinic-booking";

export const runtime = "nodejs";

// GET /api/clinic/availability?slug=<office>&date=YYYY-MM-DD
// Returns the bookable time slots for that day. Computed server-side so patient
// data in `appointments` is never exposed — only the free times come back.
export async function POST() {
  return NextResponse.json({ error: "use GET" }, { status: 405 });
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const slug = (sp.get("slug") || "").toLowerCase().trim();
  const date = (sp.get("date") || "").trim();

  if (!slug || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: office } = await admin
    .from("offices")
    .select("id, status, kind")
    .eq("slug", slug)
    .maybeSingle();
  if (!office || office.status !== "active" || !["clinic", "law"].includes(office.kind)) {
    return NextResponse.json({ error: "not available" }, { status: 404 });
  }

  // Hours for the requested weekday (null → engine uses defaults).
  const weekday = weekdayOf(date);
  let hours: ClinicHours | null = null;
  const { data: hrow } = await admin
    .from("clinic_hours")
    .select("weekday, is_open, start_min, end_min, slot_min")
    .eq("office_id", office.id)
    .eq("weekday", weekday)
    .maybeSingle();
  if (hrow) hours = hrow as ClinicHours;

  // Capacity per slot = number of active doctors (min 1).
  const { count: doctorCount } = await admin
    .from("clinic_doctors")
    .select("id", { count: "exact", head: true })
    .eq("office_id", office.id)
    .eq("active", true);
  const capacity = Math.max(1, doctorCount ?? 0);

  // Existing (non-cancelled) appointments for that Riyadh day.
  const dayStart = `${date}T00:00:00+03:00`;
  const dayEnd = `${date}T23:59:59+03:00`;
  const { data: appts } = await admin
    .from("appointments")
    .select("starts_at, status")
    .eq("office_id", office.id)
    .gte("starts_at", dayStart)
    .lte("starts_at", dayEnd)
    .neq("status", "cancelled");

  const bookedCountByMin: Record<number, number> = {};
  for (const a of appts ?? []) {
    const min = riyadhMinuteOfDay(new Date(a.starts_at as string).getTime());
    bookedCountByMin[min] = (bookedCountByMin[min] ?? 0) + 1;
  }

  const slots = computeSlots({ dateISO: date, hours, bookedCountByMin, capacity });
  return NextResponse.json({ slots, capacity });
}
