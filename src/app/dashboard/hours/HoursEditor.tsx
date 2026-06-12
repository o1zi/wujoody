"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Alert } from "@/components/ui";
import { minToHHMM, hhmmToMin, DEFAULT_HOURS } from "@/lib/clinic-booking";

export type HourRow = {
  weekday: number;
  is_open: boolean;
  start_min: number;
  end_min: number;
  slot_min: number;
};

// 0=Sunday … 6=Saturday (matches JS getDay / the booking engine).
const WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const SLOT_OPTIONS = [15, 20, 30, 45, 60];

function buildInitial(rows: HourRow[]): HourRow[] {
  return WEEKDAYS.map((_, wd) => {
    const found = rows.find((r) => r.weekday === wd);
    return found ?? { weekday: wd, is_open: true, start_min: DEFAULT_HOURS.start_min, end_min: DEFAULT_HOURS.end_min, slot_min: DEFAULT_HOURS.slot_min };
  });
}

export default function HoursEditor({ officeId, initial }: { officeId: string; initial: HourRow[] }) {
  const [rows, setRows] = useState<HourRow[]>(buildInitial(initial));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function update(wd: number, patch: Partial<HourRow>) {
    setRows((r) => r.map((row) => (row.weekday === wd ? { ...row, ...patch } : row)));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    try {
      const payload = rows.map((r) => ({
        office_id: officeId,
        weekday: r.weekday,
        is_open: r.is_open,
        start_min: r.start_min,
        end_min: r.end_min,
        slot_min: r.slot_min,
      }));
      const { error } = await supabase.from("clinic_hours").upsert(payload, { onConflict: "office_id,weekday" });
      if (error) throw error;
      setMsg({ kind: "success", text: "تم حفظ أوقات العمل." });
    } catch (e) {
      setMsg({ kind: "error", text: `تعذّر الحفظ: ${(e as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <h1 className="text-2xl font-bold">أوقات العمل</h1>
      <p className="mt-1 text-sm text-muted">حدّد أيام وساعات العمل ومدّة الموعد — منها تُحسب الأوقات المتاحة للحجز.</p>

      <div className="mt-6 space-y-2">
        {rows.map((r) => (
          <div key={r.weekday} className="rounded-xl glass-panel p-3.5">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex w-28 items-center gap-2 font-medium">
                <input type="checkbox" checked={r.is_open} onChange={(e) => update(r.weekday, { is_open: e.target.checked })} />
                {WEEKDAYS[r.weekday]}
              </label>
              {r.is_open ? (
                <div className="flex flex-wrap items-center gap-3" dir="ltr">
                  <input
                    type="time"
                    className="rounded-lg glass-panel-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
                    value={minToHHMM(r.start_min)}
                    onChange={(e) => { const m = hhmmToMin(e.target.value); if (m != null) update(r.weekday, { start_min: m }); }}
                  />
                  <span className="text-muted">—</span>
                  <input
                    type="time"
                    className="rounded-lg glass-panel-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
                    value={minToHHMM(r.end_min)}
                    onChange={(e) => { const m = hhmmToMin(e.target.value); if (m != null) update(r.weekday, { end_min: m }); }}
                  />
                  <select
                    className="rounded-lg glass-panel-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
                    value={r.slot_min}
                    onChange={(e) => update(r.weekday, { slot_min: Number(e.target.value) })}
                  >
                    {SLOT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s} دقيقة</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-sm text-muted">مغلق</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : <span className="text-xs text-muted">عدّل ثم احفظ</span>}
          <Button onClick={save} loading={saving} className="shrink-0">حفظ الأوقات</Button>
        </div>
      </div>
    </div>
  );
}
