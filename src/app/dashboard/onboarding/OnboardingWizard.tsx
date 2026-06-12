"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SiteContent } from "@/lib/site-content";
import type { PlanCaps } from "@/lib/plans";
import { markOnboarded } from "./actions";

const ACCENTS: { key: SiteContent["theme"]["accent"]; label: string; hex: string }[] = [
  { key: "bronze", label: "برونزي", hex: "#C2974E" },
  { key: "terracotta", label: "طيني", hex: "#D9774E" },
  { key: "azure", label: "أزرق", hex: "#4C7DF0" },
  { key: "sage", label: "زيتوني", hex: "#8FA66E" },
];

const input = "w-full rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function OnboardingWizard({
  officeId,
  initial,
  caps,
  siteUrl,
}: {
  officeId: string;
  initial: SiteContent;
  caps: PlanCaps;
  siteUrl: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [c, setC] = useState<SiteContent>(initial);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [, start] = useTransition();

  const steps = ["هويتك", "عن مكتبك", "تواصلك", "الإطلاق"];

  async function uploadLogo(file: File) {
    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "png";
    const key = `${officeId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(key, file, { upsert: true });
    setBusy(false);
    if (error) {
      setErr("تعذّر رفع الشعار.");
      return;
    }
    const { data } = supabase.storage.from("site-media").getPublicUrl(key);
    setC((p) => ({ ...p, brand: { ...p.brand, logo: data.publicUrl } }));
  }

  async function aiFill() {
    setAiBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: c.brand.ar }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error();
      setC((p) => ({
        ...p,
        about: { ...p.about, lead: d.aboutLead || p.about.lead, body: d.aboutBody || p.about.body },
        services: Array.isArray(d.services) && d.services.length ? { ...p.services, items: d.services } : p.services,
      }));
    } catch {
      setErr("تعذّر التوليد بالذكاء الاصطناعي.");
    } finally {
      setAiBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.from("site_content").update({ content: c }).eq("office_id", officeId);
    if (error) {
      setBusy(false);
      setErr("تعذّر حفظ البيانات. حاول مجدداً.");
      return;
    }
    start(async () => {
      await markOnboarded();
      router.push("/dashboard/subscription");
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${i <= step ? "bg-accent text-white" : "border border-border text-muted"}`}>{i + 1}</div>
            <span className={`text-xs ${i === step ? "text-foreground" : "text-muted"}`}>{s}</span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl glass-panel p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">هوية مكتبك</h2>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">اسم المكتب</span>
              <input className={input} value={c.brand.ar} onChange={(e) => setC({ ...c, brand: { ...c.brand, ar: e.target.value } })} />
            </label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg glass-panel-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.brand.logo ? <img src={c.brand.logo} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex-1">
                <span className="mb-1 block text-xs text-muted">الشعار</span>
                <input type="file" accept="image/*" disabled={busy} className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-foreground" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              </div>
            </div>
            <div>
              <span className="mb-2 block text-xs text-muted">لون التمييز</span>
              <div className="flex gap-2">
                {ACCENTS.map((a) => (
                  <button key={a.key} type="button" onClick={() => setC({ ...c, theme: { ...c.theme, accent: a.key, accentHex: null } })} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${c.theme.accent === a.key && !c.theme.accentHex ? "border-accent" : "border-border"}`}>
                    <span className="h-4 w-4 rounded-full" style={{ background: a.hex }} /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">عن مكتبك</h2>
            {caps.aiContent && (
              <button type="button" onClick={aiFill} disabled={aiBusy} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-60">
                {aiBusy ? "…" : "✨ اكتب لي النصوص تلقائياً"}
              </button>
            )}
            <label className="block">
              <span className="mb-1 block text-xs text-muted">جملة تعريفية</span>
              <textarea rows={2} className={input} value={c.about.lead} onChange={(e) => setC({ ...c, about: { ...c.about, lead: e.target.value } })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">نبذة</span>
              <textarea rows={4} className={input} value={c.about.body} onChange={(e) => setC({ ...c, about: { ...c.about, body: e.target.value } })} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">معلومات التواصل</h2>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">الهاتف</span>
              <input className={input} dir="ltr" value={c.contact.phone} onChange={(e) => setC({ ...c, contact: { ...c.contact, phone: e.target.value } })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">واتساب (مع رمز الدولة بدون +)</span>
              <input className={input} dir="ltr" placeholder="9665XXXXXXXX" value={c.contact.whatsapp} onChange={(e) => setC({ ...c, contact: { ...c.contact, whatsapp: e.target.value } })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">البريد</span>
              <input className={input} dir="ltr" value={c.contact.email} onChange={(e) => setC({ ...c, contact: { ...c.contact, email: e.target.value } })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">المدينة</span>
              <input className={input} value={c.contact.office} onChange={(e) => setC({ ...c, contact: { ...c.contact, office: e.target.value } })} />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">جاهز للإطلاق</h2>
            <p className="text-sm text-muted">حفظنا أساسيات موقعك. تقدر تكمّل التفاصيل (الخدمات، المشاريع، الخلفية) لاحقاً من محرّر الموقع. الخطوة الأخيرة: فعّل اشتراكك ليُنشر موقعك.</p>
            <div>
              <span className="mb-2 block text-xs text-muted">لون الخلفية</span>
              <div className="flex gap-2">
                {(["black", "white"] as const).map((col) => (
                  <button key={col} type="button" onClick={() => setC({ ...c, media: { ...c.media, bgMode: "solid", solid: col } })} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${c.media.solid === col && c.media.bgMode === "solid" ? "border-accent" : "border-border"}`}>
                    <span className="h-5 w-5 rounded-full border border-border" style={{ background: col === "white" ? "#f3f2ef" : "#06070A" }} /> {col === "white" ? "أبيض" : "أسود"}
                  </button>
                ))}
                {siteUrl && (
                  <a href={siteUrl} target="_blank" rel="noreferrer" className="ml-auto self-center text-sm text-accent hover:underline">معاينة ↗</a>
                )}
              </div>
            </div>
          </div>
        )}

        {err && <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</div>}

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-border px-4 py-2 text-sm text-muted disabled:opacity-40">السابق</button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent-soft">التالي</button>
          ) : (
            <button type="button" onClick={finish} disabled={busy} className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-60">{busy ? "جارٍ الحفظ…" : "إنهاء والذهاب للاشتراك"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
