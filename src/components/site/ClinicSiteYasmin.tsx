/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import type { ClinicContent } from "@/lib/clinic-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// "Yasmin" clinic template — soft med-spa aesthetic. Warm cream + muted rose,
// organic blob shapes, Reem Kufi (headings) + Tajawal (body). For cosmetic /
// derma / dental clinics. Data-driven from ClinicContent + the booking engine.

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
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.split("|").map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const I = {
  bloom: "M12 3c1.6 0 2.6 1.3 2.6 3 0 .5-.1.9-.2 1.3 1.4-.7 3-.6 3.8.8.8 1.4.2 3-.9 3.7.4.2.8.6 1 1.1.6 1.5-.3 3-1.8 3.2-.4 0-.7 0-1-.1.3 1.5-.6 2.9-2.1 3-.6 0-1.2-.2-1.6-.6-.4.4-1 .6-1.6.6-1.5-.1-2.4-1.5-2.1-3-.3.1-.6.1-1 .1-1.5-.2-2.4-1.7-1.8-3.2.2-.5.5-.9 1-1.1-1.1-.7-1.7-2.3-.9-3.7.8-1.4 2.4-1.5 3.8-.8-.1-.4-.2-.8-.2-1.3 0-1.7 1-3 2.6-3z|M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  sparkle: "M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z",
  heart: "M12 20s-7-4.3-9.2-8.4C1.3 8.7 2.6 5.5 5.7 5.1 7.8 4.8 9.4 6 12 8.8 14.6 6 16.2 4.8 18.3 5.1c3.1.4 4.4 3.6 2.9 6.5C19 15.7 12 20 12 20z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8z|M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7",
  drop: "M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z",
  leaf: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14z|M5 19c4-4 7-6 10-7",
  shield: "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z|M9.3 11.5l1.8 1.8 3.6-3.7",
  check: "M5 12.5l4 4L19 7",
  arrow: "M14 6l-6 6 6 6",
  plus: "M12 5v14|M5 12h14",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  mail: "M3 6h18v12H3z|M3 7l9 6 9-6",
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z|M12 11a2 2 0 100-4 2 2 0 000 4z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z",
  clock: "M12 7v5l3 2|M12 21a9 9 0 100-18 9 9 0 000 18z",
};
const SOC: Record<string, ReactElement> = {
  whatsapp: <Svg d="M12 3a9 9 0 00-7.7 13.5L3 21l4.6-1.2A9 9 0 1012 3z" s={17} />,
  instagram: <Svg d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z|M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" s={17} />,
  snapchat: <Svg d="M12 3c2.4 0 3.6 1.8 3.6 4.1 0 1 .1 1.7.1 1.9.3.6 1.2.4 1.6.6.5.2.4.7-.1 1-.6.3-1.4.4-1.5.9-.1.4.8 1.7 2.5 2.5.5.2.4.6 0 .8-.5.3-1.3.2-1.6.7-.2.4 0 .9-.6 1-.6.1-1.3-.4-2-.1-.8.3-1.3 1.1-2.5 1.1s-1.7-.8-2.5-1.1c-.7-.3-1.4.2-2 .1-.6-.1-.4-.6-.6-1-.3-.5-1.1-.4-1.6-.7-.4-.2-.5-.6 0-.8 1.7-.8 2.6-2.1 2.5-2.5-.1-.5-.9-.6-1.5-.9-.5-.3-.6-.8-.1-1 .4-.2 1.3 0 1.6-.6 0-.2.1-.9.1-1.9C8.4 4.8 9.6 3 12 3z" s={17} />,
  tiktok: <Svg d="M16 4c.3 2 1.6 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.5-1v5.4a5.3 5.3 0 11-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 102 2.5V4z" s={17} />,
  linkedin: <Svg d="M5 4a2 2 0 100 4 2 2 0 000-4z|M4 9h2v11H4z|M9 9h2v1.6a3 3 0 015 2.3V20h-2v-5a1.5 1.5 0 00-3 0v5H9z" s={17} />,
};
const SVC = [I.bloom, I.sparkle, I.drop, I.heart, I.leaf, I.user];

