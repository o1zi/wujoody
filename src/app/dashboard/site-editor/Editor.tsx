"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { defaultContent, type SiteContent } from "@/lib/site-content";
import type { PlanCaps } from "@/lib/plans";
import { BG_PRESETS } from "@/lib/bg-presets";
import { SITE_FONTS } from "@/lib/site-fonts";
import { SITE_SECTIONS } from "@/lib/sections";
import { SITE_PRESETS, type SitePreset } from "@/lib/site-presets";
import { SITE_TEMPLATES } from "@/lib/site-templates";
import { Button, Alert } from "@/components/ui";

const CARD_STYLES: { key: NonNullable<SiteContent["theme"]["cardStyle"]>; label: string; hint: string }[] = [
  { key: "glass", label: "زجاجي", hint: "ضبابي شفاف (الافتراضي)" },
  { key: "solid", label: "صلب", hint: "خلفية معتمة نظيفة" },
  { key: "outline", label: "محدّد", hint: "شفاف بإطار ملوّن" },
];
const CARD_RADII: { key: NonNullable<SiteContent["theme"]["cardRadius"]>; label: string }[] = [
  { key: "sharp", label: "حواف حادّة" },
  { key: "soft", label: "حواف ناعمة" },
  { key: "round", label: "دائرية" },
];

const ACCENTS: { key: SiteContent["theme"]["accent"]; label: string; hex: string }[] = [
  { key: "bronze", label: "برونزي", hex: "#C2974E" },
  { key: "terracotta", label: "طيني", hex: "#D9774E" },
  { key: "azure", label: "أزرق", hex: "#4C7DF0" },
  { key: "sage", label: "زيتوني", hex: "#8FA66E" },
];

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

