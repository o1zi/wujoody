import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { telegramConfigured } from "@/lib/telegram";
import TelegramConnect from "./TelegramConnect";

export default async function NotificationsPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl glass-panel p-8 text-center">
        <h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: office } = await admin.from("offices").select("telegram_chat_id").eq("id", ctx.office.id).maybeSingle();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">الإشعارات</h1>
      <p className="mt-1 text-muted">استلم تنبيهاً فورياً بكل عميل جديد — لا يضيع عليك أي طلب.</p>
      <TelegramConnect connected={!!office?.telegram_chat_id} configured={telegramConfigured()} />
    </div>
  );
}
