"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createOfficeAccount } from "../../actions";

const input = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

function genPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `Wj-${s}`;
}

export default function NewOfficeForm({ plans }: { plans: { code: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(genPassword());
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("");
  const [activate, setActivate] = useState(true);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ officeId?: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await createOfficeAccount({ name, slug, email, password, fullName, phone, plan: plan || undefined, activate });
      if (res.ok) setDone({ officeId: res.officeId });
      else setErr(res.error || "تعذّر الإنشاء");
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl glass-panel p-6">
        <div className="text-lg font-semibold text-emerald-300">تم إنشاء المكتب ✓</div>
        <p className="mt-1 text-sm text-muted">سلّم هذي البيانات للعميل ليدخل بها:</p>
        <div className="mt-4 space-y-2 rounded-xl bg-surface-2/60 p-4 text-sm">
          <Row k="البريد" v={email} />
          <Row k="كلمة المرور" v={password} />
          <Row k="النطاق" v={slug} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {done.officeId && (
            <Link href={`/super-admin/offices/${done.officeId}`} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft">
              فتح صفحة المكتب
            </Link>
          )}
          <button
            onClick={() => { setDone(null); setName(""); setSlug(""); setEmail(""); setFullName(""); setPhone(""); setPlan(""); setPassword(genPassword()); }}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
          >
            إضافة مكتب آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {err && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{err}</div>}

      <section className="rounded-2xl glass-panel p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted">المكتب</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">اسم المكتب</span>
            <input className={input} required value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: مكتب الأفق الهندسي" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">النطاق الفرعي (إنجليزي/أرقام)</span>
            <input className={input} dir="ltr" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="alufuq" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} />
            تفعيل المكتب فوراً
          </label>
          {activate && (
            <label className="block">
              <span className="mb-1 block text-xs text-muted">الباقة (سنة كاملة — اختياري)</span>
              <select className={input} value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="">بدون باقة (تفعيل فقط)</option>
                {plans.map((p) => (<option key={p.code} value={p.code}>{p.name}</option>))}
              </select>
            </label>
          )}
        </div>
      </section>

      <section className="rounded-2xl glass-panel p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted">حساب المالك</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">البريد الإلكتروني (الدخول)</span>
            <input className={input} dir="ltr" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" />
          </label>
          <div className="flex items-end gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs text-muted">كلمة المرور</span>
              <input className={input} dir="ltr" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="button" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2" onClick={() => setPassword(genPassword())}>توليد</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-muted">اسم المالك (اختياري)</span>
              <input className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">الجوال (اختياري)</span>
              <input className={input} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>
        </div>
      </section>

      <button type="submit" disabled={pending} className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60">
        {pending ? "جارٍ الإنشاء…" : "إنشاء المكتب"}
      </button>
    </form>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{k}</span>
      <span className="mono select-all" dir="ltr">{v}</span>
    </div>
  );
}
