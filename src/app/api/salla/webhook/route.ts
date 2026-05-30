import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout } from "@/lib/email";
import { verifySallaWebhook, isPaidEvent, extractProductId, type SallaEvent } from "@/lib/salla";
import { getPlanByProductId, getPlans } from "@/lib/plans-server";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickEmail(data: any): string | null {
  return (
    data?.customer?.email ||
    data?.email ||
    data?.customer_email ||
    data?.contact?.email ||
    null
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifySallaWebhook(rawBody, request.headers)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let evt: SallaEvent;
  try {
    evt = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const admin = createAdminClient();
  const eventId = crypto.createHash("sha256").update(rawBody).digest("hex");

  // Idempotency: skip if we've already processed this exact delivery.
  const { error: logError } = await admin
    .from("salla_events")
    .insert({ event: evt.event ?? null, event_id: eventId, payload: evt as object });
  if (logError) {
    // Unique violation = duplicate delivery → acknowledge without reprocessing.
    if (logError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    // Log failure shouldn't block processing, but report it.
    return NextResponse.json({ error: "log failed" }, { status: 500 });
  }

  if (!isPaidEvent(evt)) {
    return NextResponse.json({ ok: true, ignored: evt.event ?? "unknown" });
  }

  const data = evt.data ?? {};
  const email = pickEmail(data);
  const orderId = data.id != null ? String(data.id) : null;
  const productId = extractProductId(evt);
  const plan = (productId ? await getPlanByProductId(productId) : undefined) || (await getPlans())[0];

  if (!email) {
    return NextResponse.json({ ok: true, warning: "no email on order" });
  }

  // Map the paying customer to their office via the registered email.
  const { data: profile } = await admin
    .from("profiles")
    .select("office_id")
    .ilike("email", email)
    .not("office_id", "is", null)
    .maybeSingle();

  if (!profile?.office_id) {
    return NextResponse.json({ ok: true, warning: "no matching office for email" });
  }

  const officeId = profile.office_id as string;
  const now = new Date();
  const ends = new Date(now.getTime() + plan.durationDays * 86400000);

  // Activate / extend subscription.
  await admin.from("subscriptions").upsert(
    {
      office_id: officeId,
      plan: plan.code,
      status: "active",
      salla_order_id: orderId,
      amount: plan.price,
      currency: plan.currency,
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
    },
    { onConflict: "salla_order_id" },
  );

  // Go live.
  await admin.from("offices").update({ status: "active" }).eq("id", officeId);

  // Payment confirmation email (no-op if Resend isn't configured).
  await sendEmail({
    to: email,
    subject: "تم تفعيل اشتراكك ✓",
    html: emailLayout(
      "تم تفعيل موقع مكتبك ✓",
      `تم استلام دفعتك بنجاح وتفعيل اشتراك باقة «${plan.name}». موقعك الآن يعمل. يمكنك تعديل محتواه من لوحة التحكم.`,
    ),
  });

  return NextResponse.json({ ok: true, activated: officeId });
}

// Salla may send a GET to verify the endpoint.
export async function GET() {
  return NextResponse.json({ ok: true });
}
