import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout } from "@/lib/email";

export const runtime = "nodejs";

// Daily cron (see vercel.json): suspends offices whose subscription expired,
// and emails owners whose subscription ends within 3 days.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // 1) Expire subscriptions whose ends_at has passed.
  const { data: expired } = await admin
    .from("subscriptions")
    .update({ status: "expired" })
    .lt("ends_at", now)
    .eq("status", "active")
    .select("office_id");

  const expiredIds = [...new Set((expired ?? []).map((e) => e.office_id))];
  let suspended = 0;
  if (expiredIds.length) {
    const { data } = await admin
      .from("offices")
      .update({ status: "suspended" })
      .in("id", expiredIds)
      .eq("status", "active")
      .select("id");
    suspended = data?.length ?? 0;
  }

  // 2) Remind owners whose subscription ends within 3 days.
  const soon = new Date(Date.now() + 3 * 86400000).toISOString();
  const { data: ending } = await admin
    .from("subscriptions")
    .select("ends_at, offices(name, owner_id)")
    .gte("ends_at", now)
    .lte("ends_at", soon)
    .eq("status", "active");

  let reminded = 0;
  for (const s of ending ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const office = (s as any).offices;
    if (!office?.owner_id) continue;
    const { data: prof } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", office.owner_id)
      .maybeSingle();
    if (!prof?.email) continue;
    const days = Math.max(1, Math.ceil((new Date((s as { ends_at: string }).ends_at).getTime() - Date.now()) / 86400000));
    const ok = await sendEmail({
      to: prof.email,
      subject: "تذكير: اشتراك مكتبك يقارب الانتهاء",
      html: emailLayout(
        "تذكير بتجديد الاشتراك",
        `مرحباً ${prof.full_name || ""}،<br/>اشتراك مكتب «${office.name}» سينتهي خلال ${days} يوم تقريباً. جدّد الآن لإبقاء موقعك يعمل دون انقطاع.`,
      ),
    });
    if (ok) reminded++;
  }

  return NextResponse.json({ ok: true, suspended, reminded });
}
