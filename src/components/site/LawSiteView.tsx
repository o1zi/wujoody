/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import type { LawContent } from "@/lib/law-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import { fontByKey } from "@/lib/site-fonts";
import LawIntakeForm from "./LawIntakeForm";
import LawCalculators from "./LawCalculators";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// "Hayba" law-firm template — authoritative navy + gold (maroon variant via the
// accent). Serif headings. Built for law offices: practice areas, lawyers,
// case journey, fees, licenses, and a confidential case-intake form.

const PRIMARY: Record<string, string> = { navy: "#16314F", maroon: "#6E2733", bronze: "#7E6232", sage: "#3F5C3D" };
function primaryOf(theme: LawContent["theme"]): string {
  if (theme.accentHex) return theme.accentHex;
  return PRIMARY[theme.accent] ?? PRIMARY.navy;
}
function waLink(num: string): string | null {
  const d = (num || "").replace(/[^\d]/g, "");
  return d.length >= 8 ? `https://wa.me/${d}` : null;
}
function socialHref(kind: string, raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, "");
  if (kind === "instagram") return `https://instagram.com/${h}`;
  if (kind === "linkedin") return `https://www.linkedin.com/in/${h}`;
  if (kind === "tiktok") return `https://x.com/${h}`;
  return v;
}

