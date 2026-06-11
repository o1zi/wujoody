/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import type { ClinicContent } from "@/lib/clinic-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// "Luma" clinic template — cinematic luxe. Deep warm black + champagne gold,
// Markazi Text (display) + Tajawal (body). Built for premium cosmetic / dental
// / aesthetic clinics. Data-driven from ClinicContent + the live booking engine.

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
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.split("|").map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const I = {
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z",
  arrow: "M14 6l-6 6 6 6",
  plus: "M12 5v14|M5 12h14",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8z|M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7",
  monogram: "M12 21c0-5 -3-7 -7-8 4-1 7-3 7-9 0 6 3 8 7 9-4 1-7 3-7 8z",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  mail: "M3 6h18v12H3z|M3 7l9 6 9-6",
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z|M12 11a2 2 0 100-4 2 2 0 000 4z",
  shield: "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z|M9.3 11.5l1.8 1.8 3.6-3.7",
  quote: "M10 11H6a1 1 0 01-1-1V7a3 3 0 013-3|M19 11h-4a1 1 0 01-1-1V7a3 3 0 013-3|M5 11s0 6 5 7|M14 11s0 6 5 7",
};
const SOC: Record<string, ReactElement> = {
  whatsapp: <Svg d="M12 3a9 9 0 00-7.7 13.5L3 21l4.6-1.2A9 9 0 1012 3z" s={17} />,
  instagram: <Svg d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z|M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" s={17} />,
  snapchat: <Svg d="M12 3c2.4 0 3.6 1.8 3.6 4.1 0 1 .1 1.7.1 1.9.3.6 1.2.4 1.6.6.5.2.4.7-.1 1-.6.3-1.4.4-1.5.9-.1.4.8 1.7 2.5 2.5.5.2.4.6 0 .8-.5.3-1.3.2-1.6.7-.2.4 0 .9-.6 1-.6.1-1.3-.4-2-.1-.8.3-1.3 1.1-2.5 1.1s-1.7-.8-2.5-1.1c-.7-.3-1.4.2-2 .1-.6-.1-.4-.6-.6-1-.3-.5-1.1-.4-1.6-.7-.4-.2-.5-.6 0-.8 1.7-.8 2.6-2.1 2.5-2.5-.1-.5-.9-.6-1.5-.9-.5-.3-.6-.8-.1-1 .4-.2 1.3 0 1.6-.6 0-.2.1-.9.1-1.9C8.4 4.8 9.6 3 12 3z" s={17} />,
  tiktok: <Svg d="M16 4c.3 2 1.6 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.5-1v5.4a5.3 5.3 0 11-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 102 2.5V4z" s={17} />,
  linkedin: <Svg d="M5 4a2 2 0 100 4 2 2 0 000-4z|M4 9h2v11H4z|M9 9h2v1.6a3 3 0 015 2.3V20h-2v-5a1.5 1.5 0 00-3 0v5H9z" s={17} />,
};

