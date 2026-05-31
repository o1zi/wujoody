import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { tenantLabel } from "@/lib/urls";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active: { text: "مُفعّل", cls: "bg-emerald-500/15 text-emerald-300" },
  pending: { text: "بانتظار الاشتراك", cls: "bg-amber-500/15 text-amber-300" },
  suspended: { text: "موقوف", cls: "bg-red-500/15 text-red-300" },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  const office = ctx.office;
  const status = office ? STATUS_LABEL[office.status] : null;

  let newLeads = 0;
  if (office) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("office_id", office.id)
      .eq("status", "new");
    newLeads = count ?? 0;
  }

  const nav = [
    { href: "/dashboard", label: "نظرة عامة", badge: 0 },
    { href: "/dashboard/leads", label: "الرسائل", badge: newLeads },
    { href: "/dashboard/site-editor", label: "محرّر الموقع", badge: 0 },
    { href: "/dashboard/subscription", label: "الاشتراك", badge: 0 },
  ];

  return (
    <div className="admin-shell grid min-h-dvh md:grid-cols-[260px_1fr]">
      <aside className="glass-panel flex flex-col border-0 border-l border-white/10 p-5">
        <Link href="/dashboard" className="text-lg font-bold">
          لوحة التحكم<span className="text-accent">.</span>
        </Link>

        {office && (
          <div className="mt-5 rounded-xl border border-border p-3.5">
            <div className="text-sm font-medium">{office.name}</div>
            <div className="mono mt-1 text-xs text-muted" dir="ltr">
              {tenantLabel(office.slug)}
            </div>
            {status && (
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs ${status.cls}`}>
                {status.text}
              </span>
            )}
          </div>
        )}

        <nav className="mt-6 flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              <span>{n.label}</span>
              {n.badge > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-[#0b0d10]">
                  {n.badge}
                </span>
              )}
            </Link>
          ))}
          {isAllowedSuperAdmin(ctx.email, ctx.profile?.role) && (
            <Link
              href="/super-admin"
              className="mt-1 rounded-lg px-3 py-2 text-sm text-accent transition hover:bg-surface-2"
            >
              إدارة المنصة ←
            </Link>
          )}
        </nav>

        <form action="/auth/signout" method="post" className="mt-auto pt-6">
          <button className="w-full rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-foreground">
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <main className="overflow-y-auto p-6 sm:p-10">{children}</main>
    </div>
  );
}