function dataURLtoBlob(d: string): Blob {
  const [head, body] = d.split(",");
  const mime = (head.match(/:(.*?);/) || [])[1] || "image/jpeg";
  const bin = atob(body);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

const inputCls =
  "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function Editor({
  officeId,
  initial,
  siteUrl,
  caps,
  slug,
  aiUsed = 0,
  aiLimit = 0,
}: {
  officeId: string;
  initial: SiteContent;
  siteUrl: string | null;
  caps: PlanCaps;
  slug: string;
  aiUsed?: number;
  aiLimit?: number;
}) {
  const presets = Number.isFinite(caps.presetLimit) ? BG_PRESETS.slice(0, caps.presetLimit) : BG_PRESETS;
  const [c, setC] = useState<SiteContent>(initial);
  // The plan may restrict templates (e.g. Basic = editorial only). Show only the
  // allowed ones and reflect the template the site will actually render with.
  const layoutNow = c.theme.layout ?? "cinematic";
  const effectiveLayout = caps.templates.includes(layoutNow)
    ? layoutNow
    : caps.templates.includes("editorial")
      ? "editorial"
      : caps.templates[0] ?? "cinematic";
  const lockedTemplates = SITE_TEMPLATES.filter((t) => !caps.templates.includes(t.id)).length;
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSpecialty, setAiSpecialty] = useState("");
  const [aiRemaining, setAiRemaining] = useState(Math.max(0, aiLimit - aiUsed));

  async function generateAi() {
    setAiBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: c.brand.ar, specialty: aiSpecialty }),
      });
      const d = await res.json();
      if (res.status === 429) {
        setAiRemaining(0);
        setMsg({ kind: "error", text: `استنفدت حدّ التوليد لهذا الشهر (${aiLimit}). يتجدّد مطلع الشهر القادم.` });
        return;
      }
      if (!res.ok) throw new Error(d.error || "fail");
      if (typeof d.remaining === "number") setAiRemaining(d.remaining);
      setC((prev) => {
        let next = prev;
        if (d.aboutLead) next = deepSet(next, "about.lead", d.aboutLead);
        if (d.aboutBody) next = deepSet(next, "about.body", d.aboutBody);
        if (Array.isArray(d.services) && d.services.length) next = deepSet(next, "services.items", d.services);
        return next;
      });
      setMsg({ kind: "success", text: "تم توليد المحتوى بالذكاء الاصطناعي. راجعه ثم احفظ." });
    } catch {
      setMsg({ kind: "error", text: "تعذّر توليد المحتوى. تأكد أن الميزة مفعّلة في باقتك." });
    } finally {
      setAiBusy(false);
    }
  }

  const set = (path: string, value: unknown) => setC((prev) => deepSet(prev, path, value));

  function applyPreset(p: SitePreset) {
    setC((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        font: p.font,
        accentHex: p.accentHex,
        cardStyle: p.cardStyle,
        cardRadius: p.cardRadius,
        cardTint: p.cardTint,
      },
      media: { ...prev.media, bgMode: "solid", solid: p.solid },
    }));
  }

  function resetStyle() {
    setC((prev) => ({ ...prev, theme: { ...prev.theme, ...defaultContent.theme } }));
  }

  // Render helpers — called as functions (NOT <Comp/>) so the underlying DOM
  // node keeps identity across renders and inputs don't lose focus.
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

  const [uploadingModel, setUploadingModel] = useState<string | null>(null);
  async function uploadModel(file: File, path: string) {
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setMsg({ kind: "error", text: "الملف يجب أن يكون بصيغة GLB أو glTF (صدّره من Revit)." });
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      setMsg({ kind: "error", text: "حجم الموديل أكبر من 40 ميجابايت. صدّره بدقة أقل أو اضغطه (Draco)." });
      return;
    }
    setUploadingModel(path);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "glb";
    const key = `${officeId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("site-media")
      .upload(key, file, { upsert: true, contentType: "model/gltf-binary" });
    setUploadingModel(null);
    if (error) {
      setMsg({ kind: "error", text: "تعذّر رفع الموديل. تأكد من حاوية التخزين site-media." });
      return;
    }
    set(path, supabase.storage.from("site-media").getPublicUrl(key).data.publicUrl);
    setMsg({ kind: "success", text: "تم رفع الموديل ثلاثي الأبعاد. اضغط حفظ ثم حدّث موقعك." });
  }

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractInfo, setExtractInfo] = useState("");

  // Awtad-style: decode the video into frames in THIS browser (at authoring time),
  // upload them as small JPGs, then visitors load them as a smooth frame sequence.
  async function convertAndUploadFrames(file: File) {
    setExtracting(true);
    setMsg(null);
    setExtractInfo("جارٍ قراءة الفيديو…");
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.src = url;
    try {
      await new Promise<void>((res, rej) => {
        v.onloadedmetadata = () => res();
        v.onerror = () => rej(new Error("load"));
      });
      const dur = v.duration || 1;
      const FPS = 16; // frames per second of video (Awtad-style)
      const QUALITY = 0.85; // good JPEG quality, lighter on memory
      const MAX_W = 1280; // cap width to avoid freezing the browser
      const CAP = 400; // safety bound on total frames
      const nativeW = v.videoWidth || MAX_W;
      const nativeH = v.videoHeight || Math.round((MAX_W * 9) / 16);
      const sc = Math.min(1, MAX_W / nativeW);
      const ew = Math.max(2, Math.round(nativeW * sc));
      const eh = Math.max(2, Math.round(nativeH * sc));
      const minStep = 1 / FPS; // capture one frame every 1/16 s of video
      const MAXF = Math.min(CAP, Math.max(8, Math.ceil(dur * FPS)));
      const tmp = document.createElement("canvas");
      tmp.width = ew;
      tmp.height = eh;
      const tctx = tmp.getContext("2d")!;
      const shots: string[] = [];
      let lastT = -1;

      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const va = v as any;
        const hasRVFC = typeof va.requestVideoFrameCallback === "function";
        let done = false;
        // watchdog: never hang, even if "ended" never fires for this encoding.
        const watchdog = setTimeout(() => finish(), Math.min(60000, (dur / 2) * 1000 + 15000));
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(watchdog);
          resolve();
        };
        const fail = () => {
          if (done) return;
          done = true;
          clearTimeout(watchdog);
          reject(new Error("capture"));
        };
        const cap = () => {
          if (done) return;
          if (lastT < 0 || v.currentTime - lastT >= minStep - 0.0001) {
            tctx.drawImage(v, 0, 0, ew, eh);
            shots.push(tmp.toDataURL("image/jpeg", QUALITY));
            lastT = v.currentTime;
            setExtractInfo(`التقاط الإطارات… ${shots.length}`);
            if (shots.length >= MAXF) return finish();
          }
          if (v.duration && v.currentTime >= v.duration - 0.05) return finish();
          if (hasRVFC) va.requestVideoFrameCallback(cap);
        };
        v.onended = finish;
        v.onerror = fail;
        v.playbackRate = 2;
        v.play()
          .then(() => {
            if (hasRVFC) va.requestVideoFrameCallback(cap);
            else v.ontimeupdate = cap;
          })
          .catch(fail);
      });
      v.pause();

      if (shots.length < 8) {
        setExtracting(false);
        setMsg({ kind: "error", text: "تعذّر استخراج إطارات كافية من هذا الفيديو." });
        return;
      }

      const supabase = createClient();
      const batch = crypto.randomUUID();
      const urls: string[] = [];
      for (let i = 0; i < shots.length; i++) {
        const key = `${officeId}/frames/${batch}/f${String(i).padStart(3, "0")}.jpg`;
        const { error } = await supabase.storage
          .from("site-media")
          .upload(key, dataURLtoBlob(shots[i]), { upsert: true, contentType: "image/jpeg" });
        if (error) {
          setExtracting(false);
          setMsg({ kind: "error", text: `تعذّر رفع الإطار ${i + 1}: ${error.message}` });
          return;
        }
        urls.push(supabase.storage.from("site-media").getPublicUrl(key).data.publicUrl);
        setExtractInfo(`رفع الإطارات… ${i + 1}/${shots.length}`);
      }

      setC((prev) =>
        deepSet(deepSet(deepSet(prev, "media.frames", urls), "media.bgMode", "frames"), "media.bgVideo", null),
      );
      setMsg({ kind: "success", text: `تم توليد ${urls.length} إطاراً. اضغط حفظ ثم حدّث موقعك.` });
    } catch {
      setMsg({ kind: "error", text: "تعذّرت معالجة الفيديو. جرّب ملفاً آخر (mp4)." });
    } finally {
      URL.revokeObjectURL(url);
      setExtracting(false);
      setExtractInfo("");
    }
  }

  async function uploadVideo(file: File) {
    setUploadingVideo(true);
    setMsg(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "mp4";
    const key = `${officeId}/bg-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(key, file, { upsert: true });
    setUploadingVideo(false);
    if (error) {
      setMsg({ kind: "error", text: `تعذّر رفع الفيديو: ${error.message}` });
      return;
    }
    const { data } = supabase.storage.from("site-media").getPublicUrl(key);
    setC((prev) =>
      deepSet(deepSet(deepSet(prev, "media.bgVideo", data.publicUrl), "media.bgMode", "video"), "media.frames", null),
    );
    setMsg({ kind: "success", text: "تم رفع الفيديو. اضغط حفظ ثم حدّث موقعك." });
  }

  const image = (label: string, path: string) => {
    const val = deepGet(c, path) as string | null;
    return (
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg glass-panel-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {val ? <img src={val} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="flex-1">
          <span className="mb-1 block text-xs text-muted">{label}</span>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-foreground"
            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], path)}
          />
        </div>
        {val && (
          <button type="button" className="text-xs text-red-400" onClick={() => set(path, null)}>
            إزالة
          </button>
        )}
      </div>
    );
  };

  const model3d = (path: string) => {
    const val = deepGet(c, path) as string | null;
    const busy = uploadingModel === path;
    return (
      <div className="rounded-lg border border-dashed border-accent/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-accent">موديل ثلاثي الأبعاد (.glb) — يدور تفاعلياً في الموقع</span>
          {val && (
            <button type="button" className="text-xs text-red-400" onClick={() => set(path, null)}>إزالة</button>
          )}
        </div>
        <input
          type="file"
          accept=".glb,.gltf,model/gltf-binary"
          disabled={busy}
          className="mt-2 block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-foreground disabled:opacity-50"
          onChange={(e) => e.target.files?.[0] && uploadModel(e.target.files[0], path)}
        />
        {busy && <p className="mt-1.5 text-[11px] text-muted">جارٍ رفع الموديل…</p>}
        {val && !busy && <p className="mt-1.5 text-[11px] text-emerald-300">✓ موديل مرفوع — يظهر بشارة «3D» على بطاقة المشروع، ويتفاعل معه الزائر.</p>}
        <p className="mt-1 text-[11px] text-muted">صدّر مشروعك من Revit إلى glTF/GLB — يفضّل أقل من 40MB لسرعة التحميل.</p>
      </div>
    );
  };

  // After a successful save, delete any stored files no longer referenced
  // by the content (old backgrounds, replaced images, removed frame batches).
  async function cleanupStorage(supabase: ReturnType<typeof createClient>) {
    const MARK = "/object/public/site-media/";
    const refs = new Set<string>();
    JSON.stringify(c, (k, v) => {
      if (typeof v === "string") {
        const i = v.indexOf(MARK);
        if (i >= 0) refs.add(v.slice(i + MARK.length));
      }
      return v;
    });

    const bucket = supabase.storage.from("site-media");
    const keys: string[] = [];
    const root = await bucket.list(officeId, { limit: 1000 });
    for (const o of root.data ?? []) {
      if (o.id) keys.push(`${officeId}/${o.name}`);
      else if (o.name === "frames") {
        const batches = await bucket.list(`${officeId}/frames`, { limit: 1000 });
        for (const b of batches.data ?? []) {
          if (!b.id) {
            const fs = await bucket.list(`${officeId}/frames/${b.name}`, { limit: 1000 });
            for (const f of fs.data ?? []) if (f.id) keys.push(`${officeId}/frames/${b.name}/${f.name}`);
          }
        }
      }
    }
    const del = keys.filter((k) => !refs.has(k));
    if (del.length) await bucket.remove(del);
  }

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
      setMsg({ kind: "error", text: "لم يتم العثور على سجل المحتوى لهذا المكتب." });
      return;
    }
    try {
      await cleanupStorage(supabase);
    } catch {
      // Cleanup is best-effort; never block a successful save on it.
    }
    setSaving(false);
    setMsg({ kind: "success", text: "تم حفظ التعديلات، وتم تنظيف الملفات غير المستخدمة." });
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">محرّر الموقع</h1>
          <p className="mt-1 text-sm text-muted">عدّل المحتوى ثم احفظ — تظهر التغييرات على موقعك مباشرةً.</p>
        </div>
        <div className="flex items-center gap-4">
          {caps.profilePdf && (
            <a href={`/profile/${slug}?print=1`} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
              تحميل الملف التعريفي PDF ↓
            </a>
          )}
          {siteUrl && (
            <a href={siteUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
              معاينة الموقع ↗
            </a>
          )}
        </div>
      </div>

      <Section title="الهوية واللون">
        {image("شعار المكتب (يظهر في الشريط العلوي وكـ favicon)", "brand.logo")}
        {text("اسم المكتب (عربي)", "brand.ar")}
        {text("الاسم (لاتيني)", "brand.en", "ltr")}
        <div>
          <span className="mb-2 block text-xs text-muted">لون التمييز</span>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => set("theme.accent", a.key)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  c.theme.accent === a.key ? "border-accent" : "border-border"
                }`}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: a.hex }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {text("خط العرض", "coordinates.lat", "ltr")}
          {text("خط الطول", "coordinates.lng", "ltr")}
          {text("المدينة (لاتيني)", "coordinates.label", "ltr")}
        </div>
      </Section>

      <Section title="مظهر الموقع">
        <p className="text-xs text-muted">غيّر قالب التصميم وخط الموقع وشكل البطاقات ولون التمييز. تظهر التغييرات بعد الحفظ وتحديث الموقع.</p>

        <div>
          <span className="mb-2 block text-xs text-muted">قالب التصميم — يغيّر شكل الموقع بالكامل</span>
          <div className="grid grid-cols-2 gap-3">
            {SITE_TEMPLATES.filter((t) => caps.templates.includes(t.id)).map((t) => {
              const active = effectiveLayout === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("theme.layout", t.id)}
                  className={`overflow-hidden rounded-xl border text-right transition ${active ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent"}`}
                >
                  <div className="flex h-20 items-center justify-between px-4" style={{ background: t.dark ? "#06070A" : "#F4F1EA" }}>
                    <span className="text-lg font-bold" style={{ color: t.dark ? "#fff" : "#15110C" }}>
                      أبجد<span style={{ color: "#C2974E" }}>.</span>
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: t.dark ? "rgba(255,255,255,.1)" : "rgba(21,17,12,.08)", color: t.dark ? "#fff" : "#15110C" }}>
                      {t.dark ? "غامق" : "فاتح"}
                    </span>
                  </div>
                  <div className="px-4 py-2.5">
                    <div className="text-sm font-semibold">{t.name}{active && " ✓"}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{t.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {lockedTemplates > 0 && (
            <a
              href="/dashboard/subscription"
              className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted transition hover:border-accent hover:text-foreground"
            >
              <span>
                🔒 {lockedTemplates} قالب تصميم إضافي متاح في الباقات الأعلى — قالبك الحالي ضمن باقتك.
              </span>
              <span className="shrink-0 font-semibold text-accent">ترقية ←</span>
            </a>
          )}
        </div>

        <div>
          <span className="mb-2 block text-xs text-muted">أنماط جاهزة — طبّق مظهراً كاملاً بنقرة</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SITE_PRESETS.map((p) => {
              const dark = p.solid === "black";
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="overflow-hidden rounded-xl border border-border text-right transition hover:border-accent"
                >
                  <div className="flex h-16 items-center justify-between px-3" style={{ background: dark ? "#06070A" : "#f3f2ef" }}>
                    <span className="h-7 w-7 rounded-full" style={{ background: p.accentHex }} />
                    <span className="text-sm font-semibold" style={{ color: dark ? "#fff" : "#0E1116" }}>أبجد</span>
                  </div>
                  <div className="px-3 py-2 text-xs">{p.label}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted">تطبيق نمط يضبط الخط واللون والبطاقات والخلفية — تقدر تعدّل أي تفصيل بعدها.</p>
            <button
              type="button"
              onClick={resetStyle}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface-2 hover:text-foreground"
            >
              استعادة النمط الأساسي
            </button>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs text-muted">خط الموقع</span>
          <select
            className={inputCls}
            value={c.theme.font ?? "readex"}
            onChange={(e) => set("theme.font", e.target.value)}
          >
            {SITE_FONTS.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-2 block text-xs text-muted">شكل البطاقات</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {CARD_STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => set("theme.cardStyle", s.key)}
                className={`rounded-lg border p-3 text-right ${(c.theme.cardStyle ?? "glass") === s.key ? "border-accent" : "border-border"}`}
              >
                <div className="text-sm font-medium">{s.label}</div>
                <div className="mt-1 text-xs text-muted">{s.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs text-muted">لون البطاقات (مع الحفاظ على الشفافية)</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={c.theme.cardTint || "#10141c"}
              onChange={(e) => set("theme.cardTint", e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent p-1"
            />
            <span className="mono text-xs text-muted" dir="ltr">{c.theme.cardTint || "—"}</span>
            {c.theme.cardTint && (
              <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => set("theme.cardTint", null)}>
                إلغاء (اللون الافتراضي)
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">في البطاقة الزجاجية يبقى الضباب والشفافية، يتغيّر اللون فقط.</p>
        </div>

        <div>
          <span className="mb-2 block text-xs text-muted">استدارة الحواف</span>
          <div className="flex flex-wrap gap-2">
            {CARD_RADII.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => set("theme.cardRadius", r.key)}
                className={`rounded-lg border px-4 py-2 text-sm ${(c.theme.cardRadius ?? "soft") === r.key ? "border-accent" : "border-border"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs text-muted">لون مخصّص للتمييز (اختياري)</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={c.theme.accentHex || "#C2974E"}
              onChange={(e) => set("theme.accentHex", e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent p-1"
            />
            <span className="mono text-xs text-muted" dir="ltr">{c.theme.accentHex || "—"}</span>
            {c.theme.accentHex && (
              <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => set("theme.accentHex", null)}>
                إلغاء (استخدم لون الباقة أعلاه)
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">يتجاوز ألوان التمييز الجاهزة في قسم «الهوية واللون».</p>
        </div>

        <div>
          {text("رمز تحقق Google Search Console (اختياري)", "seo.googleVerification", "ltr")}
          <p className="mt-1 text-xs text-muted">الصق قيمة <span className="mono">content</span> من وسم التحقق (طريقة HTML tag) لتأكيد ملكية موقعك في Google Search Console.</p>
        </div>
      </Section>

      <Section title="خلفية الموقع">
        {/* Background type chooser (gated by plan) */}
        <div>
          <span className="mb-2 block text-xs text-muted">نوع الخلفية</span>
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => set("media.bgMode", "solid")}
              className={`rounded-lg border p-3 text-right ${c.media?.bgMode === "solid" || caps.solidOnly ? "border-accent" : "border-border"}`}
            >
              <div className="text-sm font-medium">لون ثابت</div>
              <div className="mt-1 text-xs text-muted">أبيض أو أسود أنيق. الأسرع.</div>
            </button>
            {!caps.solidOnly && (
              <button
                type="button"
                onClick={() => set("media.bgMode", "video")}
                className={`rounded-lg border p-3 text-right ${c.media?.bgMode === "video" ? "border-accent" : "border-border"}`}
              >
                <div className="text-sm font-medium">فيديو طبيعي ⚡</div>
                <div className="mt-1 text-xs text-muted">يعمل تلقائياً ومتكرر.</div>
              </button>
            )}
            {!caps.solidOnly && caps.presets && (
              <button
                type="button"
                onClick={() => set("media.bgMode", "frames")}
                className={`rounded-lg border p-3 text-right ${c.media?.bgMode === "frames" ? "border-accent" : "border-border"}`}
              >
                <div className="text-sm font-medium">حركة مع التمرير</div>
                <div className="mt-1 text-xs text-muted">إطارات سينمائية مثل أوتاد.</div>
              </button>
            )}
          </div>
          {caps.solidOnly && (
            <p className="mt-2 text-xs text-amber-300">
              خلفيات الفيديو متاحة في الباقة الاحترافية وبريميوم. رقِّ باقتك لتفعيلها.
            </p>
          )}
        </div>

        {/* SOLID mode (also the only option for Basic) */}
        {caps.solidOnly || c.media?.bgMode === "solid" ? (
          <div>
            <span className="mb-2 block text-xs text-muted">لون الخلفية</span>
            <div className="flex gap-2">
              {(["black", "white"] as const).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() =>
                    setC((prev) => deepSet(deepSet(prev, "media.bgMode", "solid"), "media.solid", col))
                  }
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
                    c.media?.solid === col && c.media?.bgMode === "solid" ? "border-accent" : "border-border"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ background: col === "white" ? "#f3f2ef" : "#06070A" }}
                  />
                  {col === "white" ? "أبيض" : "أسود"}
                </button>
              ))}
            </div>
          </div>
        ) : c.media?.bgMode === "frames" ? (
          <>
            <div>
              <span className="mb-2 block text-xs text-muted">
                اختر خلفية جاهزة بحركة التمرير (لا تستهلك مساحة)
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {presets.map((p) => {
                  const selected = !!c.media?.frames && c.media.frames[0] === p.frames[0];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setC((prev) =>
                          deepSet(deepSet(deepSet(prev, "media.frames", p.frames), "media.bgMode", "frames"), "media.bgVideo", null),
                        )
                      }
                      className={`overflow-hidden rounded-lg border text-right ${selected ? "border-accent ring-1 ring-accent" : "border-border"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.frames[0]} alt="" className="h-20 w-full object-cover" />
                      <div className="px-2 py-1.5 text-xs">{p.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {caps.upload ? (
              <>
                <p className="text-xs text-muted">
                  أو ارفع فيديو ليُحوَّل إلى إطارات داخل متصفحك — <b>16 إطاراً/ثانية بدقة عالية</b> (مثل أوتاد).
                  يُفضَّل mp4 قصير (5–12 ثانية). بعد التحويل اضغط حفظ.
                </p>
                {c.media.frames && c.media.frames.length > 0 && c.media.frames[0].includes("/storage/") ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.media.frames[0]} alt="" className="h-20 w-32 rounded-lg border border-border object-cover" />
                    <div className="flex-1 text-xs text-muted">{c.media.frames.length} إطاراً (مرفوعة)</div>
                  </div>
                ) : null}
                <label className="block">
                  <span className="mb-1 block text-xs text-muted">
                    {extracting ? extractInfo || "جارٍ المعالجة…" : "رفع فيديو وتحويله لإطارات"}
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    disabled={extracting}
                    className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-foreground"
                    onChange={(e) => e.target.files?.[0] && convertAndUploadFrames(e.target.files[0])}
                  />
                </label>
              </>
            ) : (
              <p className="text-xs text-amber-300">رفع فيديو خاص وتحويله لإطارات متاح في باقة بريميوم.</p>
            )}
          </>
        ) : (
          <>
            <div>
              <span className="mb-2 block text-xs text-muted">اختر خلفية جاهزة (لا تستهلك مساحة)</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {presets.map((p) => {
                  const selected = c.media?.bgVideo === p.src;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setC((prev) =>
                          deepSet(deepSet(deepSet(prev, "media.bgVideo", p.src), "media.bgMode", "video"), "media.frames", null),
                        )
                      }
                      className={`overflow-hidden rounded-lg border text-right ${selected ? "border-accent ring-1 ring-accent" : "border-border"}`}
                    >
                      <video src={p.src} muted playsInline preload="metadata" className="h-20 w-full object-cover" />
                      <div className="px-2 py-1.5 text-xs">{p.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {caps.upload ? (
              <>
                <p className="text-xs text-muted">
                  أو ارفع خلفية خاصة بك (تُحفظ في تخزين مكتبك). الأفضل <b>mp4/WebM</b> خفيف (أقل من ~5MB) أو صورة/GIF.
                </p>
                {c.media?.bgVideo && c.media.bgVideo.includes("/storage/") ? (
                  <div className="flex items-center gap-3">
                    {/\.(mp4|webm|mov|m4v|ogg|ogv)(\?|$)/i.test(c.media.bgVideo) ? (
                      <video src={c.media.bgVideo} muted className="h-20 w-32 rounded-lg border border-border object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.media.bgVideo} alt="" className="h-20 w-32 rounded-lg border border-border object-cover" />
                    )}
                    <div className="flex-1 text-xs text-muted" dir="ltr">{c.media.bgVideo.split("/").pop()}</div>
                    <button type="button" className="text-xs text-red-400" onClick={() => set("media.bgVideo", null)}>
                      إزالة
                    </button>
                  </div>
                ) : null}
                <label className="block">
                  <span className="mb-1 block text-xs text-muted">
                    {uploadingVideo ? "جارٍ الرفع…" : "رفع خلفية (فيديو / صورة / GIF)"}
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*,image/gif,image/*"
                    disabled={uploadingVideo}
                    className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-foreground"
                    onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])}
                  />
                </label>
              </>
            ) : (
              <p className="text-xs text-amber-300">رفع خلفية خاصة بك متاح في باقة بريميوم.</p>
            )}
          </>
        )}
      </Section>

      <Section title="الواجهة الرئيسية">
        {text("السطر العلوي (لاتيني)", "hero.eyebrow", "ltr")}
        {area("الوصف", "hero.subtitle")}
        <ListEditor
          title="أرقام بارزة"
          items={c.hero.meta}
          onChange={(v) => set("hero.meta", v)}
          empty={{ value: "", label: "" }}
          render={(_, i) => (
            <div className="grid grid-cols-2 gap-3">
              {text("الرقم", `hero.meta.${i}.value`)}
              {text("الوصف", `hero.meta.${i}.label`)}
            </div>
          )}
        />
      </Section>

      <Section title="من نحن">
        {caps.aiContent && (
          <div className="rounded-lg border border-dashed border-accent/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-muted">✨ دع الذكاء الاصطناعي يكتب «من نحن» و«الخدمات» تلقائياً.</p>
              <span className="mono shrink-0 text-xs text-muted">المتبقّي هذا الشهر: {aiRemaining}/{aiLimit}</span>
            </div>
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="تخصص المكتب (اختياري) — مثال: تصميم معماري وإشراف"
                value={aiSpecialty}
                onChange={(e) => setAiSpecialty(e.target.value)}
              />
              <button
                type="button"
                onClick={generateAi}
                disabled={aiBusy || aiRemaining <= 0}
                className="shrink-0 rounded-lg bg-accent px-4 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
              >
                {aiBusy ? "…" : aiRemaining <= 0 ? "انتهى الحدّ" : "اكتب لي"}
              </button>
            </div>
          </div>
        )}
        {area("العنوان الرئيسي", "about.lead")}
        {area("النص", "about.body")}
        <ListEditor
          title="بطاقات جانبية"
          items={c.about.side}
          onChange={(v) => set("about.side", v)}
          empty={{ k: "", v: "" }}
          render={(_, i) => (
            <div className="grid grid-cols-[100px_1fr] gap-3">
              {text("رمز", `about.side.${i}.k`, "ltr")}
              {text("النص", `about.side.${i}.v`)}
            </div>
          )}
        />
      </Section>

      <Section title="الخدمات">
        {text("عنوان القسم", "services.title")}
        {area("وصف القسم", "services.lead")}
        <ListEditor
          title="قائمة الخدمات"
          items={c.services.items}
          onChange={(v) => set("services.items", v)}
          empty={{ title: "", desc: "" }}
          render={(_, i) => (
            <>
              {text("عنوان الخدمة", `services.items.${i}.title`)}
              {area("الوصف", `services.items.${i}.desc`)}
            </>
          )}
        />
      </Section>

      <Section title="الأرقام والإنجازات">
        <ListEditor
          title="الإحصائيات"
          items={c.stats}
          onChange={(v) => set("stats", v)}
          empty={{ value: "", suffix: "", label: "", en: "" }}
          render={(_, i) => (
            <div className="grid grid-cols-2 gap-3">
              {text("القيمة", `stats.${i}.value`, "ltr")}
              {text("اللاحقة (+/%/M)", `stats.${i}.suffix`, "ltr")}
              {text("الوصف", `stats.${i}.label`)}
              {text("باللاتيني", `stats.${i}.en`, "ltr")}
            </div>
          )}
        />
      </Section>

      <Section title="منهجية العمل">
        <ListEditor
          title="الخطوات"
          items={c.process}
          onChange={(v) => set("process", v)}
          empty={{ title: "", desc: "" }}
          render={(_, i) => (
            <>
              {text("عنوان الخطوة", `process.${i}.title`)}
              {area("الوصف", `process.${i}.desc`)}
            </>
          )}
        />
      </Section>

      <Section title="المشاريع">
        <ListEditor
          title="المشاريع"
          items={c.projects.items}
          onChange={(v) => set("projects.items", v)}
          empty={{ tag: "", title: "", meta: "", image: null }}
          render={(pr, i) => (
            <>
              <div className="grid grid-cols-2 gap-3">
                {text("التصنيف (لاتيني)", `projects.items.${i}.tag`, "ltr")}
                {text("الموقع/السنة", `projects.items.${i}.meta`, "ltr")}
              </div>
              {text("اسم المشروع", `projects.items.${i}.title`)}
              {image("صورة المشروع", `projects.items.${i}.image`)}
              {caps.projectDetails && (
                <div className="mt-1 space-y-3 rounded-lg border border-dashed border-border p-3">
                  <p className="text-xs text-muted">دراسة حالة (تظهر عند الضغط على المشروع):</p>
                  {area("تفاصيل المشروع", `projects.items.${i}.body`)}
                  <ListEditor
                    title="معلومات (عميل/سنة/مساحة…)"
                    items={pr.details ?? []}
                    onChange={(v) => set(`projects.items.${i}.details`, v)}
                    empty={{ k: "", v: "" }}
                    render={(_, j) => (
                      <div className="grid grid-cols-2 gap-3">
                        {text("العنوان", `projects.items.${i}.details.${j}.k`)}
                        {text("القيمة", `projects.items.${i}.details.${j}.v`)}
                      </div>
                    )}
                  />
                  <ListEditor
                    title="صور إضافية"
                    items={pr.gallery ?? []}
                    onChange={(v) => set(`projects.items.${i}.gallery`, v)}
                    empty={null as string | null}
                    render={(_, j) => image(`صورة ${j + 1}`, `projects.items.${i}.gallery.${j}`)}
                  />
                </div>
              )}
            </>
          )}
        />
      </Section>

      {caps.models3d && (
        <Section title="النماذج ثلاثية الأبعاد (3D)">
          <p className="text-xs text-muted">
            يظهر هذا القسم أسفل المشاريع. صدّر مشروعك من Revit إلى GLB وارفعه — يتفاعل معه الزائر (دوران/تقريب/AR).
          </p>
          {text("عنوان القسم", "models.title")}
          {area("وصف القسم", "models.lead")}
          <ListEditor
            title="النماذج"
            items={c.models.items}
            onChange={(v) => set("models.items", v)}
            empty={{ title: "", caption: "", url: null, poster: null }}
            render={(_, i) => (
              <>
                {text("اسم النموذج", `models.items.${i}.title`)}
                {text("وصف مختصر (اختياري)", `models.items.${i}.caption`)}
                {model3d(`models.items.${i}.url`)}
                {image("صورة مصغّرة (اختياري — تظهر قبل التحميل)", `models.items.${i}.poster`)}
              </>
            )}
          />
        </Section>
      )}

      <Section title="الفريق">
        <ListEditor
          title="أعضاء الفريق"
          items={c.team.items}
          onChange={(v) => set("team.items", v)}
          empty={{ name: "", role: "", roleEn: "", image: null }}
          render={(_, i) => (
            <>
              {text("الاسم", `team.items.${i}.name`)}
              <div className="grid grid-cols-2 gap-3">
                {text("المنصب", `team.items.${i}.role`)}
                {text("باللاتيني", `team.items.${i}.roleEn`, "ltr")}
              </div>
              {image("الصورة", `team.items.${i}.image`)}
            </>
          )}
        />
      </Section>

      <Section title="آراء العملاء">
        <ListEditor
          title="الآراء"
          items={c.testimonials}
          onChange={(v) => set("testimonials", v)}
          empty={{ quote: "", name: "", role: "" }}
          render={(_, i) => (
            <>
              {area("نص الرأي", `testimonials.${i}.quote`)}
              <div className="grid grid-cols-2 gap-3">
                {text("الاسم", `testimonials.${i}.name`)}
                {text("الصفة", `testimonials.${i}.role`)}
              </div>
            </>
          )}
        />
      </Section>

      {caps.badges && (
        <Section title="الاعتمادات والثقة">
          <p className="text-xs text-muted">رقم الترخيص، اعتماد الهيئة، التصنيف، وشعارات عملائك — تظهر كقسم ثقة في موقعك.</p>
          {text("جملة تعريفية", "credentials.lead")}
          <ListEditor
            title="الاعتمادات (شارة في كل سطر)"
            items={c.credentials.badges}
            onChange={(v) => set("credentials.badges", v)}
            empty={{ label: "", value: "" }}
            render={(_, i) => (
              <div className="grid grid-cols-2 gap-3">
                {text("العنوان", `credentials.badges.${i}.label`)}
                {text("القيمة", `credentials.badges.${i}.value`)}
              </div>
            )}
          />
          <ListEditor
            title="شعارات العملاء / الشركاء"
            items={c.credentials.clients}
            onChange={(v) => set("credentials.clients", v)}
            empty={{ name: "", logo: null }}
            render={(_, i) => (
              <>
                {text("اسم العميل", `credentials.clients.${i}.name`)}
                {image("الشعار", `credentials.clients.${i}.logo`)}
              </>
            )}
          />
        </Section>
      )}

      {caps.sections.includes("calculator") && (
        <Section title="حاسبة التكلفة">
          <p className="text-xs text-muted">يدخل الزائر المساحة فيحصل على تقدير تقريبي حسب أسعارك. السعر لكل متر مربع.</p>
          {text("جملة تعريفية", "calculator.lead")}
          <div className="grid grid-cols-2 gap-3">
            {text("العملة", "calculator.unit")}
          </div>
          {area("ملاحظة أسفل النتيجة", "calculator.note")}
          <ListEditor
            title="أنواع الخدمة (السعر لكل م²)"
            items={c.calculator.types}
            onChange={(v) => set("calculator.types", v)}
            empty={{ name: "", price: 0 }}
            render={(_, i) => (
              <div className="grid grid-cols-[1fr_120px] gap-3">
                {text("نوع الخدمة", `calculator.types.${i}.name`)}
                {text("السعر/م²", `calculator.types.${i}.price`, "ltr")}
              </div>
            )}
          />
          <ListEditor
            title="مستويات التشطيب (معامل الضرب)"
            items={c.calculator.levels}
            onChange={(v) => set("calculator.levels", v)}
            empty={{ name: "", factor: 1 }}
            render={(_, i) => (
              <div className="grid grid-cols-[1fr_120px] gap-3">
                {text("المستوى", `calculator.levels.${i}.name`)}
                {text("المعامل (مثل 1.3)", `calculator.levels.${i}.factor`, "ltr")}
              </div>
            )}
          />
        </Section>
      )}

      <Section title="الأسئلة الشائعة">
        <ListEditor
          title="الأسئلة"
          items={c.faq.items}
          onChange={(v) => set("faq.items", v)}
          empty={{ q: "", a: "" }}
          render={(_, i) => (
            <>
              {text("السؤال", `faq.items.${i}.q`)}
              {area("الإجابة", `faq.items.${i}.a`)}
            </>
          )}
        />
      </Section>

      <Section title="التواصل">
        <div className="space-y-3 rounded-lg glass-panel-2/40 p-3">
          <div>
            {text("رقم واتساب (مع رمز الدولة بدون +)", "contact.whatsapp", "ltr")}
            <p className="mt-1 text-xs text-muted">مثال: 9665XXXXXXXX. إن تُرك فارغاً يُستخدم رقم الهاتف.</p>
          </div>
          {text("تيك توك (اسم المستخدم أو الرابط)", "contact.tiktok", "ltr")}
          {text("سناب شات (اسم المستخدم أو الرابط)", "contact.snapchat", "ltr")}
          {text("إنستقرام (اسم المستخدم أو الرابط)", "contact.instagram", "ltr")}
          {text("لينكدإن (الرابط أو المعرّف)", "contact.linkedin", "ltr")}
          <p className="text-xs text-muted">تظهر كأزرار عائمة على يسار الموقع. اتركها فارغة لإخفائها.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {text("الهاتف", "contact.phone", "ltr")}
          {text("ملاحظة الهاتف", "contact.phoneNote")}
          {text("البريد", "contact.email", "ltr")}
          {text("ملاحظة البريد", "contact.emailNote")}
          {text("المكتب", "contact.office", "ltr")}
          {text("العنوان", "contact.officeNote")}
          {text("حساب التواصل", "contact.social", "ltr")}
          {text("ملاحظة التواصل", "contact.socialNote")}
        </div>
        <div>
          {text("خريطة جوجل (رابط مشاركة، أو إحداثيات 24.71,46.67، أو عنوان)", "contact.mapQuery", "ltr")}
          <p className="mt-1 text-xs text-muted">
            يمكنك لصق رابط المشاركة من تطبيق خرائط جوجل مباشرةً، وسنحوّله لموقع دقيق. اتركها فارغة لإخفاء الخريطة.
          </p>
        </div>
      </Section>

      <Section title="الأقسام الظاهرة">
        <p className="text-xs text-muted">تحكّم في إظهار أو إخفاء أقسام موقعك. الأقسام غير المتاحة في باقتك تظهر مقفلة.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SITE_SECTIONS.map(({ key, label }) => {
            const allowed = caps.sections.includes(key);
            const on = (c.visible as Record<string, boolean>)[key] !== false;
            if (!allowed) {
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-muted opacity-60" title="غير متاح في باقتك">
                  <span>{label}</span>
                  <span className="mono text-xs">🔒</span>
                </div>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => set(`visible.${key}`, !on)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${on ? "border-accent" : "border-border text-muted"}`}
              >
                <span>{label}</span>
                <span className={`mono text-xs ${on ? "text-accent" : "text-muted"}`}>{on ? "ظاهر" : "مخفي"}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur md:right-[260px]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3.5">
          {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : <span className="text-sm text-muted">تذكّر الحفظ بعد التعديل.</span>}
          <Button onClick={save} loading={saving} className="shrink-0">
            حفظ التعديلات
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl glass-panel p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ListEditor<T>({
  title,
  items,
  onChange,
  empty,
  render,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  render: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <button
          type="button"
          onClick={() => onChange([...items, structuredClone(empty)])}
          className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-surface-2"
        >
          + إضافة
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl glass-panel-2/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="mono text-xs text-muted">#{i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-xs text-red-400 hover:underline"
              >
                حذف
              </button>
            </div>
            <div className="space-y-3">{render(item, i)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
