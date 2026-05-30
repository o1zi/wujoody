"use client";

import { useState } from "react";

export default function ContactForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
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
    </form>
  );
}
