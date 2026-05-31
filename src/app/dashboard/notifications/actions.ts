"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegram, telegramBotUsername } from "@/lib/telegram";

export async function generateTelegramLink(): Promise<{ ok: boolean; url?: string; error?: string }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false, error: "no office" };
  const bot = telegramBotUsername();
  if (!bot) return { ok: false, error: "بوت تيليجرام غير مهيّأ بعد. تواصل مع الدعم." };
  const token = crypto.randomBytes(16).toString("hex");
  const admin = createAdminClient();
  await admin.from("offices").update({ telegram_link_token: token }).eq("id", ctx.office.id);
  return { ok: true, url: `https://t.me/${bot}?start=${token}` };
}

export async function disconnectTelegram(): Promise<{ ok: boolean }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false };
  const admin = createAdminClient();
  await admin.from("offices").update({ telegram_chat_id: null, telegram_link_token: null }).eq("id", ctx.office.id);
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}

export async function sendTestTelegram(): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false, error: "no office" };
  const admin = createAdminClient();
  const { data: office } = await admin.from("offices").select("telegram_chat_id, name").eq("id", ctx.office.id).maybeSingle();
  if (!office?.telegram_chat_id) return { ok: false, error: "لم يتم الربط بعد." };
  const ok = await sendTelegram(office.telegram_chat_id as string, `🔔 رسالة تجريبية من «${office.name}». الإشعارات تعمل بنجاح ✓`);
  return { ok };
}
