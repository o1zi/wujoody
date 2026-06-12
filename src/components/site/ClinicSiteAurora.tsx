/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import type { ClinicContent } from "@/lib/clinic-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// "Ofuq" (Aurora) clinic template — modern bold. Aurora violet/blue gradients,
// glassmorphism, bento highlights. Cairo (headings) + Tajawal (body).
// Data-driven from ClinicContent + the live booking engine.

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
  spark: "M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3z",
  pulse: "M3 12h4l2 6 4-14 2 8h6",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8z|M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7",
  heart: "M12 20s-7-4.3-9.2-8.4C1.3 8.7 2.6 5.5 5.7 5.1 7.8 4.8 9.4 6 12 8.8 14.6 6 16.2 4.8 18.3 5.1c3.1.4 4.4 3.6 2.9 6.5C19 15.7 12 20 12 20z",
  shield: "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z|M9.3 11.5l1.8 1.8 3.6-3.7",
  tooth: "M8 3c-2.5 0-4 2-4 5 0 2 .6 3.4.9 6 .3 2.4.4 6 2.1 6 1.4 0 1.3-3 3-3s1.6 3 3 3c1.7 0 1.8-3.6 2.1-6 .3-2.6.9-4 .9-6 0-3-1.5-5-4-5-1.6 0-2 1-4 1s-2.4-1-4-1z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 100-6 3 3 0 000 6z",
  arrow: "M14 6l-6 6 6 6",
  plus: "M12 5v14|M5 12h14",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
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
const SVC = [I.tooth, I.spark, I.eye, I.heart, I.pulse, I.user];

