"use client";

import { useState } from "react";

export default function ContactForm({ slug, waNumber = "", brand = "" }: { slug: string; waNumber?: string; brand?: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  // Free, instant WhatsApp delivery: open the office's WhatsApp with the
  // visitor's details prefilled. A direct anchor click avoids popup blockers.
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `مرحباً${brand ? ` ${brand}` : ""}،\n` +
          `الاسم: ${name || "—"}\n` +
          `وسيلة التواصل: ${contact || "—"}\n` +
          `عن المشروع: ${message || "—"}`,
      )}`
    : "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending" || state === "done") return;
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, contact, message }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setName("");
      setContact("");
      setMessage("");
      setTimeout(() => setState("idle"), 4000);
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
      <div className="fld">
        <label className="mono">عن المشروع — PROJECT</label>
        <textarea rows={3} placeholder="نوع المشروع، الموقع، ونبذة مختصرة" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <button
        className="btn"
        type="submit"
        style={state === "done" ? { background: "var(--accent)", color: "#0E1116" } : undefined}
      >
        {state === "done" ? (
          <span className="ar">تم الاستلام ✓</span>
        ) : state === "error" ? (
          <span className="ar">تعذّر الإرسال، حاول مجدداً</span>
        ) : (
          <>
            <span>{state === "sending" ? "جارٍ الإرسال…" : "أرسل الطلب"}</span>
            <span className="mono">→</span>
          </>
        )}
      </button>
      {waHref && (
        <a href={waHref} target="_blank" rel="noreferrer" className="btn-wa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.671 5.466l-.999 3.648 3.817-1.003zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"/>
          </svg>
          <span>راسلنا عبر واتساب مباشرة</span>
        </a>
      )}
    </form>
  );
}
