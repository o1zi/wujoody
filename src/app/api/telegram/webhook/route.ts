import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegram } from "@/lib/telegram";

export const runtime = "nodejs";

// Telegram bot webhook. When an office presses "Start" on the bot with their
// one-time link token (/start <token>), we bind their chat to the office.
export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msg = (update as any)?.message;
  const text: string = msg?.text || "";
  const chatId = msg?.chat?.id;
  const m = text.match(/^\/start\s+(\S+)/);

  if (m && chatId) {
    const token = m[1];
    const admin = createAdminClient();
    const { data: office } = await admin.from("offices").select("id, name").eq("telegram_link_token", token).maybeSingle();
    if (office) {
      await admin.from("offices").update({ telegram_chat_id: String(chatId), telegram_link_token: null }).eq("id", office.id);
      await sendTelegram(String(chatId), `✅ تم ربط مكتب «${office.name}» بنجاح.\nستصلك إشعارات العملاء الجدد هنا فوراً.`);
    } else {
      await sendTelegram(String(chatId), "تعذّر الربط: رابط غير صالح أو منتهٍ. أنشئ رابطاً جديداً من لوحة التحكم.");
    }
  }

  return NextResponse.json({ ok: true });
}
