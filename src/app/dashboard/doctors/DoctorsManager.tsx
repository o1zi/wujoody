"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Alert } from "@/components/ui";
import { providerLabels } from "@/lib/provider-labels";

export type ClinicDoctor = {
  id: string;
  name: string;
  specialty: string | null;
  image: string | null;
  active: boolean;
  sort: number;
};

const inputCls = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function DoctorsManager({ officeId, initial, kind }: { officeId: string; initial: ClinicDoctor[]; kind?: string }) {
  const L = providerLabels(kind);
  const [rows, setRows] = useState<ClinicDoctor[]>(initial);
  const [removed, setRemoved] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function update(i: number, patch: Partial<ClinicDoctor>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addRow() {
    setRows((r) => [...r, { id: crypto.randomUUID(), name: "", specialty: "", image: null, active: true, sort: r.length }]);
  }
  function removeRow(i: number) {
    setRemoved((d) => [...d, rows[i].id]);
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function uploadImage(i: number, file: File) {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const key = `${officeId}/doctors/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(key, file, { upsert: true });
    if (error) {
      setMsg({ kind: "error", text: "تعذّر رفع الصورة." });
      return;
    }
    const { data } = supabase.storage.from("site-media").getPublicUrl(key);
    update(i, { image: data.publicUrl });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    try {
      if (removed.length) {
        await supabase.from("clinic_doctors").delete().in("id", removed).eq("office_id", officeId);
      }
      const payload = rows
        .filter((r) => r.name.trim())
        .map((r, idx) => ({
          id: r.id,
          office_id: officeId,
          name: r.name.trim(),
          specialty: r.specialty?.trim() || null,
          image: r.image,
          active: r.active,
          sort: idx,
        }));
      if (payload.length) {
        const { error } = await supabase.from("clinic_doctors").upsert(payload);
        if (error) throw error;
      }
      setRemoved([]);
      setMsg({ kind: "success", text: "تم حفظ الأطباء." });
    } catch (e) {
      setMsg({ kind: "error", text: `تعذّر الحفظ: ${(e as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <h1 className="text-2xl font-bold">{L.providersTitle}</h1>
      <p className="mt-1 text-sm text-muted">{L.providersSub}</p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted">لا يوجد بعد — أضف أول {L.providerItem}.</p>}
        {rows.map((r, i) => (
          <div key={r.id} className="rounded-2xl glass-panel p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{L.providerItem} #{i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input type="checkbox" checked={r.active} onChange={(e) => update(i, { active: e.target.checked })} />
                  نشط
                </label>
                <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => removeRow(i)}>حذف</button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {r.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full glass-panel-2 text-sm text-muted">{kind === "law" ? "⚖️" : "🩺"}</div>
              )}
              <input
                type="file"
                accept="image/*"
                className="text-xs text-muted"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(i, f);
                }}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-muted">{L.providerName}</span>
                <input className={inputCls} value={r.name} onChange={(e) => update(i, { name: e.target.value })} placeholder={L.providerNamePlaceholder} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted">التخصص</span>
                <input className={inputCls} value={r.specialty ?? ""} onChange={(e) => update(i, { specialty: e.target.value })} placeholder={L.providerSpecialtyPlaceholder} />
              </label>
            </div>
          </div>
        ))}
        <button type="button" className="text-sm text-accent hover:underline" onClick={addRow}>+ إضافة {L.providerItem}</button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : <span className="text-xs text-muted">عدّل ثم احفظ</span>}
          <Button onClick={save} loading={saving} className="shrink-0">حفظ {L.providersTitle}</Button>
        </div>
      </div>
    </div>
  );
}
