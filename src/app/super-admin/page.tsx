import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlans } from "@/lib/plans-server";
import { loadAdminData } from "./data";

const fmt = (n: number) => n.toLocaleString("en-US");
const timeAgo = (iso: string) => {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "الآن";
  const m = Math.floor(s / 60);
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} ي`;
};

export default async function SuperAdminDashboard() {
  const [data, plans] = await Promise.all([loadAdminData(), getPlans()]);
  const { metrics: m, rows, planCounts } = data;
  const admin = createAdminClient();
  const nameById = new Map(rows.map((r) => [r.id, r.name] as const));
  const planName = (code: string) => plans.find((p) => p.code === code)?.name || code;

  const [{ data: recentLeads }, { data: recentSupport }, { data: recentSubs }] = await Promise.all([
    admin.from("leads").select("office_id, name, created_at").order("created_at", { ascending: false }).limit(8),
    admin.from("support_messages").select("office_id, created_at").eq("sender", "office").order("created_at", { ascending: false }).limit(8),
    admin.from("subscriptions").select("office_id, plan, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  type Act = { ts: number; icon: string; text: string; href?: string };
  const acts: Act[] = [];
  for (const r of rows.slice(0, 8)) acts.push({ ts: new Date(r.createdAt).getTime(), icon: "🏢", text: `مكتب جديد: ${r.name}`, href: `/super-admin/offices/${r.id}` });
  for (const s of recentSubs ?? []) acts.push({ ts: new Date(s.created_at).getTime(), icon: "💳", text: `اشتراك «${planName(s.plan)}» — ${nameById.get(s.office_id) || "مكتب"}`, href: s.office_id ? `/super-admin/offices/${s.office_id}` : undefined });
  for (const l of recentLeads ?? []) acts.push({ ts: new Date(l.created_at).getTime(), icon: "📩", text: `عميل جديد لـ ${nameById.get(l.office_id) || "مكتب"}` });
  for (const sp of recentSupport ?? []) acts.push({ ts: new Date(sp.created_at).getTime(), icon: "💬", text: `رسالة دعم من ${nameById.get(sp.office_id) || "مكتب"}`, href: sp.office_id ? `/super-admin/support/${sp.office_id}` : undefined });
  acts.sort((a, b) => b.ts - a.ts);
  const activity = acts.slice(0, 12);

  const expiring = rows.filter((r) => r.expiringSoon).sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0));
  const maxPlan = Math.max(1, ...Object.values(planCounts));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
        <Link href="/super-admin/offices" className="text-sm text-accent hover:underline">كل المكاتب ←</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Kpi label="إجمالي المكاتب" value={fmt(m.total)} sub={`${m.newThisMonth} جديد هذا الشهر`} />
        <Kpi label="مكاتب مُفعّلة" value={fmt(m.activeOffices)} sub={`${m.activeSubs} اشتراك نشط`} tone="emerald" />
        <Kpi label="بانتظار التفعيل" value={fmt(m.pending)} sub={m.pending ? "يحتاج إجراء" : "لا شيء معلّق"} tone={m.pending ? "amber" : undefined} href="/super-admin/offices?tab=pending" />
        <Kpi label="الإيراد السنوي المتكرر" value={`${fmt(m.arr)} ر.س`} sub="ARR" tone="accent" />
        <Kpi label="الإيراد الشهري" value={`${fmt(m.mrr)} ر.س`} sub="MRR ≈ ARR ÷ 12" />
        <Kpi label="إجمالي المحصّل" value={`${fmt(m.totalCollected)} ر.س`} sub="منذ البداية" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Alerts + plan distribution */}
        <div className="space-y-5 lg:col-span-1">
          <section className="rounded-2xl glass-panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted">تنبيهات</h2>
            <div className="space-y-2">
              <AlertRow ok={m.pending === 0} label="بانتظار التفعيل" count={m.pending} href="/super-admin/offices?tab=pending" />
              <AlertRow ok={m.expiringSoon === 0} label="اشتراكات تنتهي خلال ١٤ يوم" count={m.expiringSoon} href="/super-admin/offices?tab=expiring" />
              <AlertRow ok={m.expired === 0} label="اشتراكات منتهية" count={m.expired} href="/super-admin/offices?tab=expired" danger />
              <AlertRow ok={m.suspended === 0} label="مكاتب موقوفة" count={m.suspended} href="/super-admin/offices?tab=suspended" />
            </div>
          </section>

          <section className="rounded-2xl glass-panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted">توزيع الباقات (نشطة)</h2>
            {Object.keys(planCounts).length === 0 ? (
              <p className="text-sm text-muted">لا توجد اشتراكات نشطة.</p>
            ) : (
              <div className="space-y-3">
                {plans.filter((p) => planCounts[p.code]).map((p) => (
                  <div key={p.code}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{p.name}</span>
                      <span className="text-muted">{planCounts[p.code]}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(planCounts[p.code] / maxPlan) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Expiring soon + activity */}
        <div className="space-y-5 lg:col-span-2">
          {expiring.length > 0 && (
            <section className="rounded-2xl glass-panel p-5">
              <h2 className="mb-3 text-sm font-semibold text-muted">اشتراكات تقارب الانتهاء</h2>
              <div className="space-y-1.5">
                {expiring.slice(0, 6).map((r) => (
                  <Link key={r.id} href={`/super-admin/offices/${r.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
                    <span className="font-medium">{r.name}</span>
                    <span className="mono text-xs text-amber-300">{r.daysLeft} يوم</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl glass-panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted">النشاط الأخير</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-muted">لا يوجد نشاط بعد.</p>
            ) : (
              <ul className="space-y-1">
                {activity.map((a, i) => {
                  const inner = (
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{a.icon}</span>
                      <span className="flex-1 text-sm">{a.text}</span>
                      <span className="mono shrink-0 text-[11px] text-muted">{timeAgo(new Date(a.ts).toISOString())}</span>
                    </span>
                  );
                  return a.href ? (
                    <li key={i}><Link href={a.href} className="block rounded-lg px-2 py-1.5 hover:bg-surface-2">{inner}</Link></li>
                  ) : (
                    <li key={i} className="px-2 py-1.5">{inner}</li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, tone, href }: { label: string; value: string; sub?: string; tone?: "emerald" | "amber" | "accent"; href?: string }) {
  const toneCls =
    tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-amber-300" : tone === "accent" ? "text-accent" : "text-foreground";
  const body = (
    <div className="rounded-2xl glass-panel p-5 transition hover:border-accent/40">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold ${toneCls}`}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function AlertRow({ label, count, href, ok, danger }: { label: string; count: number; href: string; ok: boolean; danger?: boolean }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-surface-2">
      <span className={ok ? "text-muted" : ""}>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          ok ? "bg-surface-2 text-muted" : danger ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
