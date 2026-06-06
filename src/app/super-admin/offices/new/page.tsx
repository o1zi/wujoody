import Link from "next/link";
import { getPlans } from "@/lib/plans-server";
import NewOfficeForm from "./NewOfficeForm";

export default async function NewOfficePage() {
  const plans = await getPlans();
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/super-admin/offices" className="text-sm text-muted hover:text-foreground">← المكاتب</Link>
      <h1 className="mt-2 text-2xl font-bold">إضافة مكتب يدوياً</h1>
      <p className="mt-1 text-sm text-muted">تنشئ حساباً لعميل مباشرة (مؤكَّد البريد) دون أن يمرّ بصفحة التسجيل.</p>
      <div className="mt-6">
        <NewOfficeForm plans={plans.map((p) => ({ code: p.code, name: p.name }))} />
      </div>
    </div>
  );
}
