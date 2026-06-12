import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout } from "@/lib/email";
import { sendTelegram } from "@/lib/telegram";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  computeSlots,
  hhmmToMin,
  riyadhMinuteOfDay,
  toRiyadhTimestamp,
  weekdayOf,
  type ClinicHours,
} from "@/lib/clinic-booking";

export const runtime = "nodejs";

// POST /api/clinic/book — create an appointment for a clinic.
// Re-validates slot availability server-side to prevent double-booking, then
// notifies the clinic instantly (email + Telegram). No automatic reminders.
export async function POST(request: NextRequest) {
  const rl = rateLimit(`book:${clientIp(request)}`, 6, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "too many requests" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let body: {
    slug?: string;
    name?: string;
    phone?: string;
    date?: string;
    time?: string;
    serviceId?: string;
    serviceName?: string;
    doctorId?: string;
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const slug = (body.slug || "").toLowerCase().trim();
  const name = (body.name || "").trim().slice(0, 120);
  const phone = (body.phone || "").trim().slice(0, 40);
  const date = (body.date || "").trim();
  const time = (body.time || "").trim();
  const note = (body.note || "").trim().slice(0, 1000);
  const serviceId = (body.serviceId || "").trim() || null;
  const serviceName = (body.serviceName || "").trim().slice(0, 160) || null;
  const doctorId = (body.doctorId || "").trim() || null;

  if (!slug || !name || !phone || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const min = hhmmToMin(time);
  if (min == null) {
    return NextResponse.json({ error: "bad time" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: office } = await admin
    .from("offices")
    .select("id, name, status, kind, owner_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!office || office.status !== "active" || !["clinic", "law"].includes(office.kind)) {
    return NextResponse.json({ error: "not available" }, { status: 404 });
  }

  // ---- Re-validate the slot is still bookable (race-safe) ----
  const weekday = weekdayOf(date);
  let hours: ClinicHours | null = null;
  const { data: hrow } = await admin
    .from("clinic_hours")
    .select("weekday, is_open, start_min, end_min, slot_min")
    .eq("office_id", office.id)
    .eq("weekday", weekday)
    .maybeSingle();
  if (hrow) hours = hrow as ClinicHours;

  const { count: doctorCount } = await admin
    .from("clinic_doctors")
    .select("id", { count: "exact", head: true })
    .eq("office_id", office.id)
    .eq("active", true);
  const capacity = Math.max(1, doctorCount ?? 0);

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
    const mm = riyadhMinuteOfDay(new Date(a.starts_at as string).getTime());
    bookedCountByMin[mm] = (bookedCountByMin[mm] ?? 0) + 1;
  }
  const free = computeSlots({ dateISO: date, hours, bookedCountByMin, capacity });
  const requested = `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  if (!free.includes(requested)) {
    return NextResponse.json({ error: "slot unavailable" }, { status: 409 });
  }

  // ---- Resolve service duration / name ----
  let duration = hours?.slot_min ?? 30;
  let svcName = serviceName;
  if (serviceId) {
    const { data: svc } = await admin
      .from("clinic_services")
      .select("name, duration_min")
      .eq("id", serviceId)
      .eq("office_id", office.id)
      .maybeSingle();
    if (svc) {
      svcName = (svc as { name: string }).name;
      duration = (svc as { duration_min?: number }).duration_min ?? duration;
    }
  }

  const startsAt = toRiyadhTimestamp(date, min);
  const { error } = await admin.from("appointments").insert({
    office_id: office.id,
    service_id: serviceId,
    doctor_id: doctorId,
    service_name: svcName,
    patient_name: name,
    patient_phone: phone,
    starts_at: startsAt,
    duration_min: duration,
    status: "booked",
    note: note || null,
  });
  if (error) {
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }

  // ---- Notify the clinic (best-effort) ----
  const when = `${date} · ${requested}`;
  const lines = [
    `🗓️ <b>حجز موعد جديد</b> — ${office.name}`,
    "",
    `<b>المريض:</b> ${name}`,
    `<b>الجوال:</b> ${phone}`,
    `<b>الموعد:</b> ${when}`,
    svcName ? `<b>الخدمة:</b> ${svcName}` : "",
    note ? `<b>ملاحظة:</b> ${note}` : "",
  ].filter(Boolean);

  const { data: owner } = await admin.from("profiles").select("email").eq("id", office.owner_id).maybeSingle();
  if (owner?.email) {
    await sendEmail({
      to: owner.email,
      subject: `حجز موعد جديد — ${office.name}`,
      html: emailLayout(
        "وصلك حجز موعد جديد",
        `<b>المريض:</b> ${name}<br/><b>الجوال:</b> ${phone}<br/><b>الموعد:</b> ${when}<br/>${
          svcName ? `<b>الخدمة:</b> ${svcName}<br/>` : ""
        }${note ? `<b>ملاحظة:</b> ${note.replace(/</g, "&lt;")}<br/>` : ""}<br/>راجع المواعيد من لوحة العيادة.`,
      ),
    });
  }
  try {
    const { data: tg } = await admin.from("offices").select("telegram_chat_id").eq("id", office.id).maybeSingle();
    const chatId = (tg as { telegram_chat_id?: string } | null)?.telegram_chat_id;
    if (chatId) await sendTelegram(chatId, lines.join("\n"));
  } catch {
    // ignore notification failures
  }

  return NextResponse.json({ ok: true });
}
