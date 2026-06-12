"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type LawContent } from "@/lib/law-content";
import { SITE_FONTS } from "@/lib/site-fonts";
import { LAW_SECTIONS } from "@/lib/sections";
import { Button, Alert } from "@/components/ui";

function deepSet<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clone: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepGet(obj: any, path: string): any {
  return path.split(".").reduce((a, k) => (a == null ? a : a[k]), obj);
}

const inputCls = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

const ACCENTS: { key: LawContent["theme"]["accent"]; label: string; hex: string }[] = [
  { key: "navy", label: "كحلي مهيب", hex: "#1B3A5B" },
  { key: "maroon", label: "خمري راقٍ", hex: "#7B2E3A" },
  { key: "bronze", label: "ذهبي", hex: "#B08D4F" },
  { key: "sage", label: "زيتوني", hex: "#5C7A5C" },
];

const LAYOUTS: { key: NonNullable<LawContent["theme"]["layout"]>; label: string; hint: string }[] = [
  { key: "hayba", label: "هيبة", hint: "كحلي وذهبي · رصين ومهيب" },
  { key: "adala", label: "عدالة", hint: "خمري وكريمي · كلاسيكي راقٍ" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass-panel p-5">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function LawEditor({ officeId, initial, siteUrl }: { officeId: string; initial: LawContent; siteUrl: string | null; slug: string }) {
  const [c, setC] = useState<LawContent>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const set = (path: string, value: unknown) => setC((prev) => deepSet(prev, path, value));

  const text = (label: string, path: string, dir?: "ltr" | "rtl") => (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <input className={inputCls} dir={dir} value={deepGet(c, path) ?? ""} onChange={(e) => set(path, e.target.value)} />
    </label>
  );
  const area = (label: string, path: string) => (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <textarea rows={3} className={inputCls} value={deepGet(c, path) ?? ""} onChange={(e) => set(path, e.target.value)} />
    </label>
  );

  function addItem(path: string, blank: Record<string, unknown>) {
    const arr = (deepGet(c, path) as unknown[]) ?? [];
    set(path, [...arr, blank]);
  }
  function removeItem(path: string, idx: number) {
    const arr = ((deepGet(c, path) as unknown[]) ?? []).slice();
    arr.splice(idx, 1);
    set(path, arr);
  }

  async function uploadImage(file: File, path: string) {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const key = `${officeId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(key, file, { upsert: true });
    if (error) {
      setMsg({ kind: "error", text: "تعذّر رفع الصورة. تأكد من إنشاء حاوية التخزين site-media." });
      return;
    }
    const { data } = supabase.storage.from("site-media").getPublicUrl(key);
    set(path, data.publicUrl);
  }

  const imageField = (label: string, path: string) => {
    const url = deepGet(c, path) as string | null;
    return (
      <label className="block">
        <span className="mb-1 block text-xs text-muted">{label}</span>
        <div className="flex items-center gap-3">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-lg glass-panel-2 text-xs text-muted">—</div>
          )}
          <input type="file" accept="image/*" className="text-xs text-muted" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, path); }} />
          {url && <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => set(path, null)}>حذف</button>}
        </div>
      </label>
    );
  };

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } = await supabase.from("site_content").update({ content: c }).eq("office_id", officeId).select("office_id");
    if (error) { setSaving(false); setMsg({ kind: "error", text: `تعذّر الحفظ: ${error.message}` }); return; }
    if (!data || data.length === 0) { setSaving(false); setMsg({ kind: "error", text: "لم يتم العثور على سجل المحتوى لهذا المكتب." }); return; }
    setSaving(false);
    setMsg({ kind: "success", text: "تم حفظ التعديلات — تظهر على موقع المكتب مباشرةً." });
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">محرّر موقع مكتب المحاماة</h1>
          <p className="mt-1 text-sm text-muted">عدّل المحتوى ثم احفظ — تظهر التغييرات على موقعك مباشرةً.</p>
        </div>
        {siteUrl && <a href={siteUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">عرض الموقع ↗</a>}
      </div>

      <div className="mt-6 space-y-5">
        {/* الهوية والمظهر */}
        <Section title="الهوية والمظهر">
          {text("اسم المكتب (عربي)", "brand.ar")}
          {text("الاسم بالإنجليزية", "brand.en", "ltr")}
          {imageField("الشعار", "brand.logo")}
          <div>
            <span className="mb-1 block text-xs text-muted">اللون الرئيسي</span>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button key={a.key} type="button" onClick={() => set("theme.accent", a.key)} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${c.theme.accent === a.key ? "border-accent ring-1 ring-accent" : "border-border"}`}>
                  <span className="h-3 w-3 rounded-full" style={{ background: a.hex }} />{a.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs text-muted">قالب التصميم</span>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map((l) => (
                <button key={l.key} type="button" onClick={() => set("theme.layout", l.key)} className={`rounded-lg border p-3 text-right ${(c.theme.layout ?? "hayba") === l.key ? "border-accent ring-1 ring-accent" : "border-border"}`}>
                  <div className="text-sm font-medium">{l.label}</div>
                  <div className="mt-0.5 text-[11px] leading-4 text-muted">{l.hint}</div>
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">الخط</span>
            <select className={inputCls} value={c.theme.font ?? "markazi"} onChange={(e) => set("theme.font", e.target.value)}>
              {SITE_FONTS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </label>
        </Section>

        {/* الواجهة */}
        <Section title="الواجهة الرئيسية">
          {imageField("صورة الواجهة (اختياري)", "hero.image")}
          {text("شارة علوية", "hero.eyebrow")}
          {text("العنوان الرئيسي (Headline)", "hero.title")}
          {area("الوصف", "hero.subtitle")}
          <div className="space-y-2">
            <span className="block text-xs text-muted">أرقام بارزة</span>
            {c.hero.meta.map((_, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} placeholder="+500" value={c.hero.meta[i].value} onChange={(e) => set(`hero.meta.${i}.value`, e.target.value)} />
                <input className={inputCls} placeholder="قضية ناجحة" value={c.hero.meta[i].label} onChange={(e) => set(`hero.meta.${i}.label`, e.target.value)} />
                <button type="button" className="shrink-0 text-xs text-red-400" onClick={() => removeItem("hero.meta", i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("hero.meta", { value: "", label: "" })}>+ إضافة رقم</button>
          </div>
        </Section>

        {/* عن المكتب */}
        <Section title="عن المكتب">
          {imageField("صورة القسم (اختياري)", "about.image")}
          {area("جملة افتتاحية", "about.lead")}
          {area("النص", "about.body")}
          <div className="space-y-2">
            <span className="block text-xs text-muted">معلومات جانبية</span>
            {c.about.side.map((_, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} w-28`} dir="ltr" placeholder="EST." value={c.about.side[i].k} onChange={(e) => set(`about.side.${i}.k`, e.target.value)} />
                <input className={inputCls} value={c.about.side[i].v} onChange={(e) => set(`about.side.${i}.v`, e.target.value)} />
                <button type="button" className="shrink-0 text-xs text-red-400" onClick={() => removeItem("about.side", i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("about.side", { k: "", v: "" })}>+ إضافة</button>
          </div>
        </Section>

        {/* مجالات الممارسة */}
        <Section title="مجالات الممارسة">
          {text("العنوان", "practiceAreas.title")}
          {area("الوصف", "practiceAreas.lead")}
          <div className="space-y-3">
            {c.practiceAreas.items.map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between"><span className="text-xs text-muted">مجال #{i + 1}</span><button type="button" className="text-xs text-red-400" onClick={() => removeItem("practiceAreas.items", i)}>حذف</button></div>
                <input className={inputCls} placeholder="اسم المجال" value={c.practiceAreas.items[i].title} onChange={(e) => set(`practiceAreas.items.${i}.title`, e.target.value)} />
                <textarea rows={2} className={inputCls} placeholder="وصف مختصر" value={c.practiceAreas.items[i].desc} onChange={(e) => set(`practiceAreas.items.${i}.desc`, e.target.value)} />
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("practiceAreas.items", { title: "", desc: "" })}>+ إضافة مجال</button>
          </div>
        </Section>

        {/* قسم المحامين */}
        <Section title="قسم المحامين">
          {text("العنوان", "lawyers.title")}
          {area("الوصف", "lawyers.lead")}
          <p className="rounded-lg border border-border bg-surface-2/40 p-3 text-xs text-muted">
            ⚖️ تُدار أسماء المحامين وتخصصاتهم وصورهم من صفحة <a href="/dashboard/doctors" className="text-accent hover:underline">«المحامون»</a> — وتظهر تلقائياً هنا وفي خيارات الحجز.
          </p>
        </Section>

        {/* الأتعاب */}
        <Section title="الأتعاب">
          {area("جملة تمهيدية", "fees.lead")}
          {text("ملاحظة", "fees.note")}
          <div className="space-y-2">
            {c.fees.items.map((_, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} placeholder="الخدمة" value={c.fees.items[i].name} onChange={(e) => set(`fees.items.${i}.name`, e.target.value)} />
                <input className={`${inputCls} w-28`} dir="ltr" placeholder="السعر" value={c.fees.items[i].price} onChange={(e) => set(`fees.items.${i}.price`, e.target.value)} />
                <button type="button" className="shrink-0 text-xs text-red-400" onClick={() => removeItem("fees.items", i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("fees.items", { name: "", price: "" })}>+ إضافة بند</button>
          </div>
        </Section>

        {/* رحلة القضية */}
        <Section title="رحلة القضية">
          <div className="space-y-3">
            {c.process.map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between"><span className="text-xs text-muted">خطوة #{i + 1}</span><button type="button" className="text-xs text-red-400" onClick={() => removeItem("process", i)}>حذف</button></div>
                <input className={inputCls} placeholder="عنوان الخطوة" value={c.process[i].title} onChange={(e) => set(`process.${i}.title`, e.target.value)} />
                <textarea rows={2} className={inputCls} placeholder="الوصف" value={c.process[i].desc} onChange={(e) => set(`process.${i}.desc`, e.target.value)} />
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("process", { title: "", desc: "" })}>+ إضافة خطوة</button>
          </div>
        </Section>

        {/* الحجز */}
        <Section title="قسم حجز الاستشارة">
          {text("العنوان", "booking.title")}
          {area("الوصف", "booking.lead")}
          {text("ملاحظة", "booking.note")}
          <p className="text-xs text-muted">إدارة المحامين والخدمات وأوقات العمل من صفحات اللوحة المخصّصة.</p>
        </Section>

        {/* نموذج القضية */}
        <Section title="نموذج «اعرض قضيتك»">
          {text("العنوان", "intake.title")}
          {area("الوصف", "intake.lead")}
          {text("ملاحظة السرّية", "intake.note")}
        </Section>

        {/* التواصل */}
        <Section title="التواصل">
          {text("الهاتف", "contact.phone", "ltr")}
          {text("ملاحظة الهاتف", "contact.phoneNote")}
          {text("البريد", "contact.email", "ltr")}
          {text("العنوان", "contact.office")}
          {text("واتساب (دولي بدون +)", "contact.whatsapp", "ltr")}
          {text("إكس / تويتر", "contact.tiktok", "ltr")}
          {text("لينكدإن", "contact.linkedin", "ltr")}
          {text("رابط خرائط جوجل / إحداثيات", "contact.mapQuery", "ltr")}
        </Section>

        {/* الأقسام */}
        <Section title="إظهار وإخفاء الأقسام">
          <div className="grid grid-cols-2 gap-2">
            {LAW_SECTIONS.filter((s) => s.key !== "contact").map((s) => {
              const v = (c.visible as Record<string, boolean>)[s.key] ?? true;
              return (
                <label key={s.key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input type="checkbox" checked={v} onChange={(e) => set(`visible.${s.key}`, e.target.checked)} />{s.label}
                </label>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : <span className="text-xs text-muted">عدّل ثم احفظ التغييرات</span>}
          <Button onClick={save} loading={saving} className="shrink-0">حفظ التغييرات</Button>
        </div>
      </div>
    </div>
  );
}
