import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import SupportThread from "@/components/support/SupportThread";
import SupportComposer from "@/components/support/SupportComposer";
import SupportFaq from "@/components/support/SupportFaq";
import { sendOfficeSupport } from "./actions";

export default async function OfficeSupportPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return (
      <div className="mx-auto max-w-2xl glass-panel rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1>
      </div>
    );
  }

  const admin = createAdminClient();
  // Mark admin replies as read by the office.
  await admin
    .from("support_messages")
    .update({ read: true })
    .eq("office_id", ctx.office.id)
    .eq("sender", "admin")
    .eq("read", false);

  const { data: messages } = await admin
    .from("support_messages")
    .select("id, sender, body, created_at")
    .eq("office_id", ctx.office.id)
    .order("created_at", { ascending: true })
    .limit(500);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">الدعم الفني</h1>
      <p className="mt-1 text-muted">جرّب الحلول السريعة أولاً — أغلب الاستفسارات لها إجابة جاهزة.</p>

      <div className="mt-6 glass-panel rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-semibold text-muted">أسئلة شائعة وحلولها</h2>
        <SupportFaq />
      </div>

      <div className="mt-5 glass-panel rounded-2xl p-5">
        <h2 className="mb-1 text-lg font-semibold">لم تجد إجابتك؟ راسل الدعم</h2>
        <p className="mb-3 text-sm text-muted">اكتب استفسارك وسيردّ عليك فريق الدعم هنا.</p>
        <SupportThread messages={messages ?? []} me="office" />
        <SupportComposer action={sendOfficeSupport} placeholder="اكتب رسالتك للدعم…" />
      </div>
    </div>
  );
}
