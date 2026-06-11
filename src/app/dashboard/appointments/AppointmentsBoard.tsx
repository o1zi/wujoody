"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui";

export type Appointment = {
  id: string;
  patient_name: string;
  patient_phone: string;
  service_name: string | null;
  starts_at: string;
  duration_min: number;
  status: string;
  note: string | null;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  booked: { label: "محجوز", cls: "bg-sky-500/15 text-sky-300" },
  confirmed: { label: "مؤكّد", cls: "bg-emerald-500/15 text-emerald-300" },
  done: { label: "تم", cls: "bg-zinc-500/15 text-zinc-300" },
  cancelled: { label: "ملغي", cls: "bg-red-500/15 text-red-300" },
  noshow: { label: "لم يحضر", cls: "bg-amber-500/15 text-amber-300" },
};
const NEXT_STATUS = ["booked", "confirmed", "done", "noshow", "cancelled"];

const TZ = "Asia/Riyadh";
function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-SA", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
}
function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}

export default function AppointmentsBoard({ officeId, initial }: { officeId: string; initial: Appointment[] }) {
  const [rows, setRows] = useState<Appointment[]>(initial);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: TZ });

  const groups = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of rows) {
      const k = dayKey(a.starts_at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  async function setStatus(id: string, status: string) {
    const prev = rows;
    setRows((r) => r.map((a) => (a.id === id ? { ...a, status } : a)));
    const supabase = createClient();
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id).eq("office_id", officeId);
    if (error) {
      setRows(prev);
      setMsg({ kind: "error", text: "تعذّر تحديث حالة الموعد." });
      setTimeout(() => setMsg(null), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">المواعيد</h1>
      <p className="mt-1 text-sm text-muted">حجوزات مرضاك — اضغط الحالة لتغييرها. تصلك إشعارات فورية عند كل حجز جديد.</p>

      {msg && <div className="mt-4"><Alert kind={msg.kind}>{msg.text}</Alert></div>}

      {groups.length === 0 && (
        <div className="mt-8 rounded-2xl glass-panel p-8 text-center text-muted">لا توجد مواعيد بعد.</div>
      )}

      <div className="mt-6 space-y-6">
        {groups.map(([key, items]) => (
          <div key={key}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              {fmtDay(items[0].starts_at)}
              {key === todayKey && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-[#0b0d10]">اليوم</span>}
            </div>
            <div className="space-y-2">
              {items.map((a) => {
                const st = STATUS[a.status] ?? STATUS.booked;
                const idx = NEXT_STATUS.indexOf(a.status);
                const next = NEXT_STATUS[(idx + 1) % NEXT_STATUS.length];
                return (
                  <div key={a.id} className="flex items-center gap-4 rounded-xl glass-panel p-4">
                    <div className="mono w-16 shrink-0 text-sm text-accent" dir="ltr">{fmtTime(a.starts_at)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{a.patient_name}</div>
                      <div className="text-xs text-muted">
                        <a href={`tel:${a.patient_phone}`} dir="ltr" className="hover:text-accent">{a.patient_phone}</a>
                        {a.service_name ? ` · ${a.service_name}` : ""}
                      </div>
                      {a.note && <div className="mt-1 text-xs text-muted">📝 {a.note}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStatus(a.id, next)}
                      title="اضغط لتغيير الحالة"
                      className={`shrink-0 rounded-full px-3 py-1 text-xs ${st.cls}`}
                    >
                      {st.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
