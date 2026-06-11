import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mergeContent } from "@/lib/site-content";
import { mergeClinicContent } from "@/lib/clinic-content";
import { getPlanCaps } from "@/lib/plans-server";
import { tenantUrl } from "@/lib/urls";
import Editor from "./Editor";
import ClinicEditor from "./ClinicEditor";

export default async function SiteEditorPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl glass-panel p-8 text-center">
        <h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1>
        <p className="mt-2 text-muted">تواصل مع الدعم لربط حسابك بمكتب.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("site_content")
    .select("content")
    .eq("office_id", ctx.office.id)
    .maybeSingle();

  // Clinics use a separate content model + editor; everything else is the
  // engineering editor below.
  if (ctx.office.kind === "clinic") {
    const clinicContent = mergeClinicContent(row?.content);
    const clinicSiteUrl = ctx.office.status === "active" ? tenantUrl(ctx.office.slug) : null;
    return (
      <ClinicEditor
        officeId={ctx.office.id}
        initial={clinicContent}
        siteUrl={clinicSiteUrl}
        slug={ctx.office.slug}
      />
    );
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("office_id", ctx.office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const content = mergeContent(row?.content);
  const caps = await getPlanCaps(sub?.plan);
  const siteUrl = ctx.office.status === "active" ? tenantUrl(ctx.office.slug) : null;

  // Current month's AI usage for this office (to show the remaining quota).
  let aiUsed = 0;
  if (caps.aiContent) {
    const period = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from("ai_usage")
      .select("count")
      .eq("office_id", ctx.office.id)
      .eq("period", period)
      .maybeSingle();
    aiUsed = usage?.count ?? 0;
  }

  return (
    <Editor
      officeId={ctx.office.id}
      initial={content}
      siteUrl={siteUrl}
      caps={caps}
      slug={ctx.office.slug}
      aiUsed={aiUsed}
      aiLimit={caps.aiMonthlyLimit}
    />
  );
}
