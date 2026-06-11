/* eslint-disable @next/next/no-img-element */
import type { ReactElement } from "react";
import type { ClinicContent } from "@/lib/clinic-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// "Safa" clinic template — recreated from the Claude Design handoff.
// Warm cream + deep green + gold · El Messiri (headings) + IBM Plex Sans Arabic.
// Fully data-driven from ClinicContent + the live booking engine.

function waLink(num: string): string | null {
  const digits = (num || "").replace(/[^\d]/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

const SOCIAL_SVG: Record<string, ReactElement> = {
  instagram: (<><rect x="3" y="3" width="18" height="18" rx="5" stroke="#D8BC7E" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" stroke="#D8BC7E" strokeWidth="1.5" /><circle cx="17.5" cy="6.5" r="1" fill="#D8BC7E" /></>),
  snapchat: (<path d="M12 3c2.4 0 3.7 1.8 3.7 4.2 0 1 .1 1.7.1 1.9.3.6 1.2.4 1.7.6.4.2.3.7-.2 1-.6.3-1.4.4-1.5.9-.1.4.8 1.8 2.6 2.6.5.2.4.6 0 .8-.6.3-1.4.2-1.7.7-.2.4 0 .9-.6 1-.6.1-1.3-.4-2.1-.1-.8.3-1.3 1.2-2.5 1.2s-1.7-.9-2.5-1.2c-.8-.3-1.5.2-2.1.1-.6-.1-.4-.6-.6-1-.3-.5-1.1-.4-1.7-.7-.4-.2-.5-.6 0-.8 1.8-.8 2.7-2.2 2.6-2.6-.1-.5-.9-.6-1.5-.9-.5-.3-.6-.8-.2-1 .5-.2 1.4 0 1.7-.6 0-.2.1-.9.1-1.9C8.3 4.8 9.6 3 12 3z" stroke="#D8BC7E" strokeWidth="1.4" strokeLinejoin="round" />),
  tiktok: (<path d="M16 4c.3 2 1.6 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.5-1v5.4a5.3 5.3 0 11-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 102 2.5V4h2.4z" stroke="#D8BC7E" strokeWidth="1.4" strokeLinejoin="round" />),
  linkedin: (<path d="M5 4a2 2 0 100 4 2 2 0 000-4zM4 9h2v11H4zM9 9h2v1.6a3 3 0 015 2.3V20h-2v-5a1.5 1.5 0 00-3 0v5H9z" stroke="#D8BC7E" strokeWidth="1.4" strokeLinejoin="round" />),
  whatsapp: (<path d="M12 3a9 9 0 00-7.7 13.5L3 21l4.6-1.2A9 9 0 1012 3zm4.2 11.3c-.2.5-1 1-1.5 1-.4 0-.9.1-2.6-.6-2.2-.9-3.6-3.1-3.7-3.3-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8a.8.8 0 01.6-.3h.4c.2 0 .3 0 .5.4l.7 1.6c0 .2.1.3 0 .5l-.4.5c-.2.2-.3.3-.1.6.2.3.7 1.1 1.5 1.7 1 .8 1.7 1 2 1.1.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.5.8c.2.1.4.2.4.3z" stroke="#D8BC7E" strokeWidth="1.2" strokeLinejoin="round" />),
};

function socialHref(kind: string, raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, "");
  switch (kind) {
    case "instagram": return `https://instagram.com/${h}`;
    case "snapchat": return `https://snapchat.com/add/${h}`;
    case "tiktok": return `https://tiktok.com/@${h}`;
    case "linkedin": return `https://www.linkedin.com/in/${h}`;
    default: return v;
  }
}

// Leaf logo mark.
const Leaf = ({ fill = "#D8BC7E" }: { fill?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21c0-5 -3-7 -7-8 4-1 7-3 7-9 0 6 3 8 7 9-4 1-7 3-7 8z" fill={fill} /></svg>
);
const Chevron = ({ c = "#D8BC7E", s = 18 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Six service icons (gold on green), cycled across specialty cards.
const SERVICE_ICONS = [
  <path key="0" d="M8 3c-2.5 0-4 2-4 5 0 2 .6 3.4.9 6 .3 2.4.4 6 2.1 6 1.4 0 1.3-3 3-3s1.6 3 3 3c1.7 0 1.8-3.6 2.1-6 .3-2.6.9-4 .9-6 0-3-1.5-5-4-5-1.6 0-2 1-4 1s-2.4-1-4-1z" stroke="#D8BC7E" strokeWidth="1.6" strokeLinejoin="round" />,
  <g key="1"><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18" stroke="#D8BC7E" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="12" r="3.4" stroke="#D8BC7E" strokeWidth="1.6" /></g>,
  <g key="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#D8BC7E" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="#D8BC7E" strokeWidth="1.6" /></g>,
  <path key="3" d="M3 12h3l2 5 4-10 2 5h4" stroke="#D8BC7E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  <g key="4"><circle cx="12" cy="7" r="3.2" stroke="#D8BC7E" strokeWidth="1.6" /><path d="M6 21c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="#D8BC7E" strokeWidth="1.6" strokeLinecap="round" /></g>,
  <g key="5"><path d="M6 4v6a6 6 0 0 0 12 0V4M9 20a3 3 0 0 1 6 0" stroke="#D8BC7E" strokeWidth="1.6" strokeLinecap="round" /><circle cx="18" cy="13" r="2" stroke="#D8BC7E" strokeWidth="1.6" /></g>,
];

export default function ClinicSiteView({
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
  const lastStat = c.stats.length ? c.stats[c.stats.length - 1] : null;

  const socials = (
    [
      ["whatsapp", wa ?? ""],
      ["instagram", c.contact.instagram],
      ["snapchat", c.contact.snapchat],
      ["tiktok", c.contact.tiktok],
      ["linkedin", c.contact.linkedin],
    ] as const
  )
    .filter(([kind, val]) => (kind === "whatsapp" ? !!wa : val && val.trim()))
    .map(([kind, val]) => ({ kind, href: kind === "whatsapp" ? val : socialHref(kind, val) }));

  const nav = [
    v.specialties && c.specialties.items.length > 0 && { href: "#services", label: "الخدمات" },
    v.doctors && doctors.length > 0 && { href: "#doctors", label: "الأطباء" },
    v.prices && c.prices.items.length > 0 && { href: "#pricing", label: "الأسعار" },
    v.faq && c.faq.items.length > 0 && { href: "#faq", label: "الأسئلة" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="safa" dir="rtl">
      <style>{SAFA_CSS}</style>

      {/* NAV */}
      <nav className="sf-nav">
        <a href="#top" className="sf-brand">
          <span className={`sf-logo${c.brand.logo ? " sf-logo-img-wrap" : ""}`}>
            {c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} className="sf-logo-img" /> : <Leaf />}
          </span>
          <span className="sf-brand-txt">
            <span className="serif sf-brand-ar">{c.brand.ar}</span>
            {c.brand.en && <span className="sf-brand-en">{c.brand.en}</span>}
          </span>
        </a>
        <div className="sf-nav-links">
          {nav.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}
        </div>
        <a href="#book" className="sf-btn sf-btn-nav">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 2v3M16 2v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke="#D8BC7E" strokeWidth="1.7" strokeLinecap="round" /></svg>
          احجز موعد
        </a>
      </nav>

      {/* HERO */}
      <header id="top" className="sf-hero">
        <span className="sf-hero-blob" aria-hidden="true" />
        <div className="sf-hero-grid">
          <div className="sf-hero-text">
            <span className="sf-badge"><span className="sf-badge-dot" />{c.hero.eyebrow}</span>
            <h1 className="serif sf-h1">{c.hero.title}</h1>
            <p className="sf-hero-sub">{c.hero.subtitle}</p>
            <div className="sf-hero-cta">
              <a href="#book" className="sf-btn sf-btn-lg">احجز موعدك الآن <Chevron /></a>
              {v.specialties && <a href="#services" className="sf-btn sf-btn-ghost sf-btn-lg">تعرّف على خدماتنا</a>}
            </div>
            {c.hero.meta.length > 0 && (
              <div className="sf-hero-stats">
                {c.hero.meta.map((m, i) => (
                  <div key={i}><div className="serif sf-hs-val">{m.value}</div><div className="sf-hs-lbl">{m.label}</div></div>
                ))}
              </div>
            )}
          </div>
          <div className="sf-hero-media">
            <div className="sf-hero-frame">
              {c.hero.image ? (
                <img src={c.hero.image} alt={c.brand.ar} />
              ) : (
                <div className="sf-hero-ph"><Leaf fill="#2F6B55" /><span>صورة العيادة</span></div>
              )}
            </div>
            <div className="sf-float sf-float-1">
              <span className="sf-float-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 2v3M16 2v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke="#2F6B55" strokeWidth="1.7" strokeLinecap="round" /></svg></span>
              <div><div className="sf-float-t">حجز أونلاين فوري</div><div className="sf-float-s">خلال أقل من دقيقة</div></div>
            </div>
            {lastStat && (
              <div className="sf-float sf-float-2">
                <span className="serif sf-float-big">{lastStat.value}{lastStat.suffix}</span>
                <div className="sf-float-s2">{lastStat.label}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HIGHLIGHTS (uses the about toggle) */}
      {v.about && (
        <section className="sf-sec sf-sec-cream">
          <div className="sf-wrap sf-grid-3">
            <div className="sf-feat">
              <span className="sf-feat-ic sf-ic-green"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" stroke="#2F6B55" strokeWidth="1.7" strokeLinejoin="round" /></svg></span>
              <h3 className="serif">رعاية تتمحور حولك</h3>
              <p>{c.about.lead}</p>
            </div>
            <div className="sf-feat">
              <span className="sf-feat-ic sf-ic-gold"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12h4l2 6 4-14 2 8h6" stroke="#BD9A4E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <h3 className="serif">أحدث التقنيات</h3>
              <p>أجهزة تشخيص وعلاج من أحدث الأجيال لنتائج أدق وتعافٍ أسرع وأكثر أماناً.</p>
            </div>
            <div className="sf-feat">
              <span className="sf-feat-ic sf-ic-green"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.4" stroke="#2F6B55" strokeWidth="1.7" /><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#2F6B55" strokeWidth="1.7" strokeLinecap="round" /></svg></span>
              <h3 className="serif">نخبة الاستشاريين</h3>
              <p>فريق من أمهر الأطباء وأصحاب الخبرات الطويلة في تخصصاتهم محلياً وعالمياً.</p>
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="services" className="sf-sec sf-sec-cream2">
          <div className="sf-wrap">
            <div className="sf-head">
              <span className="sf-kicker"><span className="sf-kicker-bar" />خدماتنا الطبية</span>
              <h2 className="serif sf-h2">{c.specialties.title}</h2>
              <p className="sf-lead">{c.specialties.lead}</p>
            </div>
            <div className="sf-grid-auto">
              {c.specialties.items.map((s, i) => (
                <div key={i} className="sf-svc">
                  <span className="sf-svc-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">{SERVICE_ICONS[i % SERVICE_ICONS.length]}</svg></span>
                  <h3 className="serif">{s.title}</h3>
                  <p>{s.desc}</p>
                  <a href="#book" className="sf-svc-link">احجز استشارة<Chevron c="currentColor" s={15} /></a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RESULTS (before/after) */}
      {v.results && c.results.items.length > 0 && (
        <section className="sf-sec sf-sec-cream">
          <div className="sf-wrap">
            <div className="sf-head">
              <span className="sf-kicker"><span className="sf-kicker-bar" />{c.results.title}</span>
              <h2 className="serif sf-h2">{c.results.lead}</h2>
            </div>
            <div className="sf-grid-2">
              {c.results.items.map((r, i) => (
                <div key={i} className="sf-ba-card">
                  <div className="sf-ba">
                    <div className="sf-ba-cell"><span className="sf-ba-tag">قبل</span>{r.before ? <img src={r.before} alt="قبل" /> : <div className="sf-ba-ph" />}</div>
                    <div className="sf-ba-cell"><span className="sf-ba-tag sf-ba-after">بعد</span>{r.after ? <img src={r.after} alt="بعد" /> : <div className="sf-ba-ph" />}</div>
                  </div>
                  <h3 className="serif sf-ba-title">{r.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATS BAND */}
      {v.stats && c.stats.length > 0 && (
        <section className="sf-stats">
          <span className="sf-stats-blob" aria-hidden="true" />
          <div className="sf-stats-in">
            {c.stats.map((s, i) => (
              <div key={i}><div className="serif sf-stat-val">{s.value}{s.suffix}</div><div className="sf-stat-lbl">{s.label}</div></div>
            ))}
          </div>
        </section>
      )}

      {/* DOCTORS */}
      {v.doctors && doctors.length > 0 && (
        <section id="doctors" className="sf-sec sf-sec-cream">
          <div className="sf-wrap">
            <div className="sf-head sf-head-row">
              <div>
                <span className="sf-kicker"><span className="sf-kicker-bar" />{c.doctors.title}</span>
                <h2 className="serif sf-h2">نخبة من الأطباء في رعايتك</h2>
              </div>
              <p className="sf-lead sf-lead-side">{c.doctors.lead}</p>
            </div>
            <div className="sf-grid-auto">
              {doctors.map((d) => (
                <div key={d.id} className="sf-doc">
                  <div className="sf-doc-img">{d.image ? <img src={d.image} alt={d.name} /> : <div className="sf-doc-ph"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.4" stroke="#2F6B55" strokeWidth="1.5" /><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#2F6B55" strokeWidth="1.5" strokeLinecap="round" /></svg></div>}</div>
                  <div className="sf-doc-body">
                    {d.specialty && <span className="sf-doc-tag">{d.specialty}</span>}
                    <h3 className="serif">{d.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {v.process && c.process.length > 0 && (
        <section className="sf-sec sf-sec-cream2">
          <div className="sf-wrap">
            <div className="sf-head">
              <span className="sf-kicker"><span className="sf-kicker-bar" />كيف نعمل</span>
              <h2 className="serif sf-h2">رحلة المريض</h2>
            </div>
            <div className="sf-grid-auto">
              {c.process.map((p, i) => (
                <div key={i} className="sf-step">
                  <span className="serif sf-step-num">{i + 1}</span>
                  <h3 className="serif">{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      {v.prices && c.prices.items.length > 0 && (
        <section id="pricing" className="sf-sec sf-sec-cream3">
          <div className="sf-wrap">
            <div className="sf-head sf-head-center">
              <span className="sf-kicker"><span className="sf-kicker-bar" />الأسعار والباقات</span>
              <h2 className="serif sf-h2">أسعار واضحة وشفافة</h2>
              <p className="sf-lead">{c.prices.lead}</p>
            </div>
            <div className="sf-grid-auto">
              {c.prices.items.map((p, i) => (
                <div key={i} className="sf-price">
                  <h3 className="serif">{p.name}</h3>
                  {p.note && <p className="sf-price-note">{p.note}</p>}
                  <div className="sf-price-val"><span className="serif">{p.price}</span><span className="sf-price-unit">{c.prices.unit}</span></div>
                  <a href="#book" className="sf-btn sf-btn-outline sf-price-btn">احجز الآن</a>
                </div>
              ))}
            </div>
            <p className="sf-fine">{c.prices.note}</p>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="sf-sec sf-sec-cream">
          <div className="sf-quote-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sf-quote-mark"><path d="M10 11H6a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3M19 11h-4a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3M5 11s0 6 5 7M14 11s0 6 5 7" stroke="#BD9A4E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p className="serif sf-quote-big">«{c.testimonials[0].quote}»</p>
            <div className="sf-quote-by">
              <span className="serif sf-quote-av">{c.testimonials[0].name.trim().charAt(0)}</span>
              <div><div className="sf-quote-name">{c.testimonials[0].name}</div><div className="sf-quote-role">{c.testimonials[0].role}</div></div>
            </div>
            {c.testimonials.length > 1 && (
              <div className="sf-quote-more">
                {c.testimonials.slice(1).map((t, i) => (
                  <figure key={i} className="sf-quote-card"><blockquote>«{t.quote}»</blockquote><figcaption><strong>{t.name}</strong><span>{t.role}</span></figcaption></figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CREDENTIALS */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="sf-sec sf-sec-cream2 sf-cred-sec">
          <div className="sf-wrap">
            <p className="sf-lead sf-cred-lead">{c.credentials.lead}</p>
            <div className="sf-creds">
              {c.credentials.badges.map((b, i) => (
                <div key={i} className="sf-cred"><span className="sf-cred-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" stroke="#2F6B55" strokeWidth="1.6" /><path d="M9.3 11.5l1.8 1.8 3.6-3.7" stroke="#BD9A4E" strokeWidth="1.7" strokeLinecap="round" /></svg></span><div><div className="sf-cred-v">{b.value}</div><div className="sf-cred-l">{b.label}</div></div></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="sf-sec sf-sec-cream2">
          <div className="sf-wrap sf-faq">
            <div className="sf-faq-aside">
              <span className="sf-kicker"><span className="sf-kicker-bar" />الأسئلة الشائعة</span>
              <h2 className="serif sf-h2">كل ما تودّ معرفته قبل زيارتك</h2>
              <p className="sf-lead">لم تجد إجابتك؟ فريق الاستقبال سعيد بمساعدتك.</p>
              <a href="#book" className="sf-btn">تواصل معنا</a>
            </div>
            <div className="sf-faq-list">
              {c.faq.items.map((f, i) => (
                <details key={i} className="sf-faq-item">
                  <summary>{f.q}<span className="sf-faq-plus">+</span></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOOKING */}
      {v.booking && (
        <section id="book" className="sf-sec sf-sec-cream">
          <div className="sf-wrap sf-book">
            <div className="sf-book-info">
              <span className="sf-book-blob" aria-hidden="true" />
              <span className="sf-kicker sf-kicker-gold"><span className="sf-kicker-bar sf-bar-gold" />{c.booking.title}</span>
              <h2 className="serif sf-h2 sf-book-h">{c.booking.lead}</h2>
              <p className="sf-book-p">{c.booking.note}</p>
              <div className="sf-book-rows">
                <div className="sf-book-row"><span className="sf-book-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5c0 8 7 15 15 15 1 0 2-1 2-2v-3l-4-2-2 2c-2-1-4-3-5-5l2-2-2-4H6c-1 0-2 1-2 2z" stroke="#D8BC7E" strokeWidth="1.6" strokeLinejoin="round" /></svg></span><div><div className="sf-book-k">اتصل بنا</div><div className="sf-book-v" dir="ltr">{c.contact.phone}</div></div></div>
                <div className="sf-book-row"><span className="sf-book-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="#D8BC7E" strokeWidth="1.6" strokeLinejoin="round" /></svg></span><div><div className="sf-book-k">البريد الإلكتروني</div><div className="sf-book-v" dir="ltr">{c.contact.email}</div></div></div>
                <div className="sf-book-row"><span className="sf-book-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" stroke="#D8BC7E" strokeWidth="1.6" /><circle cx="12" cy="9" r="2.4" stroke="#D8BC7E" strokeWidth="1.6" /></svg></span><div><div className="sf-book-k">العنوان</div><div className="sf-book-v">{c.contact.office}</div></div></div>
              </div>
            </div>
            <div className="sf-book-form">
              <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
            </div>
          </div>
          {mapSrc && (
            <div className="sf-wrap"><div className="sf-map"><iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div>
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer className="sf-footer">
        <div className="sf-wrap sf-foot-grid">
          <div className="sf-foot-brand">
            <div className="sf-brand"><span className={`sf-logo sf-logo-foot${c.brand.logo ? " sf-logo-img-wrap" : ""}`}>{c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} className="sf-logo-img" /> : <Leaf />}</span><span className="serif sf-foot-name">{c.brand.ar}</span></div>
            <p>{c.about.lead}</p>
          </div>
          <div className="sf-foot-col">
            <h4>روابط سريعة</h4>
            {nav.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}
          </div>
          <div className="sf-foot-col">
            <h4>تواصل معنا</h4>
            <span dir="ltr" className="sf-foot-ltr">{c.contact.phone}</span>
            <span dir="ltr" className="sf-foot-ltr">{c.contact.email}</span>
            <span>{c.contact.office}</span>
          </div>
          <div className="sf-foot-col">
            <h4>ساعات العمل</h4>
            <span>{c.contact.phoneNote || "يومياً · 9ص – 11م"}</span>
            <a href="#book" className="sf-btn sf-btn-sm sf-foot-cta">احجز موعد</a>
          </div>
        </div>
        <div className="sf-wrap sf-foot-bottom">
          <span>© {c.brand.ar} — جميع الحقوق محفوظة</span>
          <div className="sf-foot-soc">
            {socials.map((s) => (
              <a key={s.kind} href={s.href} target="_blank" rel="noreferrer" aria-label={s.kind}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">{SOCIAL_SVG[s.kind]}</svg></a>
            ))}
            <span className="sf-foot-by">صُمم عبر منصة وجود</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const SAFA_CSS = `
.safa{
  --cream:#F6F1E7;--cream2:#EFE8D9;--cream3:#ECE4D3;--card2:#FBF8F1;--field:#FBF9F4;
  --ink:#17241D;--green:#1E4A3B;--green2:#2F6B55;--green-d:#163A2E;--green-dd:#102A21;
  --gold:#BD9A4E;--gold-l:#D8BC7E;--muted:#5A6B5F;--muted2:#4E5C53;--ink2:#3A4940;--line:rgba(23,36,29,0.08);
  background:var(--cream);color:var(--ink);font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;line-height:1.8;-webkit-font-smoothing:antialiased;
}
.safa *{box-sizing:border-box}
.safa a{text-decoration:none;color:inherit}
.safa .serif{font-family:'El Messiri',serif}
.sf-wrap{max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,64px)}
.sf-sec{padding:clamp(72px,9vw,128px) 0}
.sf-sec-cream{background:var(--cream)}
.sf-sec-cream2{background:linear-gradient(180deg,var(--cream2),var(--cream3))}
.sf-sec-cream3{background:linear-gradient(180deg,var(--cream3),var(--cream2))}
@keyframes sf-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes sf-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-22px)}}
@keyframes sf-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
/* buttons */
.sf-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 26px;border-radius:99px;background:var(--green);color:var(--cream);font-weight:600;font-size:15.5px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -14px rgba(30,74,59,.75);transition:transform .25s,background .25s,box-shadow .25s}
.sf-btn:hover{transform:translateY(-2px);background:var(--green-d);box-shadow:0 20px 36px -14px rgba(30,74,59,.85)}
.sf-btn-lg{padding:16px 30px;font-size:17px}
.sf-btn-sm{padding:10px 20px;font-size:14px}
.sf-btn-nav{padding:12px 24px}
.sf-btn-ghost{background:transparent;color:var(--ink);border:1.5px solid rgba(23,36,29,.18);box-shadow:none}
.sf-btn-ghost:hover{background:rgba(255,255,255,.6);border-color:rgba(23,36,29,.32);transform:none}
.sf-btn-outline{background:transparent;color:var(--green);border:1.5px solid rgba(30,74,59,.3);box-shadow:none}
.sf-btn-outline:hover{background:rgba(30,74,59,.07);transform:none}
/* nav */
.sf-nav{position:fixed;top:0;right:0;left:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px clamp(20px,5vw,64px);background:rgba(246,241,231,.8);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
.sf-brand{display:flex;align-items:center;gap:12px}
.sf-logo{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:linear-gradient(150deg,var(--green),var(--green2));box-shadow:0 8px 22px -8px rgba(30,74,59,.6);overflow:hidden}
.sf-logo-img-wrap{background:#fff;border:1px solid var(--line);box-shadow:0 8px 22px -10px rgba(30,74,59,.4)}
.sf-logo-img{width:100%;height:100%;object-fit:contain;border-radius:10px}
.sf-brand-txt{display:flex;flex-direction:column;line-height:1}
.sf-brand-ar{font-weight:700;font-size:23px;letter-spacing:.5px}
.sf-brand-en{font-size:11.5px;color:var(--muted);margin-top:3px;direction:ltr}
.sf-nav-links{display:flex;align-items:center;gap:4px}
.sf-nav-links a{padding:9px 15px;border-radius:99px;color:var(--ink2);font-size:15.5px;font-weight:500;transition:background .2s}
.sf-nav-links a:hover{background:rgba(30,74,59,.07)}
@media(max-width:860px){.sf-nav-links{display:none}}
/* hero */
.sf-hero{position:relative;padding:150px clamp(20px,5vw,64px) 90px;background:radial-gradient(1100px 620px at 88% -8%,rgba(47,107,85,.13),transparent 58%),radial-gradient(900px 520px at -5% 25%,rgba(189,154,78,.13),transparent 55%),var(--cream);overflow:hidden}
.sf-hero-blob{position:absolute;top:-120px;left:-80px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(47,107,85,.16),transparent 70%);filter:blur(8px);animation:sf-drift 14s ease-in-out infinite}
.sf-hero-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:clamp(40px,5vw,72px);align-items:center;position:relative}
.sf-hero-text{animation:sf-rise .7s ease both}
.sf-badge{display:inline-flex;align-items:center;gap:9px;padding:8px 16px;border-radius:99px;background:rgba(255,255,255,.7);border:1px solid rgba(30,74,59,.14);font-size:14.5px;font-weight:600;color:var(--green2)}
.sf-badge-dot{width:7px;height:7px;border-radius:50%;background:var(--gold)}
.sf-h1{font-weight:700;font-size:clamp(40px,5.6vw,72px);line-height:1.16;margin:24px 0 0;color:var(--ink)}
.sf-hero-sub{font-size:clamp(17px,1.4vw,20px);line-height:1.95;color:var(--muted2);max-width:560px;margin:26px 0 0}
.sf-hero-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}
.sf-hero-stats{display:flex;flex-wrap:wrap;gap:clamp(20px,3vw,40px);margin-top:46px;padding-top:30px;border-top:1px solid rgba(23,36,29,.1)}
.sf-hs-val{font-size:34px;font-weight:700;color:var(--green)}
.sf-hs-lbl{font-size:14.5px;color:var(--muted);margin-top:2px}
.sf-hero-media{position:relative;animation:sf-rise .7s ease both;animation-delay:.15s}
.sf-hero-frame{position:relative;border-radius:34px;overflow:hidden;box-shadow:0 40px 90px -40px rgba(22,58,46,.55);border:1px solid rgba(255,255,255,.6)}
.sf-hero-frame img{display:block;width:100%;height:clamp(420px,46vw,560px);object-fit:cover}
.sf-hero-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:100%;height:clamp(420px,46vw,560px);background:linear-gradient(160deg,#E8EFE9,var(--cream2));color:var(--muted)}
.sf-float{position:absolute;display:flex;align-items:center;gap:13px;padding:14px 19px;border-radius:18px;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);box-shadow:0 22px 44px -20px rgba(22,58,46,.5);animation:sf-floaty 6s ease-in-out infinite}
.sf-float-1{bottom:26px;right:-14px}
.sf-float-2{top:-16px;left:-10px;background:var(--green);color:var(--cream);animation-delay:1s}
.sf-float-ic{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:rgba(47,107,85,.12)}
.sf-float-t{font-weight:700;font-size:15.5px;color:var(--ink)}
.sf-float-s{font-size:13px;color:var(--muted)}
.sf-float-big{font-size:24px;font-weight:700;color:var(--gold-l)}
.sf-float-s2{font-size:13px;line-height:1.4}
/* heads */
.sf-head{max-width:680px;margin-bottom:56px}
.sf-head-center{margin-left:auto;margin-right:auto;text-align:center;max-width:640px}
.sf-head-row{max-width:none;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px}
.sf-kicker{display:inline-flex;align-items:center;gap:9px;font-size:16px;font-weight:600;color:var(--green2)}
.sf-kicker-bar{width:24px;height:2px;background:var(--gold);border-radius:2px}
.sf-h2{font-size:clamp(30px,4.2vw,50px);font-weight:700;line-height:1.2;margin:18px 0 0}
.sf-lead{font-size:18px;line-height:1.9;color:var(--muted2);margin:18px 0 0}
.sf-lead-side{max-width:380px;margin:0}
.sf-head-center .sf-lead{margin-left:auto;margin-right:auto}
/* grids */
.sf-grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px}
.sf-grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,360px));gap:22px;justify-content:center}
.sf-grid-2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,520px));gap:22px;justify-content:center}
/* features */
.sf-feat{padding:34px 30px;border-radius:24px;background:#fff;border:1px solid rgba(23,36,29,.07);box-shadow:0 24px 50px -34px rgba(22,58,46,.4);transition:transform .3s}
.sf-feat:hover{transform:translateY(-6px)}
.sf-feat-ic{display:grid;place-items:center;width:54px;height:54px;border-radius:16px}
.sf-ic-green{background:rgba(47,107,85,.1)}
.sf-ic-gold{background:rgba(189,154,78,.14)}
.sf-feat h3{font-size:22px;font-weight:600;margin:20px 0 8px}
.sf-feat p{font-size:15.5px;line-height:1.85;color:var(--muted);margin:0}
/* services */
.sf-svc{padding:32px;border-radius:22px;background:var(--card2);border:1px solid rgba(23,36,29,.06);transition:transform .3s,box-shadow .3s}
.sf-svc:hover{transform:translateY(-6px);box-shadow:0 30px 56px -34px rgba(22,58,46,.45)}
.sf-svc-ic{display:grid;place-items:center;width:56px;height:56px;border-radius:16px;background:var(--green)}
.sf-svc h3{font-size:23px;font-weight:600;margin:22px 0 9px}
.sf-svc p{font-size:15.5px;line-height:1.85;color:var(--muted);margin:0 0 16px}
.sf-svc-link{display:inline-flex;align-items:center;gap:7px;color:var(--green2);font-weight:600;font-size:15px}
/* before/after */
.sf-ba-card{padding:16px;border-radius:22px;background:var(--card2);border:1px solid rgba(23,36,29,.06);transition:transform .3s}
.sf-ba-card:hover{transform:translateY(-5px)}
.sf-ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sf-ba-cell{position:relative;aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:var(--cream2)}
.sf-ba-cell img{width:100%;height:100%;object-fit:cover}
.sf-ba-ph{width:100%;height:100%;background:repeating-linear-gradient(45deg,#e8efe9,#e8efe9 10px,#e2ead9 10px,#e2ead9 20px)}
.sf-ba-tag{position:absolute;top:10px;right:10px;z-index:2;background:rgba(23,36,29,.72);color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:99px}
.sf-ba-after{background:var(--green2)}
.sf-ba-title{text-align:center;font-size:20px;font-weight:600;margin:14px 0 6px}
/* stats */
.sf-stats{position:relative;overflow:hidden;padding:clamp(60px,7vw,96px) clamp(20px,5vw,64px);background:linear-gradient(135deg,var(--green),var(--green-d))}
.sf-stats-blob{position:absolute;top:-80px;right:-60px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(189,154,78,.22),transparent 70%);animation:sf-drift 16s ease-in-out infinite}
.sf-stats-in{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:30px;text-align:center;position:relative}
.sf-stat-val{font-size:clamp(42px,5vw,60px);font-weight:700;color:var(--gold-l)}
.sf-stat-lbl{color:#CFE0D6;font-size:16px;margin-top:6px}
/* doctors */
.sf-doc{background:#fff;border-radius:24px;overflow:hidden;border:1px solid rgba(23,36,29,.06);box-shadow:0 26px 54px -36px rgba(22,58,46,.4);transition:transform .3s}
.sf-doc:hover{transform:translateY(-7px)}
.sf-doc-img{height:300px;background:var(--cream2)}
.sf-doc-img img{width:100%;height:100%;object-fit:cover}
.sf-doc-ph{display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(160deg,#E8EFE9,var(--cream2))}
.sf-doc-body{padding:22px 24px 26px}
.sf-doc-tag{display:inline-block;padding:5px 12px;border-radius:99px;background:rgba(47,107,85,.1);color:var(--green2);font-size:13px;font-weight:600}
.sf-doc-body h3{font-size:22px;font-weight:600;margin:14px 0 0}
/* process */
.sf-step{padding:30px;border-radius:22px;background:var(--card2);border:1px solid rgba(23,36,29,.06);text-align:center}
.sf-step-num{display:grid;place-items:center;width:54px;height:54px;border-radius:50%;margin:0 auto 16px;background:var(--green);color:var(--gold-l);font-size:22px;font-weight:700}
.sf-step h3{font-size:20px;font-weight:600;margin:0 0 8px}
.sf-step p{font-size:15px;color:var(--muted);margin:0;line-height:1.8}
/* pricing */
.sf-price{display:flex;flex-direction:column;padding:38px 32px;border-radius:26px;background:var(--card2);border:1px solid rgba(23,36,29,.08)}
.sf-price h3{font-size:24px;font-weight:600;margin:0}
.sf-price-note{font-size:14.5px;color:var(--muted);margin:8px 0 0}
.sf-price-val{display:flex;align-items:baseline;gap:8px;margin:20px 0 24px}
.sf-price-val .serif{font-size:46px;font-weight:700;color:var(--ink)}
.sf-price-unit{color:var(--muted);font-size:16px}
.sf-price-btn{margin-top:auto}
.sf-fine{text-align:center;font-size:14.5px;color:var(--muted);margin:30px 0 0}
/* testimonial */
.sf-quote-wrap{max-width:900px;margin:0 auto;text-align:center}
.sf-quote-mark{margin:0 auto}
.sf-quote-big{font-size:clamp(24px,3.2vw,38px);font-weight:500;line-height:1.6;color:var(--ink);margin:26px 0 0}
.sf-quote-by{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:32px}
.sf-quote-av{display:grid;place-items:center;width:50px;height:50px;border-radius:50%;background:linear-gradient(150deg,var(--green),var(--green2));color:var(--gold-l);font-weight:700;font-size:20px}
.sf-quote-name{font-weight:700;font-size:16px;text-align:right}
.sf-quote-role{font-size:14px;color:var(--muted);text-align:right}
.sf-quote-more{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:48px;text-align:right}
.sf-quote-card{margin:0;padding:24px;border-radius:18px;background:var(--card2);border:1px solid rgba(23,36,29,.06)}
.sf-quote-card blockquote{margin:0 0 14px;font-size:15.5px;line-height:1.85;color:var(--ink)}
.sf-quote-card figcaption strong{display:block}
.sf-quote-card figcaption span{color:var(--muted);font-size:13.5px}
/* credentials */
.sf-cred-sec{padding-top:clamp(50px,6vw,80px);padding-bottom:clamp(50px,6vw,80px)}
.sf-cred-lead{text-align:center;margin:0 auto 28px;max-width:560px}
.sf-creds{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.sf-cred{display:flex;align-items:center;gap:14px;background:var(--card2);border:1px solid rgba(23,36,29,.07);border-radius:16px;padding:18px 24px;min-width:230px}
.sf-cred-ic{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:rgba(47,107,85,.1)}
.sf-cred-v{font-weight:700;color:var(--ink)}
.sf-cred-l{font-size:13.5px;color:var(--muted)}
/* faq */
.sf-faq{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:48px;align-items:start}
.sf-faq-aside{position:sticky;top:110px}
.sf-faq-aside .sf-btn{margin-top:26px}
.sf-faq-list{display:flex;flex-direction:column;gap:14px}
.sf-faq-item{background:var(--card2);border:1px solid rgba(23,36,29,.08);border-radius:18px;padding:4px 24px}
.sf-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 0;font-weight:600;font-size:17.5px;color:var(--ink);cursor:pointer;list-style:none}
.sf-faq-item summary::-webkit-details-marker{display:none}
.sf-faq-plus{flex-shrink:0;color:var(--green2);font-size:24px;line-height:1;transition:transform .25s}
.sf-faq-item[open] .sf-faq-plus{transform:rotate(45deg)}
.sf-faq-item p{font-size:15.5px;line-height:1.9;color:var(--muted);margin:0 0 20px}
/* booking */
.sf-book{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:30px;align-items:stretch}
.sf-book-info{position:relative;overflow:hidden;display:flex;flex-direction:column;padding:clamp(34px,4vw,52px);border-radius:30px;background:linear-gradient(160deg,var(--green),var(--green-d));color:var(--cream)}
.sf-book-blob{position:absolute;bottom:-70px;left:-50px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(189,154,78,.2),transparent 70%)}
.sf-kicker-gold{color:var(--gold-l);position:relative}
.sf-bar-gold{background:var(--gold-l)}
.sf-book-h{color:#fff;position:relative;font-size:clamp(28px,3.6vw,44px)}
.sf-book-p{font-size:16.5px;line-height:1.9;color:#C7D8CD;margin:18px 0 36px;position:relative}
.sf-book-rows{display:flex;flex-direction:column;gap:22px;position:relative;margin-top:auto}
.sf-book-row{display:flex;align-items:center;gap:15px}
.sf-book-ic{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.1);flex-shrink:0}
.sf-book-k{font-size:13.5px;color:#A9C2B5}
.sf-book-v{font-weight:700;font-size:17px;text-align:right}
.sf-book-form{padding:clamp(28px,3.5vw,44px);border-radius:30px;background:#fff;border:1px solid rgba(23,36,29,.07);box-shadow:0 30px 64px -40px rgba(22,58,46,.45)}
.sf-map{margin-top:30px;border-radius:24px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/6;box-shadow:0 26px 54px -38px rgba(22,58,46,.4)}
.sf-map iframe{width:100%;height:100%;border:0}
/* booking form (reuses ClinicBookingForm classes) */
.sf-book-form .cl-form{display:flex;flex-direction:column;gap:18px}
.sf-book-form .cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sf-book-form .cl-fld{display:flex;flex-direction:column;gap:8px}
.sf-book-form .cl-fld label{font-size:14.5px;font-weight:600;color:var(--ink2)}
.sf-book-form .cl-fld input,.sf-book-form .cl-fld select,.sf-book-form .cl-fld textarea{width:100%;padding:14px 16px;border-radius:13px;border:1.5px solid rgba(23,36,29,.14);background:var(--field);font-size:15.5px;color:var(--ink);outline:none;font-family:inherit;transition:border-color .2s,background .2s}
.sf-book-form .cl-fld input:focus,.sf-book-form .cl-fld select:focus,.sf-book-form .cl-fld textarea:focus{border-color:var(--green2);background:#fff}
.sf-book-form .cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.sf-book-form .cl-slot{padding:10px 15px;border-radius:12px;border:1.5px solid rgba(23,36,29,.14);background:var(--field);font:inherit;cursor:pointer;color:var(--ink);font-size:14.5px;transition:all .18s}
.sf-book-form .cl-slot:hover{border-color:var(--green2)}
.sf-book-form .cl-slot-on{background:var(--green);color:var(--cream);border-color:var(--green)}
.sf-book-form .cl-slots-msg{color:var(--muted);font-size:14.5px;margin:0}
.sf-book-form .cl-btn{margin-top:6px;width:100%;padding:16px;border-radius:99px;border:none;background:var(--green);color:var(--cream);font-weight:700;font-size:17px;cursor:pointer;font-family:inherit;box-shadow:0 16px 32px -14px rgba(30,74,59,.8);transition:transform .25s,background .25s}
.sf-book-form .cl-btn:hover{transform:translateY(-2px);background:var(--green-d)}
/* footer */
.sf-footer{background:linear-gradient(180deg,var(--green-d),var(--green-dd));color:#CFE0D6;padding:clamp(60px,7vw,90px) 0 36px}
.sf-foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:44px}
.sf-foot-brand{min-width:240px}
.sf-logo-foot{background:linear-gradient(150deg,var(--green2),#3C8068)}
.sf-foot-name{font-weight:700;font-size:24px;color:#fff}
.sf-foot-brand p{font-size:15px;line-height:1.9;color:#9FBAAC;margin:20px 0 0;max-width:280px}
.sf-foot-col h4{font-size:15px;font-weight:700;color:#fff;margin:0 0 18px}
.sf-foot-col a,.sf-foot-col span{display:block;color:#9FBAAC;font-size:15px;margin-bottom:12px;transition:color .2s}
.sf-foot-col a:hover{color:var(--gold-l)}
.sf-foot-ltr{direction:ltr;text-align:right}
.sf-foot-cta{color:var(--cream)!important;margin-top:4px}
.sf-foot-bottom{margin-top:48px;padding-top:26px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;font-size:14px;color:#7E9789}
.sf-foot-soc{display:flex;align-items:center;gap:12px}
.sf-foot-soc a{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,.08);transition:background .25s}
.sf-foot-soc a:hover{background:rgba(216,188,126,.2)}
.sf-foot-by{color:#7E9789;font-size:13px}
@media(prefers-reduced-motion:reduce){.safa *{animation:none!important;transition:none!important}}
`;
