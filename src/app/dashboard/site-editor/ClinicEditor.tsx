"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clinicDefaultContent, type ClinicContent } from "@/lib/clinic-content";
import { SITE_FONTS } from "@/lib/site-fonts";
import { CLINIC_SECTIONS } from "@/lib/sections";
import { Button, Alert } from "@/components/ui";

// Immutable deep-set by dot path (supports numeric indices).
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

const ACCENTS: { key: ClinicContent["theme"]["accent"]; label: string; hex: string }[] = [
  { key: "azure", label: "أزرق طبي", hex: "#4C7DF0" },
  { key: "sage", label: "أخضر مطمئن", hex: "#8FA66E" },
  { key: "terracotta", label: "دافئ", hex: "#D9774E" },
  { key: "bronze", label: "ذهبي", hex: "#C2974E" },
];

const LAYOUTS: { key: NonNullable<ClinicContent["theme"]["layout"]>; label: string; hint: string }[] = [
  { key: "clean", label: "نظيف", hint: "أبيض واسع، احترافي" },
  { key: "care", label: "دافئ", hint: "ألوان هادئة تبعث الطمأنينة" },
  { key: "calm", label: "هادئ", hint: "بسيط ومركّز على الحجز" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass-panel p-5">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function ClinicEditor({
  officeId,
  initial,
  siteUrl,
}: {
  officeId: string;
  initial: ClinicContent;
  siteUrl: string | null;
  slug: string;
}) {
  const [c, setC] = useState<ClinicContent>(initial);
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

  // List helpers (specialties.items, doctors.items, …).
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
          <input
            type="file"
            accept="image/*"
            className="text-xs text-muted"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f, path);
            }}
          />
          {url && (
            <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => set(path, null)}>
              حذف
            </button>
          )}
        </div>
      </label>
    );
  };

  async function save() {
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_content")
      .update({ content: c })
      .eq("office_id", officeId)
      .select("office_id");
    if (error) {
      setSaving(false);
      setMsg({ kind: "error", text: `تعذّر الحفظ: ${error.message}` });
      return;
    }
    if (!data || data.length === 0) {
      setSaving(false);
      setMsg({ kind: "error", text: "لم يتم العثور على سجل المحتوى لهذه العيادة." });
      return;
    }
    setSaving(false);
    setMsg({ kind: "success", text: "تم حفظ التعديلات — تظهر على موقع العيادة مباشرةً." });
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">محرّر موقع العيادة</h1>
          <p className="mt-1 text-sm text-muted">عدّل المحتوى ثم احفظ — تظهر التغييرات على موقعك مباشرةً.</p>
        </div>
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
            عرض الموقع ↗
          </a>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {/* الهوية والمظهر */}
        <Section title="الهوية والمظهر">
          {text("اسم العيادة (عربي)", "brand.ar")}
          {text("الاسم بالإنجليزية", "brand.en", "ltr")}
          {imageField("الشعار", "brand.logo")}
          <div>
            <span className="mb-1 block text-xs text-muted">اللون الرئيسي</span>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => set("theme.accent", a.key)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                    c.theme.accent === a.key ? "border-accent ring-1 ring-accent" : "border-border"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: a.hex }} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs text-muted">قالب التصميم</span>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => set("theme.layout", l.key)}
                  className={`rounded-lg border p-2.5 text-right ${
                    (c.theme.layout ?? "clean") === l.key ? "border-accent ring-1 ring-accent" : "border-border"
                  }`}
                >
                  <div className="text-sm font-medium">{l.label}</div>
                  <div className="mt-0.5 text-[11px] leading-4 text-muted">{l.hint}</div>
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">الخط</span>
            <select className={inputCls} value={c.theme.font ?? "readex"} onChange={(e) => set("theme.font", e.target.value)}>
              {SITE_FONTS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </Section>

        {/* الواجهة (Hero) */}
        <Section title="الواجهة الرئيسية">
          {text("نص علوي (إنجليزي)", "hero.eyebrow", "ltr")}
          {area("الوصف", "hero.subtitle")}
          <div className="space-y-2">
            <span className="block text-xs text-muted">أرقام بارزة</span>
            {c.hero.meta.map((_, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} placeholder="12" value={c.hero.meta[i].value} onChange={(e) => set(`hero.meta.${i}.value`, e.target.value)} />
                <input className={inputCls} placeholder="تخصص" value={c.hero.meta[i].label} onChange={(e) => set(`hero.meta.${i}.label`, e.target.value)} />
                <button type="button" className="shrink-0 text-xs text-red-400" onClick={() => removeItem("hero.meta", i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("hero.meta", { value: "", label: "" })}>+ إضافة رقم</button>
          </div>
        </Section>

        {/* عن العيادة */}
        <Section title="عن العيادة">
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

        {/* التخصصات */}
        <Section title="التخصصات والخدمات">
          {text("العنوان", "specialties.title")}
          {area("الوصف", "specialties.lead")}
          <div className="space-y-3">
            {c.specialties.items.map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">خدمة #{i + 1}</span>
                  <button type="button" className="text-xs text-red-400" onClick={() => removeItem("specialties.items", i)}>حذف</button>
                </div>
                <input className={inputCls} placeholder="اسم الخدمة" value={c.specialties.items[i].title} onChange={(e) => set(`specialties.items.${i}.title`, e.target.value)} />
                <textarea rows={2} className={inputCls} placeholder="وصف مختصر" value={c.specialties.items[i].desc} onChange={(e) => set(`specialties.items.${i}.desc`, e.target.value)} />
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("specialties.items", { title: "", desc: "" })}>+ إضافة خدمة</button>
          </div>
        </Section>

        {/* الأطباء */}
        <Section title="الأطباء">
          {text("العنوان", "doctors.title")}
          {area("الوصف", "doctors.lead")}
          <div className="space-y-3">
            {c.doctors.items.map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">طبيب #{i + 1}</span>
                  <button type="button" className="text-xs text-red-400" onClick={() => removeItem("doctors.items", i)}>حذف</button>
                </div>
                {imageField("الصورة", `doctors.items.${i}.image`)}
                <input className={inputCls} placeholder="اسم الطبيب" value={c.doctors.items[i].name} onChange={(e) => set(`doctors.items.${i}.name`, e.target.value)} />
                <input className={inputCls} placeholder="التخصص" value={c.doctors.items[i].specialty} onChange={(e) => set(`doctors.items.${i}.specialty`, e.target.value)} />
                <input className={inputCls} dir="ltr" placeholder="SPECIALTY (EN)" value={c.doctors.items[i].specialtyEn} onChange={(e) => set(`doctors.items.${i}.specialtyEn`, e.target.value)} />
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("doctors.items", { name: "", specialty: "", specialtyEn: "", bio: "", image: null })}>+ إضافة طبيب</button>
          </div>
        </Section>

        {/* قبل وبعد */}
        <Section title="قبل وبعد">
          {text("العنوان", "results.title")}
          {area("الوصف", "results.lead")}
          <div className="space-y-3">
            {c.results.items.map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">حالة #{i + 1}</span>
                  <button type="button" className="text-xs text-red-400" onClick={() => removeItem("results.items", i)}>حذف</button>
                </div>
                <input className={inputCls} placeholder="عنوان الحالة" value={c.results.items[i].title} onChange={(e) => set(`results.items.${i}.title`, e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  {imageField("قبل", `results.items.${i}.before`)}
                  {imageField("بعد", `results.items.${i}.after`)}
                </div>
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("results.items", { title: "", before: null, after: null })}>+ إضافة حالة</button>
          </div>
        </Section>

        {/* الأسعار */}
        <Section title="الأسعار">
          {area("جملة تمهيدية", "prices.lead")}
          {text("ملاحظة", "prices.note")}
          <div className="space-y-2">
            {c.prices.items.map((_, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} placeholder="الخدمة" value={c.prices.items[i].name} onChange={(e) => set(`prices.items.${i}.name`, e.target.value)} />
                <input className={`${inputCls} w-24`} dir="ltr" placeholder="السعر" value={c.prices.items[i].price} onChange={(e) => set(`prices.items.${i}.price`, e.target.value)} />
                <button type="button" className="shrink-0 text-xs text-red-400" onClick={() => removeItem("prices.items", i)}>حذف</button>
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("prices.items", { name: "", price: "" })}>+ إضافة سعر</button>
          </div>
        </Section>

        {/* رحلة المريض */}
        <Section title="رحلة المريض">
          <div className="space-y-3">
            {c.process.map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">خطوة #{i + 1}</span>
                  <button type="button" className="text-xs text-red-400" onClick={() => removeItem("process", i)}>حذف</button>
                </div>
                <input className={inputCls} placeholder="عنوان الخطوة" value={c.process[i].title} onChange={(e) => set(`process.${i}.title`, e.target.value)} />
                <textarea rows={2} className={inputCls} placeholder="الوصف" value={c.process[i].desc} onChange={(e) => set(`process.${i}.desc`, e.target.value)} />
              </div>
            ))}
            <button type="button" className="text-xs text-accent hover:underline" onClick={() => addItem("process", { title: "", desc: "" })}>+ إضافة خطوة</button>
          </div>
        </Section>

        {/* الحجز (نص) */}
        <Section title="قسم الحجز">
          {text("العنوان", "booking.title")}
          {area("الوصف", "booking.lead")}
          {text("ملاحظة", "booking.note")}
          <p className="text-xs text-muted">إدارة الأطباء والخدمات وأوقات العمل تتم من صفحات لوحة العيادة المخصّصة.</p>
        </Section>

        {/* التواصل */}
        <Section title="التواصل">
          {text("الهاتف", "contact.phone", "ltr")}
          {text("ملاحظة الهاتف", "contact.phoneNote")}
          {text("البريد", "contact.email", "ltr")}
          {text("العنوان", "contact.office")}
          {text("واتساب (دولي بدون +)", "contact.whatsapp", "ltr")}
          {text("إنستغرام", "contact.instagram", "ltr")}
          {text("سناب شات", "contact.snapchat", "ltr")}
          {text("تيك توك", "contact.tiktok", "ltr")}
          {text("رابط خرائط جوجل / إحداثيات", "contact.mapQuery", "ltr")}
        </Section>

        {/* إظهار/إخفاء الأقسام */}
        <Section title="إظهار وإخفاء الأقسام">
          <div className="grid grid-cols-2 gap-2">
            {CLINIC_SECTIONS.filter((s) => s.key !== "contact").map((s) => {
              const v = (c.visible as Record<string, boolean>)[s.key] ?? true;
              return (
                <label key={s.key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input type="checkbox" checked={v} onChange={(e) => set(`visible.${s.key}`, e.target.checked)} />
                  {s.label}
                </label>
              );
            })}
          </div>
        </Section>
      </div>

      {/* شريط الحفظ */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0b0d10]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : <span className="text-xs text-muted">عدّل ثم احفظ التغييرات</span>}
          <Button onClick={save} loading={saving} className="shrink-0">
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </div>
  );
}

// Re-export the default content so callers can seed a fresh clinic.
export { clinicDefaultContent };
