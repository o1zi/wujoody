"use server";

import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanCaps } from "@/lib/plans-server";
import { sendTelegram } from "@/lib/telegram";
import { sendEmail, emailLayout } from "@/lib/email";

// Send the 30-day performance report to this office now (Telegram if linked,
// else email). Premium only.
export async function sendMyReport(): Promise<{ ok: boolean; channel?: "telegram" | "email"; error?: string }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false, error: "لا يوجد مكتب." };

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("office_id", ctx.office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const caps = await getPlanCaps(sub?.plan);
  if (!caps.monthlyReport) return { ok: false, error: "هذه الميزة في باقة بريميوم." };

  const admin = createAdminClient();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const officeId = ctx.office.id;
  const name = ctx.office.name;

  const [{ count: views }, { count: clicks }, { count: leads }] = await Promise.all([
    admin.from("site_events").select("id", { count: "exact", head: true }).eq("office_id", officeId).eq("type", "view").gte("created_at", since),
    admin.from("site_events").select("id", { count: "exact", head: true }).eq("office_id", officeId).like("type", "click%").gte("created_at", since),
    admin.from("leads").select("id", { count: "exact", head: true }).eq("office_id", officeId).gte("created_at", since),
  ]);

  let chatId: string | null = null;
  try {
    const { data: off } = await admin.from("offices").select("telegram_chat_id").eq("id", officeId).maybeSingle();
    chatId = (off as { telegram_chat_id?: string } | null)?.telegram_chat_id ?? null;
  } catch {
    chatId = null;
  }

  if (chatId) {
    const ok = await sendTelegram(
      chatId,
      `📊 تقرير مكتبك الشهري — ${name}\nملخص آخر 30 يوماً:\n\n👁️ الزيارات: ${views ?? 0}\n🔗 نقرات التواصل: ${clicks ?? 0}\n✉️ الرسائل/الحجوزات: ${leads ?? 0}`,
    );
    if (ok) return { ok: true, channel: "telegram" };
  }

  if (ctx.email) {
    const ok = await sendEmail({
      to: ctx.email,
      subject: `تقرير مكتبك الشهري — ${name}`,
      html: emailLayout(
        "تقرير الأداء الشهري",
        `إليك ملخص آخر 30 يوماً لموقع «${name}»:<br/><br/>👁️ <b>الزيارات:</b> ${views ?? 0}<br/>🔗 <b>نقرات التواصل:</b> ${clicks ?? 0}<br/>✉️ <b>الرسائل/الحجوزات:</b> ${leads ?? 0}`,
      ),
    });
    if (ok) return { ok: true, channel: "email" };
  }

  return { ok: false, error: "لم يصل التقرير: اربط تيليجرام أو فعّل البريد." };
}
