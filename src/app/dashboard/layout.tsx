import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlanCaps } from "@/lib/plans-server";
import { tenantLabel } from "@/lib/urls";
import DashboardNav, { type NavItem } from "./DashboardNav";

const STATUS: Record<string, { text: string; fg: string; bg: string; dot: string }> = {
  active: { text: "مُفعّل", fg: "#0f766e", bg: "rgba(13,148,136,0.12)", dot: "#0d9488" },
  pending: { text: "بانتظار الاشتراك", fg: "#b45309", bg: "rgba(245,158,11,0.14)", dot: "#f59e0b" },
  suspended: { text: "موقوف", fg: "#b91c1c", bg: "rgba(220,38,38,0.12)", dot: "#dc2626" },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  // An office that isn't active yet (pending activation, or suspended) can't use
  // the dashboard — send it to the contact-to-activate page.
  if (ctx.office && ctx.office.status !== "active") redirect("/activate");

  const office = ctx.office;
  const status = office ? STATUS[office.status] : null;
  const isClinic = office?.kind === "clinic";
  const isLaw = office?.kind === "law";
  const usesBooking = isClinic || isLaw;

  let newLeads = 0;
  let newSupport = 0;
  let upcomingAppointments = 0;
  if (office) {
    const supabase = await createClient();
    const [{ count: leadsCount }, { count: supportCount }] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("office_id", office.id).eq("status", "new"),
      supabase.from("support_messages").select("id", { count: "exact", head: true }).eq("office_id", office.id).eq("sender", "admin").eq("read", false),
    ]);
    newLeads = leadsCount ?? 0;
    newSupport = supportCount ?? 0;

    if (usesBooking) {
      const { count: apptCount } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("office_id", office.id)
        .gte("starts_at", new Date().toISOString())
        .in("status", ["booked", "confirmed"]);
      upcomingAppointments = apptCount ?? 0;
    }
  }

  let caps = await getPlanCaps(undefined);
  if (office) {
    const supabase = await createClient();
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("office_id", office.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    caps = await getPlanCaps(sub?.plan);
  }

  const nav: NavItem[] = isClinic
    ? [
        { href: "/dashboard", label: "نظرة عامة", badge: 0, icon: "overview" },
        { href: "/dashboard/appointments", label: "المواعيد", badge: upcomingAppointments, icon: "requests" },
        { href: "/dashboard/doctors", label: "الأطباء", badge: 0, icon: "clients" },
        { href: "/dashboard/services", label: "الخدمات", badge: 0, icon: "services" },
        { href: "/dashboard/hours", label: "أوقات العمل", badge: 0, icon: "hours" },
        { href: "/dashboard/notifications", label: "الإشعارات", badge: 0, icon: "notifs" },
        { href: "/dashboard/site-editor", label: "محرّر الموقع", badge: 0, icon: "editor" },
        ...(caps.customDomain ? [{ href: "/dashboard/domain", label: "النطاق الخاص", badge: 0, icon: "domain" }] : []),
        { href: "/dashboard/subscription", label: "الاشتراك", badge: 0, icon: "subscription" },
        { href: "/dashboard/settings", label: "الإعدادات", badge: 0, icon: "settings" },
        { href: "/dashboard/support", label: "الدعم الفني", badge: newSupport, icon: "support" },
      ]
    : isLaw
    ? [
        { href: "/dashboard", label: "نظرة عامة", badge: 0, icon: "overview" },
        { href: "/dashboard/appointments", label: "الاستشارات", badge: upcomingAppointments, icon: "requests" },
        { href: "/dashboard/leads", label: "طلبات القضايا", badge: newLeads, icon: "blog" },
        { href: "/dashboard/doctors", label: "المحامون", badge: 0, icon: "clients" },
        { href: "/dashboard/services", label: "الخدمات القانونية", badge: 0, icon: "services" },
        { href: "/dashboard/hours", label: "أوقات العمل", badge: 0, icon: "hours" },
        { href: "/dashboard/notifications", label: "الإشعارات", badge: 0, icon: "notifs" },
        { href: "/dashboard/site-editor", label: "محرّر الموقع", badge: 0, icon: "editor" },
        ...(caps.blog ? [{ href: "/dashboard/blog", label: "المدوّنة القانونية", badge: 0, icon: "blog" }] : []),
        ...(caps.customDomain ? [{ href: "/dashboard/domain", label: "النطاق الخاص", badge: 0, icon: "domain" }] : []),
        { href: "/dashboard/subscription", label: "الاشتراك", badge: 0, icon: "subscription" },
        { href: "/dashboard/settings", label: "الإعدادات", badge: 0, icon: "settings" },
        { href: "/dashboard/support", label: "الدعم الفني", badge: newSupport, icon: "support" },
      ]
    : [
        { href: "/dashboard", label: "نظرة عامة", badge: 0, icon: "overview" },
        { href: "/dashboard/leads", label: "الرسائل", badge: newLeads, icon: "requests" },
        { href: "/dashboard/notifications", label: "الإشعارات", badge: 0, icon: "notifs" },
        ...(caps.upload ? [{ href: "/dashboard/analytics", label: "التحليلات", badge: 0, icon: "analytics" }] : []),
        { href: "/dashboard/site-editor", label: "محرّر الموقع", badge: 0, icon: "editor" },
        ...(caps.blog ? [{ href: "/dashboard/blog", label: "المدوّنة", badge: 0, icon: "blog" }] : []),
        ...(caps.customDomain ? [{ href: "/dashboard/domain", label: "النطاق الخاص", badge: 0, icon: "domain" }] : []),
        { href: "/dashboard/subscription", label: "الاشتراك", badge: 0, icon: "subscription" },
        { href: "/dashboard/settings", label: "الإعدادات", badge: 0, icon: "settings" },
        { href: "/dashboard/support", label: "الدعم الفني", badge: newSupport, icon: "support" },
      ];

  return (
    <div className="admin-shell grid min-h-dvh md:grid-cols-[282px_1fr]">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" precedence="high" />

      <aside className="flex flex-col gap-2.5 border-0 border-l border-border bg-surface p-5 md:sticky md:top-0 md:h-dvh md:overflow-y-auto">
        {/* logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-1.5 pb-3">
          <span
            className="grid h-[38px] w-[38px] place-items-center rounded-xl text-white"
            style={{ background: "linear-gradient(140deg,#14b8a6,#0d9488)", boxShadow: "0 8px 18px -8px rgba(13,148,136,0.7)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </span>
          <div>
            <div className="text-[19px] font-bold leading-none text-[#152229]" style={{ fontFamily: "'El Messiri',serif" }}>لوحة التحكم</div>
            <div className="mt-1 text-[11px] text-[#8a97a0]">إدارة موقع نشاطك</div>
          </div>
        </Link>

        {/* published site card */}
        {office && (
          <div className="rounded-2xl border border-border bg-surface-2 p-[14px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-[#7c8a93]">الموقع المنشور</span>
              {status && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ color: status.fg, background: status.bg, border: `1px solid ${status.fg}33` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
                  {status.text}
                </span>
              )}
            </div>
            <div className="text-[17px] font-bold text-[#16242b]" style={{ fontFamily: "'El Messiri',serif" }}>{office.name}</div>
            <div dir="ltr" className="mt-0.5 text-left text-xs text-muted">{tenantLabel(office.slug)}</div>
          </div>
        )}

        <DashboardNav items={nav} />

        {isAllowedSuperAdmin(ctx.email, ctx.profile?.role) && (
          <Link href="/super-admin" className="rounded-xl px-3.5 py-2.5 text-[15px] font-medium text-accent transition hover:bg-accent/10">
            إدارة المنصة ←
          </Link>
        )}

        <form action="/auth/signout" method="post" className="mt-auto pt-4">
          <button className="w-full rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted transition hover:border-accent hover:text-foreground">
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <main className="overflow-y-auto p-6 sm:p-10">{children}</main>
    </div>
  );
}
