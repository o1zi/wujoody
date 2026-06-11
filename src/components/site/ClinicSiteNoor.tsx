/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import type { ClinicContent } from "@/lib/clinic-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// "Noor" clinic template — modern, airy, teal/white. Cairo (headings) + Tajawal
// (body). Distinct layout from Safa: centered hero with a wide image, overlay
// doctor cards, a light stats band, and a centered booking card.

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
  plus: "M12 5v14|M5 12h14",
  cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  heart: "M12 20s-7-4.3-9.2-8.4C1.3 8.7 2.6 5.5 5.7 5.1 7.8 4.8 9.4 6 12 8.8 14.6 6 16.2 4.8 18.3 5.1c3.1.4 4.4 3.6 2.9 6.5C19 15.7 12 20 12 20z",
  pulse: "M3 12h4l2 6 4-14 2 8h6",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8z|M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7",
  tooth: "M8 3c-2.5 0-4 2-4 5 0 2 .6 3.4.9 6 .3 2.4.4 6 2.1 6 1.4 0 1.3-3 3-3s1.6 3 3 3c1.7 0 1.8-3.6 2.1-6 .3-2.6.9-4 .9-6 0-3-1.5-5-4-5-1.6 0-2 1-4 1s-2.4-1-4-1z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 15a3 3 0 100-6 3 3 0 000 6z",
  shield: "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z",
  check: "M5 12.5l4 4L19 7",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  mail: "M3 6h18v12H3z|M3 7l9 6 9-6",
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z|M12 11a2 2 0 100-4 2 2 0 000 4z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z",
  clock: "M12 7v5l3 2|M12 21a9 9 0 100-18 9 9 0 000 18z",
  arrow: "M14 6l-6 6 6 6",
};
const SOC: Record<string, ReactElement> = {
  whatsapp: <Svg d="M12 3a9 9 0 00-7.7 13.5L3 21l4.6-1.2A9 9 0 1012 3z" s={18} />,
  instagram: <Svg d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z|M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" s={18} />,
  snapchat: <Svg d="M12 3c2.4 0 3.6 1.8 3.6 4.1 0 1 .1 1.7.1 1.9.3.6 1.2.4 1.6.6.5.2.4.7-.1 1-.6.3-1.4.4-1.5.9-.1.4.8 1.7 2.5 2.5.5.2.4.6 0 .8-.5.3-1.3.2-1.6.7-.2.4 0 .9-.6 1-.6.1-1.3-.4-2-.1-.8.3-1.3 1.1-2.5 1.1s-1.7-.8-2.5-1.1c-.7-.3-1.4.2-2 .1-.6-.1-.4-.6-.6-1-.3-.5-1.1-.4-1.6-.7-.4-.2-.5-.6 0-.8 1.7-.8 2.6-2.1 2.5-2.5-.1-.5-.9-.6-1.5-.9-.5-.3-.6-.8-.1-1 .4-.2 1.3 0 1.6-.6 0-.2.1-.9.1-1.9C8.4 4.8 9.6 3 12 3z" s={18} />,
  tiktok: <Svg d="M16 4c.3 2 1.6 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.5-1v5.4a5.3 5.3 0 11-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 102 2.5V4z" s={18} />,
  linkedin: <Svg d="M5 4a2 2 0 100 4 2 2 0 000-4z|M4 9h2v11H4z|M9 9h2v1.6a3 3 0 015 2.3V20h-2v-5a1.5 1.5 0 00-3 0v5H9z" s={18} />,
};
const SVC = [I.tooth, I.pulse, I.eye, I.heart, I.user, I.shield];

