import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanCaps } from "@/lib/plans-server";
import { sendEmail, emailLayout } from "@/lib/email";

export const runtime = "nodejs";

// Monthly cron (see vercel.json): emails each Premium office a 30-day summary
// of visits, clicks, and leads.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();

  // Active subscriptions + their office.
  const { data: subs } = await admin
    .from("subscriptions")
    .select("plan, offices(id, name, owner_id, status)")
    .eq("status", "active");

  let sent = 0;
  for (const s of subs ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const office = (s as any).offices;
    if (!office?.id || office.status !== "active") continue;
    const caps = await getPlanCaps((s as { plan?: string }).plan);
    if (!caps.monthlyReport) continue;

    const [{ count: views }, { count: clicks }, { count: leads }] = await Promise.all([
      admin.from("site_events").select("id", { count: "exact", head: true }).eq("office_id", office.id).eq("type", "view").gte("created_at", since),
      admin.from("site_events").select("id", { count: "exact", head: true }).eq("office_id", office.id).like("type", "click%").gte("created_at", since),
      admin.from("leads").select("id", { count: "exact", head: true }).eq("office_id", office.id).gte("created_at", since),
    ]);

    const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", office.owner_id).maybeSingle();
    if (!prof?.email) continue;

    const ok = await sendEmail({
      to: prof.email,
      subject: `تقرير مكتبك الشهري — ${office.name}`,
      html: emailLayout(
        "تقرير الأداء الشهري",
        `مرحباً ${prof.full_name || ""}،<br/>إليك ملخص آخر 30 يوماً لموقع «${office.name}»:` +
          `<br/><br/>👁️ <b>الزيارات:</b> ${views ?? 0}` +
          `<br/>🔗 <b>نقرات التواصل:</b> ${clicks ?? 0}` +
          `<br/>✉️ <b>الرسائل/الحجوزات:</b> ${leads ?? 0}` +
          `<br/><br/>راجع التفاصيل من لوحة التحكم.`,
      ),
    });
    if (ok) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