export default function ClinicSiteAurora({
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
    <div className="ao" dir="rtl">
      <style>{AO_CSS}</style>

      {/* NAV */}
      <nav className="ao-nav">
        <div className="ao-wrap ao-nav-in">
          <a href="#top" className="ao-brand">
            <span className={`ao-logo${c.brand.logo ? " ao-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.spark} s={18} fill />}</span>
            <span className="disp ao-brand-name">{c.brand.ar}</span>
          </a>
          <div className="ao-nav-links">{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <a href="#book" className="ao-btn ao-btn-sm">احجز موعد</a>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="ao-hero">
        <span className="ao-aurora" aria-hidden="true" />
        <div className="ao-wrap ao-hero-in">
          <span className="ao-chip"><span className="ao-chip-dot" />{c.hero.eyebrow}</span>
          <h1 className="disp ao-h1">{c.hero.title}</h1>
          <p className="ao-hero-sub">{c.hero.subtitle}</p>
          <div className="ao-hero-cta">
            <a href="#book" className="ao-btn ao-btn-lg">احجز موعدك <Svg d={I.arrow} s={18} /></a>
            {v.specialties && <a href="#services" className="ao-btn ao-btn-glass ao-btn-lg">خدماتنا</a>}
          </div>
        </div>
        {(c.hero.image || c.hero.meta.length > 0) && (
          <div className="ao-wrap ao-hero-media">
            <div className="ao-hero-frame">
              {c.hero.image ? <img src={c.hero.image} alt={c.brand.ar} /> : <div className="ao-hero-ph"><Svg d={I.spark} s={64} fill /></div>}
            </div>
            {c.hero.meta.length > 0 && (
              <div className="ao-hero-meta">
                {c.hero.meta.map((m, i) => (<div key={i} className="ao-glass ao-meta"><span className="disp grad ao-meta-v">{m.value}</span><span className="ao-meta-l">{m.label}</span></div>))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* HIGHLIGHTS (bento) */}
      {v.about && (
        <section className="ao-sec">
          <div className="ao-wrap ao-bento">
            <div className="ao-feat ao-feat-lead">
              <span className="ao-feat-ic ao-ic-light"><Svg d={I.heart} s={26} /></span>
              <h3 className="disp">رعاية تتمحور حولك</h3>
              <p>{c.about.lead}</p>
            </div>
            <div className="ao-feat">
              <span className="ao-feat-ic"><Svg d={I.spark} s={24} /></span>
              <h3 className="disp">أحدث التقنيات</h3>
              <p>أجهزة من أحدث الأجيال لنتائج أدق وتعافٍ أسرع.</p>
            </div>
            <div className="ao-feat">
              <span className="ao-feat-ic"><Svg d={I.user} s={24} /></span>
              <h3 className="disp">نخبة الاستشاريين</h3>
              <p>أمهر الأطباء وأصحاب الخبرات الطويلة في تخصصاتهم.</p>
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="services" className="ao-sec">
          <div className="ao-wrap">
            <div className="ao-head ao-head-center"><span className="ao-kicker">خدماتنا</span><h2 className="disp ao-h2">{c.specialties.title}</h2><p className="ao-lead">{c.specialties.lead}</p></div>
            <div className="ao-grid-auto">
              {c.specialties.items.map((s, i) => (<div key={i} className="ao-card"><span className="ao-card-ic"><Svg d={SVC[i % SVC.length]} s={24} /></span><h3 className="disp">{s.title}</h3><p>{s.desc}</p><a href="#book" className="ao-card-link">احجز استشارة <Svg d={I.arrow} s={14} /></a></div>))}
            </div>
          </div>
        </section>
      )}

      {/* BEFORE/AFTER */}
      {v.results && c.results.items.length > 0 && (
        <section className="ao-sec">
          <div className="ao-wrap">
            <div className="ao-head ao-head-center"><span className="ao-kicker">نتائجنا</span><h2 className="disp ao-h2">{c.results.title}</h2><p className="ao-lead">{c.results.lead}</p></div>
            <div className="ao-grid2">
              {c.results.items.map((r, i) => (<div key={i} className="ao-ba-card"><div className="ao-ba"><div className="ao-ba-cell"><span className="ao-ba-tag">قبل</span>{r.before ? <img src={r.before} alt="قبل" /> : <div className="ao-ba-ph" />}</div><div className="ao-ba-cell"><span className="ao-ba-tag ao-ba-after">بعد</span>{r.after ? <img src={r.after} alt="بعد" /> : <div className="ao-ba-ph" />}</div></div><h3 className="disp ao-ba-title">{r.title}</h3></div>))}
            </div>
          </div>
        </section>
      )}

      {/* STATS (gradient band) */}
      {v.stats && c.stats.length > 0 && (
        <section className="ao-sec">
          <div className="ao-wrap">
            <div className="ao-stats">
              {c.stats.map((s, i) => (<div key={i} className="ao-stat"><div className="disp ao-stat-v">{s.value}{s.suffix}</div><div className="ao-stat-l">{s.label}</div></div>))}
            </div>
          </div>
        </section>
      )}

      {/* DOCTORS */}
      {v.doctors && doctors.length > 0 && (
        <section id="doctors" className="ao-sec">
          <div className="ao-wrap">
            <div className="ao-head ao-head-center"><span className="ao-kicker">فريقنا</span><h2 className="disp ao-h2">{c.doctors.title}</h2><p className="ao-lead">{c.doctors.lead}</p></div>
            <div className="ao-grid-auto">
              {doctors.map((d) => (<div key={d.id} className="ao-doc"><div className="ao-doc-ring"><div className="ao-doc-img">{d.image ? <img src={d.image} alt={d.name} /> : <div className="ao-doc-ph"><Svg d={I.user} s={42} /></div>}</div></div><h3 className="disp">{d.name}</h3>{d.specialty && <span className="ao-doc-spec">{d.specialty}</span>}</div>))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {v.process && c.process.length > 0 && (
        <section className="ao-sec">
          <div className="ao-wrap">
            <div className="ao-head ao-head-center"><span className="ao-kicker">التجربة</span><h2 className="disp ao-h2">رحلة العناية</h2></div>
            <div className="ao-grid-auto">
              {c.process.map((p, i) => (<div key={i} className="ao-step"><span className="disp grad ao-step-n">{String(i + 1).padStart(2, "0")}</span><h3 className="disp">{p.title}</h3><p>{p.desc}</p></div>))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      {v.prices && c.prices.items.length > 0 && (
        <section id="pricing" className="ao-sec">
          <div className="ao-wrap">
            <div className="ao-head ao-head-center"><span className="ao-kicker">الأسعار</span><h2 className="disp ao-h2">باقات عناية واضحة</h2><p className="ao-lead">{c.prices.lead}</p></div>
            <div className="ao-grid-auto">
              {c.prices.items.map((p, i) => (<div key={i} className="ao-price"><h3 className="disp">{p.name}</h3>{p.note && <p className="ao-price-note">{p.note}</p>}<div className="ao-price-v"><span className="disp grad">{p.price}</span><span className="ao-price-u">{c.prices.unit}</span></div><a href="#book" className="ao-btn ao-btn-glass ao-price-btn">احجز الآن</a></div>))}
            </div>
            <p className="ao-fine">{c.prices.note}</p>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="ao-sec">
          <div className="ao-wrap">
            <div className="ao-head ao-head-center"><span className="ao-kicker">آراء المرضى</span><h2 className="disp ao-h2">ماذا قالوا عنّا</h2></div>
            <div className="ao-grid-auto">
              {c.testimonials.map((t, i) => (<figure key={i} className="ao-quote"><div className="ao-stars">{[0, 1, 2, 3, 4].map((s) => <Svg key={s} d={I.star} s={15} fill />)}</div><blockquote>«{t.quote}»</blockquote><figcaption><span className="disp ao-av">{t.name.trim().charAt(0)}</span><div><strong>{t.name}</strong><span>{t.role}</span></div></figcaption></figure>))}
            </div>
          </div>
        </section>
      )}

      {/* CREDENTIALS */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="ao-sec ao-cred-sec">
          <div className="ao-wrap"><p className="ao-lead ao-cred-lead">{c.credentials.lead}</p><div className="ao-creds">{c.credentials.badges.map((b, i) => (<div key={i} className="ao-cred"><span className="ao-cred-ic"><Svg d={I.shield} s={20} /></span><div><div className="disp ao-cred-v">{b.value}</div><div className="ao-cred-l">{b.label}</div></div></div>))}</div></div>
        </section>
      )}

      {/* FAQ */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="ao-sec">
          <div className="ao-wrap ao-faq">
            <div className="ao-head ao-head-center"><span className="ao-kicker">الأسئلة الشائعة</span><h2 className="disp ao-h2">كل ما تودّ معرفته</h2></div>
            {c.faq.items.map((f, i) => (<details key={i} className="ao-faq-item"><summary>{f.q}<span className="ao-faq-plus"><Svg d={I.plus} s={18} /></span></summary><p>{f.a}</p></details>))}
          </div>
        </section>
      )}

      {/* BOOKING */}
      {v.booking && (
        <section id="book" className="ao-sec">
          <div className="ao-wrap ao-book-wrap">
            <div className="ao-book">
              <div className="ao-book-head">
                <span className="ao-aurora ao-aurora-b" aria-hidden="true" />
                <span className="ao-chip ao-chip-light"><span className="ao-chip-dot ao-dot-light" />{c.booking.title}</span>
                <h2 className="disp ao-book-h">{c.booking.lead}</h2>
                <div className="ao-book-chips">
                  <a className="ao-bchip" href={`tel:${c.contact.phone}`}><Svg d={I.phone} s={15} /><span dir="ltr">{c.contact.phone}</span></a>
                  <span className="ao-bchip"><Svg d={I.pin} s={15} />{c.contact.office}</span>
                </div>
              </div>
              <div className="ao-book-body">
                <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
                <p className="ao-book-note">{c.booking.note}</p>
              </div>
            </div>
            {mapSrc && <div className="ao-map"><iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="ao-footer">
        <span className="ao-aurora ao-aurora-f" aria-hidden="true" />
        <div className="ao-wrap ao-foot-grid">
          <div className="ao-foot-brand">
            <div className="ao-brand"><span className={`ao-logo${c.brand.logo ? " ao-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.spark} s={16} fill />}</span><span className="disp ao-foot-name">{c.brand.ar}</span></div>
            <p>{c.about.lead}</p>
            {socials.length > 0 && <div className="ao-socs">{socials.map((s) => <a key={s.k} href={s.href} target="_blank" rel="noreferrer" aria-label={s.k}>{SOC[s.k]}</a>)}</div>}
          </div>
          <div className="ao-foot-col"><h4>روابط</h4>{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <div className="ao-foot-col"><h4>تواصل</h4><a href={`tel:${c.contact.phone}`} dir="ltr" className="ao-ltr">{c.contact.phone}</a><a href={`mailto:${c.contact.email}`} dir="ltr" className="ao-ltr">{c.contact.email}</a><span>{c.contact.office}</span></div>
          <div className="ao-foot-col"><h4>أوقات العمل</h4><span>{c.contact.phoneNote || "يومياً · 9ص – 11م"}</span><a href="#book" className="ao-btn ao-btn-sm ao-foot-cta">احجز موعد</a></div>
        </div>
        <div className="ao-wrap ao-foot-bottom"><span>© {c.brand.ar} — جميع الحقوق محفوظة</span><span className="ao-foot-by">صُمم عبر منصة وجود</span></div>
      </footer>
    </div>
  );
}

const AO_CSS = `
.ao{
  --bg:#FBFBFE;--bg2:#F4F3FC;--ink:#1A1530;--muted:#6B6585;--muted2:#9A95B0;--line:#EAE7F6;--card:#fff;
  --p:#6D5DF6;--p2:#9A5CF0;--p3:#4F8DF7;--p-soft:#EEEBFE;--p-ink:#4B3FD0;
  --grad:linear-gradient(120deg,#6E5BF2,#9A5CF0,#4F8DF7);
  --s1:0 8px 24px -10px rgba(82,60,190,.18);--s2:0 22px 50px -22px rgba(82,60,190,.28);--s3:0 36px 80px -30px rgba(82,60,190,.4);
  background:var(--bg);color:var(--ink);font-family:'Tajawal',system-ui,sans-serif;line-height:1.85;-webkit-font-smoothing:antialiased;
}
.ao *{box-sizing:border-box}
.ao a{text-decoration:none}
:where(.ao) a{color:inherit}
.ao .disp{font-family:'Cairo','Tajawal',sans-serif;font-weight:800;letter-spacing:-.01em}
.ao .grad{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.ao-glass{background:rgba(255,255,255,.62);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.7)}
.ao-wrap{max-width:1180px;margin:0 auto;padding:0 clamp(20px,5vw,56px)}
.ao-sec{padding:clamp(64px,7vw,108px) 0}
/* buttons */
.ao-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 26px;border-radius:16px;background:var(--grad);color:#fff;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -12px rgba(109,93,246,.6);transition:transform .25s,box-shadow .25s,filter .25s}
.ao-btn:hover{transform:translateY(-2px);filter:brightness(1.05);box-shadow:0 20px 40px -12px rgba(109,93,246,.7)}
.ao-btn-sm{padding:10px 20px;font-size:14px;border-radius:13px;box-shadow:none}
.ao-btn-lg{padding:15px 32px;font-size:16.5px;border-radius:18px}
.ao-btn-glass{background:rgba(255,255,255,.6);backdrop-filter:blur(10px);color:var(--p-ink);border:1px solid var(--line);box-shadow:var(--s1)}
.ao-btn-glass:hover{background:#fff;filter:none}
/* nav */
.ao-nav{position:fixed;top:0;right:0;left:0;z-index:50;background:rgba(251,251,254,.7);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
.ao-nav-in{display:flex;align-items:center;gap:24px;height:72px}
.ao-brand{display:flex;align-items:center;gap:11px}
.ao-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--grad);color:#fff;box-shadow:0 10px 22px -10px rgba(109,93,246,.7);overflow:hidden}
.ao-logo-img{background:#fff;border:1px solid var(--line)}
.ao-logo-img img{width:100%;height:100%;object-fit:contain}
.ao-brand-name{font-size:21px;color:var(--ink)}
.ao-nav-links{display:flex;gap:6px;margin-inline-start:auto;font-size:15px;color:var(--muted);font-weight:600}
.ao-nav-links a{padding:8px 14px;border-radius:12px;transition:color .2s,background .2s}
.ao-nav-links a:hover{color:var(--p-ink);background:var(--p-soft)}
@media(max-width:840px){.ao-nav-links{display:none}}
/* hero */
.ao-hero{position:relative;overflow:hidden;padding:138px 0 70px;text-align:center}
.ao-aurora{position:absolute;inset:0;z-index:0;background:radial-gradient(680px 460px at 78% -8%,rgba(154,92,240,.28),transparent 58%),radial-gradient(620px 480px at 12% 12%,rgba(79,141,247,.24),transparent 56%),radial-gradient(560px 420px at 50% 110%,rgba(109,93,246,.2),transparent 60%);filter:blur(8px)}
.ao-hero-in{position:relative;z-index:2;max-width:840px}
.ao-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border-radius:999px;background:rgba(255,255,255,.7);backdrop-filter:blur(10px);border:1px solid var(--line);font-size:14px;font-weight:600;color:var(--p-ink);box-shadow:var(--s1)}
.ao-chip-dot{width:7px;height:7px;border-radius:50%;background:var(--p2)}
.ao-h1{font-size:clamp(40px,6.2vw,76px);line-height:1.1;margin:22px 0 0;color:var(--ink)}
.ao-hero-sub{font-size:clamp(16px,1.3vw,20px);line-height:1.9;color:var(--muted);max-width:600px;margin:22px auto 0}
.ao-hero-cta{display:flex;gap:13px;justify-content:center;margin-top:30px}
.ao-hero-media{position:relative;z-index:2;margin-top:54px}
.ao-hero-frame{position:relative;border-radius:30px;overflow:hidden;box-shadow:var(--s3);border:1px solid rgba(255,255,255,.7);background:#fff;padding:8px}
.ao-hero-frame img{display:block;width:100%;height:clamp(280px,38vw,440px);object-fit:cover;border-radius:22px}
.ao-hero-ph{display:grid;place-items:center;width:100%;height:clamp(280px,38vw,440px);border-radius:22px;background:var(--grad);color:rgba(255,255,255,.6)}
.ao-hero-meta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:-44px;position:relative;z-index:3}
.ao-meta{display:flex;flex-direction:column;align-items:center;border-radius:18px;padding:14px 26px;box-shadow:var(--s2);min-width:120px}
.ao-meta-v{font-size:28px;line-height:1}
.ao-meta-l{font-size:13px;color:var(--muted);margin-top:4px}
/* heads */
.ao-head{max-width:600px;margin:0 0 48px}
.ao-head-center{margin-left:auto;margin-right:auto;text-align:center}
.ao-kicker{display:inline-block;font-size:13.5px;font-weight:700;color:var(--p-ink);background:var(--p-soft);padding:5px 14px;border-radius:999px;margin-bottom:14px}
.ao-h2{font-size:clamp(30px,4.2vw,50px);line-height:1.16;margin:0;color:var(--ink)}
.ao-lead{font-size:18px;line-height:1.9;color:var(--muted);margin:16px 0 0}
.ao-head-center .ao-lead{margin-left:auto;margin-right:auto;max-width:560px}
/* bento highlights */
.ao-bento{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:20px}
@media(max-width:860px){.ao-bento{grid-template-columns:1fr}}
.ao-feat{padding:34px 30px;border-radius:26px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s}
.ao-feat:hover{transform:translateY(-6px);box-shadow:var(--s2)}
.ao-feat-lead{background:var(--grad);color:#fff;border:none;display:flex;flex-direction:column;justify-content:center}
.ao-feat-lead p{color:rgba(255,255,255,.9)}
.ao-feat-ic{display:grid;place-items:center;width:56px;height:56px;border-radius:16px;background:var(--p-soft);color:var(--p)}
.ao-ic-light{background:rgba(255,255,255,.18);color:#fff}
.ao-feat h3{font-size:22px;margin:18px 0 8px}
.ao-feat p{font-size:15.5px;line-height:1.85;color:var(--muted);margin:0}
/* grids */
.ao-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,360px));gap:22px;justify-content:center}
.ao-grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,520px));gap:22px;justify-content:center}
/* services */
.ao-card{padding:30px 26px;border-radius:26px;background:var(--card);border:1px solid var(--line);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s,border-color .3s}
.ao-card:hover{transform:translateY(-6px);box-shadow:var(--s2);border-color:var(--p2)}
.ao-card-ic{display:grid;place-items:center;width:54px;height:54px;border-radius:16px;background:var(--grad);color:#fff;box-shadow:0 10px 22px -10px rgba(109,93,246,.6)}
.ao-card h3{font-size:21px;margin:18px 0 8px;color:var(--ink)}
.ao-card p{font-size:15px;line-height:1.8;color:var(--muted);margin:0 0 14px}
.ao-card-link{display:inline-flex;align-items:center;gap:6px;color:var(--p-ink);font-weight:700;font-size:14.5px}
/* before/after */
.ao-ba-card{padding:14px;border-radius:24px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.ao-ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ao-ba-cell{position:relative;aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:var(--bg2)}
.ao-ba-cell img{width:100%;height:100%;object-fit:cover}
.ao-ba-ph{width:100%;height:100%;background:repeating-linear-gradient(45deg,#eceaf8,#eceaf8 10px,#e4e1f4 10px,#e4e1f4 20px)}
.ao-ba-tag{position:absolute;top:10px;right:10px;z-index:2;background:rgba(26,21,48,.72);color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:999px}
.ao-ba-after{background:var(--p)}
.ao-ba-title{text-align:center;font-size:20px;margin:14px 0 6px;color:var(--ink)}
/* stats gradient band */
.ao-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;text-align:center;background:var(--grad);border-radius:30px;padding:clamp(38px,5vw,56px) 30px;box-shadow:var(--s2)}
.ao-stat-v{font-size:clamp(40px,4.8vw,58px);color:#fff;line-height:1}
.ao-stat-l{color:rgba(255,255,255,.86);font-size:15px;margin-top:6px}
/* doctors */
.ao-doc{background:#fff;border:1px solid var(--line);border-radius:26px;padding:28px;text-align:center;box-shadow:var(--s1);transition:transform .3s,box-shadow .3s}
.ao-doc:hover{transform:translateY(-6px);box-shadow:var(--s2)}
.ao-doc-ring{width:148px;height:148px;margin:0 auto 16px;border-radius:50%;padding:4px;background:var(--grad)}
.ao-doc-img{width:100%;height:100%;border-radius:50%;overflow:hidden;background:var(--bg2);border:3px solid #fff}
.ao-doc-img img{width:100%;height:100%;object-fit:cover}
.ao-doc-ph{display:grid;place-items:center;width:100%;height:100%;color:var(--p2)}
.ao-doc h3{font-size:22px;margin:0 0 6px;color:var(--ink)}
.ao-doc-spec{display:inline-block;font-size:13.5px;color:var(--p-ink);background:var(--p-soft);padding:4px 14px;border-radius:999px}
/* process */
.ao-step{background:#fff;border:1px solid var(--line);border-radius:26px;padding:30px;text-align:center;box-shadow:var(--s1)}
.ao-step-n{font-size:34px;line-height:1}
.ao-step h3{font-size:20px;margin:10px 0 6px;color:var(--ink)}
.ao-step p{font-size:14.5px;color:var(--muted);margin:0;line-height:1.8}
/* pricing */
.ao-price{display:flex;flex-direction:column;padding:34px 30px;border-radius:26px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.ao-price h3{font-size:22px;margin:0;color:var(--ink)}
.ao-price-note{font-size:14px;color:var(--muted);margin:6px 0 0}
.ao-price-v{display:flex;align-items:baseline;gap:7px;margin:18px 0 22px}
.ao-price-v .disp{font-size:44px}
.ao-price-u{color:var(--muted);font-size:15px}
.ao-price-btn{margin-top:auto}
.ao-fine{text-align:center;font-size:14px;color:var(--muted2);margin:28px 0 0}
/* testimonials */
.ao-quote{margin:0;padding:28px;border-radius:26px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.ao-stars{display:flex;gap:3px;color:#F5A524;margin-bottom:14px}
.ao-quote blockquote{margin:0 0 18px;font-size:15.5px;line-height:1.85;color:var(--ink)}
.ao-quote figcaption{display:flex;align-items:center;gap:12px}
.ao-av{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--grad);color:#fff;font-size:18px}
.ao-quote figcaption strong{display:block;color:var(--ink)}
.ao-quote figcaption span{color:var(--muted);font-size:13.5px}
/* credentials */
.ao-cred-sec{padding:clamp(46px,6vw,72px) 0}
.ao-cred-lead{text-align:center;margin:0 auto 26px;max-width:560px}
.ao-creds{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.ao-cred{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 22px;box-shadow:var(--s1);min-width:220px}
.ao-cred-ic{flex:none;display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--p-soft);color:var(--p)}
.ao-cred-v{font-size:18px;color:var(--ink)}
.ao-cred-l{font-size:13px;color:var(--muted)}
/* faq */
.ao-faq{max-width:780px}
.ao-faq-item{background:#fff;border:1px solid var(--line);border-radius:20px;padding:4px 24px;margin-bottom:12px;box-shadow:var(--s1)}
.ao-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:19px 0;font-weight:700;font-size:17px;cursor:pointer;list-style:none;color:var(--ink)}
.ao-faq-item summary::-webkit-details-marker{display:none}
.ao-faq-plus{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--p-soft);color:var(--p);transition:transform .25s}
.ao-faq-item[open] .ao-faq-plus{transform:rotate(135deg)}
.ao-faq-item p{font-size:15.5px;line-height:1.9;color:var(--muted);margin:0 0 19px}
/* booking */
.ao-book-wrap{max-width:780px}
.ao-book{border-radius:30px;overflow:hidden;box-shadow:var(--s3);border:1px solid var(--line);background:#fff}
.ao-book-head{position:relative;overflow:hidden;background:var(--grad);color:#fff;padding:36px 34px 32px;text-align:center}
.ao-aurora-b{opacity:.5;mix-blend-mode:soft-light}
.ao-chip-light{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.3);color:#fff;position:relative;z-index:2}
.ao-dot-light{background:#fff}
.ao-book-h{font-size:clamp(26px,3.4vw,38px);color:#fff;margin:14px 0 0;position:relative;z-index:2}
.ao-book-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:18px;position:relative;z-index:2}
.ao-bchip{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:999px;background:rgba(255,255,255,.16);font-size:14px}
.ao-book-body{padding:30px 34px 34px}
.ao-book-note{text-align:center;color:var(--muted);font-size:14px;margin:16px 0 0}
.ao-map{margin-top:24px;border-radius:24px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/6;box-shadow:var(--s2)}
.ao-map iframe{width:100%;height:100%;border:0}
/* booking form */
.ao-book-body .cl-form{display:flex;flex-direction:column;gap:16px}
.ao-book-body .cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.ao-book-body .cl-fld{display:flex;flex-direction:column;gap:7px}
.ao-book-body .cl-fld label{font-size:14px;font-weight:600;color:var(--ink)}
.ao-book-body .cl-fld input,.ao-book-body .cl-fld select,.ao-book-body .cl-fld textarea{width:100%;padding:13px 15px;border-radius:14px;border:1.5px solid var(--line);background:var(--bg2);font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s}
.ao-book-body .cl-fld input:focus,.ao-book-body .cl-fld select:focus,.ao-book-body .cl-fld textarea:focus{border-color:var(--p);box-shadow:0 0 0 4px var(--p-soft);background:#fff}
.ao-book-body .cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.ao-book-body .cl-slot{padding:9px 15px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg2);font:inherit;cursor:pointer;color:var(--ink);font-size:14.5px;transition:all .18s}
.ao-book-body .cl-slot:hover{border-color:var(--p)}
.ao-book-body .cl-slot-on{background:var(--grad);color:#fff;border-color:transparent}
.ao-book-body .cl-slots-msg{color:var(--muted);font-size:14px;margin:0}
.ao-book-body .cl-btn{margin-top:4px;width:100%;padding:15px;border-radius:16px;border:none;background:var(--grad);color:#fff;font-weight:700;font-size:16.5px;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -12px rgba(109,93,246,.7);transition:transform .22s,filter .22s}
.ao-book-body .cl-btn:hover{transform:translateY(-2px);filter:brightness(1.05)}
/* footer */
.ao-footer{position:relative;overflow:hidden;background:#171331;color:#B9B3D6;padding:clamp(58px,7vw,88px) 0 34px}
.ao-aurora-f{opacity:.5}
.ao-foot-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:42px}
.ao-foot-brand{min-width:240px}
.ao-foot-name{font-size:23px;color:#fff}
.ao-foot-brand p{font-size:15px;line-height:1.9;color:#928BB8;margin:18px 0 18px;max-width:280px}
.ao-socs{display:flex;gap:10px}
.ao-socs a{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);transition:background .2s,transform .2s}
.ao-socs a:hover{background:var(--p);transform:translateY(-2px)}
.ao-foot-col h4{font-size:14.5px;font-weight:700;color:#fff;margin:0 0 16px}
.ao-foot-col a,.ao-foot-col span{display:block;color:#928BB8;font-size:15px;margin-bottom:11px;transition:color .2s}
.ao-foot-col a:hover{color:#fff}
.ao-ltr{direction:ltr;text-align:right}
.ao-foot-cta{color:#fff!important;margin-top:4px}
.ao-foot-bottom{position:relative;z-index:2;margin-top:46px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:13.5px;color:#7E78A0}
@media(prefers-reduced-motion:reduce){.ao *{animation:none!important;transition:none!important}}
`;
