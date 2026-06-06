"use client";

import { useState } from "react";

type Result = { ok: boolean; reason?: string; status?: number; from?: string; to?: string; detail?: string };

export default function EmailTester({ defaultTo = "" }: { defaultTo?: string }) {
  const [to, setTo] = useState(defaultTo);
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch("/api/super-admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      setRes(await r.json());
    } catch {
      setRes({ ok: false, reason: "خطأ في الاتصال بالخادم" });
    }
    setLoading(false);
  }

  return (
    <section className="rounded-2xl glass-panel p-6">
      <h2 className="mb-1 text-lg font-semibold">اختبار إرسال البريد (Resend)</h2>
      <p className="mb-4 text-xs text-muted">
        أرسل بريداً تجريبياً للتأكد من أن إعداد الإرسال يعمل — يعتمد عليه إيميل استعادة كلمة المرور وإشعارات العملاء.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1">
          <span className="mb-1 block text-xs text-muted">أرسل إلى</span>
          <input
            className="w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent"
            dir="ltr"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <button
          onClick={send}
          disabled={loading}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
        >
          {loading ? "…" : "إرسال تجريبي"}
        </button>
      </div>

      {res && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            res.ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {res.ok ? (
            <div>تم الإرسال بنجاح ✓ — تحقّق من صندوق الوارد (وملف السبام) للبريد {res.to}.</div>
          ) : (
            <div className="space-y-1">
              <div className="font-medium">لم يُرسَل ✗</div>
              {res.reason && <div>{res.reason}</div>}
              {res.status != null && <div className="mono text-xs">HTTP {res.status}</div>}
              {res.from && <div className="mono text-xs" dir="ltr">from: {res.from}</div>}
              {res.detail && (
                <pre className="mono mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded bg-black/30 p-2 text-[11px]" dir="ltr">
                  {res.detail}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