const Svg = ({ d, s = 22, fill = false }: { d: string; s?: number; fill?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.split("|").map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const I = {
  scale: "M12 3v18|M7 21h10|M12 5l-7 3 2.5 5a3.5 3.5 0 01-5 0L5 8|M12 5l7 3-2.5 5a3.5 3.5 0 005 0L19 8",
  gavel: "M14 4l6 6|M11 7l6 6|M9 9l-6 6 3 3 6-6|M14 14l4 4|M13 21h8",
  doc: "M6 3h8l4 4v14H6z|M14 3v4h4|M9 12h6M9 16h6",
  building: "M4 21V7l8-4 8 4v14|M9 21v-5h6v5|M8 10h.01M12 10h.01M16 10h.01",
  home: "M4 11l8-6 8 6|M6 10v10h12V10|M10 20v-5h4v5",
  shield: "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z|M9.3 11.5l1.8 1.8 3.6-3.7",
  handshake: "M8 12l-3 3 2 2 3-3|M12 11l4 4 2-2-4-4|M3 9l4-4 5 4|M21 9l-4-4-5 4",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8z|M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7",
  arrow: "M14 6l-6 6 6 6",
  plus: "M12 5v14|M5 12h14",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  mail: "M3 6h18v12H3z|M3 7l9 6 9-6",
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z|M12 11a2 2 0 100-4 2 2 0 000 4z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z",
  lock: "M6 11h12v9H6z|M9 11V8a3 3 0 016 0v3",
  quote: "M10 11H6a1 1 0 01-1-1V7a3 3 0 013-3|M19 11h-4a1 1 0 01-1-1V7a3 3 0 013-3|M5 11s0 6 5 7|M14 11s0 6 5 7",
};
const SOC: Record<string, ReactElement> = {
  whatsapp: <Svg d="M12 3a9 9 0 00-7.7 13.5L3 21l4.6-1.2A9 9 0 1012 3z" s={17} />,
  instagram: <Svg d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z|M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" s={17} />,
  linkedin: <Svg d="M5 4a2 2 0 100 4 2 2 0 000-4z|M4 9h2v11H4z|M9 9h2v1.6a3 3 0 015 2.3V20h-2v-5a1.5 1.5 0 00-3 0v5H9z" s={17} />,
  tiktok: <Svg d="M4 4l16 16|M20 4L4 20" s={16} />,
};
const PA_ICONS = [I.building, I.user, I.handshake, I.home, I.gavel, I.scale];

export default function LawSiteView({
  content,
  slug,
  lawyers = [],
  services = [],
}: {
  content: LawContent;
  slug: string;
  lawyers?: PublicDoctor[];
  services?: BookingService[];
}) {
  const c = content;
  const v = c.visible;
  const p = primaryOf(c.theme);
  const fontFamily = `${fontByKey(c.theme.font).family}, serif`;
  const wa = waLink(c.contact.whatsapp);
  const areas = c.practiceAreas.items.map((a) => a.title).filter(Boolean);
  const bookingServices: BookingService[] =
    services.length > 0 ? services : areas.map((name) => ({ id: null, name }));
  const mapQ = c.contact.mapQuery?.trim();
  const mapSrc = mapQ ? `https://www.google.com/maps?q=${encodeURIComponent(mapQ)}&hl=ar&output=embed` : null;
  const two = (n: number) => String(n).padStart(2, "0");

  const socials = (
    [["whatsapp", wa ?? ""], ["linkedin", c.contact.linkedin], ["tiktok", c.contact.tiktok], ["instagram", c.contact.instagram]] as const
  ).filter(([k, val]) => (k === "whatsapp" ? !!wa : val && val.trim())).map(([k, val]) => ({ k, href: k === "whatsapp" ? val : socialHref(k, val) }));

  const nav = [
    v.practiceAreas && c.practiceAreas.items.length > 0 && { href: "#practice", label: "مجالات الممارسة" },
    v.lawyers && lawyers.length > 0 && { href: "#lawyers", label: "المحامون" },
    v.fees && c.fees.items.length > 0 && { href: "#fees", label: "الأتعاب" },
    v.faq && c.faq.items.length > 0 && { href: "#faq", label: "الأسئلة" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="lw" dir="rtl" style={{ ["--p" as string]: p, fontFamily }}>
      <style>{LW_CSS}</style>

      {/* NAV */}
      <nav className="lw-nav">
        <div className="lw-wrap lw-nav-in">
          <a href="#top" className="lw-brand">
            <span className={`lw-logo${c.brand.logo ? " lw-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.scale} s={20} />}</span>
            <span className="disp lw-brand-name">{c.brand.ar}</span>
          </a>
          <div className="lw-nav-links">{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <a href="#intake" className="lw-btn lw-btn-sm">اعرض قضيتك</a>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="lw-hero">
        <div className="lw-wrap lw-hero-grid">
          <div className="lw-hero-text">
            <span className="lw-kicker"><span className="lw-kicker-line" />{c.hero.eyebrow}</span>
            <h1 className="disp lw-h1">{c.hero.title}</h1>
            <p className="lw-hero-sub">{c.hero.subtitle}</p>
            <div className="lw-hero-cta">
              <a href="#intake" className="lw-btn lw-btn-lg">اعرض قضيتك بسرّية <Svg d={I.arrow} s={18} /></a>
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="lw-btn lw-btn-ghost lw-btn-lg">استشارة عبر واتساب</a>}
            </div>
            {c.hero.meta.length > 0 && (
              <div className="lw-hero-stats">
                {c.hero.meta.map((m, i) => (<div key={i} className="lw-hs"><span className="disp lw-hs-v">{m.value}</span><span className="lw-hs-l">{m.label}</span></div>))}
              </div>
            )}
          </div>
          <div className="lw-hero-media">
            <div className="lw-hero-frame">{c.hero.image ? <img src={c.hero.image} alt={c.brand.ar} /> : <div className="lw-hero-ph"><Svg d={I.scale} s={72} /></div>}</div>
            <div className="lw-hero-seal"><Svg d={I.lock} s={16} /><span>سرّية تامة</span></div>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      {v.about && (
        <section className="lw-sec">
          <div className="lw-wrap lw-about">
            <div>
              <span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />عن المكتب</span>
              <p className="disp lw-about-lead">{c.about.lead}</p>
              <p className="lw-about-body">{c.about.body}</p>
            </div>
            <div className="lw-about-side">
              {c.about.side.map((s, i) => (<div key={i} className="lw-fact"><span className="disp lw-fact-k">{s.k}</span><span className="lw-fact-v">{s.v}</span></div>))}
            </div>
          </div>
        </section>
      )}

      {/* PRACTICE AREAS */}
      {v.practiceAreas && c.practiceAreas.items.length > 0 && (
        <section id="practice" className="lw-sec lw-sec-soft">
          <div className="lw-wrap">
            <div className="lw-head"><span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />مجالات الممارسة</span><h2 className="disp lw-h2">{c.practiceAreas.title}</h2><p className="lw-lead">{c.practiceAreas.lead}</p></div>
            <div className="lw-grid-auto">
              {c.practiceAreas.items.map((a, i) => (<div key={i} className="lw-pa"><span className="lw-pa-ic"><Svg d={PA_ICONS[i % PA_ICONS.length]} s={24} /></span><h3 className="disp">{a.title}</h3><p>{a.desc}</p><a href="#intake" className="lw-pa-link">اعرض قضيتك <Svg d={I.arrow} s={14} /></a></div>))}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {v.stats && c.stats.length > 0 && (
        <section className="lw-stats">
          <div className="lw-wrap lw-stats-in">
            {c.stats.map((s, i) => (<div key={i} className="lw-stat"><div className="disp lw-stat-v">{s.value}{s.suffix}</div><div className="lw-stat-l">{s.label}</div></div>))}
          </div>
        </section>
      )}

      {/* LAWYERS */}
      {v.lawyers && lawyers.length > 0 && (
        <section id="lawyers" className="lw-sec">
          <div className="lw-wrap">
            <div className="lw-head"><span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />{c.lawyers.title}</span><h2 className="disp lw-h2">نخبة من المحامين في خدمتك</h2><p className="lw-lead">{c.lawyers.lead}</p></div>
            <div className="lw-grid-auto">
              {lawyers.map((d) => (<div key={d.id} className="lw-lawyer"><div className="lw-lawyer-img">{d.image ? <img src={d.image} alt={d.name} /> : <div className="lw-lawyer-ph"><Svg d={I.user} s={42} /></div>}</div><div className="lw-lawyer-body"><h3 className="disp">{d.name}</h3>{d.specialty && <span className="lw-lawyer-spec">{d.specialty}</span>}</div></div>))}
            </div>
          </div>
        </section>
      )}

      {/* LEGAL CALCULATORS */}
      {v.calculators && (
        <section id="calc" className="lw-sec">
          <div className="lw-wrap lw-narrow">
            <div className="lw-head lw-head-center"><span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />أدوات مجانية</span><h2 className="disp lw-h2">حاسبات قانونية فورية</h2><p className="lw-lead">احسب مكافأة نهاية الخدمة أو تقسيم الميراث في ثوانٍ.</p></div>
            <LawCalculators />
          </div>
        </section>
      )}

      {/* PROCESS */}
      {v.process && c.process.length > 0 && (
        <section className="lw-sec lw-sec-soft">
          <div className="lw-wrap">
            <div className="lw-head"><span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />كيف نعمل</span><h2 className="disp lw-h2">رحلة القضية</h2></div>
            <div className="lw-grid-auto">
              {c.process.map((s, i) => (<div key={i} className="lw-step"><span className="disp lw-step-n">{two(i + 1)}</span><h3 className="disp">{s.title}</h3><p>{s.desc}</p></div>))}
            </div>
          </div>
        </section>
      )}

      {/* FEES */}
      {v.fees && c.fees.items.length > 0 && (
        <section id="fees" className="lw-sec">
          <div className="lw-wrap lw-narrow">
            <div className="lw-head lw-head-center"><span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />الأتعاب</span><h2 className="disp lw-h2">أتعاب واضحة وشفافة</h2><p className="lw-lead">{c.fees.lead}</p></div>
            <div className="lw-feelist">
              {c.fees.items.map((f, i) => (<div key={i} className="lw-fee-row"><div><div className="lw-fee-name">{f.name}</div>{f.note && <div className="lw-fee-note">{f.note}</div>}</div><div className="disp lw-fee-val">{f.price} <span>{/\d/.test(f.price) ? c.fees.unit : ""}</span></div></div>))}
            </div>
            <p className="lw-fine">{c.fees.note}</p>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="lw-sec lw-sec-soft">
          <div className="lw-wrap">
            <div className="lw-head lw-head-center"><span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />آراء العملاء</span><h2 className="disp lw-h2">ماذا قالوا عنّا</h2></div>
            <div className="lw-grid-auto">
              {c.testimonials.map((t, i) => (<figure key={i} className="lw-quote"><span className="lw-quote-mark"><Svg d={I.quote} s={28} /></span><blockquote>«{t.quote}»</blockquote><figcaption><span className="disp lw-av">{t.name.trim().charAt(0)}</span><div><strong>{t.name}</strong><span>{t.role}</span></div></figcaption></figure>))}
            </div>
          </div>
        </section>
      )}

      {/* CREDENTIALS */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="lw-sec lw-cred-sec">
          <div className="lw-wrap"><p className="lw-lead lw-cred-lead">{c.credentials.lead}</p><div className="lw-creds">{c.credentials.badges.map((b, i) => (<div key={i} className="lw-cred"><span className="lw-cred-ic"><Svg d={I.shield} s={20} /></span><div><div className="disp lw-cred-v">{b.value}</div><div className="lw-cred-l">{b.label}</div></div></div>))}</div></div>
        </section>
      )}

      {/* FAQ */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="lw-sec lw-sec-soft">
          <div className="lw-wrap lw-faq">
            <div className="lw-head lw-head-center"><span className="lw-kicker lw-kicker-d"><span className="lw-kicker-line lw-line-d" />الأسئلة الشائعة</span><h2 className="disp lw-h2">إجابات لما يهمّك</h2></div>
            {c.faq.items.map((f, i) => (<details key={i} className="lw-faq-item"><summary>{f.q}<span className="lw-faq-plus"><Svg d={I.plus} s={18} /></span></summary><p>{f.a}</p></details>))}
          </div>
        </section>
      )}

      {/* BOOKING — legal consultation (slot-based) */}
      {v.booking && (
        <section id="book" className="lw-sec lw-sec-soft">
          <div className="lw-wrap lw-intake-wrap">
            <div className="lw-intake">
              <div className="lw-intake-head">
                <span className="lw-kicker"><span className="lw-kicker-line" />{c.booking.title}</span>
                <h2 className="disp lw-intake-h">{c.booking.lead}</h2>
              </div>
              <div className="lw-intake-body">
                <ClinicBookingForm
                  slug={slug}
                  services={bookingServices}
                  doctors={lawyers.map((d) => ({ id: d.id, name: d.name }))}
                  providerLabel="المحامي"
                  providerAnyLabel="أي محامٍ متاح"
                />
                <p className="lw-intake-note">{c.booking.note}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* INTAKE (confidential case form) */}
      {v.intake && (
        <section id="intake" className="lw-sec">
          <div className="lw-wrap lw-intake-wrap">
            <div className="lw-intake">
              <div className="lw-intake-head">
                <span className="lw-kicker"><span className="lw-kicker-line" /><span className="lw-lock"><Svg d={I.lock} s={14} /></span>{c.intake.title}</span>
                <h2 className="disp lw-intake-h">{c.intake.lead}</h2>
                <div className="lw-intake-chips">
                  <a className="lw-ichip" href={`tel:${c.contact.phone}`}><Svg d={I.phone} s={15} /><span dir="ltr">{c.contact.phone}</span></a>
                  <span className="lw-ichip"><Svg d={I.pin} s={15} />{c.contact.office}</span>
                </div>
              </div>
              <div className="lw-intake-body">
                <LawIntakeForm slug={slug} areas={areas} />
                <p className="lw-intake-note">{c.intake.note}</p>
              </div>
            </div>
            {mapSrc && <div className="lw-map"><iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="lw-footer">
        <div className="lw-wrap lw-foot-grid">
          <div className="lw-foot-brand">
            <div className="lw-brand"><span className={`lw-logo${c.brand.logo ? " lw-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.scale} s={16} />}</span><span className="disp lw-foot-name">{c.brand.ar}</span></div>
            <p>{c.about.lead}</p>
            {socials.length > 0 && <div className="lw-socs">{socials.map((s) => <a key={s.k} href={s.href} target="_blank" rel="noreferrer" aria-label={s.k}>{SOC[s.k]}</a>)}</div>}
          </div>
          <div className="lw-foot-col"><h4>روابط</h4>{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <div className="lw-foot-col"><h4>تواصل</h4><a href={`tel:${c.contact.phone}`} dir="ltr" className="lw-ltr">{c.contact.phone}</a><a href={`mailto:${c.contact.email}`} dir="ltr" className="lw-ltr">{c.contact.email}</a><span>{c.contact.office}</span></div>
          <div className="lw-foot-col"><h4>أوقات العمل</h4><span>{c.contact.phoneNote || "الأحد – الخميس · 9ص – 6م"}</span><a href="#intake" className="lw-btn lw-btn-sm lw-foot-cta">اعرض قضيتك</a></div>
        </div>
        <div className="lw-wrap lw-foot-bottom"><span>© {c.brand.ar} — جميع الحقوق محفوظة</span><span className="lw-foot-by">صُمم عبر منصة وجود</span></div>
      </footer>
    </div>
  );
}

const LW_CSS = `
.lw{
  --bg:#FBFAF6;--bg2:#F4F1E9;--ink:#16243A;--muted:#5C6577;--line:#E7E2D6;--card:#fff;
  --gold:#B08D4F;--gold-l:#C9A867;--gold-soft:#F4ECDB;--p-d:color-mix(in srgb,var(--p) 78%,#000);--p-soft:color-mix(in srgb,var(--p) 10%,#fff);
  background:var(--bg);color:var(--ink);font-family:inherit;line-height:1.85;-webkit-font-smoothing:antialiased;
}
.lw *{box-sizing:border-box}
.lw a{text-decoration:none}
:where(.lw) a{color:inherit}
.lw .disp{font-family:inherit;font-weight:700;letter-spacing:.2px}
.lw-wrap{max-width:1200px;margin:0 auto;padding:0 clamp(20px,5vw,56px)}
.lw-narrow{max-width:780px}
.lw-sec{padding:clamp(70px,8vw,118px) 0}
.lw-sec-soft{background:var(--bg2)}
/* buttons */
.lw-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 26px;border-radius:6px;background:var(--gold);color:#1c1405;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 12px 26px -12px rgba(176,141,79,.55);transition:transform .25s,filter .25s,box-shadow .25s}
.lw-btn:hover{transform:translateY(-2px);filter:brightness(1.05);box-shadow:0 18px 34px -12px rgba(176,141,79,.65)}
.lw-btn-sm{padding:10px 20px;font-size:14px;box-shadow:none}
.lw-btn-lg{padding:15px 30px;font-size:16.5px}
.lw-btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.4);box-shadow:none}
.lw-btn-ghost:hover{background:rgba(255,255,255,.12);border-color:#fff;filter:none}
.lw-btn-block{width:100%;margin-top:4px;padding:15px;border-radius:8px;font-size:16.5px}
/* nav */
.lw-nav{position:fixed;top:0;right:0;left:0;z-index:50;background:rgba(251,250,246,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.lw-nav-in{display:flex;align-items:center;gap:24px;height:74px}
.lw-brand{display:flex;align-items:center;gap:12px}
.lw-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:8px;background:var(--p);color:var(--gold-l);overflow:hidden}
.lw-logo-img{background:#fff;border:1px solid var(--line)}
.lw-logo-img img{width:100%;height:100%;object-fit:contain}
.lw-brand-name{font-size:22px;color:var(--ink)}
.lw-nav-links{display:flex;gap:8px;margin-inline-start:auto;font-size:15px;color:var(--muted);font-weight:600}
.lw-nav-links a{padding:8px 14px;border-radius:6px;transition:color .2s,background .2s}
.lw-nav-links a:hover{color:var(--p);background:var(--p-soft)}
@media(max-width:880px){.lw-nav-links{display:none}}
/* kicker */
.lw-kicker{display:inline-flex;align-items:center;gap:11px;font-size:13px;font-weight:700;letter-spacing:.1em;color:var(--gold-l);text-transform:uppercase}
.lw-kicker-line{width:30px;height:2px;background:var(--gold)}
.lw-kicker-d{color:var(--gold)}
.lw-line-d{background:var(--gold)}
.lw-lock{display:inline-flex;color:var(--gold-l)}
/* hero */
.lw-hero{padding:120px 0 80px;background:linear-gradient(180deg,var(--bg),var(--bg2))}
.lw-hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(32px,4vw,60px);align-items:center}
@media(max-width:920px){.lw-hero-grid{grid-template-columns:1fr;gap:44px}}
.lw-h1{font-size:clamp(40px,5.4vw,70px);line-height:1.14;margin:22px 0 0;color:var(--ink)}
.lw-hero-sub{font-size:clamp(16px,1.3vw,19px);line-height:1.9;color:var(--muted);max-width:540px;margin:22px 0 0;font-family:'Tajawal',sans-serif}
.lw-hero-cta{display:flex;flex-wrap:wrap;gap:13px;margin-top:34px}
.lw-hero-cta .lw-btn-ghost{color:var(--p);border-color:color-mix(in srgb,var(--p) 30%,#fff)}
.lw-hero-cta .lw-btn-ghost:hover{background:var(--p-soft)}
.lw-hero-stats{display:flex;flex-wrap:wrap;gap:clamp(22px,3vw,42px);margin-top:44px;padding-top:28px;border-top:1px solid var(--line)}
.lw-hs-v{font-size:36px;color:var(--p);line-height:1;display:block}
.lw-hs-l{font-size:14px;color:var(--muted);margin-top:4px;display:block;font-family:'Tajawal',sans-serif}
.lw-hero-media{position:relative}
.lw-hero-frame{position:relative;border-radius:10px;overflow:hidden;border:8px solid var(--p);box-shadow:0 40px 90px -40px rgba(22,36,58,.5)}
.lw-hero-frame::after{content:"";position:absolute;inset:0;border:1px solid var(--gold);opacity:.5;pointer-events:none}
.lw-hero-frame img{display:block;width:100%;height:clamp(420px,50vw,520px);object-fit:cover}
.lw-hero-ph{display:grid;place-items:center;width:100%;height:clamp(420px,50vw,520px);background:linear-gradient(155deg,var(--p),var(--p-d));color:rgba(201,168,103,.5)}
.lw-hero-seal{position:absolute;bottom:-14px;right:24px;display:flex;align-items:center;gap:8px;padding:11px 18px;border-radius:6px;background:var(--p);color:var(--gold-l);font-size:13.5px;font-weight:700;font-family:'Tajawal',sans-serif;box-shadow:0 18px 40px -18px rgba(22,36,58,.6)}
/* heads */
.lw-head{max-width:640px;margin:0 0 50px}
.lw-head-center{margin-left:auto;margin-right:auto;text-align:center}
.lw-h2{font-size:clamp(30px,4.2vw,52px);line-height:1.18;margin:14px 0 0;color:var(--ink)}
.lw-lead{font-size:17.5px;line-height:1.9;color:var(--muted);margin:16px 0 0;font-family:'Tajawal',sans-serif}
.lw-head-center .lw-lead{margin-left:auto;margin-right:auto;max-width:560px}
/* about */
.lw-about{display:grid;grid-template-columns:1.5fr 1fr;gap:clamp(40px,5vw,72px);align-items:center}
@media(max-width:860px){.lw-about{grid-template-columns:1fr;gap:32px}}
.lw-about-lead{font-size:clamp(24px,2.8vw,36px);line-height:1.5;margin:18px 0 0;color:var(--ink)}
.lw-about-body{font-size:16.5px;line-height:1.95;color:var(--muted);margin:18px 0 0;font-family:'Tajawal',sans-serif}
.lw-about-side{display:flex;flex-direction:column;gap:16px;border-inline-start:2px solid var(--gold);padding-inline-start:20px}
.lw-fact-k{display:block;font-size:12.5px;letter-spacing:.1em;color:var(--gold);direction:ltr;text-align:right}
.lw-fact-v{color:var(--ink);font-size:15.5px;font-family:'Tajawal',sans-serif}
/* grids */
.lw-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,360px));gap:22px;justify-content:center}
/* practice areas */
.lw-pa{padding:32px 28px;border-radius:10px;background:var(--card);border:1px solid var(--line);box-shadow:0 6px 18px -8px rgba(22,36,58,.12);transition:transform .3s,box-shadow .3s,border-color .3s}
.lw-pa:hover{transform:translateY(-6px);box-shadow:0 22px 46px -22px rgba(22,36,58,.24);border-color:var(--gold)}
.lw-pa-ic{display:grid;place-items:center;width:54px;height:54px;border-radius:10px;background:var(--p);color:var(--gold-l)}
.lw-pa h3{font-size:21px;margin:18px 0 8px;color:var(--ink)}
.lw-pa p{font-size:15px;line-height:1.8;color:var(--muted);margin:0 0 14px;font-family:'Tajawal',sans-serif}
.lw-pa-link{display:inline-flex;align-items:center;gap:6px;color:var(--gold);font-weight:700;font-size:14px;font-family:'Tajawal',sans-serif}
/* stats */
.lw-stats{background:linear-gradient(135deg,var(--p),var(--p-d));padding:clamp(54px,6vw,84px) 0}
.lw-stats-in{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;text-align:center}
.lw-stat-v{font-size:clamp(42px,5vw,60px);color:var(--gold-l);line-height:1}
.lw-stat-l{color:rgba(255,255,255,.78);font-size:15px;margin-top:6px;font-family:'Tajawal',sans-serif}
/* lawyers */
.lw-lawyer{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden;box-shadow:0 6px 18px -8px rgba(22,36,58,.12);transition:transform .3s,box-shadow .3s}
.lw-lawyer:hover{transform:translateY(-6px);box-shadow:0 22px 46px -22px rgba(22,36,58,.24)}
.lw-lawyer-img{height:300px;background:var(--bg2)}
.lw-lawyer-img img{width:100%;height:100%;object-fit:cover}
.lw-lawyer-ph{display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(150deg,var(--p),var(--p-d));color:rgba(201,168,103,.55)}
.lw-lawyer-body{padding:22px 24px 26px;border-top:3px solid var(--gold)}
.lw-lawyer-body h3{font-size:21px;margin:0 0 6px;color:var(--ink)}
.lw-lawyer-spec{display:inline-block;font-size:13.5px;color:var(--p);background:var(--p-soft);padding:4px 14px;border-radius:999px;font-family:'Tajawal',sans-serif}
/* process */
.lw-step{background:#fff;border:1px solid var(--line);border-radius:10px;padding:30px;text-align:center}
.lw-step-n{font-size:32px;color:var(--gold)}
.lw-step h3{font-size:20px;margin:10px 0 6px;color:var(--ink)}
.lw-step p{font-size:14.5px;color:var(--muted);margin:0;line-height:1.8;font-family:'Tajawal',sans-serif}
/* fees */
.lw-feelist{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 12px 30px -18px rgba(22,36,58,.2)}
.lw-fee-row{display:flex;justify-content:space-between;align-items:center;padding:20px 26px;border-bottom:1px solid var(--line)}
.lw-fee-row:last-child{border-bottom:none}
.lw-fee-name{font-weight:700;color:var(--ink);font-family:'Tajawal',sans-serif}
.lw-fee-note{color:var(--muted);font-size:13.5px;font-family:'Tajawal',sans-serif}
.lw-fee-val{color:var(--p);font-size:1.4rem}
.lw-fee-val span{font-size:.8rem;color:var(--muted)}
.lw-fine{text-align:center;font-size:14px;color:var(--muted);margin:20px 0 0;font-family:'Tajawal',sans-serif}
/* testimonials */
.lw-quote{margin:0;padding:30px 26px;border-radius:10px;background:#fff;border:1px solid var(--line);box-shadow:0 6px 18px -8px rgba(22,36,58,.12)}
.lw-quote-mark{color:var(--gold);display:inline-block;margin-bottom:8px}
.lw-quote blockquote{margin:0 0 18px;font-size:15.5px;line-height:1.85;color:var(--ink);font-family:'Tajawal',sans-serif}
.lw-quote figcaption{display:flex;align-items:center;gap:12px}
.lw-av{display:grid;place-items:center;width:46px;height:46px;border-radius:8px;background:var(--p);color:var(--gold-l);font-size:18px}
.lw-quote figcaption strong{display:block;color:var(--ink)}
.lw-quote figcaption span{color:var(--muted);font-size:13px;font-family:'Tajawal',sans-serif}
/* credentials */
.lw-cred-sec{padding:clamp(46px,6vw,72px) 0;border-block:1px solid var(--line)}
.lw-cred-lead{text-align:center;margin:0 auto 26px;max-width:560px}
.lw-creds{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.lw-cred{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px 22px;box-shadow:0 6px 18px -8px rgba(22,36,58,.12);min-width:230px}
.lw-cred-ic{flex:none;display:grid;place-items:center;width:42px;height:42px;border-radius:8px;background:var(--gold-soft);color:var(--gold)}
.lw-cred-v{font-size:18px;color:var(--ink)}
.lw-cred-l{font-size:13px;color:var(--muted);font-family:'Tajawal',sans-serif}
/* faq */
.lw-faq{max-width:800px}
.lw-faq-item{background:#fff;border:1px solid var(--line);border-radius:10px;padding:4px 24px;margin-bottom:12px;box-shadow:0 6px 18px -8px rgba(22,36,58,.1)}
.lw-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:19px 0;font-weight:700;font-size:17px;cursor:pointer;list-style:none;color:var(--ink)}
.lw-faq-item summary::-webkit-details-marker{display:none}
.lw-faq-plus{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:7px;background:var(--gold-soft);color:var(--gold);transition:transform .25s}
.lw-faq-item[open] .lw-faq-plus{transform:rotate(135deg)}
.lw-faq-item p{font-size:15.5px;line-height:1.9;color:var(--muted);margin:0 0 19px;font-family:'Tajawal',sans-serif}
/* intake */
.lw-intake-wrap{max-width:780px}
.lw-intake{border-radius:12px;overflow:hidden;box-shadow:0 36px 80px -40px rgba(22,36,58,.5);border:1px solid var(--line);background:#fff}
.lw-intake-head{background:linear-gradient(135deg,var(--p),var(--p-d));color:#fff;padding:36px 34px 32px;text-align:center}
.lw-intake-head .lw-kicker{justify-content:center}
.lw-intake-h{font-size:clamp(26px,3.4vw,38px);color:#fff;margin:14px 0 0}
.lw-intake-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:18px;font-family:'Tajawal',sans-serif}
.lw-ichip{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:6px;background:rgba(255,255,255,.12);font-size:14px}
.lw-intake-body{padding:30px 34px 34px;font-family:'Tajawal',sans-serif}
.lw-intake-note{text-align:center;color:var(--p);font-size:13.5px;font-weight:600;margin:16px 0 0}
.lw-map{margin-top:24px;border-radius:10px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/6}
.lw-map iframe{width:100%;height:100%;border:0;filter:grayscale(.2)}
/* intake form */
.lw-form{display:flex;flex-direction:column;gap:16px}
.lw-fld{display:flex;flex-direction:column;gap:7px}
.lw-fld label{font-size:14px;font-weight:600;color:var(--ink)}
.lw-fld input,.lw-fld select,.lw-fld textarea{width:100%;padding:13px 15px;border-radius:8px;border:1.5px solid var(--line);background:var(--bg);font:inherit;font-size:15px;color:var(--ink);outline:none;font-family:'Tajawal',sans-serif;transition:border-color .2s,box-shadow .2s}
.lw-fld input:focus,.lw-fld select:focus,.lw-fld textarea:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--p-soft);background:#fff}
/* consultation booking form (ClinicBookingForm classes) */
.lw .cl-form{display:flex;flex-direction:column;gap:16px}
.lw .cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.lw .cl-fld{display:flex;flex-direction:column;gap:7px}
.lw .cl-fld label{font-size:14px;font-weight:600;color:var(--ink)}
.lw .cl-fld input,.lw .cl-fld select,.lw .cl-fld textarea{width:100%;padding:13px 15px;border-radius:8px;border:1.5px solid var(--line);background:var(--bg);font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s}
.lw .cl-fld input:focus,.lw .cl-fld select:focus,.lw .cl-fld textarea:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--p-soft);background:#fff}
.lw .cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.lw .cl-slot{padding:9px 15px;border-radius:6px;border:1.5px solid var(--line);background:var(--bg);font:inherit;cursor:pointer;color:var(--ink);font-size:14.5px;transition:all .18s}
.lw .cl-slot:hover{border-color:var(--p)}
.lw .cl-slot-on{background:var(--p);color:#fff;border-color:var(--p)}
.lw .cl-slots-msg{color:var(--muted);font-size:14px;margin:0}
.lw .cl-btn{margin-top:4px;width:100%;padding:15px;border-radius:8px;border:none;background:var(--gold);color:#1c1405;font-weight:700;font-size:16.5px;cursor:pointer;font-family:inherit;box-shadow:0 12px 26px -12px rgba(176,141,79,.55);transition:transform .22s,filter .22s}
.lw .cl-btn:hover{transform:translateY(-2px);filter:brightness(1.05)}
/* legal calculators */
.lw-calc{background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px;box-shadow:0 12px 30px -18px rgba(22,36,58,.2);font-family:'Tajawal',sans-serif}
.lw-calc-tabs{display:flex;gap:6px;background:var(--bg2);border-radius:8px;padding:6px;margin-bottom:18px}
.lw-calc-tab{flex:1;padding:12px;border:none;border-radius:6px;background:transparent;font:inherit;font-weight:700;font-size:15px;color:var(--muted);cursor:pointer;transition:.2s}
.lw-calc-tab.on{background:var(--p);color:#fff}
.lw-calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0 12px}
@media(max-width:540px){.lw-calc-grid{grid-template-columns:1fr}}
.lw-calc-fld{display:flex;flex-direction:column;gap:7px}
.lw-calc-fld span{font-size:13.5px;font-weight:600;color:var(--ink)}
.lw-calc-fld input,.lw-calc-fld select{padding:12px 14px;border-radius:8px;border:1.5px solid var(--line);background:var(--bg);font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s}
.lw-calc-fld input:focus,.lw-calc-fld select:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--p-soft);background:#fff}
.lw-calc-check{display:flex;align-items:center;gap:9px;font-size:14.5px;color:var(--ink);padding-top:6px}
.lw-calc-result{margin:18px 12px 0;border-top:1px solid var(--line);padding-top:16px;display:flex;flex-direction:column;gap:10px}
.lw-calc-total{display:flex;align-items:center;justify-content:space-between;background:var(--p-soft);border:1px solid color-mix(in srgb,var(--p) 22%,#fff);border-radius:8px;padding:14px 16px}
.lw-calc-total span{font-weight:600;color:var(--ink)}
.lw-calc-total strong{font-size:1.5rem;color:var(--p)}
.lw-calc-total small{font-size:.8rem;color:var(--muted);font-weight:500}
.lw-calc-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:14.5px;color:var(--muted)}
.lw-calc-row strong{color:var(--ink)}
.lw-calc-row small{color:var(--gold);font-weight:600}
.lw-calc-note{background:var(--gold-soft);color:var(--p);border-radius:8px;padding:10px 14px;font-size:13.5px;justify-content:center}
.lw-calc-disc{margin:16px 12px 0;font-size:13px;color:var(--muted);text-align:center}
.lw-calc-cta{display:block;margin:14px 12px 8px;text-align:center}
/* footer */
.lw-footer{background:var(--p-d);color:#B7C0CE;padding:clamp(58px,7vw,88px) 0 34px;font-family:'Tajawal',sans-serif}
.lw-foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:42px}
.lw-foot-brand{min-width:240px}
.lw-foot-name{font-size:23px;color:#fff;font-family:inherit}
.lw-foot-brand p{font-size:15px;line-height:1.9;color:#94A0B2;margin:18px 0 18px;max-width:280px}
.lw-socs{display:flex;gap:10px}
.lw-socs a{display:grid;place-items:center;width:40px;height:40px;border-radius:8px;background:rgba(255,255,255,.08);color:var(--gold-l);border:1px solid rgba(255,255,255,.12);transition:background .2s,transform .2s}
.lw-socs a:hover{background:var(--gold);color:#1c1405;transform:translateY(-2px)}
.lw-foot-col h4{font-size:14.5px;font-weight:700;color:var(--gold-l);margin:0 0 16px}
.lw-foot-col a,.lw-foot-col span{display:block;color:#94A0B2;font-size:15px;margin-bottom:11px;transition:color .2s}
.lw-foot-col a:hover{color:#fff}
.lw-ltr{direction:ltr;text-align:right}
.lw-foot-cta{color:#1c1405!important;margin-top:4px}
.lw-foot-bottom{margin-top:46px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:13.5px;color:#6E7A8C}
@media(prefers-reduced-motion:reduce){.lw *{animation:none!important;transition:none!important}}
`;
