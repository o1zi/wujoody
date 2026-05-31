import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout } from "@/lib/email";
import { verifySallaWebhook, isPaidEvent, extractProductId, extractOfficeId, type SallaEvent } from "@/lib/salla";
import { getPlanByProductId, getPlans } from "@/lib/plans-server";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickEmail(data: any): string | null {
  return data?.customer?.email || data?.email || data?.customer_email || data?.contact?.email || null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickPhone(data: any): string | null {
  const c = data?.customer || {};
  return c.mobile || c.phone || data?.mobile || data?.phone || null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifySallaWebhook(rawBody, request.headers)) {
    // Temporary discovery aid: when SALLA_WEBHOOK_DEBUG=1, persist the raw
    // delivery (headers + body) even though the signature didn't match, so the
    // very first real payload can be inspected to confirm Salla's V2 format and
    // signing header. Turn the flag OFF once the format is confirmed.
    if (process.env.SALLA_WEBHOOK_DEBUG === "1") {
      try {
        await createAdminClient()
          .from("salla_events")
          .insert({
            event: "debug.unverified",
            event_id: crypto.randomUUID(),
            payload: { headers: Object.fromEntries(request.headers), body: rawBody },
          });
      } catch {
        // best-effort capture only
      }
      return NextResponse.json({ ok: true, debug: "captured (unverified)" });
    }
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
  const phone = normalizePhone(pickPhone(data));
  const orderId = data.id != null ? String(data.id) : null;
  const productId = extractProductId(evt);
  const plan = (productId ? await getPlanByProductId(productId) : undefined) || (await getPlans())[0];

  // Map the payment to its office. Primary: the `?office=<uuid>` marker we append
  // to each plan's payment link, recovered from the order payload — exact and
  // independent of how the customer paid. Fallbacks: phone, then email.
  let officeId: string | null = null;
  const refOfficeId = extractOfficeId(rawBody);
  if (refOfficeId) {
    const { data: off } = await admin.from("offices").select("id").eq("id", refOfficeId).maybeSingle();
    officeId = (off?.id as string) ?? null;
  }
  if (!officeId && phone) {
    const { data: byPhone } = await admin
      .from("profiles")
      .select("office_id")
      .eq("phone", phone)
      .not("office_id", "is", null)
      .maybeSingle();
    officeId = (byPhone?.office_id as string) ?? null;
  }
  if (!officeId && email) {
    const { data: byEmail } = await admin
      .from("profiles")
      .select("office_id")
      .ilike("email", email)
      .not("office_id", "is", null)
      .maybeSingle();
    officeId = (byEmail?.office_id as string) ?? null;
  }

  if (!officeId) {
    return NextResponse.json({ ok: true, warning: "no matching office (ref/phone/email)" });
  }
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

  // Payment confirmation email (no-op if Resend isn't configured). When the
  // payment carried no email, fall back to the office admin's registered email.
  let notifyEmail = email;
  if (!notifyEmail) {
    const { data: owner } = await admin
      .from("profiles")
      .select("email")
      .eq("office_id", officeId)
      .not("email", "is", null)
      .limit(1)
      .maybeSingle();
    notifyEmail = (owner?.email as string) ?? null;
  }
  if (notifyEmail) {
    await sendEmail({
      to: notifyEmail,
      subject: "تم تفعيل اشتراكك ✓",
      html: emailLayout(
        "تم تفعيل موقع مكتبك ✓",
        `تم استلام دفعتك بنجاح وتفعيل اشتراك باقة «${plan.name}». موقعك الآن يعمل. يمكنك تعديل محتواه من لوحة التحكم.`,
      ),
    });
  }

  return NextResponse.json({ ok: true, activated: officeId });
}

// Salla may send a GET to verify the endpoint.
export async function GET() {
  return NextResponse.json({ ok: true });
}
