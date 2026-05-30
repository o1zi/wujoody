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

  const [{ data: offices }, { data: profiles }, { data: subs }, { data: events }, plans] = await Promise.all([
    admin.from("offices").select("id, name, slug, status, owner_id, created_at").order("created_at", { ascending: false }),
    admin.from("profiles").select("id, email, office_id, role"),
    admin.from("subscriptions").select("office_id, plan, status, ends_at, created_at").order("created_at", { ascending: false }),
    admin.from("salla_events").select("id, event, created_at").order("created_at", { ascending: false }).limit(10),
    getPlans(),
  ]);
  const planOptions = plans.map((p) => ({ code: p.code, name: p.name }));

  const ownerEmail = new Map<string, string>();
  (profiles ?? []).forEach((p) => {
    if (p.id) ownerEmail.set(p.id, p.email ?? "");
  });
  const latestSub = new Map<string, { plan: string; status: string }>();
  (subs ?? []).forEach((s) => {
    if (s.office_id && !latestSub.has(s.office_id)) latestSub.set(s.office_id, { plan: s.plan, status: s.status });
  });

  const total = offices?.length ?? 0;
  const active = offices?.filter((o) => o.status === "active").length ?? 0;
  const pending = offices?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">المكاتب</h1>
      <div className="mt-5 grid grid-cols-3 gap-4">
        <Stat label="إجمالي المكاتب" value={total} />
        <Stat label="مكاتب مُفعّلة" value={active} />
        <Stat label="بانتظار التفعيل" value={pending} />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 text-right font-medium">المكتب</th>
              <th className="px-4 py-3 text-right font-medium">النطاق</th>
              <th className="px-4 py-3 text-right font-medium">المالك</th>
              <th className="px-4 py-3 text-right font-medium">الاشتراك</th>
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
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${st.cls}`}>{st.text}</span>
                  </td>
                  <td className="px-4 py-3">
                    <OfficeActions
                      office={{ id: o.id, status: o.status }}
                      currentPlan={sub?.plan ?? null}
                      plans={planOptions}
                    />
                  </td>
                </tr>
              );
            })}
            {total === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">لا توجد مكاتب بعد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-semibold">أحدث أحداث سلة</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 text-right font-medium">الحدث</th>
              <th className="px-4 py-3 text-right font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((e) => (
              <tr key={e.id} className="border-t border-border bg-surface/40">
                <td className="mono px-4 py-3 text-xs" dir="ltr">{e.event || "—"}</td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(e.created_at).toLocaleString("ar-SA")}</td>
              </tr>
            ))}
            {(events?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted">لا توجد أحداث بعد.</td>
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
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
