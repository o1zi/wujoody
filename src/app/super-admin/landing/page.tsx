import { getLanding } from "@/lib/landing-server";
import LandingEditor from "./LandingEditor";

export default async function SuperAdminLanding() {
  const content = await getLanding();
  return (
    <div>
      <h1 className="text-2xl font-bold">محرّر صفحة الهبوط</h1>
      <p className="mt-1 text-muted">عدّل نصوص الصفحة الرئيسية للمنصّة. تُحفظ في قاعدة البيانات وتظهر فوراً.</p>
      <div className="mt-6">
        <LandingEditor initial={content} />
      </div>
    </div>
  );
}
