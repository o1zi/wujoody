import { createAdminClient } from "@/lib/supabase/admin";
import { FALLBACK_PLANS, normalizePlan } from "@/lib/plans";
import PlanEditor from "./PlanEditor";

export default async function SuperAdminPlans() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("plans").select("*").order("sort_order", { ascending: true });

  const tableMissing = !!error || !data;

  const rows =
    !tableMissing && data && data.length > 0
      ? data.map((p) => ({
          code: p.code,
          name: p.name,
          price: Number(p.price),
          features: Array.isArray(p.features) ? p.features : [],
          highlight: !!p.highlight,
          active: !!p.active,
          paymentLink: p.payment_link || "",
          sallaProductId: p.salla_product_id || "",
          sections: normalizePlan(p).caps.sections,
        }))
      : FALLBACK_PLANS.map((p) => ({
          code: p.code,
          name: p.name,
          price: p.price,
          features: p.features,
          highlight: !!p.highlight,
          active: true,
          paymentLink: p.paymentLink,
          sallaProductId: p.sallaProductId,
          sections: p.caps.sections,
        }));

  return (
    <div>
      <h1 className="text-2xl font-bold">إدارة الباقات</h1>
      <p className="mt-1 text-muted">عدّل الأسعار والمزايا. تُحفظ مباشرةً في قاعدة البيانات.</p>

      {tableMissing && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          جدول <span className="mono">plans</span> غير موجود بعد — تُعرض القيم الافتراضية من الكود.
          نفّذ <span className="mono">supabase/plans.sql</span> في Supabase أولاً ليصبح التعديل من هنا فعّالاً.
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {rows.map((p) => (
          <PlanEditor key={p.code} plan={p} />
        ))}
      </div>
    </div>
  );
}
