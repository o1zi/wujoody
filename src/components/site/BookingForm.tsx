"use client";

import { useState } from "react";

export default function BookingForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending" || state === "done") return;
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, contact, message, kind: "booking", preferredDate: date, preferredTime: time }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setName(""); setContact(""); setDate(""); setTime(""); setMessage("");
      setTimeout(() => setState("idle"), 4500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="fld">
        <label className="mono">الاسم — NAME</label>
        <input type="text" placeholder="اسمك الكريم" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="fld">
        <label className="mono">البريد / الجوال — CONTACT</label>
        <input type="text" placeholder="بريدك أو رقم جوالك" required value={contact} onChange={(e) => setContact(e.target.value)} />
      </div>
      <div className="book-row">
        <div className="fld">
          <label className="mono">التاريخ المفضّل — DATE</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} dir="ltr" />
        </div>
        <div className="fld">
          <label className="mono">الوقت — TIME</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} dir="ltr" />
        </div>
      </div>
      <div className="fld">
        <label className="mono">موضوع الاستشارة — TOPIC</label>
        <textarea rows={2} placeholder="نبذة عن مشروعك أو استفسارك" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <button
        className="btn"
        type="submit"
        style={state === "done" ? { background: "var(--accent)", color: "#0E1116" } : undefined}
      >
        {state === "done" ? (
          <span className="ar">تم استلام طلبك ✓ سنتواصل معك</span>
        ) : state === "error" ? (
          <span className="ar">تعذّر الإرسال، حاول مجدداً</span>
        ) : (
          <>
            <span>{state === "sending" ? "جارٍ الحجز…" : "احجز الاستشارة"}</span>
            <span className="mono">→</span>
          </>
        )}
      </button>
    </form>
  );
}
