"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteContent } from "@/lib/site-content";
import { BG_PRESETS } from "@/lib/bg-presets";
import { Button, Alert } from "@/components/ui";

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
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function Editor({
  officeId,
  initial,
  siteUrl,
}: {
  officeId: string;
  initial: SiteContent;
  siteUrl: string | null;
}) {
  const [c, setC] = useState<SiteContent>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const set = (path: string, value: unknown) => setC((prev) => deepSet(prev, path, value));

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
      const QUALITY = 0.92; // high JPEG quality — keep the footage crisp
      const MAX_W = 1920; // don't upscale; only cap very large footage
      const CAP = 600; // safety bound on total frames
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
        const hasRVFC = typeof (v as unknown as { requestVideoFrameCallback?: unknown }).requestVideoFrameCallback === "function";
        const finish = () => resolve();
        v.onended = finish;
        v.onerror = () => reject(new Error("play"));
        const cap = () => {
          if (lastT < 0 || v.currentTime - lastT >= minStep - 0.0001) {
            tctx.drawImage(v, 0, 0, ew, eh);
            shots.push(tmp.toDataURL("image/jpeg", QUALITY));
            lastT = v.currentTime;
            setExtractInfo(`التقاط الإطارات… ${shots.length}`);
            if (shots.length >= MAXF) return finish();
          }
          if (hasRVFC) (v as unknown as { requestVideoFrameCallback: (cb: () => void) => void }).requestVideoFrameCallback(cap);
        };
        v.playbackRate = 2;
        v.play()
          .then(() => {
            if (hasRVFC) (v as unknown as { requestVideoFrameCallback: (cb: () => void) => void }).requestVideoFrameCallback(cap);
            else v.ontimeupdate = cap;
          })
          .catch(() => reject(new Error("autoplay")));
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
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
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
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
            معاينة الموقع ↗
          </a>
        )}
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

      <Section title="خلفية الموقع">
        <div>
          <span className="mb-2 block text-xs text-muted">نوع الخلفية</span>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => set("media.bgMode", "video")}
              className={`rounded-lg border p-3 text-right ${c.media?.bgMode !== "frames" ? "border-accent" : "border-border"}`}
            >
              <div className="text-sm font-medium">فيديو طبيعي ⚡</div>
              <div className="mt-1 text-xs text-muted">يعمل تلقائياً ومتكرر. الأسرع والأفضل لـSEO.</div>
            </button>
            <button
              type="button"
              onClick={() => set("media.bgMode", "frames")}
              className={`rounded-lg border p-3 text-right ${c.media?.bgMode === "frames" ? "border-accent" : "border-border"}`}
            >
              <div className="text-sm font-medium">حركة مع التمرير (مثل أوتاد)</div>
              <div className="mt-1 text-xs text-muted">يُقطّع فيديوك لإطارات. أنعم تأثير، لكن تحميل أثقل (يؤثر على SEO).</div>
            </button>
          </div>
        </div>

        {c.media?.bgMode === "frames" ? (
          <>
            <div>
              <span className="mb-2 block text-xs text-muted">
                اختر خلفية جاهزة بحركة التمرير (إطارات مُعدّة مسبقاً — لا تستهلك مساحة)
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BG_PRESETS.map((p) => {
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

            <p className="text-xs text-muted">
              أو ارفع فيديو ليُحوَّل إلى إطارات داخل متصفحك — <b>16 إطاراً/ثانية بدقة عالية بلا إفساد للجودة</b>
              (مثل أوتاد). يُفضَّل mp4 قصير (5–12 ثانية) لأن عدد الإطارات = المدة × 16. بعد التحويل اضغط حفظ.
            </p>
            {c.media.frames && c.media.frames.length > 0 ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.media.frames[0]} alt="" className="h-20 w-32 rounded-lg border border-border object-cover" />
                <div className="flex-1 text-xs text-muted">{c.media.frames.length} إطاراً جاهزة</div>
                <button type="button" className="text-xs text-red-400" onClick={() => set("media.frames", null)}>
                  إزالة
                </button>
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
          <>
            <div>
              <span className="mb-2 block text-xs text-muted">
                اختر خلفية جاهزة (موصى به — لا تستهلك مساحة تخزين)
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BG_PRESETS.map((p) => {
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

            <p className="text-xs text-muted">
              أو ارفع خلفية خاصة بك (تُحفظ في تخزين مكتبك). الأفضل ملف <b>mp4/WebM</b> خفيف وقصير
              (أقل من ~5MB)، أو صورة/GIF.
            </p>
            {c.media?.bgVideo ? (
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
          render={(_, i) => (
            <>
              <div className="grid grid-cols-2 gap-3">
                {text("التصنيف (لاتيني)", `projects.items.${i}.tag`, "ltr")}
                {text("الموقع/السنة", `projects.items.${i}.meta`, "ltr")}
              </div>
              {text("اسم المشروع", `projects.items.${i}.title`)}
              {image("صورة المشروع", `projects.items.${i}.image`)}
            </>
          )}
        />
      </Section>

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

      <Section title="التواصل">
        <div className="space-y-3 rounded-lg border border-border bg-surface-2/40 p-3">
          <div>
            {text("رقم واتساب (مع رمز الدولة بدون +)", "contact.whatsapp", "ltr")}
            <p className="mt-1 text-xs text-muted">مثال: 9665XXXXXXXX. إن تُرك فارغاً يُستخدم رقم الهاتف.</p>
          </div>
          {text("تيك توك (اسم المستخدم أو الرابط)", "contact.tiktok", "ltr")}
          {text("سناب شات (اسم المستخدم أو الرابط)", "contact.snapchat", "ltr")}
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
          {text("خريطة جوجل (عنوان المكتب أو إحداثيات مثل 24.71,46.67)", "contact.mapQuery", "ltr")}
          <p className="mt-1 text-xs text-muted">تظهر خريطة جوجل في قسم التواصل. اتركها فارغة لإخفائها.</p>
        </div>
      </Section>

      <Section title="الأقسام الظاهرة">
        <p className="text-xs text-muted">تحكّم في إظهار أو إخفاء أقسام موقعك.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ["about", "من نحن"],
            ["services", "الخدمات"],
            ["stats", "الأرقام"],
            ["process", "المنهجية"],
            ["projects", "المشاريع"],
            ["team", "الفريق"],
            ["testimonials", "الآراء"],
            ["contact", "التواصل"],
          ] as const).map(([key, label]) => {
            const on = c.visible?.[key] !== false;
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
    <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
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
          <div key={i} className="rounded-xl border border-border bg-surface-2/40 p-4">
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
