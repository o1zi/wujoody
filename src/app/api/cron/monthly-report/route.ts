import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanCaps } from "@/lib/plans-server";
import { sendEmail } from "@/lib/email";
import { sendTelegram } from "@/lib/telegram";
import { buildOfficeReport } from "@/lib/report";

export const runtime = "nodejs";

// Monthly cron (see vercel.json): sends each Premium office a 30-day summary of
// visits, clicks, and leads — via Telegram if linked, otherwise by email.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();

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

    const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", office.owner_id).maybeSingle();
    const report = await buildOfficeReport(admin, office.id, office.name, prof?.full_name || "");

    // Prefer Telegram if the office linked it; fall back to email.
    let chatId: string | null = null;
    try {
      const { data: off } = await admin.from("offices").select("telegram_chat_id").eq("id", office.id).maybeSingle();
      chatId = (off as { telegram_chat_id?: string } | null)?.telegram_chat_id ?? null;
    } catch {
      chatId = null;
    }

    if (chatId) {
      const ok = await sendTelegram(chatId, report.telegramText);
      if (ok) {
        sent++;
        continue;
      }
    }

    if (prof?.email) {
      const ok = await sendEmail({ to: prof.email, subject: report.subject, html: report.emailHtml });
      if (ok) sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
