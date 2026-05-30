import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { tenantUrl, tenantLabel } from "@/lib/urls";

export default async function DashboardHome() {
  const ctx = await getSessionContext();
  if (ctx?.profile?.role === "super_admin") redirect("/super-admin");
  const office = ctx?.office ?? null;

  let subStatus: string | null = null;
  let subEndsAt: string | null = null;
  if (office) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("status, ends_at")
      .eq("office_id", office.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    subStatus = data?.status ?? null;
    subEndsAt = data?.ends_at ?? null;
  }

  const siteUrl = office ? tenantUrl(office.slug) : null;
  const isLive = office?.status === "active";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">أهلاً، {ctx?.profile?.full_name || "بك"} 👋</h1>
      <p className="mt-1 text-muted">هذه نظرة سريعة على حالة مكتبك وموقعك.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mono text-xs text-muted">حالة الموقع</div>
          <div className="mt-2 text-xl font-semibold">
            {isLive ? "موقعك يعمل الآن ✓" : "غير مُفعّل بعد"}
          </div>
          {isLive && siteUrl ? (
            <a href={siteUrl} target="_blank" rel="noreferrer" className="mono mt-3 inline-block text-sm text-accent hover:underline" dir="ltr">
              {tenantLabel(office!.slug)} ↗
            </a>
          ) : (
            <Link href="/dashboard/subscription" className="mt-3 inline-block text-sm text-accent hover:underline">
              فعّل اشتراكك لإطلاق الموقع ←
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mono text-xs text-muted">الاشتراك</div>
          <div className="mt-2 text-xl font-semibold">
            {subStatus === "active" ? "اشتراك نشط" : subStatus === "pending" ? "بانتظار الدفع" : "لا يوجد اشتراك"}
          </div>
          {subEndsAt && (
            <div className="mt-3 text-sm text-muted">
              ينتهي في {new Date(subEndsAt).toLocaleDateString("ar-SA")}
            </div>
          )}
          <Link href="/dashboard/subscription" className="mt-3 inline-block text-sm text-accent hover:underline">
            إدارة الاشتراك ←
          </Link>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">محرّر الموقع</div>
            <p className="mt-1 text-sm text-muted">عدّل نصوص موقعك وخدماتك ومشاريعك وفريقك.</p>
          </div>
          <Link
            href="/dashboard/site-editor"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft"
          >
            افتح المحرّر
          </Link>
        </div>
      </div>
    </div>
  );
}
