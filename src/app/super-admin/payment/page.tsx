import { getPaymentSettings } from "@/lib/bank-server";
import PaymentEditor from "./PaymentEditor";

export default async function SuperAdminPayment() {
  const settings = await getPaymentSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold">بيانات الدفع</h1>
      <p className="mt-1 text-muted">
        بيانات الحساب البنكي ورقم الواتساب التي تظهر للمكاتب في صفحة الاشتراك. تُحفظ في قاعدة البيانات وتظهر فوراً.
      </p>
      <div className="mt-6">
        <PaymentEditor initial={settings} />
      </div>
    </div>
  );
}
