import { createAdminClient } from "@/lib/supabase/admin";
import { getPlans } from "@/lib/plans-server";
import OfficeActions from "./OfficeActions";

const STATUS: Record<string, { text: string; cls: string }> = {
  active: { text: "مُفعّل", cls: "bg-emerald-500/15 text-emerald-300" },
  pending: { text: "معلّق", cls: "bg-amber-500/15 text-amber-300" },
  suspended: { text: "موقوف", cls: "bg-red-500/15 text-red-300" },
};

export default async function SuperAdminPage() {
  const admin = createAdminClient();

  const [{ data: offices }, { data: profiles }, { data: subs }, plans, viewsAgg, clicksAgg, leadsAgg] =
    await Promise.all([
      admin.from("offices").select("id, name, slug, status, owner_id, created_at").order("created_at", { ascending: false }),
      admin.from("profiles").select("id, email, office_id, role"),
      admin.from("subscriptions").select("office_id, plan, status, ends_at, created_at").order("created_at", { ascending: false }),
      getPlans(),
      admin.from("site_events").select("id", { count: "exact", head: true }).eq("type", "view"),
      admin.from("site_events").select("id", { count: "exact", head: true }).neq("type", "view"),
      admin.from("leads").select("id", { count: "exact", head: true }),
    ]);
  const planOptions = plans.map((p) => ({ code: p.code, name: p.name }));
  const totalViews = viewsAgg.count ?? 0;
  const totalClicks = clicksAgg.count ?? 0;
  const totalLeads = leadsAgg.count ?? 0;

  const ownerEmail = new Map<string, string>();
  (profiles ?? []).forEach((p) => {
    if (p.id) ownerEmail.set(p.id, p.email ?? "");
  });
  const latestSub = new Map<string, { plan: string; status: string; ends_at: string | null }>();
  (subs ?? []).forEach((s) => {
    if (s.office_id && !latestSub.has(s.office_id))
      latestSub.set(s.office_id, { plan: s.plan, status: s.status, ends_at: s.ends_at });
  });

  const total = offices?.length ?? 0;
  const active = offices?.filter((o) => o.status === "active").length ?? 0;
  const pending = offices?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="إجمالي المكاتب" value={total} />
        <Stat label="مُفعّلة" value={active} />
        <Stat label="بانتظار التفعيل" value={pending} />
        <Stat label="إجمالي الزيارات" value={totalViews} />
        <Stat label="نقرات التواصل" value={totalClicks} />
        <Stat label="رسائل العملاء" value={totalLeads} />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 text-right font-medium">المكتب</th>
              <th className="px-4 py-3 text-right font-medium">النطاق</th>
              <th className="px-4 py-3 text-right font-medium">المالك</th>
              <th className="px-4 py-3 text-right font-medium">الاشتراك</th>
              <th className="px-4 py-3 text-right font-medium">ينتهي</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(offices ?? []).map((o) => {
              const st = STATUS[o.status];
              const sub = latestSub.get(o.id);
              return (
                <tr key={o.id} className="border-t border-border bg-surface/40">
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="mono px-4 py-3 text-xs text-muted" dir="ltr">{o.slug}</td>
                  <td className="px-4 py-3 text-xs text-muted" dir="ltr">{ownerEmail.get(o.owner_id) || "—"}</td>
                  <td className="px-4 py-3 text-xs">{sub ? `${sub.plan} · ${sub.status}` : "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {sub?.ends_at ? (
                      (() => {
                        const days = Math.ceil((new Date(sub.ends_at).getTime() - Date.now()) / 86400000);
                        const expired = days <= 0;
                        return (
                          <span className={expired ? "text-red-300" : days <= 5 ? "text-amber-300" : ""}>
                            {new Date(sub.ends_at).toLocaleDateString("ar-SA")}
                            <span className="mono mr-1 text-[10px]">
                              {expired ? "(منتهٍ)" : `(${days}ي)`}
                            </span>
                          </span>
                        );
                      })()
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${st.cls}`}>{st.text}</span>
                  </td>
                  <td className="px-4 py-3">
                    <OfficeActions
                      office={{ id: o.id, status: o.status, slug: o.slug }}
                      currentPlan={sub?.plan ?? null}
                      plans={planOptions}
                    />
                  </td>
                </tr>
              );
            })}
            {total === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">لا توجد مكاتب بعد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl glass-panel p-5">
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