export default function ClinicSiteLuxe({
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
    <div className="luma" dir="rtl">
      <style>{LUMA_CSS}</style>

      {/* NAV */}
      <nav className="lx-nav">
        <div className="lx-wrap lx-nav-in">
          <a href="#top" className="lx-brand">
            <span className={`lx-logo${c.brand.logo ? " lx-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.monogram} s={18} fill />}</span>
            <span className="disp lx-brand-name">{c.brand.ar}</span>
          </a>
          <div className="lx-nav-links">{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <a href="#book" className="lx-btn lx-btn-sm">احجز موعد</a>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="lx-hero">
        <span className="lx-glow" aria-hidden="true" />
        <div className="lx-wrap lx-hero-grid">
          <div className="lx-hero-text">
            <span className="lx-kicker"><span className="lx-kicker-line" />{c.hero.eyebrow}</span>
            <h1 className="disp lx-h1">{c.hero.title}</h1>
            <p className="lx-hero-sub">{c.hero.subtitle}</p>
            <div className="lx-hero-cta">
              <a href="#book" className="lx-btn lx-btn-lg">احجز موعدك <Svg d={I.arrow} s={18} /></a>
              {v.specialties && <a href="#services" className="lx-btn lx-btn-ghost lx-btn-lg">اكتشف خدماتنا</a>}
            </div>
            {c.hero.meta.length > 0 && (
              <div className="lx-hero-stats">
                {c.hero.meta.map((m, i) => (
                  <div key={i} className="lx-hs"><span className="disp gold lx-hs-v">{m.value}</span><span className="lx-hs-l">{m.label}</span></div>
                ))}
              </div>
            )}
          </div>
          <div className="lx-hero-media">
            <div className="lx-frame">
              {c.hero.image ? <img src={c.hero.image} alt={c.brand.ar} /> : <div className="lx-frame-ph"><Svg d={I.monogram} s={70} fill /></div>}
            </div>
            {c.stats.length > 0 && (
              <div className="lx-hero-badge"><span className="disp gold lx-badge-v">{c.stats[c.stats.length - 1].value}{c.stats[c.stats.length - 1].suffix}</span><span className="lx-badge-l">{c.stats[c.stats.length - 1].label}</span></div>
            )}
          </div>
        </div>
      </header>

      {/* ABOUT / PHILOSOPHY */}
      {v.about && (
        <section className="lx-sec lx-about">
          <div className="lx-wrap lx-about-grid">
            <div>
              <span className="lx-kicker"><span className="lx-kicker-line" />فلسفتنا</span>
              <p className="disp lx-about-lead">{c.about.lead}</p>
            </div>
            <div className="lx-about-body">
              <p>{c.about.body}</p>
              <div className="lx-about-facts">
                {c.about.side.map((s, i) => (
                  <div key={i} className="lx-fact"><span className="gold disp lx-fact-k">{s.k}</span><span className="lx-fact-v">{s.v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="services" className="lx-sec">
          <div className="lx-wrap">
            <div className="lx-head"><span className="lx-kicker"><span className="lx-kicker-line" />خدماتنا</span><h2 className="disp lx-h2">{c.specialties.title}</h2><p className="lx-lead">{c.specialties.lead}</p></div>
            <div className="lx-grid-auto">
              {c.specialties.items.map((s, i) => (
                <div key={i} className="lx-svc"><span className="disp gold lx-svc-n">{two(i + 1)}</span><h3 className="disp">{s.title}</h3><p>{s.desc}</p><a href="#book" className="lx-svc-link">احجز استشارة <Svg d={I.arrow} s={14} /></a></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BEFORE/AFTER */}
      {v.results && c.results.items.length > 0 && (
        <section className="lx-sec">
          <div className="lx-wrap">
            <div className="lx-head"><span className="lx-kicker"><span className="lx-kicker-line" />نتائجنا</span><h2 className="disp lx-h2">{c.results.title}</h2><p className="lx-lead">{c.results.lead}</p></div>
            <div className="lx-grid2">
              {c.results.items.map((r, i) => (
                <div key={i} className="lx-ba-card"><div className="lx-ba"><div className="lx-ba-cell"><span className="lx-ba-tag">قبل</span>{r.before ? <img src={r.before} alt="قبل" /> : <div className="lx-ba-ph" />}</div><div className="lx-ba-cell"><span className="lx-ba-tag lx-ba-after">بعد</span>{r.after ? <img src={r.after} alt="بعد" /> : <div className="lx-ba-ph" />}</div></div><h3 className="disp lx-ba-title">{r.title}</h3></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {v.stats && c.stats.length > 0 && (
        <section className="lx-stats-sec">
          <div className="lx-wrap lx-stats">
            {c.stats.map((s, i) => (<div key={i} className="lx-stat"><div className="disp gold lx-stat-v">{s.value}{s.suffix}</div><div className="lx-stat-l">{s.label}</div></div>))}
          </div>
        </section>
      )}

      {/* DOCTORS */}
      {v.doctors && doctors.length > 0 && (
        <section id="doctors" className="lx-sec">
          <div className="lx-wrap">
            <div className="lx-head"><span className="lx-kicker"><span className="lx-kicker-line" />فريقنا</span><h2 className="disp lx-h2">{c.doctors.title}</h2><p className="lx-lead">{c.doctors.lead}</p></div>
            <div className="lx-grid-auto">
              {doctors.map((d) => (
                <div key={d.id} className="lx-doc">
                  <div className="lx-doc-img">{d.image ? <img src={d.image} alt={d.name} /> : <div className="lx-doc-ph"><Svg d={I.user} s={44} /></div>}</div>
                  <h3 className="disp">{d.name}</h3>
                  {d.specialty && <span className="lx-doc-spec">{d.specialty}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {v.process && c.process.length > 0 && (
        <section className="lx-sec">
          <div className="lx-wrap">
            <div className="lx-head"><span className="lx-kicker"><span className="lx-kicker-line" />التجربة</span><h2 className="disp lx-h2">رحلة العناية</h2></div>
            <div className="lx-grid-auto">
              {c.process.map((p, i) => (<div key={i} className="lx-step"><span className="disp gold lx-step-n">{two(i + 1)}</span><h3 className="disp">{p.title}</h3><p>{p.desc}</p></div>))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      {v.prices && c.prices.items.length > 0 && (
        <section id="pricing" className="lx-sec">
          <div className="lx-wrap">
            <div className="lx-head lx-head-center"><span className="lx-kicker"><span className="lx-kicker-line" />الأسعار</span><h2 className="disp lx-h2">باقات عناية واضحة</h2><p className="lx-lead">{c.prices.lead}</p></div>
            <div className="lx-grid-auto">
              {c.prices.items.map((p, i) => (
                <div key={i} className="lx-price"><h3 className="disp">{p.name}</h3>{p.note && <p className="lx-price-note">{p.note}</p>}<div className="lx-price-v"><span className="disp gold">{p.price}</span><span className="lx-price-u">{c.prices.unit}</span></div><a href="#book" className="lx-btn lx-btn-ghost lx-price-btn">احجز الآن</a></div>
              ))}
            </div>
            <p className="lx-fine">{c.prices.note}</p>
          </div>
        </section>
      )}

      {/* TESTIMONIAL */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="lx-sec lx-quote-sec">
          <div className="lx-wrap lx-quote-wrap">
            <span className="gold lx-quote-mark"><Svg d={I.quote} s={46} /></span>
            <p className="disp lx-quote-big">«{c.testimonials[0].quote}»</p>
            <div className="lx-quote-by"><span className="disp gold lx-quote-av">{c.testimonials[0].name.trim().charAt(0)}</span><div><div className="lx-quote-name">{c.testimonials[0].name}</div><div className="lx-quote-role">{c.testimonials[0].role}</div></div></div>
            {c.testimonials.length > 1 && (
              <div className="lx-grid-auto lx-quote-more">
                {c.testimonials.slice(1).map((t, i) => (<figure key={i} className="lx-qcard"><div className="lx-stars">{[0, 1, 2, 3, 4].map((s) => <Svg key={s} d={I.star} s={14} fill />)}</div><blockquote>«{t.quote}»</blockquote><figcaption><strong>{t.name}</strong><span>{t.role}</span></figcaption></figure>))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CREDENTIALS */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="lx-sec lx-cred-sec">
          <div className="lx-wrap"><p className="lx-lead lx-cred-lead">{c.credentials.lead}</p><div className="lx-creds">{c.credentials.badges.map((b, i) => (<div key={i} className="lx-cred"><span className="gold lx-cred-ic"><Svg d={I.shield} s={20} /></span><div><div className="disp lx-cred-v">{b.value}</div><div className="lx-cred-l">{b.label}</div></div></div>))}</div></div>
        </section>
      )}

      {/* FAQ */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="lx-sec">
          <div className="lx-wrap lx-faq">
            <div className="lx-head lx-head-center"><span className="lx-kicker lx-kicker-c"><span className="lx-kicker-line" />الأسئلة الشائعة</span><h2 className="disp lx-h2">إجابات لما يهمّك</h2></div>
            {c.faq.items.map((f, i) => (<details key={i} className="lx-faq-item"><summary>{f.q}<span className="gold lx-faq-plus"><Svg d={I.plus} s={18} /></span></summary><p>{f.a}</p></details>))}
          </div>
        </section>
      )}

      {/* BOOKING */}
      {v.booking && (
        <section id="book" className="lx-sec lx-book-sec">
          <span className="lx-glow lx-glow-b" aria-hidden="true" />
          <div className="lx-wrap lx-book-wrap">
            <div className="lx-book-head lx-head-center">
              <span className="lx-kicker lx-kicker-c"><span className="lx-kicker-line" />{c.booking.title}</span>
              <h2 className="disp lx-h2">{c.booking.lead}</h2>
              <div className="lx-book-chips">
                <a className="lx-bchip" href={`tel:${c.contact.phone}`}><span className="gold"><Svg d={I.phone} s={15} /></span><span dir="ltr">{c.contact.phone}</span></a>
                <span className="lx-bchip"><span className="gold"><Svg d={I.pin} s={15} /></span>{c.contact.office}</span>
              </div>
            </div>
            <div className="lx-book-card">
              <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
              <p className="lx-book-note">{c.booking.note}</p>
            </div>
            {mapSrc && <div className="lx-map"><iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="lx-footer">
        <div className="lx-wrap lx-foot-grid">
          <div className="lx-foot-brand">
            <div className="lx-brand"><span className={`lx-logo${c.brand.logo ? " lx-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.monogram} s={16} fill />}</span><span className="disp lx-foot-name">{c.brand.ar}</span></div>
            <p>{c.about.lead}</p>
            {socials.length > 0 && <div className="lx-socs">{socials.map((s) => <a key={s.k} href={s.href} target="_blank" rel="noreferrer" aria-label={s.k}>{SOC[s.k]}</a>)}</div>}
          </div>
          <div className="lx-foot-col"><h4>روابط</h4>{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <div className="lx-foot-col"><h4>تواصل</h4><a href={`tel:${c.contact.phone}`} dir="ltr" className="lx-ltr">{c.contact.phone}</a><a href={`mailto:${c.contact.email}`} dir="ltr" className="lx-ltr">{c.contact.email}</a><span>{c.contact.office}</span></div>
          <div className="lx-foot-col"><h4>أوقات العمل</h4><span>{c.contact.phoneNote || "يومياً · 9ص – 11م"}</span><a href="#book" className="lx-btn lx-btn-sm lx-foot-cta">احجز موعد</a></div>
        </div>
        <div className="lx-wrap lx-foot-bottom"><span>© {c.brand.ar} — جميع الحقوق محفوظة</span><span className="lx-foot-by">صُمم عبر منصة وجود</span></div>
      </footer>
    </div>
  );
}

const LUMA_CSS = `
.luma{
  --bg:#100E0C;--panel:#19150F;--panel2:#221C15;--line:rgba(232,201,141,.14);--line2:rgba(255,255,255,.07);
  --ink:#F4EFE6;--muted:#A89E8E;--muted2:#7A7164;
  --gold:#E8C98D;--gold2:#C9A45E;--gold-grad:linear-gradient(135deg,#F3DEAE,#C9A45E);
  background:var(--bg);color:var(--ink);font-family:'Tajawal',system-ui,sans-serif;line-height:1.85;-webkit-font-smoothing:antialiased;
}
.luma *{box-sizing:border-box}
.luma a{text-decoration:none}
:where(.luma) a{color:inherit}
.luma .disp{font-family:'Markazi Text',serif;font-weight:600;letter-spacing:.2px}
.luma .gold{background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.lx-wrap{max-width:1200px;margin:0 auto;padding:0 clamp(20px,5vw,60px)}
.lx-sec{padding:clamp(74px,9vw,130px) 0;position:relative}
/* buttons */
.lx-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 26px;border-radius:999px;background:var(--gold-grad);color:#241803;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 14px 34px -14px rgba(201,164,94,.6);transition:transform .25s,box-shadow .25s,filter .25s}
.lx-btn:hover{transform:translateY(-2px);filter:brightness(1.06);box-shadow:0 20px 40px -14px rgba(201,164,94,.7)}
.lx-btn-sm{padding:10px 20px;font-size:14px;box-shadow:none}
.lx-btn-lg{padding:15px 32px;font-size:16.5px}
.lx-btn-ghost{background:transparent;color:var(--gold);border:1px solid rgba(232,201,141,.42);box-shadow:none}
.lx-btn-ghost:hover{background:rgba(232,201,141,.08);border-color:var(--gold);filter:none}
/* nav */
.lx-nav{position:fixed;top:0;right:0;left:0;z-index:50;background:rgba(16,14,12,.72);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.lx-nav-in{display:flex;align-items:center;gap:24px;height:74px}
.lx-brand{display:flex;align-items:center;gap:12px}
.lx-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--gold-grad);color:#241803;overflow:hidden}
.lx-logo-img{background:#0E0C0A;border:1px solid var(--line)}
.lx-logo-img img{width:100%;height:100%;object-fit:contain}
.lx-brand-name{font-size:24px;color:var(--ink)}
.lx-nav-links{display:flex;gap:8px;margin-inline-start:auto;font-size:15px;color:var(--muted);font-weight:500}
.lx-nav-links a{padding:8px 14px;border-radius:999px;transition:color .2s,background .2s}
.lx-nav-links a:hover{color:var(--gold);background:rgba(232,201,141,.06)}
@media(max-width:840px){.lx-nav-links{display:none}}
/* kicker */
.lx-kicker{display:inline-flex;align-items:center;gap:12px;font-size:13.5px;font-weight:600;letter-spacing:.12em;color:var(--gold);text-transform:uppercase}
.lx-kicker-line{width:34px;height:1px;background:var(--gold-grad)}
.lx-kicker-c{justify-content:center}
/* hero */
.lx-hero{position:relative;overflow:hidden;padding:150px 0 96px;background:radial-gradient(900px 540px at 82% 0%,rgba(201,164,94,.12),transparent 58%),var(--bg)}
.lx-glow{position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(201,164,94,.16),transparent 70%);top:-180px;inset-inline-start:-120px;filter:blur(40px)}
.lx-hero-grid{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(40px,5vw,72px);align-items:center}
@media(max-width:900px){.lx-hero-grid{grid-template-columns:1fr;gap:48px}}
.lx-h1{font-size:clamp(44px,6.4vw,84px);line-height:1.08;margin:22px 0 0;color:var(--ink);font-weight:600}
.lx-hero-sub{font-size:clamp(16px,1.3vw,19px);line-height:1.95;color:var(--muted);max-width:540px;margin:24px 0 0}
.lx-hero-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:36px}
.lx-hero-stats{display:flex;flex-wrap:wrap;gap:clamp(24px,3vw,46px);margin-top:48px;padding-top:30px;border-top:1px solid var(--line)}
.lx-hs-v{font-size:42px;line-height:1;display:block}
.lx-hs-l{font-size:14px;color:var(--muted);margin-top:6px;display:block}
.lx-hero-media{position:relative}
.lx-frame{position:relative;border-radius:8px;padding:10px;background:linear-gradient(160deg,rgba(232,201,141,.4),rgba(232,201,141,.05));box-shadow:0 50px 100px -40px rgba(0,0,0,.7)}
.lx-frame::after{content:"";position:absolute;inset:10px;border:1px solid rgba(232,201,141,.35);pointer-events:none;border-radius:3px}
.lx-frame img{display:block;width:100%;height:clamp(440px,52vw,580px);object-fit:cover;border-radius:3px}
.lx-frame-ph{display:grid;place-items:center;width:100%;height:clamp(440px,52vw,580px);background:linear-gradient(160deg,#1C1812,#0E0C0A);color:rgba(232,201,141,.4);border-radius:3px}
.lx-hero-badge{position:absolute;bottom:30px;right:-18px;display:flex;flex-direction:column;align-items:center;padding:18px 26px;border-radius:14px;background:rgba(16,14,12,.86);backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:0 24px 50px -22px rgba(0,0,0,.8)}
.lx-badge-v{font-size:34px;line-height:1}
.lx-badge-l{font-size:12.5px;color:var(--muted);margin-top:4px}
/* heads */
.lx-head{max-width:620px;margin:0 0 54px}
.lx-head-center{margin-left:auto;margin-right:auto;text-align:center}
.lx-h2{font-size:clamp(34px,4.6vw,58px);line-height:1.16;margin:16px 0 0;color:var(--ink);font-weight:600}
.lx-lead{font-size:17.5px;line-height:1.9;color:var(--muted);margin:16px 0 0}
.lx-head-center .lx-lead{margin-left:auto;margin-right:auto;max-width:560px}
/* about */
.lx-about-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,5vw,72px);align-items:center}
@media(max-width:860px){.lx-about-grid{grid-template-columns:1fr;gap:32px}}
.lx-about-lead{font-size:clamp(26px,3vw,40px);line-height:1.45;margin:18px 0 0;color:var(--ink);font-weight:500}
.lx-about-body p{font-size:17px;line-height:1.95;color:var(--muted);margin:0}
.lx-about-facts{margin-top:26px;display:flex;flex-direction:column;gap:16px}
.lx-fact{display:flex;flex-direction:column;gap:3px;padding-inline-start:16px;border-inline-start:1px solid var(--line)}
.lx-fact-k{font-size:13px;letter-spacing:.1em;direction:ltr;text-align:right}
.lx-fact-v{color:var(--ink);font-size:15.5px}
/* grids */
.lx-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.lx-grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,520px));gap:22px;justify-content:center}
/* services (bordered grid cells) */
.lx-svc{background:var(--bg);padding:38px 32px;transition:background .3s}
.lx-svc:hover{background:var(--panel)}
.lx-svc-n{font-size:30px;line-height:1}
.lx-svc h3{font-size:25px;font-weight:600;margin:14px 0 8px;color:var(--ink)}
.lx-svc p{font-size:15px;line-height:1.8;color:var(--muted);margin:0 0 16px}
.lx-svc-link{display:inline-flex;align-items:center;gap:6px;color:var(--gold);font-weight:600;font-size:14px}
/* before/after */
.lx-ba-card{padding:14px;border-radius:12px;background:var(--panel);border:1px solid var(--line)}
.lx-ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.lx-ba-cell{position:relative;aspect-ratio:4/3;border-radius:8px;overflow:hidden;background:#0E0C0A}
.lx-ba-cell img{width:100%;height:100%;object-fit:cover}
.lx-ba-ph{width:100%;height:100%;background:repeating-linear-gradient(45deg,#1A1610,#1A1610 10px,#221C14 10px,#221C14 20px)}
.lx-ba-tag{position:absolute;top:10px;right:10px;z-index:2;background:rgba(16,14,12,.8);color:var(--gold);font-size:12px;font-weight:600;padding:3px 12px;border-radius:999px;border:1px solid var(--line)}
.lx-ba-after{color:#241803;background:var(--gold-grad);border:none}
.lx-ba-title{text-align:center;font-size:22px;margin:14px 0 6px;color:var(--ink)}
/* stats */
.lx-stats-sec{padding:clamp(54px,6vw,84px) 0;border-block:1px solid var(--line);background:radial-gradient(700px 300px at 50% 0,rgba(201,164,94,.07),transparent 70%)}
.lx-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;text-align:center}
.lx-stat-v{font-size:clamp(46px,5.2vw,66px);line-height:1}
.lx-stat-l{color:var(--muted);font-size:15px;margin-top:8px}
/* doctors */
.lx-doc{background:var(--bg);padding:28px;text-align:center;transition:background .3s}
.lx-doc:hover{background:var(--panel)}
.lx-doc-img{width:160px;height:160px;border-radius:50%;margin:0 auto 18px;overflow:hidden;padding:5px;background:linear-gradient(160deg,rgba(232,201,141,.5),rgba(232,201,141,.06))}
.lx-doc-img img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.lx-doc-ph{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:#15110C;color:rgba(232,201,141,.4)}
.lx-doc h3{font-size:23px;font-weight:600;margin:0 0 6px;color:var(--ink)}
.lx-doc-spec{display:inline-block;font-size:13.5px;color:var(--gold);letter-spacing:.04em}
/* process */
.lx-step{background:var(--bg);padding:34px 30px;transition:background .3s}
.lx-step:hover{background:var(--panel)}
.lx-step-n{font-size:30px}
.lx-step h3{font-size:22px;font-weight:600;margin:12px 0 6px;color:var(--ink)}
.lx-step p{font-size:14.5px;color:var(--muted);margin:0;line-height:1.8}
/* pricing */
.lx-price{display:flex;flex-direction:column;background:var(--bg);padding:38px 32px;transition:background .3s}
.lx-price:hover{background:var(--panel)}
.lx-price h3{font-size:24px;font-weight:600;margin:0;color:var(--ink)}
.lx-price-note{font-size:14px;color:var(--muted);margin:6px 0 0}
.lx-price-v{display:flex;align-items:baseline;gap:8px;margin:18px 0 24px}
.lx-price-v .disp{font-size:46px}
.lx-price-u{color:var(--muted);font-size:15px}
.lx-price-btn{margin-top:auto}
.lx-fine{text-align:center;font-size:13.5px;color:var(--muted2);margin:28px 0 0}
/* testimonial */
.lx-quote-sec{background:radial-gradient(700px 320px at 50% 100%,rgba(201,164,94,.06),transparent 70%)}
.lx-quote-wrap{max-width:860px;margin:0 auto;text-align:center}
.lx-quote-mark{display:inline-block}
.lx-quote-big{font-size:clamp(26px,3.6vw,44px);line-height:1.5;font-weight:500;color:var(--ink);margin:20px 0 0}
.lx-quote-by{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:30px}
.lx-quote-av{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;border:1px solid var(--gold);font-size:22px}
.lx-quote-name{font-weight:700;color:var(--ink);text-align:right}
.lx-quote-role{font-size:13.5px;color:var(--muted);text-align:right}
.lx-quote-more{margin-top:48px;border:none;background:none;gap:18px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));text-align:right}
.lx-qcard{margin:0;padding:26px;border-radius:12px;background:var(--panel);border:1px solid var(--line)}
.lx-stars{display:flex;gap:3px;color:var(--gold);margin-bottom:12px}
.lx-qcard blockquote{margin:0 0 14px;font-size:15px;line-height:1.85;color:var(--ink)}
.lx-qcard figcaption strong{display:block;color:var(--ink)}
.lx-qcard figcaption span{color:var(--muted);font-size:13px}
/* credentials */
.lx-cred-sec{padding:clamp(50px,6vw,78px) 0;border-block:1px solid var(--line)}
.lx-cred-lead{text-align:center;margin:0 auto 26px;max-width:560px}
.lx-creds{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.lx-cred{display:flex;align-items:center;gap:13px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 24px;min-width:220px}
.lx-cred-ic{flex:none}
.lx-cred-v{font-size:18px;color:var(--ink)}
.lx-cred-l{font-size:13px;color:var(--muted)}
/* faq */
.lx-faq{max-width:800px}
.lx-faq-item{border-bottom:1px solid var(--line);padding:6px 6px}
.lx-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 0;font-weight:600;font-size:18px;cursor:pointer;list-style:none;color:var(--ink)}
.lx-faq-item summary::-webkit-details-marker{display:none}
.lx-faq-plus{flex:none;transition:transform .25s}
.lx-faq-item[open] .lx-faq-plus{transform:rotate(135deg)}
.lx-faq-item p{font-size:15.5px;line-height:1.9;color:var(--muted);margin:0 0 22px;max-width:680px}
/* booking */
.lx-book-sec{overflow:hidden}
.lx-glow-b{top:auto;bottom:-200px;inset-inline-start:auto;inset-inline-end:-120px}
.lx-book-wrap{max-width:780px;position:relative;z-index:2}
.lx-book-head{margin-bottom:30px}
.lx-book-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:20px}
.lx-bchip{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);font-size:14px;color:var(--ink)}
.lx-book-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:clamp(28px,3.5vw,42px);box-shadow:0 40px 90px -50px rgba(0,0,0,.9)}
.lx-book-note{text-align:center;color:var(--muted);font-size:13.5px;margin:16px 0 0}
.lx-map{margin-top:24px;border-radius:14px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/6;filter:grayscale(.3) brightness(.9)}
.lx-map iframe{width:100%;height:100%;border:0}
/* booking form on dark */
.lx-book-card .cl-form{display:flex;flex-direction:column;gap:16px}
.lx-book-card .cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.lx-book-card .cl-fld{display:flex;flex-direction:column;gap:7px}
.lx-book-card .cl-fld label{font-size:14px;font-weight:600;color:var(--ink)}
.lx-book-card .cl-fld input,.lx-book-card .cl-fld select,.lx-book-card .cl-fld textarea{width:100%;padding:13px 15px;border-radius:11px;border:1px solid var(--line);background:#120F0B;font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s}
.lx-book-card .cl-fld input::placeholder,.lx-book-card .cl-fld textarea::placeholder{color:var(--muted2)}
.lx-book-card .cl-fld input:focus,.lx-book-card .cl-fld select:focus,.lx-book-card .cl-fld textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,164,94,.16)}
.lx-book-card .cl-fld option{background:#15110C;color:var(--ink)}
.lx-book-card .cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.lx-book-card .cl-slot{padding:9px 15px;border-radius:10px;border:1px solid var(--line);background:#120F0B;font:inherit;cursor:pointer;color:var(--ink);font-size:14.5px;transition:all .18s}
.lx-book-card .cl-slot:hover{border-color:var(--gold)}
.lx-book-card .cl-slot-on{background:var(--gold-grad);color:#241803;border-color:transparent}
.lx-book-card .cl-slots-msg{color:var(--muted);font-size:14px;margin:0}
.lx-book-card .cl-btn{margin-top:4px;width:100%;padding:15px;border-radius:12px;border:none;background:var(--gold-grad);color:#241803;font-weight:700;font-size:16.5px;cursor:pointer;font-family:inherit;box-shadow:0 16px 34px -16px rgba(201,164,94,.7);transition:transform .22s,filter .22s}
.lx-book-card .cl-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
/* footer */
.lx-footer{background:#0A0908;border-top:1px solid var(--line);padding:clamp(60px,7vw,90px) 0 34px}
.lx-foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:42px}
.lx-foot-brand{min-width:240px}
.lx-foot-name{font-size:24px;color:var(--ink)}
.lx-foot-brand p{font-size:15px;line-height:1.9;color:var(--muted);margin:18px 0 18px;max-width:280px}
.lx-socs{display:flex;gap:10px}
.lx-socs a{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);color:var(--gold);transition:background .2s,transform .2s}
.lx-socs a:hover{background:rgba(232,201,141,.1);transform:translateY(-2px)}
.lx-foot-col h4{font-size:14px;font-weight:700;color:var(--gold);margin:0 0 16px;letter-spacing:.05em}
.lx-foot-col a,.lx-foot-col span{display:block;color:var(--muted);font-size:15px;margin-bottom:11px;transition:color .2s}
.lx-foot-col a:hover{color:var(--gold)}
.lx-ltr{direction:ltr;text-align:right}
.lx-foot-cta{color:#241803!important;margin-top:4px}
.lx-foot-bottom{margin-top:46px;padding-top:24px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:13px;color:var(--muted2)}
@media(prefers-reduced-motion:reduce){.luma *{animation:none!important;transition:none!important}}
`;
