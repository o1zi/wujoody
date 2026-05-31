import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!isAllowedSuperAdmin(ctx.email, ctx.profile?.role)) redirect("/dashboard");

  return (
    <div className="admin-shell min-h-dvh">
      <header className="glass-panel sticky top-0 z-30 border-x-0 border-t-0 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-5">
            <Link href="/super-admin" className="text-lg font-bold">
              إدارة المنصة<span className="text-accent">.</span>
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link href="/super-admin" className="text-sm text-muted hover:text-foreground">المكاتب</Link>
              <Link href="/super-admin/plans" className="text-sm text-muted hover:text-foreground">الباقات</Link>
              <Link href="/super-admin/landing" className="text-sm text-muted hover:text-foreground">صفحة الهبوط</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
              لوحتي
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-muted hover:text-foreground">خروج</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
