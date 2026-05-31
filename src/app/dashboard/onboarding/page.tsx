import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mergeContent } from "@/lib/site-content";
import { getPlanCaps } from "@/lib/plans-server";
import { tenantUrl } from "@/lib/urls";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl glass-panel p-8 text-center">
        <h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: row } = await supabase.from("site_content").select("content").eq("office_id", ctx.office.id).maybeSingle();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("office_id", ctx.office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const caps = await getPlanCaps(sub?.plan);
  const content = mergeContent(row?.content);
  const siteUrl = ctx.office.status === "active" ? tenantUrl(ctx.office.slug) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">لنجهّز موقعك ✨</h1>
      <p className="mt-1 text-muted">خطوات سريعة تطلق موقع مكتبك. تقدر تعدّل كل شيء لاحقاً.</p>
      <div className="mt-6">
        <OnboardingWizard officeId={ctx.office.id} initial={content} caps={caps} siteUrl={siteUrl} />
      </div>
    </div>
  );
}
