import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlans } from "@/lib/plans-server";
import { tenantUrl } from "@/lib/urls";
import OfficeControls from "./OfficeControls";

const STATUS: Record<string, { text: string; cls: string }> = {
  active: { text: "مُفعّل", cls: "bg-emerald-500/15 text-emerald-300" },
  pending: { text: "معلّق", cls: "bg-amber-500/15 text-amber-300" },
  suspended: { text: "موقوف", cls: "bg-red-500/15 text-red-300" },
};
const fmt = (n: number) => n.toLocaleString("en-US");
function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export default async function OfficeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: office } = await admin
    .from("offices")
    .select("id, name, slug, status, owner_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!office) notFound();

  const [{ data: owner }, { data: subs }, plans, viewsAgg, clicksAgg, leadsAgg, { data: recentLeads }] = await Promise.all([
    admin.from("profiles").select("email, full_name, phone").eq("id", office.owner_id).maybeSingle(),
    admin.from("subscriptions").select("plan, status, amount, currency, starts_at, ends_at, created_at").eq("office_id", id).order("created_at", { ascending: false }),
    getPlans(),
    admin.from("site_events").select("id", { count: "exact", head: true }).eq("office_id", id).eq("type", "view"),
    admin.from("site_events").select("id", { count: "exact", head: true }).eq("office_id", id).neq("type", "view"),
    admin.from("leads").select("id", { count: "exact", head: true }).eq("office_id", id),
    admin.from("leads").select("name, contact, created_at").eq("office_id", id).order("created_at", { ascending: false }).limit(5),
  ]);

  const sub = subs?.[0] ?? null;
  const planName = (code?: string | null) => (code ? plans.find((p) => p.code === code)?.name || code : "—");
  const st = STATUS[office.status] ?? { text: office.status, cls: "bg-surface-2 text-muted" };
  const daysLeft = daysUntil(sub?.ends_at);
  const expired = daysLeft !== null && daysLeft <= 0;
  const liveUrl = tenantUrl(office.slug);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/super-admin/offices" className="text-sm text-muted hover:text-foreground">← كل المكاتب</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{office.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs ${st.cls}`}>{st.text}</span>
          <a href={liveUrl} target="_blank" rel="noreferrer" className="mono text-xs text-accent hover:underline" dir="ltr">{office.slug} ↗</a>
        </div>
        <p className="mt-1 text-xs text-muted">أُنشئ في {new Date(office.created_at).toLocaleDateString("ar-SA")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* left: subscription + controls */}
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl glass-panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted">الاشتراك</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="الباقة" value={planName(sub?.plan)} />
              <Field label="الحالة" value={sub ? (expired ? "منتهٍ" : sub.status) : "—"} tone={expired ? "red" : sub?.status === "active" ? "emerald" : undefined} />
              <Field label="ينتهي في" value={sub?.ends_at ? new Date(sub.ends_at).toLocaleDateString("ar-SA") : "—"} sub={daysLeft !== null ? (expired ? "منتهٍ" : `${daysLeft} يوم`) : undefined} />
              <Field label="القيمة" value={sub?.amount != null ? `${fmt(Number(sub.amount))} ر.س` : "—"} />
            </div>
          </section>

          <OfficeControls
            officeId={office.id}
            name={office.name}
            slug={office.slug}
            status={office.status}
            currentPlan={sub?.plan ?? null}
            owner={{ email: owner?.email ?? "", fullName: owner?.full_name ?? "", phone: owner?.phone ?? "" }}
            plans={plans.map((p) => ({ code: p.code, name: p.name }))}
          />
        </div>

        {/* right: stats + owner + leads + links */}
        <div className="space-y-5">
          <section className="rounded-2xl glass-panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted">الأداء</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="زيارات" value={fmt(viewsAgg.count ?? 0)} />
              <Stat label="نقرات" value={fmt(clicksAgg.count ?? 0)} />
              <Stat label="عملاء" value={fmt(leadsAgg.count ?? 0)} />
            </div>
          </section>

          <section className="rounded-2xl glass-panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted">المالك</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted">البريد</span><span dir="ltr" className="truncate">{owner?.email || "—"}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted">الاسم</span><span>{owner?.full_name || "—"}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted">الجوال</span><span dir="ltr">{owner?.phone || "—"}</span></div>
            </div>
          </section>

          <section className="rounded-2xl glass-panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted">آخر العملاء</h2>
              <Link href={`/super-admin/offices/${id}/leads`} className="text-xs text-accent hover:underline">الكل ←</Link>
            </div>
            {(recentLeads ?? []).length === 0 ? (
              <p className="text-sm text-muted">لا توجد رسائل بعد.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(recentLeads ?? []).map((l, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <span className="truncate"><b>{l.name}</b> <span className="text-muted" dir="ltr">{l.contact}</span></span>
                    <span className="mono shrink-0 text-[10px] text-muted">{new Date(l.created_at).toLocaleDateString("ar-SA")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid grid-cols-2 gap-3">
            <Link href={`/super-admin/offices/${id}/edit`} className="rounded-lg border border-border px-3 py-2 text-center text-sm hover:bg-surface-2">تعديل الموقع</Link>
            <Link href={`/super-admin/support/${id}`} className="rounded-lg border border-border px-3 py-2 text-center text-sm hover:bg-surface-2">الدعم</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "emerald" | "red" }) {
  const t = tone === "emerald" ? "text-emerald-300" : tone === "red" ? "text-red-300" : "";
  return (
    <div>
      <div className="text-[11px] text-muted">{label}</div>
      <div className={`mt-1 font-medium ${t}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2/50 p-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
