"use client";

import { useState, useTransition } from "react";
import type { LandingContent } from "@/lib/landing-content";
import { BG_PRESETS } from "@/lib/bg-presets";
import { LANDING_PRESETS } from "@/lib/landing-presets";
import { saveLanding } from "../actions";

// Prefer landing-specific clips; fall back to the shared office library while empty.
const PRESETS = LANDING_PRESETS.length ? LANDING_PRESETS : BG_PRESETS;
const FRAME_PRESETS = PRESETS.filter((p) => p.frames.length > 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass-panel p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function LandingEditor({ initial }: { initial: LandingContent }) {
  const [c, setC] = useState<LandingContent>(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (path: string, v: unknown) => setC((p) => deepSet(p, path, v));

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

  function save() {
    setErr(null);
    start(async () => {
      try {
        await saveLanding(c);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch {
        setErr("تعذّر الحفظ — شغّل ملف settings.sql في Supabase أولاً.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-28">
      <Section title="الهوية">
        <div className="grid grid-cols-2 gap-3">
          {text("الاسم (عربي)", "brand.ar")}
          {text("الاسم (لاتيني)", "brand.en", "ltr")}
        </div>
      </Section>

      <Section title="خلفية الصفحة">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setC((p) => deepSet(deepSet(deepSet(p, "media.bgMode", "video"), "media.bgVideo", null), "media.frames", null))}
            className={`rounded-lg border px-3 py-2 text-sm ${c.media.bgMode !== "solid" && !c.media.bgVideo && !c.media.frames ? "border-accent" : "border-border"}`}
          >
            الافتراضية (بناء)
          </button>
          <button
            type="button"
            onClick={() => setC((p) => deepSet(deepSet(p, "media.bgMode", "solid"), "media.solid", "black"))}
            className={`rounded-lg border px-3 py-2 text-sm ${c.media.bgMode === "solid" && c.media.solid === "black" ? "border-accent" : "border-border"}`}
          >
            أسود
          </button>
          <button
            type="button"
            onClick={() => setC((p) => deepSet(deepSet(p, "media.bgMode", "solid"), "media.solid", "white"))}
            className={`rounded-lg border px-3 py-2 text-sm ${c.media.bgMode === "solid" && c.media.solid === "white" ? "border-accent" : "border-border"}`}
          >
            أبيض
          </button>
        </div>

        <div>
          <span className="mb-2 block text-xs text-muted">فيديو متحرك (يعمل تلقائياً)</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRESETS.map((p) => (
              <button
                key={`v-${p.id}`}
                type="button"
                onClick={() => setC((prev) => deepSet(deepSet(deepSet(prev, "media.bgVideo", p.src), "media.bgMode", "video"), "media.frames", null))}
                className={`overflow-hidden rounded-lg border text-right ${c.media.bgVideo === p.src ? "border-accent ring-1 ring-accent" : "border-border"}`}
              >
                <video src={p.src} muted playsInline preload="metadata" className="h-16 w-full object-cover" />
                <div className="px-2 py-1 text-xs">{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs text-muted">حركة مع التمرير (إطارات)</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FRAME_PRESETS.map((p) => {
              const sel = !!c.media.frames && c.media.frames[0] === p.frames[0];
              return (
                <button
                  key={`f-${p.id}`}
                  type="button"
                  onClick={() => setC((prev) => deepSet(deepSet(deepSet(prev, "media.frames", p.frames), "media.bgMode", "frames"), "media.bgVideo", null))}
                  className={`overflow-hidden rounded-lg border text-right ${sel ? "border-accent ring-1 ring-accent" : "border-border"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.frames[0]} alt="" className="h-16 w-full object-cover" />
                  <div className="px-2 py-1 text-xs">{p.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section title="الواجهة الرئيسية">
        {text("السطر العلوي (لاتيني)", "hero.eyebrow", "ltr")}
        {area("الوصف", "hero.subtitle")}
        <div className="space-y-3">
          {c.hero.meta.map((_, i) => (
            <div className="grid grid-cols-2 gap-3" key={i}>
              {text(`رقم ${i + 1}`, `hero.meta.${i}.value`)}
              {text("الوصف", `hero.meta.${i}.label`)}
            </div>
          ))}
        </div>
      </Section>

      <Section title="المزايا">
        {text("عنوان القسم", "features.title")}
        {area("وصف القسم", "features.lead")}
        {c.features.items.map((_, i) => (
          <div className="rounded-xl glass-panel-2/40 p-4" key={i}>
            <div className="mono mb-2 text-xs text-muted">ميزة #{i + 1}</div>
            {text("العنوان", `features.items.${i}.title`)}
            {area("الوصف", `features.items.${i}.desc`)}
          </div>
        ))}
      </Section>

      <Section title="كيف تبدأ">
        {text("عنوان القسم", "steps.title")}
        {c.steps.items.map((_, i) => (
          <div className="rounded-xl glass-panel-2/40 p-4" key={i}>
            <div className="mono mb-2 text-xs text-muted">خطوة #{i + 1}</div>
            {text("العنوان", `steps.items.${i}.title`)}
            {area("الوصف", `steps.items.${i}.desc`)}
          </div>
        ))}
      </Section>

      <Section title="الباقات (العناوين فقط)">
        {text("عنوان القسم", "pricing.title")}
        {area("وصف القسم", "pricing.lead")}
        <p className="text-xs text-muted">الأسعار والمزايا تُحرَّر من صفحة «الباقات».</p>
      </Section>

      <Section title="دعوة الإجراء (CTA)">
        {text("العنوان", "cta.title")}
        {area("الوصف", "cta.lead")}
        {text("نص الزر", "cta.button")}
      </Section>

      <Section title="أزرار التواصل (واتساب + بريد)">
        <p className="mb-3 text-xs text-muted">
          تظهر هذه الأزرار في صفحة الهبوط (قسم «ابدأ» والفوتر). اترك الواتساب فارغاً ليُستخدم رقم واتساب الدفع تلقائياً.
        </p>
        {text("رقم واتساب (دولي، أرقام فقط — مثال: 9665XXXXXXXX)", "contact.whatsapp", "ltr")}
        {text("بريد التواصل (اختياري)", "contact.email", "ltr")}
      </Section>

      <Section title="الفوتر">
        {area("وصف الفوتر", "footerTag")}
      </Section>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3.5">
          {err ? (
            <span className="text-sm text-red-400">{err}</span>
          ) : (
            <a href="/" target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
              معاينة الصفحة ↗
            </a>
          )}
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
          >
            {pending ? "…" : saved ? "تم الحفظ ✓" : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}
