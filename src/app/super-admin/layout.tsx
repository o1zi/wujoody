import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (ctx.profile?.role !== "super_admin") redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/super-admin" className="text-lg font-bold">
              إدارة المنصة<span className="text-accent">.</span>
            </Link>
            <span className="mono rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">SUPER ADMIN</span>
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
