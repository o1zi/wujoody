"use client";

import { useState, useTransition } from "react";
import { saveCustomDomain, removeCustomDomain, verifyCustomDomain, DOMAIN_TARGETS } from "./actions";

const STATUS: Record<string, { text: string; cls: string }> = {
  none: { text: "غير مربوط", cls: "bg-surface-2 text-muted" },
  pending: { text: "بانتظار التحقق", cls: "bg-amber-500/15 text-amber-300" },
  verified: { text: "موثّق ✓", cls: "bg-emerald-500/15 text-emerald-300" },
};

export default function DomainManager({ initialDomain, initialStatus }: { initialDomain: string; initialStatus: string }) {
  const [domain, setDomain] = useState(initialDomain);
  const [status, setStatus] = useState(initialStatus || "none");
  const [saved, setSaved] = useState(initialDomain);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const st = STATUS[status] ?? STATUS.none;
  const input = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

  function save() {
    start(async () => {
      setMsg(null);
      const r = await saveCustomDomain(domain);
      if (r.ok) {
        setSaved(domain.trim().toLowerCase());
        setStatus("pending");
        setMsg({ kind: "ok", text: "تم حفظ النطاق. أضف سجلات DNS أدناه ثم اضغط تحقّق." });
      } else setMsg({ kind: "err", text: r.error || "تعذّر الحفظ." });
    });
  }
  function verify() {
    start(async () => {
      setMsg(null);
      const r = await verifyCustomDomain();
      if (r.ok) {
        setStatus(r.status);
        setMsg(
          r.status === "verified"
            ? { kind: "ok", text: "تم التحقق من النطاق ✓ سيُفعّل ربطه قريباً." }
            : { kind: "err", text: "لم تُكتشف السجلات بعد. قد يستغرق انتشار DNS حتى عدة ساعات." },
        );
      } else setMsg({ kind: "err", text: r.error || "تعذّر التحقق." });
    });
  }
  function remove() {
    start(async () => {
      await removeCustomDomain();
      setDomain("");
      setSaved("");
      setStatus("none");
      setMsg({ kind: "ok", text: "تمت إزالة النطاق." });
    });
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-2xl glass-panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">نطاقك الخاص</h2>
          <span className={`rounded-full px-3 py-1 text-xs ${st.cls}`}>{st.text}</span>
        </div>
        <p className="mt-1 text-sm text-muted">اربط نطاقك (مثل example.com) ليعمل موقعك عليه بدل النطاق الفرعي.</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input className={input} dir="ltr" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <button
            onClick={save}
            disabled={pending || !domain.trim()}
            className="shrink-0 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
          >
            {pending ? "…" : "حفظ النطاق"}
          </button>
        </div>

        {msg && (
          <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
            {msg.text}
          </div>
        )}
      </div>

      {saved && (
        <div className="rounded-2xl glass-panel p-6">
          <h3 className="font-semibold">سجلات DNS المطلوبة</h3>
          <p className="mt-1 text-sm text-muted">
            أضف أحد السجلين عند مزوّد نطاقك (حسب نوع النطاق)، ثم اضغط «تحقّق».
          </p>

          <div className="mt-4 space-y-3 text-sm" dir="ltr">
            <div className="rounded-lg border border-border p-3">
              <div className="mb-1 text-xs text-muted">For a subdomain (www.example.com)</div>
              <div className="mono">Type: <b>CNAME</b> &nbsp;·&nbsp; Name: <b>www</b> &nbsp;·&nbsp; Value: <b>{DOMAIN_TARGETS.cname}</b></div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="mb-1 text-xs text-muted">For a root domain (example.com)</div>
              <div className="mono">Type: <b>A</b> &nbsp;·&nbsp; Name: <b>@</b> &nbsp;·&nbsp; Value: <b>{DOMAIN_TARGETS.aRecord}</b></div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={verify}
              disabled={pending}
              className="rounded-lg border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10 disabled:opacity-60"
            >
              {pending ? "جارٍ التحقق…" : "تحقّق من النطاق"}
            </button>
            <button onClick={remove} disabled={pending} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground">
              إزالة النطاق
            </button>
          </div>

          <p className="mt-3 text-xs text-muted">
            ملاحظة: قد يستغرق انتشار DNS حتى عدة ساعات. بعد التحقق يكتمل ربط النطاق بموقعك.
          </p>
        </div>
      )}
    </div>
  );
}