export default function ClinicSiteYasmin({
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
    v.doctors && doctors.length > 0 && { href: "#doctors", label: "الطبيبات" },
    v.prices && c.prices.items.length > 0 && { href: "#pricing", label: "الأسعار" },
    v.faq && c.faq.items.length > 0 && { href: "#faq", label: "الأسئلة" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="yas" dir="rtl">
      <style>{YAS_CSS}</style>

      {/* NAV */}
      <nav className="ya-nav">
        <div className="ya-wrap ya-nav-in">
          <a href="#top" className="ya-brand">
            <span className={`ya-logo${c.brand.logo ? " ya-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.bloom} s={20} fill />}</span>
            <span className="disp ya-brand-name">{c.brand.ar}</span>
          </a>
          <div className="ya-nav-links">{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <a href="#book" className="ya-btn ya-btn-sm">احجز موعد</a>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="ya-hero">
        <span className="ya-blob ya-blob-1" aria-hidden="true" />
        <span className="ya-blob ya-blob-2" aria-hidden="true" />
        <div className="ya-wrap ya-hero-grid">
          <div className="ya-hero-text">
            <span className="ya-chip"><Svg d={I.sparkle} s={15} fill />{c.hero.eyebrow}</span>
            <h1 className="disp ya-h1">{c.hero.title}</h1>
            <p className="ya-hero-sub">{c.hero.subtitle}</p>
            <div className="ya-hero-cta">
              <a href="#book" className="ya-btn ya-btn-lg">احجز موعدك <Svg d={I.arrow} s={18} /></a>
              {v.specialties && <a href="#services" className="ya-btn ya-btn-ghost ya-btn-lg">خدماتنا</a>}
            </div>
            {c.hero.meta.length > 0 && (
              <div className="ya-hero-stats">
                {c.hero.meta.map((m, i) => (<div key={i} className="ya-hs"><span className="disp ya-hs-v">{m.value}</span><span className="ya-hs-l">{m.label}</span></div>))}
              </div>
            )}
          </div>
          <div className="ya-hero-media">
            <div className="ya-blobimg">{c.hero.image ? <img src={c.hero.image} alt={c.brand.ar} /> : <div className="ya-blobimg-ph"><Svg d={I.bloom} s={64} fill /></div>}</div>
            <div className="ya-float ya-float-1"><span className="ya-float-ic"><Svg d={I.clock} s={19} /></span><div><div className="ya-float-t">حجز أونلاين فوري</div><div className="ya-float-s">خلال أقل من دقيقة</div></div></div>
            {c.stats.length > 0 && <div className="ya-float ya-float-2"><span className="disp ya-float-big">{c.stats[c.stats.length - 1].value}{c.stats[c.stats.length - 1].suffix}</span><div className="ya-float-s">{c.stats[c.stats.length - 1].label}</div></div>}
          </div>
        </div>
      </header>

      {/* HIGHLIGHTS */}
      {v.about && (
        <section className="ya-sec">
          <div className="ya-wrap ya-grid3">
            {[
              { d: I.heart, t: "رعاية تتمحور حولك", p: c.about.lead },
              { d: I.sparkle, t: "أحدث التقنيات", p: "أجهزة من أحدث الأجيال لنتائج أدق وتعافٍ أسرع وأكثر أماناً." },
              { d: I.user, t: "نخبة المختصّات", p: "فريق من أمهر الطبيبات وأصحاب الخبرات الطويلة في تخصصاتهم." },
            ].map((f, i) => (<div key={i} className="ya-feat"><span className="ya-feat-ic"><Svg d={f.d} s={26} /></span><h3 className="disp">{f.t}</h3><p>{f.p}</p></div>))}
          </div>
        </section>
      )}

      {/* SERVICES */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="services" className="ya-sec ya-sec-soft">
          <div className="ya-wrap">
            <div className="ya-head"><span className="ya-kicker">خدماتنا</span><h2 className="disp ya-h2">{c.specialties.title}</h2><p className="ya-lead">{c.specialties.lead}</p></div>
            <div className="ya-grid-auto">
              {c.specialties.items.map((s, i) => (<div key={i} className="ya-card"><span className="ya-card-ic"><Svg d={SVC[i % SVC.length]} s={24} /></span><h3 className="disp">{s.title}</h3><p>{s.desc}</p><a href="#book" className="ya-card-link">احجز استشارة <Svg d={I.arrow} s={14} /></a></div>))}
            </div>
          </div>
        </section>
      )}

      {/* BEFORE/AFTER */}
      {v.results && c.results.items.length > 0 && (
        <section className="ya-sec">
          <div className="ya-wrap">
            <div className="ya-head"><span className="ya-kicker">نتائجنا</span><h2 className="disp ya-h2">{c.results.title}</h2><p className="ya-lead">{c.results.lead}</p></div>
            <div className="ya-grid2">
              {c.results.items.map((r, i) => (<div key={i} className="ya-ba-card"><div className="ya-ba"><div className="ya-ba-cell"><span className="ya-ba-tag">قبل</span>{r.before ? <img src={r.before} alt="قبل" /> : <div className="ya-ba-ph" />}</div><div className="ya-ba-cell"><span className="ya-ba-tag ya-ba-after">بعد</span>{r.after ? <img src={r.after} alt="بعد" /> : <div className="ya-ba-ph" />}</div></div><h3 className="disp ya-ba-title">{r.title}</h3></div>))}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {v.stats && c.stats.length > 0 && (
        <section className="ya-stats-sec">
          <div className="ya-wrap ya-stats">
            {c.stats.map((s, i) => (<div key={i} className="ya-stat"><div className="disp ya-stat-v">{s.value}{s.suffix}</div><div className="ya-stat-l">{s.label}</div></div>))}
          </div>
        </section>
      )}

      {/* DOCTORS */}
      {v.doctors && doctors.length > 0 && (
        <section id="doctors" className="ya-sec ya-sec-soft">
          <div className="ya-wrap">
            <div className="ya-head"><span className="ya-kicker">فريقنا</span><h2 className="disp ya-h2">{c.doctors.title}</h2><p className="ya-lead">{c.doctors.lead}</p></div>
            <div className="ya-grid-auto">
              {doctors.map((d) => (<div key={d.id} className="ya-doc"><div className="ya-doc-img">{d.image ? <img src={d.image} alt={d.name} /> : <div className="ya-doc-ph"><Svg d={I.user} s={44} /></div>}</div><h3 className="disp">{d.name}</h3>{d.specialty && <span className="ya-doc-spec">{d.specialty}</span>}</div>))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {v.process && c.process.length > 0 && (
        <section className="ya-sec">
          <div className="ya-wrap">
            <div className="ya-head"><span className="ya-kicker">التجربة</span><h2 className="disp ya-h2">رحلة العناية بك</h2></div>
            <div className="ya-grid-auto">
              {c.process.map((p, i) => (<div key={i} className="ya-step"><span className="disp ya-step-n">{i + 1}</span><h3 className="disp">{p.title}</h3><p>{p.desc}</p></div>))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      {v.prices && c.prices.items.length > 0 && (
        <section id="pricing" className="ya-sec ya-sec-soft">
          <div className="ya-wrap">
            <div className="ya-head ya-head-center"><span className="ya-kicker">الأسعار</span><h2 className="disp ya-h2">باقات عناية بأسعار واضحة</h2><p className="ya-lead">{c.prices.lead}</p></div>
            <div className="ya-grid-auto">
              {c.prices.items.map((p, i) => (<div key={i} className="ya-price"><h3 className="disp">{p.name}</h3>{p.note && <p className="ya-price-note">{p.note}</p>}<div className="ya-price-v"><span className="disp">{p.price}</span><span className="ya-price-u">{c.prices.unit}</span></div><a href="#book" className="ya-btn ya-btn-outline ya-price-btn">احجز الآن</a></div>))}
            </div>
            <p className="ya-fine">{c.prices.note}</p>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="ya-sec">
          <div className="ya-wrap">
            <div className="ya-head ya-head-center"><span className="ya-kicker">آراء المريضات</span><h2 className="disp ya-h2">ماذا قلن عنّا</h2></div>
            <div className="ya-grid-auto">
              {c.testimonials.map((t, i) => (<figure key={i} className="ya-quote"><div className="ya-stars">{[0, 1, 2, 3, 4].map((s) => <Svg key={s} d={I.star} s={15} fill />)}</div><blockquote>«{t.quote}»</blockquote><figcaption><span className="disp ya-av">{t.name.trim().charAt(0)}</span><div><strong>{t.name}</strong><span>{t.role}</span></div></figcaption></figure>))}
            </div>
          </div>
        </section>
      )}

      {/* CREDENTIALS */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="ya-sec ya-sec-soft ya-cred-sec">
          <div className="ya-wrap"><p className="ya-lead ya-cred-lead">{c.credentials.lead}</p><div className="ya-creds">{c.credentials.badges.map((b, i) => (<div key={i} className="ya-cred"><span className="ya-cred-ic"><Svg d={I.shield} s={20} /></span><div><div className="disp ya-cred-v">{b.value}</div><div className="ya-cred-l">{b.label}</div></div></div>))}</div></div>
        </section>
      )}

      {/* FAQ */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="ya-sec">
          <div className="ya-wrap ya-faq">
            <div className="ya-head ya-head-center"><span className="ya-kicker">الأسئلة الشائعة</span><h2 className="disp ya-h2">كل ما تودّين معرفته</h2></div>
            {c.faq.items.map((f, i) => (<details key={i} className="ya-faq-item"><summary>{f.q}<span className="ya-faq-plus"><Svg d={I.plus} s={18} /></span></summary><p>{f.a}</p></details>))}
          </div>
        </section>
      )}

      {/* BOOKING */}
      {v.booking && (
        <section id="book" className="ya-sec ya-sec-soft">
          <div className="ya-wrap ya-book-wrap">
            <div className="ya-book">
              <div className="ya-book-head">
                <span className="ya-chip ya-chip-light"><Svg d={I.clock} s={15} />{c.booking.title}</span>
                <h2 className="disp ya-book-h">{c.booking.lead}</h2>
                <div className="ya-book-chips">
                  <a className="ya-bchip" href={`tel:${c.contact.phone}`}><Svg d={I.phone} s={15} /><span dir="ltr">{c.contact.phone}</span></a>
                  <span className="ya-bchip"><Svg d={I.pin} s={15} />{c.contact.office}</span>
                </div>
              </div>
              <div className="ya-book-body">
                <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
                <p className="ya-book-note">{c.booking.note}</p>
              </div>
            </div>
            {mapSrc && <div className="ya-map"><iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="ya-footer">
        <div className="ya-wrap ya-foot-grid">
          <div className="ya-foot-brand">
            <div className="ya-brand"><span className={`ya-logo ya-logo-foot${c.brand.logo ? " ya-logo-img" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} /> : <Svg d={I.bloom} s={16} fill />}</span><span className="disp ya-foot-name">{c.brand.ar}</span></div>
            <p>{c.about.lead}</p>
            {socials.length > 0 && <div className="ya-socs">{socials.map((s) => <a key={s.k} href={s.href} target="_blank" rel="noreferrer" aria-label={s.k}>{SOC[s.k]}</a>)}</div>}
          </div>
          <div className="ya-foot-col"><h4>روابط</h4>{nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</div>
          <div className="ya-foot-col"><h4>تواصل</h4><a href={`tel:${c.contact.phone}`} dir="ltr" className="ya-ltr">{c.contact.phone}</a><a href={`mailto:${c.contact.email}`} dir="ltr" className="ya-ltr">{c.contact.email}</a><span>{c.contact.office}</span></div>
          <div className="ya-foot-col"><h4>أوقات العمل</h4><span>{c.contact.phoneNote || "يومياً · 9ص – 11م"}</span><a href="#book" className="ya-btn ya-btn-sm ya-foot-cta">احجز موعد</a></div>
        </div>
        <div className="ya-wrap ya-foot-bottom"><span>© {c.brand.ar} — جميع الحقوق محفوظة</span><span className="ya-foot-by">صُمم عبر منصة وجود</span></div>
      </footer>
    </div>
  );
}

const YAS_CSS = `
.yas{
  --bg:#FBF6F2;--bg2:#F7EBE6;--ink:#33252A;--muted:#8B7882;--muted2:#B3A2A8;--line:#EFE0DA;
  --rose:#C9788A;--rose-d:#A85567;--rose2:#E0A6B0;--rose-soft:#F8E8EA;--rose-ink:#8A4654;
  --grad:linear-gradient(135deg,#E2A6B0,#C9788A);--card:#fff;
  --s1:0 6px 18px -8px rgba(168,85,103,.18);--s2:0 20px 44px -22px rgba(168,85,103,.26);--s3:0 30px 70px -30px rgba(168,85,103,.32);
  --blob:58% 42% 52% 48% / 55% 50% 50% 45%;
  background:var(--bg);color:var(--ink);font-family:'Tajawal',system-ui,sans-serif;line-height:1.85;-webkit-font-smoothing:antialiased;
}
.yas *{box-sizing:border-box}
.yas a{text-decoration:none}
:where(.yas) a{color:inherit}
.yas .disp{font-family:'Reem Kufi','Tajawal',sans-serif;font-weight:600;letter-spacing:0}
.ya-wrap{max-width:1180px;margin:0 auto;padding:0 clamp(20px,5vw,56px)}
.ya-sec{padding:clamp(70px,8vw,120px) 0}
.ya-sec-soft{background:var(--bg2)}
/* buttons */
.ya-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 26px;border-radius:999px;background:var(--grad);color:#fff;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -14px rgba(168,85,103,.6);transition:transform .25s,box-shadow .25s,filter .25s}
.ya-btn:hover{transform:translateY(-2px);filter:brightness(1.04);box-shadow:0 20px 38px -14px rgba(168,85,103,.7)}
.ya-btn-sm{padding:10px 20px;font-size:14px;box-shadow:none}
.ya-btn-lg{padding:15px 30px;font-size:16.5px}
.ya-btn-ghost{background:#fff;color:var(--rose-ink);border:1.5px solid var(--line);box-shadow:var(--s1)}
.ya-btn-ghost:hover{background:var(--rose-soft);border-color:var(--rose2);filter:none}
.ya-btn-outline{background:transparent;color:var(--rose-ink);border:1.5px solid rgba(168,85,103,.3);box-shadow:none}
.ya-btn-outline:hover{background:var(--rose-soft);transform:none}
/* nav */
.ya-nav{position:fixed;top:0;right:0;left:0;z-index:50;background:rgba(251,246,242,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.ya-nav-in{display:flex;align-items:center;gap:24px;height:72px}
.ya-brand{display:flex;align-items:center;gap:11px}
.ya-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:var(--grad);color:#fff;box-shadow:0 8px 18px -8px rgba(168,85,103,.6);overflow:hidden}
.ya-logo-img{background:#fff;border:1px solid var(--line)}
.ya-logo-img img{width:100%;height:100%;object-fit:contain}
.ya-brand-name{font-size:23px;color:var(--ink)}
.ya-nav-links{display:flex;gap:6px;margin-inline-start:auto;font-size:15px;color:var(--muted);font-weight:500}
.ya-nav-links a{padding:8px 14px;border-radius:999px;transition:color .2s,background .2s}
.ya-nav-links a:hover{color:var(--rose-ink);background:var(--rose-soft)}
@media(max-width:840px){.ya-nav-links{display:none}}
/* hero */
.ya-hero{position:relative;overflow:hidden;padding:140px 0 84px;background:radial-gradient(800px 480px at 80% -5%,var(--rose-soft),transparent 58%),linear-gradient(180deg,#fff,var(--bg))}
.ya-blob{position:absolute;border-radius:50%;filter:blur(56px);z-index:0}
.ya-blob-1{width:360px;height:360px;background:rgba(224,166,176,.34);top:-100px;right:-90px}
.ya-blob-2{width:300px;height:300px;background:rgba(201,120,138,.14);bottom:30px;left:-110px}
.ya-hero-grid{position:relative;z-index:2;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(40px,5vw,70px);align-items:center}
@media(max-width:900px){.ya-hero-grid{grid-template-columns:1fr;gap:46px}}
.ya-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:14px;font-weight:600;color:var(--rose-ink);box-shadow:var(--s1)}
.ya-h1{font-size:clamp(40px,5.8vw,72px);line-height:1.14;margin:22px 0 0;color:var(--ink);font-weight:600}
.ya-hero-sub{font-size:clamp(16px,1.3vw,19px);line-height:1.95;color:var(--muted);max-width:540px;margin:22px 0 0}
.ya-hero-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}
.ya-hero-stats{display:flex;flex-wrap:wrap;gap:clamp(22px,3vw,42px);margin-top:46px;padding-top:28px;border-top:1px solid var(--line)}
.ya-hs-v{font-size:36px;color:var(--rose-d);line-height:1;display:block}
.ya-hs-l{font-size:14px;color:var(--muted);margin-top:4px;display:block}
.ya-hero-media{position:relative}
.ya-blobimg{position:relative;border-radius:var(--blob);overflow:hidden;box-shadow:var(--s3);border:6px solid #fff}
.ya-blobimg img{display:block;width:100%;height:clamp(420px,50vw,540px);object-fit:cover}
.ya-blobimg-ph{display:grid;place-items:center;width:100%;height:clamp(420px,50vw,540px);background:linear-gradient(150deg,var(--rose-soft),var(--bg2));color:var(--rose2)}
.ya-float{position:absolute;display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:18px;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);box-shadow:var(--s2)}
.ya-float-1{bottom:30px;right:-14px}
.ya-float-2{top:24px;left:-12px;flex-direction:column;align-items:flex-start;background:var(--grad);color:#fff}
.ya-float-ic{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--rose-soft);color:var(--rose)}
.ya-float-t{font-weight:700;font-size:14.5px;color:var(--ink)}
.ya-float-s{font-size:12.5px;color:var(--muted)}
.ya-float-2 .ya-float-s{color:rgba(255,255,255,.85)}
.ya-float-big{font-size:26px}
@media(max-width:560px){.ya-float-1,.ya-float-2{display:none}}
/* heads */
.ya-head{max-width:640px;margin:0 0 50px}
.ya-head-center{margin-left:auto;margin-right:auto;text-align:center}
.ya-kicker{display:inline-block;font-size:14px;font-weight:700;color:var(--rose-ink);background:var(--rose-soft);padding:5px 15px;border-radius:999px;margin-bottom:14px}
.ya-h2{font-size:clamp(30px,4.2vw,50px);line-height:1.2;margin:0;color:var(--ink);font-weight:600}
.ya-lead{font-size:18px;line-height:1.9;color:var(--muted);margin:16px 0 0}
.ya-head-center .ya-lead{margin-left:auto;margin-right:auto;max-width:560px}
/* grids */
.ya-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px}
.ya-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,360px));gap:22px;justify-content:center}
.ya-grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,520px));gap:22px;justify-content:center}
/* features */
.ya-feat{padding:32px 28px;border-radius:28px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s}
.ya-feat:hover{transform:translateY(-6px);box-shadow:var(--s2)}
.ya-feat-ic{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:var(--rose-soft);color:var(--rose)}
.ya-feat h3{font-size:21px;margin:18px 0 8px;color:var(--ink)}
.ya-feat p{font-size:15.5px;line-height:1.85;color:var(--muted);margin:0}
/* services */
.ya-card{padding:30px 26px;border-radius:28px;background:var(--card);border:1px solid var(--line);box-shadow:var(--s1);transition:transform .3s,box-shadow .3s,border-color .3s}
.ya-card:hover{transform:translateY(-6px);box-shadow:var(--s2);border-color:var(--rose2)}
.ya-card-ic{display:grid;place-items:center;width:56px;height:56px;border-radius:20px;background:var(--grad);color:#fff;box-shadow:0 10px 22px -10px rgba(168,85,103,.6)}
.ya-card h3{font-size:21px;margin:18px 0 8px;color:var(--ink)}
.ya-card p{font-size:15px;line-height:1.8;color:var(--muted);margin:0 0 14px}
.ya-card-link{display:inline-flex;align-items:center;gap:6px;color:var(--rose-d);font-weight:700;font-size:14.5px}
/* before/after */
.ya-ba-card{padding:14px;border-radius:26px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.ya-ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ya-ba-cell{position:relative;aspect-ratio:4/3;border-radius:18px;overflow:hidden;background:var(--bg2)}
.ya-ba-cell img{width:100%;height:100%;object-fit:cover}
.ya-ba-ph{width:100%;height:100%;background:repeating-linear-gradient(45deg,#f3e3e1,#f3e3e1 10px,#efdad9 10px,#efdad9 20px)}
.ya-ba-tag{position:absolute;top:10px;right:10px;z-index:2;background:rgba(51,37,42,.7);color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:999px}
.ya-ba-after{background:var(--rose)}
.ya-ba-title{text-align:center;font-size:20px;margin:14px 0 6px;color:var(--ink)}
/* stats */
.ya-stats-sec{padding:clamp(48px,6vw,76px) 0;background:radial-gradient(600px 240px at 50% 0,var(--rose-soft),transparent 70%)}
.ya-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;text-align:center}
.ya-stat-v{font-size:clamp(40px,4.8vw,56px);color:var(--rose-d);line-height:1}
.ya-stat-l{color:var(--muted);font-size:15px;margin-top:6px}
/* doctors */
.ya-doc{background:#fff;border:1px solid var(--line);border-radius:28px;padding:28px;text-align:center;box-shadow:var(--s1);transition:transform .3s,box-shadow .3s}
.ya-doc:hover{transform:translateY(-6px);box-shadow:var(--s2)}
.ya-doc-img{width:150px;height:150px;margin:0 auto 16px;border-radius:58% 42% 52% 48% / 55% 50% 50% 45%;overflow:hidden;background:var(--rose-soft)}
.ya-doc-img img{width:100%;height:100%;object-fit:cover}
.ya-doc-ph{display:grid;place-items:center;width:100%;height:100%;color:var(--rose2)}
.ya-doc h3{font-size:22px;margin:0 0 6px;color:var(--ink)}
.ya-doc-spec{display:inline-block;font-size:13.5px;color:var(--rose-d);background:var(--rose-soft);padding:4px 14px;border-radius:999px}
/* process */
.ya-step{text-align:center;padding:28px;border-radius:28px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.ya-step-n{display:grid;place-items:center;width:54px;height:54px;border-radius:50%;margin:0 auto 14px;background:var(--rose-soft);color:var(--rose-d);font-size:22px}
.ya-step h3{font-size:20px;margin:0 0 6px;color:var(--ink)}
.ya-step p{font-size:14.5px;color:var(--muted);margin:0;line-height:1.8}
/* pricing */
.ya-price{display:flex;flex-direction:column;padding:34px 30px;border-radius:28px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.ya-price h3{font-size:22px;margin:0;color:var(--ink)}
.ya-price-note{font-size:14px;color:var(--muted);margin:6px 0 0}
.ya-price-v{display:flex;align-items:baseline;gap:7px;margin:18px 0 22px}
.ya-price-v .disp{font-size:42px;color:var(--rose-d)}
.ya-price-u{color:var(--muted);font-size:15px}
.ya-price-btn{margin-top:auto}
.ya-fine{text-align:center;font-size:14px;color:var(--muted2);margin:28px 0 0}
/* testimonials */
.ya-quote{margin:0;padding:28px;border-radius:28px;background:#fff;border:1px solid var(--line);box-shadow:var(--s1)}
.ya-stars{display:flex;gap:3px;color:var(--rose);margin-bottom:14px}
.ya-quote blockquote{margin:0 0 18px;font-size:15.5px;line-height:1.85;color:var(--ink)}
.ya-quote figcaption{display:flex;align-items:center;gap:12px}
.ya-av{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--grad);color:#fff;font-size:19px}
.ya-quote figcaption strong{display:block;color:var(--ink)}
.ya-quote figcaption span{color:var(--muted);font-size:13.5px}
/* credentials */
.ya-cred-sec{padding:clamp(46px,6vw,72px) 0}
.ya-cred-lead{text-align:center;margin:0 auto 26px;max-width:560px}
.ya-creds{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.ya-cred{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 22px;box-shadow:var(--s1);min-width:220px}
.ya-cred-ic{flex:none;display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--rose-soft);color:var(--rose)}
.ya-cred-v{font-size:18px;color:var(--ink)}
.ya-cred-l{font-size:13px;color:var(--muted)}
/* faq */
.ya-faq{max-width:780px}
.ya-faq-item{background:#fff;border:1px solid var(--line);border-radius:22px;padding:4px 24px;margin-bottom:12px;box-shadow:var(--s1)}
.ya-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:19px 0;font-weight:700;font-size:17px;cursor:pointer;list-style:none;color:var(--ink)}
.ya-faq-item summary::-webkit-details-marker{display:none}
.ya-faq-plus{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--rose-soft);color:var(--rose);transition:transform .25s}
.ya-faq-item[open] .ya-faq-plus{transform:rotate(135deg)}
.ya-faq-item p{font-size:15.5px;line-height:1.9;color:var(--muted);margin:0 0 19px}
/* booking */
.ya-book-wrap{max-width:780px}
.ya-book{border-radius:32px;overflow:hidden;box-shadow:var(--s3);border:1px solid var(--line);background:#fff}
.ya-book-head{background:var(--grad);color:#fff;padding:34px 34px 30px;text-align:center}
.ya-chip-light{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.32);color:#fff}
.ya-book-h{font-size:clamp(26px,3.4vw,38px);color:#fff;margin:14px 0 0}
.ya-book-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:18px}
.ya-bchip{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:999px;background:rgba(255,255,255,.16);font-size:14px}
.ya-book-body{padding:30px 34px 34px}
.ya-book-note{text-align:center;color:var(--muted);font-size:14px;margin:16px 0 0}
.ya-map{margin-top:24px;border-radius:24px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/6;box-shadow:var(--s2)}
.ya-map iframe{width:100%;height:100%;border:0}
/* booking form */
.ya-book-body .cl-form{display:flex;flex-direction:column;gap:16px}
.ya-book-body .cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.ya-book-body .cl-fld{display:flex;flex-direction:column;gap:7px}
.ya-book-body .cl-fld label{font-size:14px;font-weight:600;color:var(--ink)}
.ya-book-body .cl-fld input,.ya-book-body .cl-fld select,.ya-book-body .cl-fld textarea{width:100%;padding:13px 15px;border-radius:14px;border:1.5px solid var(--line);background:#FDF8F6;font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s}
.ya-book-body .cl-fld input:focus,.ya-book-body .cl-fld select:focus,.ya-book-body .cl-fld textarea:focus{border-color:var(--rose);box-shadow:0 0 0 4px var(--rose-soft);background:#fff}
.ya-book-body .cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.ya-book-body .cl-slot{padding:9px 15px;border-radius:12px;border:1.5px solid var(--line);background:#FDF8F6;font:inherit;cursor:pointer;color:var(--ink);font-size:14.5px;transition:all .18s}
.ya-book-body .cl-slot:hover{border-color:var(--rose)}
.ya-book-body .cl-slot-on{background:var(--grad);color:#fff;border-color:transparent}
.ya-book-body .cl-slots-msg{color:var(--muted);font-size:14px;margin:0}
.ya-book-body .cl-btn{margin-top:4px;width:100%;padding:15px;border-radius:16px;border:none;background:var(--grad);color:#fff;font-weight:700;font-size:16.5px;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -14px rgba(168,85,103,.7);transition:transform .22s,filter .22s}
.ya-book-body .cl-btn:hover{transform:translateY(-2px);filter:brightness(1.04)}
/* footer */
.ya-footer{background:#3A2A30;color:#D8C4CB;padding:clamp(58px,7vw,88px) 0 34px}
.ya-foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:42px}
.ya-foot-brand{min-width:240px}
.ya-foot-name{font-size:23px;color:#fff}
.ya-logo-foot{background:var(--grad)}
.ya-foot-brand p{font-size:15px;line-height:1.9;color:#B79CA6;margin:18px 0 18px;max-width:280px}
.ya-socs{display:flex;gap:10px}
.ya-socs a{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);transition:background .2s,transform .2s}
.ya-socs a:hover{background:var(--rose);transform:translateY(-2px)}
.ya-foot-col h4{font-size:14.5px;font-weight:700;color:#fff;margin:0 0 16px}
.ya-foot-col a,.ya-foot-col span{display:block;color:#B79CA6;font-size:15px;margin-bottom:11px;transition:color .2s}
.ya-foot-col a:hover{color:#fff}
.ya-ltr{direction:ltr;text-align:right}
.ya-foot-cta{color:#fff!important;margin-top:4px}
.ya-foot-bottom{margin-top:46px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:13.5px;color:#9A818B}
@media(prefers-reduced-motion:reduce){.yas *{animation:none!important;transition:none!important}}
`;
