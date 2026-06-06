"use client";

import { useState, useTransition } from "react";
import type { PaymentSettings } from "@/lib/bank";
import { savePayment } from "../actions";

const inputCls = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function PaymentEditor({ initial }: { initial: PaymentSettings }) {
  const [c, setC] = useState<PaymentSettings>(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof PaymentSettings, v: string) => setC((p) => ({ ...p, [k]: v }));

  function field(label: string, k: keyof PaymentSettings, opts?: { dir?: "ltr" | "rtl"; hint?: string; placeholder?: string }) {
    return (
      <label className="block">
        <span className="mb-1 block text-xs text-muted">{label}</span>
        <input
          className={inputCls}
          dir={opts?.dir}
          placeholder={opts?.placeholder}
          value={c[k] ?? ""}
          onChange={(e) => set(k, e.target.value)}
        />
        {opts?.hint && <span className="mt-1 block text-[11px] text-muted">{opts.hint}</span>}
      </label>
    );
  }

  function save() {
    setErr(null);
    start(async () => {
      try {
        await savePayment(c);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch {
        setErr("تعذّر الحفظ — تأكد من وجود جدول app_settings في Supabase.");
      }
    });
  }

  const waPreview = (c.whatsapp || "").replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-28">
      <section className="rounded-2xl glass-panel p-6">
        <h2 className="mb-4 text-lg font-semibold">الحساب البنكي</h2>
        <div className="space-y-4">
          {field("اسم البنك", "bankName", { placeholder: "مثال: مصرف الراجحي" })}
          {field("اسم صاحب الحساب", "accountName", { placeholder: "الاسم كما هو في الحساب" })}
          {field("رقم الآيبان (IBAN)", "iban", { dir: "ltr", placeholder: "SA0000000000000000000000" })}
          {field("رقم الحساب (اختياري)", "accountNumber", { dir: "ltr" })}
        </div>
      </section>

      <section className="rounded-2xl glass-panel p-6">
        <h2 className="mb-4 text-lg font-semibold">واتساب استقبال الإيصالات</h2>
        <div className="space-y-4">
          {field("رقم الواتساب (دولي)", "whatsapp", {
            dir: "ltr",
            placeholder: "9665XXXXXXXX",
            hint: "بصيغة دولية بدون + أو أصفار بادئة. مثال للسعودية: 96651XXXXXXX",
          })}
          {waPreview.length >= 8 && (
            <a
              href={`https://wa.me/${waPreview}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-accent hover:underline"
            >
              اختبار الرابط: wa.me/{waPreview} ↗
            </a>
          )}
        </div>
      </section>

      <section className="rounded-2xl glass-panel p-6">
        <h2 className="mb-4 text-lg font-semibold">ملاحظة إضافية (اختياري)</h2>
        <textarea
          rows={3}
          className={inputCls}
          placeholder="تعليمات تظهر للعميل تحت بيانات الحساب — مثال: يُرجى كتابة اسم المكتب في خانة الملاحظات عند التحويل."
          value={c.instructions ?? ""}
          onChange={(e) => set("instructions", e.target.value)}
        />
      </section>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3.5">
          {err ? (
            <span className="text-sm text-red-400">{err}</span>
          ) : (
            <a href="/dashboard/subscription" target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
              معاينة صفحة الاشتراك ↗
            </a>
          )}
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
          >
            {pending ? "…" : saved ? "تم الحفظ ✓" : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}
