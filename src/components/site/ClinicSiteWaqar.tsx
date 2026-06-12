/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import type { ClinicContent } from "@/lib/clinic-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// "Waqar" clinic template — corporate-elegant. Deep navy + coral, color-blocked
// hero, Almarai (headings) + Tajawal (body). For premium medical groups /
// multi-specialty clinics. Data-driven from ClinicContent + the booking engine.

function waLink(num: string): string | null {
  const d = (num || "").replace(/[^\d]/g, "");
  return d.length >= 8 ? `https://wa.me/${d}` : null;
}
function socialHref(kind: string, raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, "");
  if (kind === "instagram") return `https://instagram.com/${h}`;
  if (kind === "snapchat") return `https://snapchat.com/add/${h}`;
  if (kind === "tiktok") return `https://tiktok.com/@${h}`;
  if (kind === "linkedin") return `https://www.linkedin.com/in/${h}`;
  return v;
}

const Svg = ({ d, s = 22, fill = false }: { d: string; s?: number; fill?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.split("|").map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const I = {
  cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  heart: "M12 20s-7-4.3-9.2-8.4C1.3 8.7 2.6 5.5 5.7 5.1 7.8 4.8 9.4 6 12 8.8 14.6 6 16.2 4.8 18.3 5.1c3.1.4 4.4 3.6 2.9 6.5C19 15.7 12 20 12 20z",
  pulse: "M3 12h4l2 6 4-14 2 8h6",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8z|M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7",
  tooth: "M8 3c-2.5 0-4 2-4 5 0 2 .6 3.4.9 6 .3 2.4.4 6 2.1 6 1.4 0 1.3-3 3-3s1.6 3 3 3c1.7 0 1.8-3.6 2.1-6 .3-2.6.9-4 .9-6 0-3-1.5-5-4-5-1.6 0-2 1-4 1s-2.4-1-4-1z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 100-6 3 3 0 000 6z",
  shield: "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z|M9.3 11.5l1.8 1.8 3.6-3.7",
  arrow: "M14 6l-6 6 6 6",
  plus: "M12 5v14|M5 12h14",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  mail: "M3 6h18v12H3z|M3 7l9 6 9-6",
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z|M12 11a2 2 0 100-4 2 2 0 000 4z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z",
  clock: "M12 7v5l3 2|M12 21a9 9 0 100-18 9 9 0 000 18z",
  check: "M5 12.5l4 4L19 7",
};
const SOC: Record<string, ReactElement> = {
  whatsapp: <Svg d="M12 3a9 9 0 00-7.7 13.5L3 21l4.6-1.2A9 9 0 1012 3z" s={17} />,
  instagram: <Svg d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z|M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" s={17} />,
  snapchat: <Svg d="M12 3c2.4 0 3.6 1.8 3.6 4.1 0 1 .1 1.7.1 1.9.3.6 1.2.4 1.6.6.5.2.4.7-.1 1-.6.3-1.4.4-1.5.9-.1.4.8 1.7 2.5 2.5.5.2.4.6 0 .8-.5.3-1.3.2-1.6.7-.2.4 0 .9-.6 1-.6.1-1.3-.4-2-.1-.8.3-1.3 1.1-2.5 1.1s-1.7-.8-2.5-1.1c-.7-.3-1.4.2-2 .1-.6-.1-.4-.6-.6-1-.3-.5-1.1-.4-1.6-.7-.4-.2-.5-.6 0-.8 1.7-.8 2.6-2.1 2.5-2.5-.1-.5-.9-.6-1.5-.9-.5-.3-.6-.8-.1-1 .4-.2 1.3 0 1.6-.6 0-.2.1-.9.1-1.9C8.4 4.8 9.6 3 12 3z" s={17} />,
  tiktok: <Svg d="M16 4c.3 2 1.6 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.5-1v5.4a5.3 5.3 0 11-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 102 2.5V4z" s={17} />,
  linkedin: <Svg d="M5 4a2 2 0 100 4 2 2 0 000-4z|M4 9h2v11H4z|M9 9h2v1.6a3 3 0 015 2.3V20h-2v-5a1.5 1.5 0 00-3 0v5H9z" s={17} />,
};
const SVC = [I.tooth, I.pulse, I.eye, I.heart, I.shield, I.user];

export default function ClinicSiteWaqar({
  content,
  slug,
  services = [],
  doctors = [],
}: {
  content: ClinicContent;
  slug: string;
  services?: BookingService[];
  doctors?: PublicDoctor[];
}) {
  const c = content;
  const v = c.visible;
  const wa = waLink(c.contact.whatsapp);
  const bookingServices: BookingService[] =
    services.length > 0
      ? services
      : c.specialties.items.map((s) => s.title).filter(Boolean).map((name) => ({ id: null, name }));
  const mapQ = c.contact.mapQuery?.trim();
  const mapSrc = mapQ ? `https://www.google.com/maps?q=${encodeURIComponent(mapQ)}&hl=ar&output=embed` : null;
  const two = (n: number) => String(n).padStart(2, "0");

  const socials = (
    [["whatsapp", wa ?? ""], ["instagram", c.contact.instagram], ["snapchat", c.contact.snapchat], ["tiktok", c.contact.tiktok], ["linkedin", c.contact.linkedin]] as const
  ).filter(([k, val]) => (k === "whatsapp" ? !!wa : val && val.trim())).map(([k, val]) => ({ k, href: k === "whatsapp" ? val : socialHref(k, val) }));

  const nav = [
    v.specialties && c.specialties.items.length > 0 && { href: "#services", label: "الخدمات" },
    v.doctors && doctors.length > 0 && { href: "#doctors", label: "الأطباء" },
    v.prices && c.prices.items.length > 0 && { href: "#pricing", label: "الأسعار" },
    v.faq && c.faq.items.length > 0 && { href: "#faq", label: "الأسئلة" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="wq" dir="rtl">
      <style>{WQ_CSS}</style>

      {/* NAV */}
      <nav className="wq-nav">
        <div className="wq-wrap wq-nav-in">
          <a href="#top" className="wq-brand">
            <span className={`wq-logo${c.brand.logo ? " wq-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.cross} s={18} fill />}</span>
            <span className="disp wq-brand-name">{c.brand.ar}</span>
          </a>
          <div className="wq-nav-links">{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <a href="#book" className="wq-btn wq-btn-sm">احجز موعد</a>
        </div>
      </nav>

      {/* HERO — navy color block */}
      <header id="top" className="wq-hero">
        <div className="wq-wrap wq-hero-grid">
          <div className="wq-hero-panel">
            <span className="wq-kicker"><span className="wq-kicker-line" />{c.hero.eyebrow}</span>
            <h1 className="disp wq-h1">{c.hero.title}</h1>
            <p className="wq-hero-sub">{c.hero.subtitle}</p>
            <div className="wq-hero-cta">
              <a href="#book" className="wq-btn wq-btn-lg">احجز موعدك <Svg d={I.arrow} s={18} /></a>
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="wq-btn wq-btn-ghost-light wq-btn-lg">تواصل واتساب</a>}
            </div>
            {c.hero.meta.length > 0 && (
              <div className="wq-hero-stats">
                {c.hero.meta.map((m, i) => (<div key={i} className="wq-hs"><span className="disp wq-hs-v">{m.value}</span><span className="wq-hs-l">{m.label}</span></div>))}
              </div>
            )}
          </div>
          <div className="wq-hero-media">
            <div className="wq-hero-frame">{c.hero.image ? <img src={c.hero.image} alt={c.brand.ar} /> : <div className="wq-hero-ph"><Svg d={I.cross} s={64} fill /></div>}</div>
            {c.stats.length > 0 && <div className="wq-hero-badge"><span className="disp wq-badge-v">{c.stats[c.stats.length - 1].value}{c.stats[c.stats.length - 1].suffix}</span><span className="wq-badge-l">{c.stats[c.stats.length - 1].label}</span></div>}
          </div>
        </div>
      </header>

      {/* HIGHLIGHTS */}
      {v.about && (
        <section className="wq-sec">
          <div className="wq-wrap wq-grid3">
            {[
              { d: I.heart, t: "رعاية تتمحور حولك", p: c.about.lead },
              { d: I.pulse, t: "أحدث التقنيات", p: "أجهزة من أحدث الأجيال لنتائج أدق وتعافٍ أسرع وأكثر أماناً." },
              { d: I.user, t: "نخبة الاستشاريين", p: "أمهر الأطباء وأصحاب الخبرات الطويلة في تخصصاتهم محلياً وعالمياً." },
            ].map((f, i) => (<div key={i} className="wq-feat"><span className="wq-feat-ic"><Svg d={f.d} s={24} /></span><h3 className="disp">{f.t}</h3><p>{f.p}</p></div>))}
          </div>
        </section>
      )}

      {/* SERVICES */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="services" className="wq-sec wq-sec-soft">
          <div className="wq-wrap">
            <div className="wq-head"><span className="wq-kicker wq-kicker-d"><span className="wq-kicker-line wq-line-d" />خدماتنا</span><h2 className="disp wq-h2">{c.specialties.title}</h2><p className="wq-lead">{c.specialties.lead}</p></div>
            <div className="wq-grid-auto">
              {c.specialties.items.map((s, i) => (<div key={i} className="wq-card"><div className="wq-card-top"><span className="disp wq-card-n">{two(i + 1)}</span><span className="wq-card-ic"><Svg d={SVC[i % SVC.length]} s={22} /></span></div><h3 className="disp">{s.title}</h3><p>{s.desc}</p><a href="#book" className="wq-card-link">احجز استشارة <Svg d={I.arrow} s={14} /></a></div>))}
            </div>
          </div>
        </section>
      )}

      {/* BEFORE/AFTER */}
      {v.results && c.results.items.length > 0 && (
        <section className="wq-sec">
          <div className="wq-wrap">
            <div className="wq-head"><span className="wq-kicker wq-kicker-d"><span className="wq-kicker-line wq-line-d" />نتائجنا</span><h2 className="disp wq-h2">{c.results.title}</h2><p className="wq-lead">{c.results.lead}</p></div>
            <div className="wq-grid2">
              {c.results.items.map((r, i) => (<div key={i} className="wq-ba-card"><div className="wq-ba"><div className="wq-ba-cell"><span className="wq-ba-tag">قبل</span>{r.before ? <img src={r.before} alt="قبل" /> : <div className="wq-ba-ph" />}</div><div className="wq-ba-cell"><span className="wq-ba-tag wq-ba-after">بعد</span>{r.after ? <img src={r.after} alt="بعد" /> : <div className="wq-ba-ph" />}</div></div><h3 className="disp wq-ba-title">{r.title}</h3></div>))}
            </div>
          </div>
        </section>
      )}

      {/* STATS (navy band) */}
      {v.stats && c.stats.length > 0 && (
        <section className="wq-stats">
          <div className="wq-wrap wq-stats-in">
            {c.stats.map((s, i) => (<div key={i} className="wq-stat"><div className="disp wq-stat-v">{s.value}{s.suffix}</div><div className="wq-stat-l">{s.label}</div></div>))}
          </div>
        </section>
      )}

      {/* DOCTORS */}
      {v.doctors && doctors.length > 0 && (
        <section id="doctors" className="wq-sec wq-sec-soft">
          <div className="wq-wrap">
            <div className="wq-head"><span className="wq-kicker wq-kicker-d"><span className="wq-kicker-line wq-line-d" />فريقنا</span><h2 className="disp wq-h2">{c.doctors.title}</h2><p className="wq-lead">{c.doctors.lead}</p></div>
            <div className="wq-grid-auto">
              {doctors.map((d) => (<div key={d.id} className="wq-doc"><div className="wq-doc-img">{d.image ? <img src={d.image} alt={d.name} /> : <div className="wq-doc-ph"><Svg d={I.user} s={42} /></div>}</div><div className="wq-doc-body"><h3 className="disp">{d.name}</h3>{d.specialty && <span className="wq-doc-spec">{d.specialty}</span>}</div></div>))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {v.process && c.process.length > 0 && (
        <section className="wq-sec">
          <div className="wq-wrap">
            <div className="wq-head"><span className="wq-kicker wq-kicker-d"><span className="wq-kicker-line wq-line-d" />التجربة</span><h2 className="disp wq-h2">رحلة العناية</h2></div>
            <div className="wq-grid-auto">
              {c.process.map((p, i) => (<div key={i} className="wq-step"><span className="disp wq-step-n">{two(i + 1)}</span><h3 className="disp">{p.title}</h3><p>{p.desc}</p></div>))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      {v.prices && c.prices.items.length > 0 && (
        <section id="pricing" className="wq-sec wq-sec-soft">
          <div className="wq-wrap">
            <div className="wq-head wq-head-center"><span className="wq-kicker wq-kicker-d"><span className="wq-kicker-line wq-line-d" />الأسعار</span><h2 className="disp wq-h2">أسعار واضحة وشفافة</h2><p className="wq-lead">{c.prices.lead}</p></div>
            <div className="wq-grid-auto">
              {c.prices.items.map((p, i) => (<div key={i} className="wq-price"><h3 className="disp">{p.name}</h3>{p.note && <p className="wq-price-note">{p.note}</p>}<div className="wq-price-v"><span className="disp">{p.price}</span><span className="wq-price-u">{c.prices.unit}</span></div><a href="#book" className="wq-btn wq-btn-outline wq-price-btn">احجز الآن</a></div>))}
            </div>
            <p className="wq-fine">{c.prices.note}</p>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="wq-sec">
          <div className="wq-wrap">
            <div className="wq-head wq-head-center"><span className="wq-kicker wq-kicker-d"><span className="wq-kicker-line wq-line-d" />آراء المرضى</span><h2 className="disp wq-h2">ماذا قالوا عنّا</h2></div>
            <div className="wq-grid-auto">
              {c.testimonials.map((t, i) => (<figure key={i} className="wq-quote"><div className="wq-stars">{[0, 1, 2, 3, 4].map((s) => <Svg key={s} d={I.star} s={15} fill />)}</div><blockquote>«{t.quote}»</blockquote><figcaption><span className="disp wq-av">{t.name.trim().charAt(0)}</span><div><strong>{t.name}</strong><span>{t.role}</span></div></figcaption></figure>))}
            </div>
          </div>
        </section>
      )}

      {/* CREDENTIALS */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="wq-sec wq-sec-soft wq-cred-sec">
          <div className="wq-wrap"><p className="wq-lead wq-cred-lead">{c.credentials.lead}</p><div className="wq-creds">{c.credentials.badges.map((b, i) => (<div key={i} className="wq-cred"><span className="wq-cred-ic"><Svg d={I.shield} s={20} /></span><div><div className="disp wq-cred-v">{b.value}</div><div className="wq-cred-l">{b.label}</div></div></div>))}</div></div>
        </section>
      )}

      {/* FAQ */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="wq-sec">
          <div className="wq-wrap wq-faq">
            <div className="wq-head wq-head-center"><span className="wq-kicker wq-kicker-d"><span className="wq-kicker-line wq-line-d" />الأسئلة الشائعة</span><h2 className="disp wq-h2">كل ما تودّ معرفته</h2></div>
            {c.faq.items.map((f, i) => (<details key={i} className="wq-faq-item"><summary>{f.q}<span className="wq-faq-plus"><Svg d={I.plus} s={18} /></span></summary><p>{f.a}</p></details>))}
          </div>
        </section>
      )}

      {/* BOOKING */}
      {v.booking && (
        <section id="book" className="wq-sec wq-sec-soft">
          <div className="wq-wrap wq-book-wrap">
            <div className="wq-book">
              <div className="wq-book-head">
                <span className="wq-kicker"><span className="wq-kicker-line" />{c.booking.title}</span>
                <h2 className="disp wq-book-h">{c.booking.lead}</h2>
                <div className="wq-book-chips">
                  <a className="wq-bchip" href={`tel:${c.contact.phone}`}><Svg d={I.phone} s={15} /><span dir="ltr">{c.contact.phone}</span></a>
                  <span className="wq-bchip"><Svg d={I.pin} s={15} />{c.contact.office}</span>
                </div>
              </div>
              <div className="wq-book-body">
                <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
                <p className="wq-book-note">{c.booking.note}</p>
              </div>
            </div>
            {mapSrc && <div className="wq-map"><iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="wq-footer">
        <div className="wq-wrap wq-foot-grid">
          <div className="wq-foot-brand">
            <div className="wq-brand"><span className={`wq-logo${c.brand.logo ? " wq-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.cross} s={16} fill />}</span><span className="disp wq-foot-name">{c.brand.ar}</span></div>
            <p>{c.about.lead}</p>
            {socials.length > 0 && <div className="wq-socs">{socials.map((s) => <a key={s.k} href={s.href} target="_blank" rel="noreferrer" aria-label={s.k}>{SOC[s.k]}</a>)}</div>}
          </div>
          <div className="wq-foot-col"><h4>روابط</h4>{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <div className="wq-foot-col"><h4>تواصل</h4><a href={`tel:${c.contact.phone}`} dir="ltr" className="wq-ltr">{c.contact.phone}</a><a href={`mailto:${c.contact.email}`} dir="ltr" className="wq-ltr">{c.contact.email}</a><span>{c.contact.office}</span></div>
          <div className="wq-foot-col"><h4>أوقات العمل</h4><span>{c.contact.phoneNote || "يومياً · 9ص – 11م"}</span><a href="#book" className="wq-btn wq-btn-sm wq-foot-cta">احجز موعد</a></div>
        </div>
        <div className="wq-wrap wq-foot-bottom"><span>© {c.brand.ar} — جميع الحقوق محفوظة</span><span className="wq-foot-by">صُمم عبر منصة وجود</span></div>
      </footer>
    </div>
  );
}

const WQ_CSS = `
.wq{
  --bg:#FFFFFF;--bg2:#F2F5F9;--ink:#13283F;--muted:#5C6B82;--line:#E3E9F1;--card:#fff;
  --navy:#1B3A5B;--navy-d:#122A45;--navy2:#2A5580;--navy-soft:#EAF0F6;
  --coral:#F0654B;--coral-d:#D8492E;--coral-soft:#FDEAE5;--coral-ink:#B23B26;
  --s1:0 6px 18px -8px rgba(19,40,63,.16);--s2:0 20px 46px -22px rgba(19,40,63,.26);--s3:0 36px 80px -34px rgba(19,40,63,.4);
  background:var(--bg);color:var(--ink);font-family:'Tajawal',system-ui,sans-serif;line-height:1.85;-webkit-font-smoothing:antialiased;
}
.wq *{box-sizing:border-box}
.wq a{text-decoration:none}
:where(.wq) a{color:inherit}
.wq .disp{font-family:'Almarai','Tajawal',sans-serif;font-weight:800;letter-spacing:-.01em}
.wq-wrap{max-width:1200px;margin:0 auto;padding:0 clamp(20px,5vw,56px)}
.wq-sec{padding:clamp(70px,8vw,116px) 0}
.wq-sec-soft{background:var(--bg2)}
/* buttons */
.wq-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 26px;border-radius:12px;background:var(--coral);color:#fff;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 12px 26px -12px rgba(240,101,75,.6);transition:transform .25s,background .25s,box-shadow .25s}
.wq-btn:hover{transform:translateY(-2px);background:var(--coral-d);box-shadow:0 18px 34px -12px rgba(240,101,75,.7)}
.wq-btn-sm{padding:10px 20px;font-size:14px;box-shadow:none}
.wq-btn-lg{padding:15px 30px;font-size:16.5px}
.wq-btn-ghost-light{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.4);box-shadow:none}
.wq-btn-ghost-light:hover{background:rgba(255,255,255,.12);border-color:#fff}
.wq-btn-outline{background:transparent;color:var(--navy);border:1.5px solid rgba(27,58,91,.28);box-shadow:none}
.wq-btn-outline:hover{background:var(--navy);color:#fff;border-color:var(--navy);transform:none}
/* nav */
.wq-nav{position:fixed;top:0;right:0;left:0;z-index:50;background:rgba(255,255,255,.86);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.wq-nav-in{display:flex;align-items:center;gap:24px;height:74px}
.wq-brand{display:flex;align-items:center;gap:11px}
.wq-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:11px;background:var(--navy);color:#fff;overflow:hidden}
.wq-logo-img{background:#fff;border:1px solid var(--line)}
.wq-logo-img img{width:100%;height:100%;object-fit:contain}
.wq-brand-name{font-size:21px;color:var(--ink)}
.wq-nav-links{display:flex;gap:6px;margin-inline-start:auto;font-size:15px;color:var(--muted);font-weight:600}
.wq-nav-links a{padding:8px 14px;border-radius:9px;transition:color .2s,background .2s}
.wq-nav-links a:hover{color:var(--navy);background:var(--navy-soft)}
@media(max-width:840px){.wq-nav-links{display:none}}
/* kicker */
.wq-kicker{display:inline-flex;align-items:center;gap:11px;font-size:13px;font-weight:700;letter-spacing:.1em;color:#fff;text-transform:uppercase}
.wq-kicker-line{width:30px;height:2px;background:var(--coral);border-radius:2px}
.wq-kicker-d{color:var(--coral-ink)}
.wq-line-d{background:var(--coral)}
/* hero color block */
.wq-hero{padding:118px 0 80px}
.wq-hero-grid{display:grid;grid-template-columns:1.06fr .94fr;gap:clamp(24px,3vw,40px);align-items:stretch}
@media(max-width:920px){.wq-hero-grid{grid-template-columns:1fr}}
.wq-hero-panel{background:linear-gradient(155deg,var(--navy),var(--navy-d));color:#fff;border-radius:30px;padding:clamp(36px,4vw,58px);display:flex;flex-direction:column;justify-content:center;box-shadow:var(--s3)}
.wq-h1{font-size:clamp(38px,5vw,64px);line-height:1.14;margin:22px 0 0;color:#fff}
.wq-hero-sub{font-size:clamp(16px,1.3vw,19px);line-height:1.9;color:rgba(255,255,255,.82);max-width:520px;margin:22px 0 0}
.wq-hero-cta{display:flex;flex-wrap:wrap;gap:13px;margin-top:32px}
.wq-hero-stats{display:flex;flex-wrap:wrap;gap:clamp(22px,3vw,42px);margin-top:40px;padding-top:28px;border-top:1px solid rgba(255,255,255,.16)}
.wq-hs-v{font-size:34px;color:var(--coral);line-height:1;display:block}
.wq-hs-l{font-size:14px;color:rgba(255,255,255,.7);margin-top:4px;display:block}
.wq-hero-media{position:relative;border-radius:30px;overflow:hidden;box-shadow:var(--s3)}
.wq-hero-media>.wq-hero-frame{height:100%}
.wq-hero-frame{min-height:380px;height:100%}
.wq-hero-frame img{display:block;width:100%;height:100%;min-height:380px;object-fit:cover}
.wq-hero-ph{display:grid;place-items:center;width:100%;height:100%;min-height:380px;background:linear-gradient(150deg,var(--navy2),var(--navy-d));color:rgba(255,255,255,.4)}
.wq-hero-badge{position:absolute;bottom:24px;right:24px;display:flex;flex-direction:column;align-items:center;padding:16px 24px;border-radius:14px;background:var(--coral);color:#fff;box-shadow:0 18px 40px -18px rgba(240,101,75,.7)}
.wq-badge-v{font-size:30px;line-height:1}
.wq-badge-l{font-size:12.5px;margin-top:3px;opacity:.92}
/* heads */
.wq-head{max-width:620px;margin:0 0 50px}
.wq-head-center{margin-left:auto;margin-right:auto;text-align:center}
.wq-h2{font-size:clamp(30px,4.2vw,50px);line-height:1.16;margin:14px 0 0;color:var(--ink)}
.wq-lead{font-size:18px;line-height:1.9;color:var(--muted);margin:16px 0 0}
.wq-head-center .wq-lead{margin-left:auto;margin-right:auto;max-width:560px}
/* grids */
.wq-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px}
.wq-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,360px));gap:22px;justify-content:center}
.wq-grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,520px));gap:22px;justify-content:center}
/* features */
.wq-feat{padding:32px 28px;border-radius:18px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s}
.wq-feat:hover{transform:translateY(-6px);box-shadow:var(--s2)}
.wq-feat-ic{display:grid;place-items:center;width:54px;height:54px;border-radius:14px;background:var(--coral-soft);color:var(--coral)}
.wq-feat h3{font-size:21px;margin:18px 0 8px;color:var(--ink)}
.wq-feat p{font-size:15.5px;line-height:1.85;color:var(--muted);margin:0}
/* services */
.wq-card{padding:30px 26px;border-radius:18px;background:var(--card);border:1px solid var(--line);border-top:3px solid var(--navy);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s,border-top-color .3s}
.wq-card:hover{transform:translateY(-6px);box-shadow:var(--s2);border-top-color:var(--coral)}
.wq-card-top{display:flex;align-items:center;justify-content:space-between}
.wq-card-n{font-size:26px;color:var(--navy-soft);-webkit-text-stroke:1px var(--navy2)}
.wq-card-ic{display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:var(--navy);color:#fff}
.wq-card h3{font-size:21px;margin:16px 0 8px;color:var(--ink)}
.wq-card p{font-size:15px;line-height:1.8;color:var(--muted);margin:0 0 14px}
.wq-card-link{display:inline-flex;align-items:center;gap:6px;color:var(--coral-ink);font-weight:700;font-size:14.5px}
/* before/after */
.wq-ba-card{padding:14px;border-radius:18px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.wq-ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.wq-ba-cell{position:relative;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:var(--bg2)}
.wq-ba-cell img{width:100%;height:100%;object-fit:cover}
.wq-ba-ph{width:100%;height:100%;background:repeating-linear-gradient(45deg,#e7edf4,#e7edf4 10px,#dfe7f0 10px,#dfe7f0 20px)}
.wq-ba-tag{position:absolute;top:10px;right:10px;z-index:2;background:rgba(19,40,63,.78);color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:999px}
.wq-ba-after{background:var(--coral)}
.wq-ba-title{text-align:center;font-size:20px;margin:14px 0 6px;color:var(--ink)}
/* stats navy band */
.wq-stats{background:linear-gradient(135deg,var(--navy),var(--navy-d));padding:clamp(54px,6vw,84px) 0}
.wq-stats-in{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;text-align:center}
.wq-stat-v{font-size:clamp(42px,5vw,60px);color:var(--coral);line-height:1}
.wq-stat-l{color:rgba(255,255,255,.78);font-size:15px;margin-top:6px}
/* doctors */
.wq-doc{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:var(--s1);transition:transform .3s,box-shadow .3s}
.wq-doc:hover{transform:translateY(-6px);box-shadow:var(--s2)}
.wq-doc-img{height:300px;background:var(--bg2)}
.wq-doc-img img{width:100%;height:100%;object-fit:cover}
.wq-doc-ph{display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(150deg,var(--navy2),var(--navy-d));color:rgba(255,255,255,.5)}
.wq-doc-body{padding:22px 24px 26px}
.wq-doc-body h3{font-size:21px;margin:0 0 6px;color:var(--ink)}
.wq-doc-spec{display:inline-block;font-size:13.5px;color:var(--coral-ink);background:var(--coral-soft);padding:4px 14px;border-radius:999px}
/* process */
.wq-step{background:#fff;border:1px solid var(--line);border-radius:18px;padding:30px}
.wq-step-n{font-size:32px;color:var(--coral)}
.wq-step h3{font-size:20px;margin:10px 0 6px;color:var(--ink)}
.wq-step p{font-size:14.5px;color:var(--muted);margin:0;line-height:1.8}
/* pricing */
.wq-price{display:flex;flex-direction:column;padding:34px 30px;border-radius:18px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.wq-price h3{font-size:22px;margin:0;color:var(--ink)}
.wq-price-note{font-size:14px;color:var(--muted);margin:6px 0 0}
.wq-price-v{display:flex;align-items:baseline;gap:7px;margin:18px 0 22px}
.wq-price-v .disp{font-size:42px;color:var(--navy)}
.wq-price-u{color:var(--muted);font-size:15px}
.wq-price-btn{margin-top:auto}
.wq-fine{text-align:center;font-size:14px;color:var(--muted);margin:28px 0 0}
/* testimonials */
.wq-quote{margin:0;padding:28px;border-radius:18px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.wq-stars{display:flex;gap:3px;color:#F5A524;margin-bottom:14px}
.wq-quote blockquote{margin:0 0 18px;font-size:15.5px;line-height:1.85;color:var(--ink)}
.wq-quote figcaption{display:flex;align-items:center;gap:12px}
.wq-av{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--navy);color:#fff;font-size:18px}
.wq-quote figcaption strong{display:block;color:var(--ink)}
.wq-quote figcaption span{color:var(--muted);font-size:13.5px}
/* credentials */
.wq-cred-sec{padding:clamp(46px,6vw,72px) 0}
.wq-cred-lead{text-align:center;margin:0 auto 26px;max-width:560px}
.wq-creds{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.wq-cred{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 22px;box-shadow:var(--s1);min-width:220px}
.wq-cred-ic{flex:none;display:grid;place-items:center;width:42px;height:42px;border-radius:11px;background:var(--navy-soft);color:var(--navy)}
.wq-cred-v{font-size:18px;color:var(--ink)}
.wq-cred-l{font-size:13px;color:var(--muted)}
/* faq */
.wq-faq{max-width:800px}
.wq-faq-item{background:#fff;border:1px solid var(--line);border-radius:14px;padding:4px 24px;margin-bottom:12px;box-shadow:var(--s1)}
.wq-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:19px 0;font-weight:700;font-size:17px;cursor:pointer;list-style:none;color:var(--ink)}
.wq-faq-item summary::-webkit-details-marker{display:none}
.wq-faq-plus{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--coral-soft);color:var(--coral);transition:transform .25s}
.wq-faq-item[open] .wq-faq-plus{transform:rotate(135deg)}
.wq-faq-item p{font-size:15.5px;line-height:1.9;color:var(--muted);margin:0 0 19px}
/* booking */
.wq-book-wrap{max-width:780px}
.wq-book{border-radius:24px;overflow:hidden;box-shadow:var(--s3);border:1px solid var(--line);background:#fff}
.wq-book-head{background:linear-gradient(135deg,var(--navy),var(--navy-d));color:#fff;padding:36px 34px 32px;text-align:center}
.wq-book-head .wq-kicker{justify-content:center}
.wq-book-h{font-size:clamp(26px,3.4vw,38px);color:#fff;margin:14px 0 0}
.wq-book-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:18px}
.wq-bchip{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:999px;background:rgba(255,255,255,.12);font-size:14px}
.wq-book-body{padding:30px 34px 34px}
.wq-book-note{text-align:center;color:var(--muted);font-size:14px;margin:16px 0 0}
.wq-map{margin-top:24px;border-radius:18px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/6;box-shadow:var(--s2)}
.wq-map iframe{width:100%;height:100%;border:0}
/* booking form */
.wq-book-body .cl-form{display:flex;flex-direction:column;gap:16px}
.wq-book-body .cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.wq-book-body .cl-fld{display:flex;flex-direction:column;gap:7px}
.wq-book-body .cl-fld label{font-size:14px;font-weight:600;color:var(--ink)}
.wq-book-body .cl-fld input,.wq-book-body .cl-fld select,.wq-book-body .cl-fld textarea{width:100%;padding:13px 15px;border-radius:11px;border:1.5px solid var(--line);background:var(--bg2);font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s}
.wq-book-body .cl-fld input:focus,.wq-book-body .cl-fld select:focus,.wq-book-body .cl-fld textarea:focus{border-color:var(--navy);box-shadow:0 0 0 4px var(--navy-soft);background:#fff}
.wq-book-body .cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.wq-book-body .cl-slot{padding:9px 15px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg2);font:inherit;cursor:pointer;color:var(--ink);font-size:14.5px;transition:all .18s}
.wq-book-body .cl-slot:hover{border-color:var(--navy)}
.wq-book-body .cl-slot-on{background:var(--navy);color:#fff;border-color:var(--navy)}
.wq-book-body .cl-slots-msg{color:var(--muted);font-size:14px;margin:0}
.wq-book-body .cl-btn{margin-top:4px;width:100%;padding:15px;border-radius:12px;border:none;background:var(--coral);color:#fff;font-weight:700;font-size:16.5px;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -14px rgba(240,101,75,.7);transition:transform .22s,background .22s}
.wq-book-body .cl-btn:hover{transform:translateY(-2px);background:var(--coral-d)}
/* footer */
.wq-footer{background:var(--navy-d);color:#A8B9CC;padding:clamp(58px,7vw,88px) 0 34px}
.wq-foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:42px}
.wq-foot-brand{min-width:240px}
.wq-foot-name{font-size:23px;color:#fff}
.wq-foot-brand p{font-size:15px;line-height:1.9;color:#8599B0;margin:18px 0 18px;max-width:280px}
.wq-socs{display:flex;gap:10px}
.wq-socs a{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);transition:background .2s,transform .2s}
.wq-socs a:hover{background:var(--coral);border-color:var(--coral);transform:translateY(-2px)}
.wq-foot-col h4{font-size:14.5px;font-weight:700;color:#fff;margin:0 0 16px}
.wq-foot-col a,.wq-foot-col span{display:block;color:#8599B0;font-size:15px;margin-bottom:11px;transition:color .2s}
.wq-foot-col a:hover{color:#fff}
.wq-ltr{direction:ltr;text-align:right}
.wq-foot-cta{color:#fff!important;margin-top:4px}
.wq-foot-bottom{margin-top:46px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:13.5px;color:#6E8298}
@media(prefers-reduced-motion:reduce){.wq *{animation:none!important;transition:none!important}}
`;
