"use client";

import { useState } from "react";

// Confidential case-evaluation form for law firms. Submits to /api/leads so the
// firm receives the case in its messages channel (email + Telegram). Treated as
// a regular lead with a clear "case evaluation" marker; nothing is exposed.
export default function LawIntakeForm({ slug, areas }: { slug: string; areas: string[] }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending" || state === "done") return;
    setState("sending");
    try {
      const composed = [`🔒 طلب تقييم قضية${area ? ` — ${area}` : ""}`, message].filter(Boolean).join("\n");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, contact: phone, message: composed, kind: "message" }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setName(""); setPhone(""); setArea(""); setMessage("");
      setTimeout(() => setState("idle"), 6000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  return (
    <form className="lw-form" onSubmit={onSubmit}>
      <div className="lw-fld">
        <label>الاسم</label>
        <input type="text" placeholder="اسمك الكريم" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="lw-fld">
        <label>الجوال</label>
        <input type="tel" placeholder="05XXXXXXXX" required value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
      </div>
      {areas.length > 0 && (
        <div className="lw-fld">
          <label>نوع القضية</label>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">اختر المجال</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}
      <div className="lw-fld">
        <label>تفاصيل القضية</label>
        <textarea rows={4} placeholder="صِف قضيتك باختصار…" required value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <button className="lw-btn lw-btn-block" type="submit" disabled={state === "sending"}>
        {state === "done"
          ? "تم استلام طلبك ✓ سنتواصل معك بسرّية"
          : state === "error"
            ? "تعذّر الإرسال، حاول مجدداً"
            : state === "sending"
              ? "جارٍ الإرسال…"
              : "أرسل بسرّية تامة"}
      </button>
    </form>
  );
}
