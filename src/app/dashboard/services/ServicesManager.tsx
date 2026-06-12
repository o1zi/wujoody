"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Alert } from "@/components/ui";

export type ClinicService = {
  id: string;
  name: string;
  price: number | null;
  duration_min: number;
  active: boolean;
  sort: number;
};

const inputCls = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function ServicesManager({ officeId, initial }: { officeId: string; initial: ClinicService[] }) {
  const [rows, setRows] = useState<ClinicService[]>(initial);
  const [removed, setRemoved] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function update(i: number, patch: Partial<ClinicService>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addRow() {
    setRows((r) => [
      ...r,
      { id: crypto.randomUUID(), name: "", price: null, duration_min: 30, active: true, sort: r.length },
    ]);
  }
  function removeRow(i: number) {
    const row = rows[i];
    setRemoved((d) => [...d, row.id]);
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    try {
      if (removed.length) {
        await supabase.from("clinic_services").delete().in("id", removed).eq("office_id", officeId);
      }
      const payload = rows
        .filter((r) => r.name.trim())
        .map((r, idx) => ({
          id: r.id,
          office_id: officeId,
          name: r.name.trim(),
          price: r.price === null || Number.isNaN(r.price) ? null : Number(r.price),
          duration_min: Number(r.duration_min) || 30,
          active: r.active,
          sort: idx,
        }));
      if (payload.length) {
        const { error } = await supabase.from("clinic_services").upsert(payload);
        if (error) throw error;
      }
      setRemoved([]);
      setMsg({ kind: "success", text: "تم حفظ الخدمات." });
    } catch (e) {
      setMsg({ kind: "error", text: `تعذّر الحفظ: ${(e as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <h1 className="text-2xl font-bold">الخدمات والأسعار</h1>
      <p className="mt-1 text-sm text-muted">الخدمات التي تظهر للمريض عند الحجز. المدة تحدّد طول الموعد.</p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted">لا توجد خدمات بعد — أضف أول خدمة.</p>}
        {rows.map((r, i) => (
          <div key={r.id} className="rounded-2xl glass-panel p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">خدمة #{i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input type="checkbox" checked={r.active} onChange={(e) => update(i, { active: e.target.checked })} />
                  مفعّلة
                </label>
                <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => removeRow(i)}>حذف</button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_120px]">
              <label className="block">
                <span className="mb-1 block text-xs text-muted">اسم الخدمة</span>
                <input className={inputCls} value={r.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="تنظيف الأسنان" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted">السعر (ر.س)</span>
                <input className={inputCls} dir="ltr" inputMode="numeric" value={r.price ?? ""} onChange={(e) => update(i, { price: e.target.value === "" ? null : Number(e.target.value) })} placeholder="250" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted">المدة (دقيقة)</span>
                <input className={inputCls} dir="ltr" inputMode="numeric" value={r.duration_min} onChange={(e) => update(i, { duration_min: Number(e.target.value) })} placeholder="30" />
              </label>
            </div>
          </div>
        ))}
        <button type="button" className="text-sm text-accent hover:underline" onClick={addRow}>+ إضافة خدمة</button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : <span className="text-xs text-muted">عدّل ثم احفظ</span>}
          <Button onClick={save} loading={saving} className="shrink-0">حفظ الخدمات</Button>
        </div>
      </div>
    </div>
  );
}
