"use client";

import { useState, useTransition } from "react";
import { setLeadStatus, setLeadNote } from "./actions";

const STATUSES: { key: string; label: string }[] = [
  { key: "new", label: "جديدة" },
  { key: "contacted", label: "تم التواصل" },
  { key: "won", label: "عميل مكتسب" },
  { key: "lost", label: "غير مهتم" },
  { key: "archived", label: "مؤرشفة" },
];

export default function LeadCrm({ id, status, note }: { id: string; status: string; note: string | null }) {
  const [val, setVal] = useState(status === "read" ? "contacted" : status);
  const [text, setText] = useState(note || "");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-start">
      <select
        value={val}
        onChange={(e) => {
          const s = e.target.value;
          setVal(s);
          start(() => setLeadStatus(id, s));
        }}
        className="rounded-lg glass-panel-2 px-2.5 py-1.5 text-xs outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
      <div className="flex-1">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaved(false);
          }}
          onBlur={() => start(async () => { await setLeadNote(id, text); setSaved(true); })}
          placeholder="ملاحظة داخلية…"
          className="w-full rounded-lg glass-panel-2 px-2.5 py-1.5 text-xs outline-none"
        />
        {pending ? <span className="text-[11px] text-muted">حفظ…</span> : saved ? <span className="text-[11px] text-emerald-400">حُفظت ✓</span> : null}
      </div>
    </div>
  );
}
