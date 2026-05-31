"use client";

import { useState, useTransition } from "react";
import { sendMyReport } from "./actions";

export default function SendReportButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function send() {
    start(async () => {
      setMsg(null);
      const r = await sendMyReport();
      if (r.ok) {
        setMsg({ kind: "ok", text: r.channel === "telegram" ? "أُرسل التقرير على تيليجرام ✓" : "أُرسل التقرير على بريدك ✓" });
      } else {
        setMsg({ kind: "err", text: r.error || "تعذّر الإرسال." });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={send}
        disabled={pending}
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? "جارٍ الإرسال…" : "أرسل تقريري الآن"}
      </button>
      {msg && (
        <span className={`text-xs ${msg.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</span>
      )}
    </div>
  );
}
