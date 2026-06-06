import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import PasswordForm from "./PasswordForm";

export default async function SettingsPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">الإعدادات</h1>
      <p className="mt-1 text-sm text-muted">إدارة بيانات حسابك.</p>

      <section className="mt-6 rounded-2xl glass-panel p-6">
        <h2 className="text-sm font-semibold">تغيير كلمة المرور</h2>
        <p className="mt-1 mb-4 text-xs text-muted">
          البريد: <span className="mono" dir="ltr">{ctx.email || "—"}</span>
        </p>
        <PasswordForm email={ctx.email ?? ""} />
      </section>
    </div>
  );
}
