import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!isAllowedSuperAdmin(ctx.email, ctx.profile?.role)) redirect("/dashboard");

  const { count: supportUnread } = await createAdminClient()
    .from("support_messages")
    .select("id", { count: "exact", head: true })
    .eq("sender", "office")
    .eq("read", false);

  const unread = supportUnread ?? 0;
  const links = [
    { href: "/super-admin", label: "لوحة المعلومات" },
    { href: "/super-admin/offices", label: "المكاتب" },
    { href: "/super-admin/plans", label: "الباقات" },
    { href: "/super-admin/payment", label: "بيانات الدفع" },
    { href: "/super-admin/landing", label: "صفحة الهبوط" },
    { href: "/super-admin/support", label: "الدعم", badge: unread },
  ];

  return (
    <div className="admin-shell min-h-dvh">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" precedence="high" />
      <header className="glass-panel sticky top-0 z-30 border-x-0 border-t-0 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="flex items-center gap-5">
              <Link href="/super-admin" className="text-lg font-bold">
                إدارة المنصة<span className="text-accent">.</span>
              </Link>
              {/* desktop nav */}
              <nav className="hidden items-center gap-4 lg:flex">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
                    {l.label}
                    {l.badge ? <span className="rounded-full bg-accent px-1.5 text-xs font-medium text-white">{l.badge}</span> : null}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              <Link href="/dashboard" className="text-muted hover:text-foreground">لوحتي</Link>
              <form action="/auth/signout" method="post">
                <button className="text-muted hover:text-foreground">خروج</button>
              </form>
            </div>
          </div>
          {/* mobile nav — horizontally scrollable */}
          <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-2.5 lg:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg glass-panel-2 px-3 py-1.5 text-sm text-muted"
              >
                {l.label}
                {l.badge ? <span className="rounded-full bg-accent px-1.5 text-xs font-medium text-white">{l.badge}</span> : null}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
