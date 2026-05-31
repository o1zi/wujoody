"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateTelegramLink, disconnectTelegram, sendTestTelegram } from "./actions";

export default function TelegramConnect({ connected, configured }: { connected: boolean; configured: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();

  function connect() {
    start(async () => {
      setMsg(null);
      const r = await generateTelegramLink();
      if (r.ok && r.url) {
        window.open(r.url, "_blank");
        setMsg({ kind: "ok", text: "افتح تيليجرام واضغط Start، ثم ارجع هنا واضغط «تحقّق»." });
      } else setMsg({ kind: "err", text: r.error || "تعذّر إنشاء الرابط." });
    });
  }
  function refresh() {
    start(() => {
      router.refresh();
    });
  }
  function test() {
    start(async () => {
      setMsg(null);
      const r = await sendTestTelegram();
      setMsg(r.ok ? { kind: "ok", text: "أُرسلت رسالة تجريبية ✓ تحقّق من تيليجرام." } : { kind: "err", text: r.error || "تعذّر الإرسال." });
    });
  }
  function disconnect() {
    start(async () => {
      await disconnectTelegram();
      router.refresh();
    });
  }

  if (!configured) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-200">
        خدمة إشعارات تيليجرام غير مفعّلة على المنصة بعد. سيتم تفعيلها قريباً.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl glass-panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">إشعارات تيليجرام</h2>
        <span className={`rounded-full px-3 py-1 text-xs ${connected ? "bg-emerald-500/15 text-emerald-300" : "bg-surface-2 text-muted"}`}>
          {connected ? "مربوط ✓" : "غير مربوط"}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">اربط تيليجرام ليصلك إشعار فوري بكل عميل أو حجز جديد على موقعك.</p>

      {msg && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</div>
      )}

      {connected ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={test} disabled={pending} className="rounded-lg border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10 disabled:opacity-60">إرسال رسالة تجريبية</button>
          <button onClick={disconnect} disabled={pending} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground">إلغاء الربط</button>
        </div>
      ) : (
        <div className="mt-5">
          <ol className="mb-4 space-y-1.5 text-sm text-muted">
            <li>١. اضغط «اربط تيليجرام» — يفتح البوت في تيليجرام.</li>
            <li>٢. اضغط <span className="text-foreground">Start</span> داخل المحادثة.</li>
            <li>٣. ارجع هنا واضغط «تحقّق».</li>
          </ol>
          <div className="flex flex-wrap gap-3">
            <button onClick={connect} disabled={pending} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60">اربط تيليجرام</button>
            <button onClick={refresh} disabled={pending} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2">تحقّق</button>
          </div>
        </div>
      )}
    </div>
  );
}