export default function ClinicSiteNoor({
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
    <div className="noor" dir="rtl">
      <style>{NOOR_CSS}</style>

      {/* NAV (floating capsule) */}
      <div className="nr-nav">
        <div className="nr-nav-in">
          <a href="#top" className="nr-brand">
            <span className={`nr-logo${c.brand.logo ? " nr-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.cross} s={18} fill />}</span>
            <span className="nr-brand-name">{c.brand.ar}</span>
          </a>
          <div className="nr-nav-links">{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <a href="#book" className="nr-btn nr-btn-sm">احجز موعد</a>
        </div>
      </div>

      {/* HERO */}
      <header id="top" className="nr-hero">
        <span className="nr-blob nr-blob-1" aria-hidden="true" />
        <span className="nr-blob nr-blob-2" aria-hidden="true" />
        <div className="nr-wrap nr-hero-in">
          <span className="nr-pill"><span className="nr-dot" />{c.hero.eyebrow}</span>
          <h1 className="disp nr-h1">{c.hero.title}</h1>
          <p className="nr-hero-sub">{c.hero.subtitle}</p>
          <div className="nr-hero-cta">
            <a href="#book" className="nr-btn nr-btn-lg">احجز موعدك الآن <Svg d={I.arrow} s={18} /></a>
            {v.specialties && <a href="#services" className="nr-btn nr-btn-ghost nr-btn-lg">خدماتنا</a>}
          </div>
          {c.hero.meta.length > 0 && (
            <div className="nr-hero-meta">
              {c.hero.meta.map((m, i) => (<div key={i} className="nr-meta"><span className="disp nr-meta-v">{m.value}</span><span className="nr-meta-l">{m.label}</span></div>))}
            </div>
          )}
        </div>
        <div className="nr-wrap">
          <div className="nr-hero-media">
            {c.hero.image ? <img src={c.hero.image} alt={c.brand.ar} /> : <div className="nr-hero-ph"><Svg d={I.cross} s={64} fill /></div>}
            <div className="nr-chip nr-chip-1"><span className="nr-chip-ic"><Svg d={I.clock} s={20} /></span><div><div className="nr-chip-t">حجز أونلاين فوري</div><div className="nr-chip-s">خلال أقل من دقيقة</div></div></div>
            {c.stats.length > 0 && <div className="nr-chip nr-chip-2"><span className="disp nr-chip-big">{c.stats[c.stats.length - 1].value}{c.stats[c.stats.length - 1].suffix}</span><div className="nr-chip-s">{c.stats[c.stats.length - 1].label}</div></div>}
          </div>
        </div>
      </header>

      {/* HIGHLIGHTS */}
      {v.about && (
        <section className="nr-sec">
          <div className="nr-wrap nr-grid3">
            {[
              { d: I.heart, t: "رعاية تتمحور حولك", p: c.about.lead },
              { d: I.pulse, t: "أحدث التقنيات", p: "أجهزة تشخيص وعلاج من أحدث الأجيال لنتائج أدق وتعافٍ أسرع وأكثر أماناً." },
              { d: I.user, t: "نخبة الاستشاريين", p: "فريق من أمهر الأطباء وأصحاب الخبرات الطويلة في تخصصاتهم محلياً وعالمياً." },
            ].map((f, i) => (
              <div key={i} className="nr-feat"><span className="nr-feat-ic"><Svg d={f.d} s={26} /></span><h3 className="disp">{f.t}</h3><p>{f.p}</p></div>
            ))}
          </div>
        </section>
      )}

      {/* SERVICES */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="services" className="nr-sec nr-sec-soft">
          <div className="nr-wrap">
            <div className="nr-head"><span className="nr-kicker">خدماتنا الطبية</span><h2 className="disp nr-h2">{c.specialties.title}</h2><p className="nr-lead">{c.specialties.lead}</p></div>
            <div className="nr-grid-auto">
              {c.specialties.items.map((s, i) => (
                <div key={i} className="nr-card"><span className="nr-card-ic"><Svg d={SVC[i % SVC.length]} s={24} /></span><h3 className="disp">{s.title}</h3><p>{s.desc}</p><a href="#book" className="nr-card-link">احجز استشارة <Svg d={I.arrow} s={15} /></a></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BEFORE/AFTER */}
      {v.results && c.results.items.length > 0 && (
        <section className="nr-sec">
          <div className="nr-wrap">
            <div className="nr-head"><span className="nr-kicker">نتائجنا</span><h2 className="disp nr-h2">{c.results.title}</h2><p className="nr-lead">{c.results.lead}</p></div>
            <div className="nr-grid2">
              {c.results.items.map((r, i) => (
                <div key={i} className="nr-ba-card"><div className="nr-ba"><div className="nr-ba-cell"><span className="nr-ba-tag">قبل</span>{r.before ? <img src={r.before} alt="قبل" /> : <div className="nr-ba-ph" />}</div><div className="nr-ba-cell"><span className="nr-ba-tag nr-ba-after">بعد</span>{r.after ? <img src={r.after} alt="بعد" /> : <div className="nr-ba-ph" />}</div></div><h3 className="disp nr-ba-title">{r.title}</h3></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATS (light band) */}
      {v.stats && c.stats.length > 0 && (
        <section className="nr-sec-soft nr-stats-sec">
          <div className="nr-wrap nr-stats">
            {c.stats.map((s, i) => (<div key={i} className="nr-stat"><div className="disp nr-stat-v">{s.value}{s.suffix}</div><div className="nr-stat-l">{s.label}</div></div>))}
          </div>
        </section>
      )}

      {/* DOCTORS (overlay cards) */}
      {v.doctors && doctors.length > 0 && (
        <section id="doctors" className="nr-sec">
          <div className="nr-wrap">
            <div className="nr-head"><span className="nr-kicker">فريقنا الطبي</span><h2 className="disp nr-h2">{c.doctors.title}</h2><p className="nr-lead">{c.doctors.lead}</p></div>
            <div className="nr-grid-auto">
              {doctors.map((d) => (
                <div key={d.id} className="nr-doc">
                  {d.image ? <img src={d.image} alt={d.name} /> : <div className="nr-doc-ph"><Svg d={I.user} s={48} /></div>}
                  <span className="nr-doc-ov" aria-hidden="true" />
                  <div className="nr-doc-cap">{d.specialty && <span className="nr-doc-tag">{d.specialty}</span>}<h3 className="disp">{d.name}</h3></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {v.process && c.process.length > 0 && (
        <section className="nr-sec nr-sec-soft">
          <div className="nr-wrap">
            <div className="nr-head"><span className="nr-kicker">كيف نعمل</span><h2 className="disp nr-h2">رحلة المريض</h2></div>
            <div className="nr-grid-auto nr-steps">
              {c.process.map((p, i) => (<div key={i} className="nr-step"><span className="disp nr-step-n">{i + 1}</span><h3 className="disp">{p.title}</h3><p>{p.desc}</p></div>))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      {v.prices && c.prices.items.length > 0 && (
        <section id="pricing" className="nr-sec">
          <div className="nr-wrap">
            <div className="nr-head nr-head-center"><span className="nr-kicker">الأسعار</span><h2 className="disp nr-h2">أسعار واضحة وشفافة</h2><p className="nr-lead">{c.prices.lead}</p></div>
            <div className="nr-grid-auto">
              {c.prices.items.map((p, i) => (
                <div key={i} className="nr-price"><h3 className="disp">{p.name}</h3>{p.note && <p className="nr-price-note">{p.note}</p>}<div className="nr-price-v"><span className="disp">{p.price}</span><span className="nr-price-u">{c.prices.unit}</span></div><a href="#book" className="nr-btn nr-btn-outline nr-price-btn">احجز الآن</a></div>
              ))}
            </div>
            <p className="nr-fine">{c.prices.note}</p>
          </div>
        </section>
      )}

      {/* TESTIMONIALS (grid) */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="nr-sec nr-sec-soft">
          <div className="nr-wrap">
            <div className="nr-head nr-head-center"><span className="nr-kicker">آراء المرضى</span><h2 className="disp nr-h2">ماذا قالوا عنّا</h2></div>
            <div className="nr-grid-auto">
              {c.testimonials.map((t, i) => (
                <figure key={i} className="nr-quote"><div className="nr-stars">{[0, 1, 2, 3, 4].map((s) => <Svg key={s} d={I.star} s={15} fill />)}</div><blockquote>«{t.quote}»</blockquote><figcaption><span className="nr-av">{t.name.trim().charAt(0)}</span><div><strong>{t.name}</strong><span>{t.role}</span></div></figcaption></figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CREDENTIALS */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="nr-sec nr-cred-sec">
          <div className="nr-wrap"><p className="nr-lead nr-cred-lead">{c.credentials.lead}</p><div className="nr-creds">{c.credentials.badges.map((b, i) => (<div key={i} className="nr-cred"><span className="nr-cred-ic"><Svg d={I.shield} s={20} /></span><div><div className="nr-cred-v">{b.value}</div><div className="nr-cred-l">{b.label}</div></div></div>))}</div></div>
        </section>
      )}

      {/* FAQ (centered) */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="nr-sec nr-sec-soft">
          <div className="nr-wrap nr-faq">
            <div className="nr-head nr-head-center"><span className="nr-kicker">الأسئلة الشائعة</span><h2 className="disp nr-h2">كل ما تودّ معرفته قبل زيارتك</h2></div>
            {c.faq.items.map((f, i) => (<details key={i} className="nr-faq-item"><summary>{f.q}<span className="nr-faq-plus"><Svg d={I.plus} s={18} /></span></summary><p>{f.a}</p></details>))}
          </div>
        </section>
      )}

      {/* BOOKING (centered card) */}
      {v.booking && (
        <section id="book" className="nr-sec">
          <div className="nr-wrap nr-book-wrap">
            <div className="nr-book">
              <div className="nr-book-head">
                <span className="nr-pill nr-pill-light"><span className="nr-dot nr-dot-light" />{c.booking.title}</span>
                <h2 className="disp nr-book-h">{c.booking.lead}</h2>
                <div className="nr-book-chips">
                  <a className="nr-bchip" href={`tel:${c.contact.phone}`}><Svg d={I.phone} s={16} /><span dir="ltr">{c.contact.phone}</span></a>
                  <span className="nr-bchip"><Svg d={I.pin} s={16} />{c.contact.office}</span>
                </div>
              </div>
              <div className="nr-book-body">
                <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
                <p className="nr-book-note">{c.booking.note}</p>
              </div>
            </div>
            {mapSrc && <div className="nr-map"><iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="nr-footer">
        <div className="nr-wrap nr-foot-grid">
          <div className="nr-foot-brand">
            <div className="nr-brand"><span className={`nr-logo nr-logo-foot${c.brand.logo ? " nr-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.cross} s={16} fill />}</span><span className="disp nr-foot-name">{c.brand.ar}</span></div>
            <p>{c.about.lead}</p>
            {socials.length > 0 && <div className="nr-socs">{socials.map((s) => <a key={s.k} href={s.href} target="_blank" rel="noreferrer" aria-label={s.k}>{SOC[s.k]}</a>)}</div>}
          </div>
          <div className="nr-foot-col"><h4>روابط سريعة</h4>{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <div className="nr-foot-col"><h4>تواصل معنا</h4><a href={`tel:${c.contact.phone}`} dir="ltr" className="nr-ltr">{c.contact.phone}</a><a href={`mailto:${c.contact.email}`} dir="ltr" className="nr-ltr">{c.contact.email}</a><span>{c.contact.office}</span></div>
          <div className="nr-foot-col"><h4>أوقات العمل</h4><span>{c.contact.phoneNote || "يومياً · 9ص – 11م"}</span><a href="#book" className="nr-btn nr-btn-sm nr-foot-cta">احجز موعد</a></div>
        </div>
        <div className="nr-wrap nr-foot-bottom"><span>© {c.brand.ar} — جميع الحقوق محفوظة</span><span className="nr-foot-by">صُمم عبر منصة وجود</span></div>
      </footer>
    </div>
  );
}

const NOOR_CSS = `
.noor{
  --bg:#fff;--bg2:#EFF7F9;--ink:#0C2A33;--slate:#54707A;--line:#E2EDF0;--card:#fff;
  --c:#0B8FA8;--c-d:#076678;--c2:#16B5CE;--c-soft:#E4F6FA;--c-ink:#075563;--amber:#F5A524;
  --s1:0 4px 14px -6px rgba(11,42,51,.12);--s2:0 18px 44px -22px rgba(11,42,51,.2);--s3:0 30px 70px -30px rgba(7,102,120,.34);
  background:var(--bg);color:var(--ink);font-family:'Tajawal',system-ui,sans-serif;line-height:1.8;-webkit-font-smoothing:antialiased;
}
.noor *{box-sizing:border-box}
.noor a{text-decoration:none}
:where(.noor) a{color:inherit}
.noor .disp{font-family:'Cairo','Tajawal',sans-serif;font-weight:800;letter-spacing:-.01em}
.nr-wrap{max-width:1180px;margin:0 auto;padding:0 clamp(20px,5vw,56px)}
.nr-sec{padding:clamp(70px,8vw,118px) 0}
.nr-sec-soft{background:var(--bg2)}
/* buttons */
.nr-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:999px;background:var(--c);color:#fff;font-weight:700;font-size:15.5px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 12px 26px -12px rgba(11,143,168,.7);transition:transform .22s,background .22s,box-shadow .22s}
.nr-btn:hover{transform:translateY(-2px);background:var(--c-d);box-shadow:0 18px 32px -12px rgba(11,143,168,.8)}
.nr-btn-sm{padding:10px 20px;font-size:14.5px;box-shadow:none}
.nr-btn-lg{padding:15px 30px;font-size:16.5px}
.nr-btn-ghost{background:#fff;color:var(--c-ink);border:1.5px solid var(--line);box-shadow:var(--s1)}
.nr-btn-ghost:hover{background:var(--c-soft);border-color:var(--c2)}
.nr-btn-outline{background:transparent;color:var(--c-ink);border:1.5px solid rgba(11,143,168,.32);box-shadow:none}
.nr-btn-outline:hover{background:var(--c-soft);transform:none}
/* nav */
.nr-nav{position:fixed;top:14px;left:0;right:0;z-index:50;display:flex;justify-content:center;padding:0 16px}
.nr-nav-in{display:flex;align-items:center;gap:22px;width:100%;max-width:1100px;background:rgba(255,255,255,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--line);border-radius:999px;padding:9px 12px 9px 22px;box-shadow:var(--s1)}
.nr-brand{display:flex;align-items:center;gap:11px;font-weight:800;font-size:19px}
.nr-logo{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,var(--c),var(--c2));color:#fff;box-shadow:0 8px 18px -8px rgba(11,143,168,.7);overflow:hidden}
.nr-logo-img{background:#fff;border:1px solid var(--line)}
.nr-logo-img img{width:100%;height:100%;object-fit:contain}
.nr-brand-name{font-family:'Cairo',sans-serif}
.nr-nav-links{display:flex;gap:6px;margin-inline-start:auto;font-size:15px;font-weight:500;color:var(--slate)}
.nr-nav-links a{padding:8px 14px;border-radius:999px;transition:background .2s,color .2s}
.nr-nav-links a:hover{background:var(--c-soft);color:var(--c-ink)}
@media(max-width:840px){.nr-nav-links{display:none}}
/* hero */
.nr-hero{position:relative;overflow:hidden;padding:130px 0 70px;background:radial-gradient(900px 500px at 80% -10%,var(--c-soft),transparent 60%),linear-gradient(180deg,#fff,var(--bg2))}
.nr-blob{position:absolute;border-radius:50%;filter:blur(60px);z-index:0}
.nr-blob-1{width:340px;height:340px;background:rgba(22,181,206,.16);top:-120px;right:-80px}
.nr-blob-2{width:300px;height:300px;background:rgba(11,143,168,.1);bottom:60px;left:-100px}
.nr-hero-in{position:relative;z-index:2;text-align:center;max-width:840px}
.nr-pill{display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:14px;font-weight:600;color:var(--c-ink);box-shadow:var(--s1)}
.nr-dot{width:7px;height:7px;border-radius:50%;background:var(--c2)}
.nr-h1{font-size:clamp(38px,5.6vw,68px);line-height:1.12;margin:22px 0 0;color:var(--ink)}
.nr-hero-sub{font-size:clamp(17px,1.4vw,20px);line-height:1.9;color:var(--slate);max-width:600px;margin:22px auto 0}
.nr-hero-cta{display:flex;gap:13px;justify-content:center;margin-top:30px}
.nr-hero-meta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:40px}
.nr-meta{display:flex;flex-direction:column;align-items:center;background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px 26px;box-shadow:var(--s1);min-width:118px}
.nr-meta-v{font-size:28px;color:var(--c);line-height:1}
.nr-meta-l{font-size:13.5px;color:var(--slate);margin-top:5px}
.nr-hero-media{position:relative;margin-top:54px;border-radius:32px;overflow:hidden;box-shadow:var(--s3);border:1px solid rgba(255,255,255,.7)}
.nr-hero-media>img{display:block;width:100%;height:clamp(280px,38vw,460px);object-fit:cover}
.nr-hero-ph{display:grid;place-items:center;width:100%;height:clamp(280px,38vw,460px);background:linear-gradient(135deg,var(--c),var(--c2));color:rgba(255,255,255,.6)}
.nr-chip{position:absolute;display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:18px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);box-shadow:var(--s2)}
.nr-chip-1{bottom:22px;right:22px}
.nr-chip-2{top:22px;left:22px;flex-direction:column;align-items:flex-start;background:var(--c);color:#fff}
.nr-chip-ic{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--c-soft);color:var(--c)}
.nr-chip-t{font-weight:700;font-size:15px;color:var(--ink)}
.nr-chip-s{font-size:12.5px;color:var(--slate)}
.nr-chip-2 .nr-chip-s{color:rgba(255,255,255,.85)}
.nr-chip-big{font-size:26px}
@media(max-width:560px){.nr-chip-1,.nr-chip-2{display:none}}
/* heads */
.nr-head{max-width:640px;margin:0 0 50px}
.nr-head-center{margin-left:auto;margin-right:auto;text-align:center}
.nr-kicker{display:inline-block;font-size:14px;font-weight:700;color:var(--c-ink);background:var(--c-soft);padding:5px 14px;border-radius:999px;margin-bottom:14px}
.nr-h2{font-size:clamp(30px,4.2vw,48px);line-height:1.2;margin:0;color:var(--ink)}
.nr-lead{font-size:18px;line-height:1.9;color:var(--slate);margin:16px 0 0}
.nr-head-center .nr-lead{margin-left:auto;margin-right:auto;max-width:560px}
/* grids */
.nr-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px}
.nr-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,360px));gap:22px;justify-content:center}
.nr-grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,520px));gap:22px;justify-content:center}
/* features */
.nr-feat{padding:32px 28px;border-radius:24px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s}
.nr-feat:hover{transform:translateY(-6px);box-shadow:var(--s2)}
.nr-feat-ic{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:var(--c-soft);color:var(--c)}
.nr-feat h3{font-size:21px;margin:18px 0 8px}
.nr-feat p{font-size:15.5px;line-height:1.85;color:var(--slate);margin:0}
/* services */
.nr-card{padding:30px 26px;border-radius:24px;background:var(--card);border:1px solid var(--line);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s,border-color .3s}
.nr-card:hover{transform:translateY(-6px);box-shadow:var(--s2);border-color:var(--c2)}
.nr-card-ic{display:grid;place-items:center;width:56px;height:56px;border-radius:18px;background:linear-gradient(145deg,var(--c),var(--c2));color:#fff;box-shadow:0 10px 22px -10px rgba(11,143,168,.7)}
.nr-card h3{font-size:21px;margin:18px 0 8px}
.nr-card p{font-size:15px;line-height:1.8;color:var(--slate);margin:0 0 14px}
.nr-card-link{display:inline-flex;align-items:center;gap:6px;color:var(--c);font-weight:700;font-size:14.5px}
/* before/after */
.nr-ba-card{padding:14px;border-radius:22px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.nr-ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.nr-ba-cell{position:relative;aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:var(--bg2)}
.nr-ba-cell img{width:100%;height:100%;object-fit:cover}
.nr-ba-ph{width:100%;height:100%;background:repeating-linear-gradient(45deg,#e7f1f4,#e7f1f4 10px,#dde9ed 10px,#dde9ed 20px)}
.nr-ba-tag{position:absolute;top:10px;right:10px;z-index:2;background:rgba(12,42,51,.72);color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:999px}
.nr-ba-after{background:var(--c)}
.nr-ba-title{text-align:center;font-size:19px;margin:14px 0 6px}
/* stats light band */
.nr-stats-sec{padding:clamp(48px,6vw,76px) 0}
.nr-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;text-align:center}
.nr-stat{padding:8px}
.nr-stat-v{font-size:clamp(38px,4.6vw,54px);color:var(--c)}
.nr-stat-l{color:var(--slate);font-size:15px;margin-top:4px}
/* doctors overlay */
.nr-doc{position:relative;border-radius:24px;overflow:hidden;aspect-ratio:3/4;box-shadow:var(--s2);transition:transform .3s}
.nr-doc:hover{transform:translateY(-6px)}
.nr-doc>img{width:100%;height:100%;object-fit:cover}
.nr-doc-ph{display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(150deg,var(--c),var(--c2));color:rgba(255,255,255,.7)}
.nr-doc-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,38,46,.9),rgba(8,38,46,.1) 55%,transparent)}
.nr-doc-cap{position:absolute;inset-inline:0;bottom:0;padding:22px;z-index:2;color:#fff}
.nr-doc-tag{display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.18);backdrop-filter:blur(4px);font-size:12.5px;font-weight:600;margin-bottom:8px}
.nr-doc-cap h3{font-size:20px;margin:0}
/* process */
.nr-step{text-align:center;padding:26px;border-radius:22px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.nr-step-n{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;margin:0 auto 14px;background:var(--c-soft);color:var(--c);font-size:21px}
.nr-step h3{font-size:19px;margin:0 0 6px}
.nr-step p{font-size:14.5px;color:var(--slate);margin:0;line-height:1.8}
/* pricing */
.nr-price{display:flex;flex-direction:column;padding:34px 30px;border-radius:24px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.nr-price h3{font-size:22px;margin:0}
.nr-price-note{font-size:14px;color:var(--slate);margin:6px 0 0}
.nr-price-v{display:flex;align-items:baseline;gap:7px;margin:18px 0 22px}
.nr-price-v .disp{font-size:42px;color:var(--ink)}
.nr-price-u{color:var(--slate);font-size:15px}
.nr-price-btn{margin-top:auto}
.nr-fine{text-align:center;font-size:14px;color:var(--slate);margin:28px 0 0}
/* testimonials */
.nr-quote{margin:0;padding:28px;border-radius:22px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.nr-stars{display:flex;gap:3px;color:var(--amber);margin-bottom:14px}
.nr-quote blockquote{margin:0 0 18px;font-size:15.5px;line-height:1.85;color:var(--ink)}
.nr-quote figcaption{display:flex;align-items:center;gap:12px}
.nr-av{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:linear-gradient(150deg,var(--c),var(--c2));color:#fff;font-family:'Cairo';font-weight:800;font-size:18px}
.nr-quote figcaption strong{display:block}
.nr-quote figcaption span{color:var(--slate);font-size:13.5px}
/* credentials */
.nr-cred-sec{padding:clamp(46px,6vw,72px) 0}
.nr-cred-lead{text-align:center;margin:0 auto 26px;max-width:560px}
.nr-creds{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.nr-cred{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 22px;box-shadow:var(--s1);min-width:220px}
.nr-cred-ic{flex:none;display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--c-soft);color:var(--c)}
.nr-cred-v{font-weight:700}
.nr-cred-l{font-size:13px;color:var(--slate)}
/* faq centered */
.nr-faq{max-width:780px}
.nr-faq-item{background:#fff;border:1px solid var(--line);border-radius:18px;padding:4px 24px;margin-bottom:12px;box-shadow:var(--s1)}
.nr-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:19px 0;font-weight:700;font-size:17px;cursor:pointer;list-style:none;color:var(--ink)}
.nr-faq-item summary::-webkit-details-marker{display:none}
.nr-faq-plus{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--c-soft);color:var(--c);transition:transform .25s}
.nr-faq-item[open] .nr-faq-plus{transform:rotate(135deg)}
.nr-faq-item p{font-size:15.5px;line-height:1.9;color:var(--slate);margin:0 0 19px}
/* booking */
.nr-book-wrap{max-width:780px}
.nr-book{border-radius:30px;overflow:hidden;box-shadow:var(--s3);border:1px solid var(--line);background:#fff}
.nr-book-head{background:linear-gradient(135deg,var(--c),var(--c-d));color:#fff;padding:34px 34px 30px;text-align:center}
.nr-pill-light{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.3);color:#fff}
.nr-dot-light{background:#fff}
.nr-book-h{font-size:clamp(26px,3.4vw,38px);color:#fff;margin:14px 0 0}
.nr-book-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:18px}
.nr-bchip{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:999px;background:rgba(255,255,255,.14);font-size:14px}
.nr-book-body{padding:30px 34px 34px}
.nr-book-note{text-align:center;color:var(--slate);font-size:14px;margin:16px 0 0}
.nr-map{margin-top:24px;border-radius:24px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/6;box-shadow:var(--s2)}
.nr-map iframe{width:100%;height:100%;border:0}
/* booking form (ClinicBookingForm classes) */
.nr-book-body .cl-form{display:flex;flex-direction:column;gap:16px}
.nr-book-body .cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.nr-book-body .cl-fld{display:flex;flex-direction:column;gap:7px}
.nr-book-body .cl-fld label{font-size:14px;font-weight:600;color:var(--ink)}
.nr-book-body .cl-fld input,.nr-book-body .cl-fld select,.nr-book-body .cl-fld textarea{width:100%;padding:13px 15px;border-radius:13px;border:1.5px solid var(--line);background:#F8FBFC;font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s}
.nr-book-body .cl-fld input:focus,.nr-book-body .cl-fld select:focus,.nr-book-body .cl-fld textarea:focus{border-color:var(--c);box-shadow:0 0 0 4px var(--c-soft);background:#fff}
.nr-book-body .cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.nr-book-body .cl-slot{padding:9px 15px;border-radius:11px;border:1.5px solid var(--line);background:#F8FBFC;font:inherit;cursor:pointer;color:var(--ink);font-size:14.5px;transition:all .18s}
.nr-book-body .cl-slot:hover{border-color:var(--c)}
.nr-book-body .cl-slot-on{background:var(--c);color:#fff;border-color:var(--c)}
.nr-book-body .cl-slots-msg{color:var(--slate);font-size:14px;margin:0}
.nr-book-body .cl-btn{margin-top:4px;width:100%;padding:15px;border-radius:14px;border:none;background:var(--c);color:#fff;font-weight:700;font-size:16.5px;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -14px rgba(11,143,168,.8);transition:transform .22s,background .22s}
.nr-book-body .cl-btn:hover{transform:translateY(-2px);background:var(--c-d)}
/* footer */
.nr-footer{background:linear-gradient(180deg,#0A3540,#072A33);color:#B7D2D8;padding:clamp(58px,7vw,88px) 0 34px}
.nr-foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:42px}
.nr-foot-brand{min-width:240px}
.nr-foot-name{font-size:23px;color:#fff}
.nr-logo-foot{background:linear-gradient(145deg,var(--c2),var(--c))}
.nr-foot-brand p{font-size:15px;line-height:1.9;color:#8FB2BA;margin:18px 0 18px;max-width:280px}
.nr-socs{display:flex;gap:10px}
.nr-socs a{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);transition:background .2s,transform .2s}
.nr-socs a:hover{background:var(--c);transform:translateY(-2px)}
.nr-foot-col h4{font-size:15px;font-weight:700;color:#fff;margin:0 0 16px}
.nr-foot-col a,.nr-foot-col span{display:block;color:#8FB2BA;font-size:15px;margin-bottom:11px;transition:color .2s}
.nr-foot-col a:hover{color:#fff}
.nr-ltr{direction:ltr;text-align:right}
.nr-foot-cta{color:#fff!important;margin-top:4px}
.nr-foot-bottom{margin-top:46px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:13.5px;color:#6E9099}
@media(prefers-reduced-motion:reduce){.noor *{animation:none!important;transition:none!important}}
`;
