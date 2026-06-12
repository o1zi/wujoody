import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlanCaps } from "@/lib/plans-server";
import SendReportButton from "./SendReportButton";

const NETWORKS: { type: string; label: string }[] = [
  { type: "click_whatsapp", label: "واتساب" },
  { type: "click_tiktok", label: "تيك توك" },
  { type: "click_snapchat", label: "سناب شات" },
  { type: "click_instagram", label: "إنستقرام" },
  { type: "click_linkedin", label: "لينكدإن" },
];

async function countEvents(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  officeId: string,
  type: string,
  since?: string,
): Promise<number> {
  let q = supabase.from("site_events").select("id", { count: "exact", head: true }).eq("office_id", officeId).eq("type", type);
  if (since) q = q.gte("created_at", since);
  const { count } = await q;
  return count ?? 0;
}

export default async function AnalyticsPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return <div className="mx-auto max-w-2xl glass-panel rounded-2xl p-8 text-center"><h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1></div>;
  }

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

  // Analytics are a premium feature (premium is the only plan with upload).
  if (!caps.upload) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">التحليلات</h1>
        <div className="mt-5 glass-panel rounded-2xl p-8 text-center">
          <div className="text-lg font-semibold text-accent">ميزة بريميوم</div>
          <p className="mt-2 text-muted">التحليلات الشاملة (الزيارات والنقرات) متاحة في باقة بريميوم.</p>
          <Link href="/dashboard/subscription" className="mt-5 inline-block rounded-xl bg-accent px-6 py-3 font-medium text-white hover:bg-accent-soft">
            ترقية الباقة
          </Link>
        </div>
      </div>
    );
  }

  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const [viewsTotal, views30, leads] = await Promise.all([
    countEvents(supabase, ctx.office.id, "view"),
    countEvents(supabase, ctx.office.id, "view", since30),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("office_id", ctx.office.id).then((r: { count: number | null }) => r.count ?? 0),
  ]);
  const clicks = await Promise.all(NETWORKS.map((n) => countEvents(supabase, ctx.office!.id, n.type)));
  const totalClicks = clicks.reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">التحليلات</h1>
          <p className="mt-1 text-muted">نظرة شاملة على أداء موقعك.</p>
        </div>
        <SendReportButton />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="إجمالي الزيارات" value={viewsTotal} />
        <Stat label="زيارات آخر 30 يوماً" value={views30} />
        <Stat label="نقرات التواصل" value={totalClicks} />
        <Stat label="رسائل العملاء" value={leads} />
      </div>

      <h2 className="mt-8 text-lg font-semibold">نقرات أزرار التواصل</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {NETWORKS.map((n, i) => (
          <Stat key={n.type} label={n.label} value={clicks[i]} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="text-3xl font-bold">{value.toLocaleString("en-US")}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
