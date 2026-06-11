"use client";

import { useState } from "react";

// Phase 2 booking form. Submits to the existing /api/leads endpoint (kind:
// "booking") so the clinic gets the request immediately via its lead channel.
// Phase 3 replaces this with the real slot-based appointment engine (choose
// doctor → available times → confirmed appointment row).
export default function ClinicBookingForm({ slug, services }: { slug: string; services: string[] }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending" || state === "done") return;
    setState("sending");
    try {
      const composed = [service ? `الخدمة: ${service}` : "", message].filter(Boolean).join(" — ");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, contact, message: composed, kind: "booking", preferredDate: date, preferredTime: time }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setName(""); setContact(""); setService(""); setDate(""); setTime(""); setMessage("");
      setTimeout(() => setState("idle"), 4500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  return (
    <form className="cl-form" onSubmit={onSubmit}>
      <div className="cl-fld">
        <label>الاسم</label>
        <input type="text" placeholder="اسمك الكريم" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="cl-fld">
        <label>الجوال</label>
        <input type="tel" placeholder="05XXXXXXXX" required value={contact} onChange={(e) => setContact(e.target.value)} dir="ltr" />
      </div>
      {services.length > 0 && (
        <div className="cl-fld">
          <label>الخدمة</label>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">اختر الخدمة</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      <div className="cl-row">
        <div className="cl-fld">
          <label>التاريخ المفضّل</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} dir="ltr" />
        </div>
        <div className="cl-fld">
          <label>الوقت</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} dir="ltr" />
        </div>
      </div>
      <div className="cl-fld">
        <label>ملاحظة (اختياري)</label>
        <textarea rows={2} placeholder="أعراض أو ملاحظة تساعدنا" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <button className="cl-btn cl-btn-block" type="submit" disabled={state === "sending"}>
        {state === "done"
          ? "تم استلام طلبك ✓ سنؤكد لك الموعد"
          : state === "error"
            ? "تعذّر الإرسال، حاول مجدداً"
            : state === "sending"
              ? "جارٍ الحجز…"
              : "تأكيد الحجز"}
      </button>
    </form>
  );
}
