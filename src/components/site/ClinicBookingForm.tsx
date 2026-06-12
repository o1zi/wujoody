"use client";

import { useState } from "react";

export type BookingService = { id: string | null; name: string };
export type BookingDoctor = { id: string; name: string };

// Real slot-based booking flow: pick service/doctor + date → fetch available
// times from the server → pick a slot → submit. The server re-validates the
// slot and notifies the clinic instantly (no automatic reminders).
export default function ClinicBookingForm({
  slug,
  services,
  doctors,
  providerLabel = "الطبيب",
  providerAnyLabel = "أي طبيب متاح",
}: {
  slug: string;
  services: BookingService[];
  doctors: BookingDoctor[];
  providerLabel?: string;
  providerAnyLabel?: string;
}) {
  const [serviceIdx, setServiceIdx] = useState(-1);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errText, setErrText] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  async function loadSlots(d: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    setLoadingSlots(true);
    setSlots(null);
    setTime("");
    try {
      const res = await fetch(`/api/clinic/availability?slug=${encodeURIComponent(slug)}&date=${d}`);
      const data = await res.json();
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function onDateChange(d: string) {
    setDate(d);
    if (d) loadSlots(d);
    else setSlots(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending" || state === "done") return;
    if (!time) {
      setErrText("اختر وقتاً متاحاً للموعد.");
      setState("error");
      setTimeout(() => setState("idle"), 3500);
      return;
    }
    setState("sending");
    setErrText("");
    const svc = serviceIdx >= 0 ? services[serviceIdx] : null;
    try {
      const res = await fetch("/api/clinic/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name,
          phone,
          date,
          time,
          serviceId: svc?.id || undefined,
          serviceName: svc?.name || undefined,
          doctorId: doctorId || undefined,
          note,
        }),
      });
      if (res.status === 409) {
        setErrText("هذا الوقت حُجز للتو، اختر وقتاً آخر.");
        setState("error");
        await loadSlots(date);
        setTimeout(() => setState("idle"), 3500);
        return;
      }
      if (!res.ok) throw new Error();
      setState("done");
      setName(""); setPhone(""); setNote(""); setTime(""); setServiceIdx(-1); setDoctorId("");
      setTimeout(() => setState("idle"), 6000);
    } catch {
      setErrText("تعذّر الحجز، حاول مجدداً.");
      setState("error");
      setTimeout(() => setState("idle"), 3500);
    }
  }

  return (
    <form className="cl-form" onSubmit={onSubmit}>
      {services.length > 0 && (
        <div className="cl-fld">
          <label>الخدمة</label>
          <select value={serviceIdx} onChange={(e) => setServiceIdx(Number(e.target.value))}>
            <option value={-1}>اختر الخدمة (اختياري)</option>
            {services.map((s, i) => (
              <option key={i} value={i}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {doctors.length > 0 && (
        <div className="cl-fld">
          <label>{providerLabel}</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">{providerAnyLabel}</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="cl-fld">
        <label>التاريخ</label>
        <input type="date" required value={date} min={today} onChange={(e) => onDateChange(e.target.value)} dir="ltr" />
      </div>

      {date && (
        <div className="cl-fld">
          <label>الوقت المتاح</label>
          {loadingSlots ? (
            <p className="cl-slots-msg">جارٍ تحميل الأوقات…</p>
          ) : slots && slots.length > 0 ? (
            <div className="cl-slots">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`cl-slot ${time === s ? "cl-slot-on" : ""}`}
                  onClick={() => setTime(s)}
                  dir="ltr"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="cl-slots-msg">لا توجد أوقات متاحة في هذا اليوم — جرّب يوماً آخر.</p>
          )}
        </div>
      )}

      <div className="cl-fld">
        <label>الاسم</label>
        <input type="text" placeholder="اسمك الكريم" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="cl-fld">
        <label>الجوال</label>
        <input type="tel" placeholder="05XXXXXXXX" required value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
      </div>
      <div className="cl-fld">
        <label>ملاحظة (اختياري)</label>
        <textarea rows={2} placeholder="أعراض أو ملاحظة تساعدنا" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button className="cl-btn cl-btn-block" type="submit" disabled={state === "sending"}>
        {state === "done"
          ? "تم الحجز ✓ سنستقبلك في موعدك"
          : state === "error"
            ? errText || "تعذّر الحجز، حاول مجدداً"
            : state === "sending"
              ? "جارٍ الحجز…"
              : "تأكيد الحجز"}
      </button>
    </form>
  );
}
