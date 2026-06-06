import { getSessionContext } from "@/lib/auth";
import { getPaymentSettings } from "@/lib/bank-server";
import PaymentEditor from "./PaymentEditor";
import EmailTester from "./EmailTester";

export default async function SuperAdminPayment() {
  const [settings, ctx] = await Promise.all([getPaymentSettings(), getSessionContext()]);
  return (
    <div>
      <h1 className="text-2xl font-bold">بيانات الدفع</h1>
      <p className="mt-1 text-muted">
        بيانات الحساب البنكي ورقم الواتساب التي تظهر للمكاتب في صفحة الاشتراك. تُحفظ في قاعدة البيانات وتظهر فوراً.
      </p>
      <div className="mx-auto max-w-2xl">
        <div className="mt-6">
          <EmailTester defaultTo={ctx?.email || ""} />
        </div>
      </div>
      <div className="mt-2">
        <PaymentEditor initial={settings} />
      </div>
    </div>
  );
}
