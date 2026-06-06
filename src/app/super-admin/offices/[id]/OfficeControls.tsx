"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setOfficePlan,
  setOfficeStatus,
  setOfficeName,
  setOfficeSlug,
  updateOfficeOwner,
  extendSubscription,
  endSubscriptionNow,
  deleteOffice,
} from "../../actions";

const input = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";
const btn = "rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2 disabled:opacity-50";

export default function OfficeControls({
  officeId,
  name,
  slug,
  status,
  currentPlan,
  owner,
  plans,
}: {
  officeId: string;
  name: string;
  slug: string;
  status: string;
  currentPlan: string | null;
  owner: { email: string; fullName: string; phone: string };
  plans: { code: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [nameV, setNameV] = useState(name);
  const [slugV, setSlugV] = useState(slug);
  const [fullName, setFullName] = useState(owner.fullName);
  const [phone, setPhone] = useState(owner.phone);

  function run(fn: () => Promise<unknown>, ok = "تم ✓") {
    setMsg(null);
    start(async () => {
      try {
        await fn();
        setMsg(ok);
        setTimeout(() => setMsg(null), 2500);
      } catch {
        setMsg("تعذّر التنفيذ");
      }
    });
  }

  function saveSlug() {
    setMsg(null);
    start(async () => {
      const res = await setOfficeSlug(officeId, slugV);
      setMsg(res.ok ? "تم تغيير النطاق ✓" : res.error || "تعذّر التغيير");
      if (!res.ok) setTimeout(() => setMsg(null), 4000);
      else setTimeout(() => setMsg(null), 2500);
    });
  }

  function remove() {
    if (!confirm(`حذف «${name}» نهائياً؟ لا يمكن التراجع.`)) return;
    start(async () => {
      await deleteOffice(officeId);
      router.push("/super-admin/offices");
    });
  }

  return (
    <div className="space-y-5">
      {/* subscription controls */}
      <section className="rounded-2xl glass-panel p-5">
        <h2 className="mb-3 text-sm font-semibold text-muted">إدارة الاشتراك</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">تفعيل / تغيير الباقة (سنة كاملة)</span>
            <select
              value={currentPlan ?? ""}
              disabled={pending}
              onChange={(e) => run(() => setOfficePlan(officeId, e.target.value), "تم تفعيل الباقة سنة ✓")}
              className={input}
            >
              <option value="" disabled>اختر باقة…</option>
              {plans.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-1.5 block text-xs text-muted">تمديد المدة</span>
            <div className="flex flex-wrap gap-2">
              <button className={btn} disabled={pending} onClick={() => run(() => extendSubscription(officeId, 30), "تم التمديد ٣٠ يوم ✓")}>+ ٣٠ يوم</button>
              <button className={btn} disabled={pending} onClick={() => run(() => extendSubscription(officeId, 90), "تم التمديد ٩٠ يوم ✓")}>+ ٩٠ يوم</button>
              <button className={btn} disabled={pending} onClick={() => run(() => extendSubscription(officeId, 365), "تم التمديد سنة ✓")}>+ سنة</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {status !== "active" ? (
              <button className="rounded-lg border border-emerald-500/40 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50" disabled={pending} onClick={() => run(() => setOfficeStatus(officeId, "active"), "تم التفعيل ✓")}>
                تفعيل المكتب
              </button>
            ) : (
              <button className="rounded-lg border border-amber-500/40 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/10 disabled:opacity-50" disabled={pending} onClick={() => run(() => setOfficeStatus(officeId, "suspended"), "تم الإيقاف ✓")}>
                إيقاف المكتب
              </button>
            )}
            <button
              className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              disabled={pending}
              onClick={() => { if (confirm("إنهاء الاشتراك الآن؟ سيُغلق الموقع مباشرة.")) run(() => endSubscriptionNow(officeId), "تم إنهاء الاشتراك ✓"); }}
            >
              إنهاء الاشتراك الآن
            </button>
          </div>
        </div>
      </section>

      {/* office + owner data */}
      <section className="rounded-2xl glass-panel p-5">
        <h2 className="mb-3 text-sm font-semibold text-muted">بيانات المكتب والمالك</h2>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs text-muted">اسم المكتب</span>
              <input className={input} value={nameV} onChange={(e) => setNameV(e.target.value)} />
            </label>
            <button className={btn} disabled={pending || nameV.trim() === name} onClick={() => run(() => setOfficeName(officeId, nameV), "تم حفظ الاسم ✓")}>حفظ</button>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs text-muted">النطاق الفرعي (slug)</span>
              <input className={input} dir="ltr" value={slugV} onChange={(e) => setSlugV(e.target.value)} />
            </label>
            <button className={btn} disabled={pending || slugV.trim() === slug} onClick={saveSlug}>حفظ</button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-muted">اسم المالك</span>
              <input className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">جوال المالك</span>
              <input className={input} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>
          <button
            className={btn}
            disabled={pending || (fullName === owner.fullName && phone === owner.phone)}
            onClick={() => run(() => updateOfficeOwner(officeId, { full_name: fullName, phone }), "تم حفظ بيانات المالك ✓")}
          >
            حفظ بيانات المالك
          </button>
          <p className="text-[11px] text-muted">البريد ({owner.email || "—"}) لا يُعدّل من هنا — يغيّره المالك من حسابه.</p>
        </div>
      </section>

      {/* danger */}
      <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <h2 className="mb-1 text-sm font-semibold text-red-300">منطقة الخطر</h2>
        <p className="mb-3 text-xs text-muted">حذف المكتب يمسح موقعه ومحتواه ورسائله نهائياً.</p>
        <button className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50" disabled={pending} onClick={remove}>
          حذف المكتب نهائياً
        </button>
      </section>

      {msg && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-surface px-4 py-2 text-sm shadow-lg ring-1 ring-border">
          {msg}
        </div>
      )}
    </div>
  );
}
