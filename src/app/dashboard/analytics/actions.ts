"use server";

import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanCaps } from "@/lib/plans-server";
import { sendTelegram } from "@/lib/telegram";
import { sendEmail } from "@/lib/email";
import { buildOfficeReport } from "@/lib/report";

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
  const officeId = ctx.office.id;
  const report = await buildOfficeReport(admin, officeId, ctx.office.name, ctx.profile?.full_name || "");

  let chatId: string | null = null;
  try {
    const { data: off } = await admin.from("offices").select("telegram_chat_id").eq("id", officeId).maybeSingle();
    chatId = (off as { telegram_chat_id?: string } | null)?.telegram_chat_id ?? null;
  } catch {
    chatId = null;
  }

  if (chatId) {
    const ok = await sendTelegram(chatId, report.telegramText);
    if (ok) return { ok: true, channel: "telegram" };
  }

  if (ctx.email) {
    const ok = await sendEmail({ to: ctx.email, subject: report.subject, html: report.emailHtml });
    if (ok) return { ok: true, channel: "email" };
  }

  return { ok: false, error: "لم يصل التقرير: اربط تيليجرام أو فعّل البريد." };
}
