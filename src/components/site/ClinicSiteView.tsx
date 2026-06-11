import type { ClinicContent } from "@/lib/clinic-content";
import type { PublicDoctor } from "@/lib/clinic-booking";
import { fontByKey } from "@/lib/site-fonts";
import ClinicBookingForm, { type BookingService } from "./ClinicBookingForm";

// Medical palette — calm cyan / health green by default (admin can override via
// theme.accentHex). Tuned for trust + cleanliness.
const ACCENT_HEX: Record<string, string> = {
  azure: "#0891B2",
  sage: "#0E9F6E",
  terracotta: "#E0654A",
  bronze: "#B6894A",
};

function accentOf(theme: ClinicContent["theme"]): string {
  if (theme.accentHex) return theme.accentHex;
  return ACCENT_HEX[theme.accent] ?? ACCENT_HEX.azure;
}

function waLink(num: string): string | null {
  const digits = (num || "").replace(/[^\d]/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

const SOCIAL_SVG: Record<string, string> = {
  instagram: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z M12 8.2a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6z M17.3 6.7h.01",
  snapchat: "M12 3c2.4 0 3.7 1.8 3.7 4.2 0 1 .1 1.7.1 1.9.3.6 1.2.4 1.7.6.4.2.3.7-.2 1-.6.3-1.4.4-1.5.9-.1.4.8 1.8 2.6 2.6.5.2.4.6 0 .8-.6.3-1.4.2-1.7.7-.2.4 0 .9-.6 1-.6.1-1.3-.4-2.1-.1-.8.3-1.3 1.2-2.5 1.2s-1.7-.9-2.5-1.2c-.8-.3-1.5.2-2.1.1-.6-.1-.4-.6-.6-1-.3-.5-1.1-.4-1.7-.7-.4-.2-.5-.6 0-.8 1.8-.8 2.7-2.2 2.6-2.6-.1-.5-.9-.6-1.5-.9-.5-.3-.6-.8-.2-1 .5-.2 1.4 0 1.7-.6 0-.2.1-.9.1-1.9C8.3 4.8 9.6 3 12 3z",
  tiktok: "M16 4c.3 2 1.6 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.5-1v5.4a5.3 5.3 0 11-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 102 2.5V4h2.4z",
  linkedin: "M5 4a2 2 0 100 4 2 2 0 000-4z M4 9h2v11H4z M9 9h2v1.5a3 3 0 015 2.3V20h-2v-5a1.5 1.5 0 00-3 0v5H9z",
  x: "M4 4l16 16 M20 4L4 20",
};

function socialHref(kind: string, raw: string): string {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "");
  switch (kind) {
    case "instagram": return `https://instagram.com/${handle}`;
    case "snapchat": return `https://snapchat.com/add/${handle}`;
    case "tiktok": return `https://tiktok.com/@${handle}`;
    case "linkedin": return `https://www.linkedin.com/in/${handle}`;
    case "x": return `https://x.com/${handle}`;
    default: return v;
  }
}

// ---- Inline SVG icon set (no emoji; consistent 1.6 stroke) ----
const I = {
  spark: "M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3L12 3z",
  tooth: "M12 3c2 0 3 1 4.5 1S19 3.5 19 6c0 4-1.2 6-2 9-.5 2-1 4-2 4s-1-3-3-3-2 3-3 3-1.5-2-2-4c-.8-3-2-5-2-9 0-2.5 1-2 2.5-2S10 3 12 3z",
  heart: "M12 20s-7-4.3-9.2-8.4C1.3 8.7 2.6 5.5 5.7 5.1 7.8 4.8 9.4 6 12 8.8 14.6 6 16.2 4.8 18.3 5.1c3.1.4 4.4 3.6 2.9 6.5C19 15.7 12 20 12 20z",
  shield: "M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z M9.5 11.5l1.8 1.8 3.5-3.7",
  stethoscope: "M6 3v5a4 4 0 008 0V3 M10 16a5 5 0 0010 0v-2 M19 11.5a1.5 1.5 0 100 1",
  scan: "M4 8V6a2 2 0 012-2h2 M16 4h2a2 2 0 012 2v2 M20 16v2a2 2 0 01-2 2h-2 M8 20H6a2 2 0 01-2-2v-2 M4 12h16",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  mail: "M3 6h18v12H3z M3 7l9 6 9-6",
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z M12 11a2 2 0 100-4 2 2 0 000 4z",
  check: "M5 12.5l4 4L19 7",
  clock: "M12 7v5l3 2 M12 21a9 9 0 100-18 9 9 0 000 18z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5z",
};
const SPEC_ICONS = [I.tooth, I.spark, I.heart, I.shield, I.stethoscope, I.scan];

function Svg({ d, size = 22, fill = false }: { d: string; size?: number; fill?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split(" M").map((seg, i) => (
        <path key={i} d={(i === 0 ? seg : "M" + seg)} />
      ))}
    </svg>
  );
}

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
  const accent = accentOf(c.theme);
  const fontFamily = `${fontByKey(c.theme.font).family}, system-ui, sans-serif`;
  const wa = waLink(c.contact.whatsapp);
  const bookingServices: BookingService[] =
    services.length > 0
      ? services
      : c.specialties.items.map((s) => s.title).filter(Boolean).map((name) => ({ id: null, name }));
  const mapQ = c.contact.mapQuery?.trim();
  const mapSrc = mapQ ? `https://www.google.com/maps?q=${encodeURIComponent(mapQ)}&hl=ar&output=embed` : null;
  const heroImg = c.hero.image?.trim() || null;

  // Footer social links (only those the clinic filled in).
  const socials = (
    [
      ["instagram", c.contact.instagram],
      ["snapchat", c.contact.snapchat],
      ["tiktok", c.contact.tiktok],
      ["linkedin", c.contact.linkedin],
    ] as const
  )
    .filter(([, val]) => val && val.trim())
    .map(([kind, val]) => ({ kind, href: socialHref(kind, val) }));

  const nav = [
    v.specialties && { href: "#specialties", label: "الخدمات" },
    v.doctors && doctors.length > 0 && { href: "#doctors", label: "الأطباء" },
    v.prices && { href: "#prices", label: "الأسعار" },
    v.faq && { href: "#faq", label: "أسئلة شائعة" },
    { href: "#booking", label: "احجز موعد" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="clinic-site" style={{ ["--accent" as string]: accent, fontFamily }} dir="rtl">
      <style>{CLINIC_CSS}</style>

      {/* Header */}
      <header className="cl-header">
        <div className="cl-container cl-header-in">
          <a href="#top" className="cl-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} className="cl-logo" /> : <span className="cl-logo-mark"><Svg d={I.heart} size={18} fill /></span>}
            <span>{c.brand.ar}</span>
          </a>
          <nav className="cl-nav">
            {nav.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
          </nav>
          <a href="#booking" className="cl-btn cl-btn-sm">احجز موعد</a>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className={`cl-hero${heroImg ? " cl-hero-img" : ""}`}
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        {heroImg ? (
          <span className="cl-hero-overlay" aria-hidden="true" />
        ) : (
          <>
            <span className="cl-blob cl-blob-1" aria-hidden="true" />
            <span className="cl-blob cl-blob-2" aria-hidden="true" />
          </>
        )}
        <div className="cl-container cl-hero-in">
          <span className="cl-chip"><Svg d={I.shield} size={15} /> {c.hero.eyebrow}</span>
          <h1 className="cl-h1">{c.brand.ar}</h1>
          <p className="cl-hero-sub">{c.hero.subtitle}</p>
          <div className="cl-hero-cta">
            <a href="#booking" className="cl-btn cl-btn-lg">
              احجز موعدك الآن <Svg d={I.check} size={18} />
            </a>
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="cl-btn cl-btn-ghost cl-btn-lg">
                <Svg d={I.phone} size={17} /> تواصل عبر واتساب
              </a>
            )}
          </div>
          {c.hero.meta.length > 0 && (
            <div className="cl-hero-meta">
              {c.hero.meta.map((m, i) => (
                <div key={i} className="cl-meta-item">
                  <div className="cl-meta-val">{m.value}</div>
                  <div className="cl-meta-lbl">{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      {v.about && (
        <section id="about" className="cl-section">
          <div className="cl-container cl-about">
            <div>
              <span className="cl-eyebrow">عن العيادة</span>
              <p className="cl-lead">{c.about.lead}</p>
              <p className="cl-body">{c.about.body}</p>
              <div className="cl-about-facts">
                {c.about.side.map((s, i) => (
                  <div key={i} className="cl-side-row">
                    <span className="cl-side-ic"><Svg d={I.check} size={15} /></span>
                    <div>
                      <span className="cl-side-k">{s.k}</span>
                      <span className="cl-side-v">{s.v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cl-about-media">
              {c.about.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.about.image} alt={c.brand.ar} className="cl-about-img" />
              ) : (
                <div className="cl-about-deco" aria-hidden="true">
                  <Svg d={I.heart} size={56} fill />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Specialties */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="specialties" className="cl-section cl-tinted">
          <div className="cl-container">
            <div className="cl-head">
              <span className="cl-eyebrow">خدماتنا</span>
              <h2 className="cl-h2">{c.specialties.title}</h2>
              <p className="cl-sub">{c.specialties.lead}</p>
            </div>
            <div className="cl-grid cl-grid-3">
              {c.specialties.items.map((s, i) => (
                <div key={i} className="cl-card">
                  <div className="cl-card-icon"><Svg d={SPEC_ICONS[i % SPEC_ICONS.length]} size={24} /></div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {v.doctors && doctors.length > 0 && (
        <section id="doctors" className="cl-section">
          <div className="cl-container">
            <div className="cl-head">
              <span className="cl-eyebrow">فريقنا</span>
              <h2 className="cl-h2">{c.doctors.title}</h2>
              <p className="cl-sub">{c.doctors.lead}</p>
            </div>
            <div className="cl-grid cl-grid-3">
              {doctors.map((d) => (
                <div key={d.id} className="cl-doctor">
                  <div className="cl-doctor-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {d.image ? <img src={d.image} alt={d.name} /> : <span className="cl-doctor-ph"><Svg d={I.stethoscope} size={34} /></span>}
                  </div>
                  <h3>{d.name}</h3>
                  {d.specialty && <p className="cl-doctor-spec">{d.specialty}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results (before/after) */}
      {v.results && c.results.items.length > 0 && (
        <section id="results" className="cl-section cl-tinted">
          <div className="cl-container">
            <div className="cl-head">
              <span className="cl-eyebrow">نتائجنا</span>
              <h2 className="cl-h2">{c.results.title}</h2>
              <p className="cl-sub">{c.results.lead}</p>
            </div>
            <div className="cl-grid cl-grid-2">
              {c.results.items.map((r, i) => (
                <div key={i} className="cl-result">
                  <div className="cl-ba">
                    <div className="cl-ba-cell">
                      <span className="cl-ba-tag">قبل</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {r.before ? <img src={r.before} alt="قبل" /> : <div className="cl-ba-ph" />}
                    </div>
                    <div className="cl-ba-cell">
                      <span className="cl-ba-tag cl-ba-tag-after">بعد</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {r.after ? <img src={r.after} alt="بعد" /> : <div className="cl-ba-ph" />}
                    </div>
                  </div>
                  <h3 className="cl-result-title">{r.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prices */}
      {v.prices && c.prices.items.length > 0 && (
        <section id="prices" className="cl-section">
          <div className="cl-container cl-narrow">
            <div className="cl-head">
              <span className="cl-eyebrow">الأسعار</span>
              <h2 className="cl-h2">أسعار واضحة وشفافة</h2>
              <p className="cl-sub">{c.prices.lead}</p>
            </div>
            <div className="cl-pricelist">
              {c.prices.items.map((p, i) => (
                <div key={i} className="cl-price-row">
                  <div>
                    <div className="cl-price-name">{p.name}</div>
                    {p.note && <div className="cl-price-note">{p.note}</div>}
                  </div>
                  <div className="cl-price-val">{p.price} <span>{c.prices.unit}</span></div>
                </div>
              ))}
            </div>
            <p className="cl-fineprint">{c.prices.note}</p>
          </div>
        </section>
      )}

      {/* Stats */}
      {v.stats && c.stats.length > 0 && (
        <section className="cl-stats">
          <span className="cl-stats-glow" aria-hidden="true" />
          <div className="cl-container cl-stats-in">
            {c.stats.map((s, i) => (
              <div key={i} className="cl-stat">
                <div className="cl-stat-val">{s.value}{s.suffix}</div>
                <div className="cl-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Process */}
      {v.process && c.process.length > 0 && (
        <section className="cl-section cl-tinted">
          <div className="cl-container">
            <div className="cl-head">
              <span className="cl-eyebrow">كيف نعمل</span>
              <h2 className="cl-h2">رحلة المريض</h2>
            </div>
            <div className="cl-steps">
              {c.process.map((p, i) => (
                <div key={i} className="cl-step">
                  <div className="cl-step-num">{i + 1}</div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {v.testimonials && c.testimonials.length > 0 && (
        <section className="cl-section">
          <div className="cl-container">
            <div className="cl-head">
              <span className="cl-eyebrow">آراء المرضى</span>
              <h2 className="cl-h2">ماذا قالوا عنّا</h2>
            </div>
            <div className="cl-grid cl-grid-3">
              {c.testimonials.map((t, i) => (
                <figure key={i} className="cl-quote">
                  <div className="cl-stars">{[0, 1, 2, 3, 4].map((s) => <Svg key={s} d={I.star} size={15} fill />)}</div>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Credentials */}
      {v.credentials && c.credentials.badges.length > 0 && (
        <section className="cl-section cl-tinted">
          <div className="cl-container cl-narrow">
            <div className="cl-head">
              <span className="cl-eyebrow">اعتماداتنا</span>
              <p className="cl-sub cl-center">{c.credentials.lead}</p>
            </div>
            <div className="cl-badges">
              {c.credentials.badges.map((b, i) => (
                <div key={i} className="cl-badge">
                  <span className="cl-badge-ic"><Svg d={I.shield} size={20} /></span>
                  <div>
                    <div className="cl-badge-val">{b.value}</div>
                    <div className="cl-badge-lbl">{b.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {v.faq && c.faq.items.length > 0 && (
        <section id="faq" className="cl-section">
          <div className="cl-container cl-narrow">
            <div className="cl-head">
              <span className="cl-eyebrow">أسئلة شائعة</span>
              <h2 className="cl-h2">إجابات لأكثر ما يُسأل</h2>
            </div>
            <div className="cl-faq">
              {c.faq.items.map((f, i) => (
                <details key={i} className="cl-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking */}
      {v.booking && (
        <section id="booking" className="cl-section cl-booking">
          <div className="cl-container cl-narrow">
            <div className="cl-booking-card">
              <div className="cl-booking-head">
                <span className="cl-chip cl-chip-light"><Svg d={I.clock} size={15} /> حجز سريع</span>
                <h2 className="cl-h2 cl-h2-light">{c.booking.title}</h2>
                <p>{c.booking.lead}</p>
              </div>
              <div className="cl-booking-body">
                <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />
                <p className="cl-booking-note">{c.booking.note}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact + map */}
      <section id="contact" className="cl-section cl-tinted">
        <div className="cl-container cl-contact">
          <div className="cl-contact-info">
            <span className="cl-eyebrow">تواصل معنا</span>
            <h2 className="cl-h2">نحن هنا لخدمتك</h2>
            <a className="cl-contact-row" href={`tel:${c.contact.phone}`}>
              <span className="cl-contact-ic"><Svg d={I.phone} size={18} /></span>
              <span><span className="cl-contact-k">الهاتف</span><span dir="ltr" className="cl-contact-v">{c.contact.phone}</span></span>
            </a>
            <a className="cl-contact-row" href={`mailto:${c.contact.email}`}>
              <span className="cl-contact-ic"><Svg d={I.mail} size={18} /></span>
              <span><span className="cl-contact-k">البريد</span><span dir="ltr" className="cl-contact-v">{c.contact.email}</span></span>
            </a>
            <div className="cl-contact-row">
              <span className="cl-contact-ic"><Svg d={I.pin} size={18} /></span>
              <span><span className="cl-contact-k">العنوان</span><span className="cl-contact-v">{c.contact.office}</span></span>
            </div>
            <div className="cl-contact-actions">
              <a href="#booking" className="cl-btn">احجز موعد</a>
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="cl-btn cl-btn-ghost">واتساب</a>}
            </div>
          </div>
          {mapSrc && (
            <div className="cl-map">
              <iframe src={mapSrc} title="الموقع" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </div>
      </section>

      <footer className="cl-footer">
        <div className="cl-container cl-footer-grid">
          <div className="cl-foot-brand">
            <span className="cl-brand cl-brand-light">
              <span className="cl-logo-mark"><Svg d={I.heart} size={16} fill /></span>{c.brand.ar}
            </span>
            <p>{c.about.lead}</p>
            {(wa || socials.length > 0) && (
              <div className="cl-socials">
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" aria-label="واتساب" className="cl-soc">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.1-1.3A10 10 0 1012 2zm4.6 12c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.3 7.3 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 3 3 0 00-1 2.2 5.3 5.3 0 001.1 2.8 12 12 0 004.6 4c1.6.6 1.9.5 2.3.5s1.3-.5 1.5-1.1.2-1.1.1-1.2-.2-.2-.4-.3z"/></svg>
                  </a>
                )}
                {socials.map((s) => (
                  <a key={s.kind} href={s.href} target="_blank" rel="noreferrer" aria-label={s.kind} className="cl-soc">
                    <Svg d={SOCIAL_SVG[s.kind]} size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="cl-foot-col">
            <h4>روابط سريعة</h4>
            {nav.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
          </div>

          <div className="cl-foot-col">
            <h4>تواصل</h4>
            <a href={`tel:${c.contact.phone}`} dir="ltr" className="cl-foot-ltr">{c.contact.phone}</a>
            <a href={`mailto:${c.contact.email}`} dir="ltr" className="cl-foot-ltr">{c.contact.email}</a>
            <span>{c.contact.office}</span>
          </div>

          <div className="cl-foot-col">
            <h4>أوقات العمل</h4>
            <span>{c.contact.phoneNote || "يومياً"}</span>
            <a href="#booking" className="cl-btn cl-btn-sm cl-foot-cta">احجز موعد</a>
          </div>
        </div>
        <div className="cl-footer-bottom">
          <div className="cl-container cl-footer-bottom-in">
            <span>© {c.brand.ar} — جميع الحقوق محفوظة</span>
            <span className="cl-footer-by">صُمم عبر منصة وجود</span>
          </div>
        </div>
      </footer>

      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="cl-wa-float" aria-label="تواصل عبر واتساب">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.1-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.6-6c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.3 7.3 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 3 3 0 00-1 2.2 5.3 5.3 0 001.1 2.8 12 12 0 004.6 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 001.6.1c.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2-.2-.2-.4-.3z"/></svg>
        </a>
      )}
    </div>
  );
}

const CLINIC_CSS = `
.clinic-site{
  --ink:#13343B;--body:#51666D;--line:#E6EEF0;--bg:#fff;--tint:#F3F9FA;--card:#fff;
  --accent-soft:color-mix(in srgb,var(--accent) 12%,#fff);
  --accent-line:color-mix(in srgb,var(--accent) 22%,#fff);
  --accent-ink:color-mix(in srgb,var(--accent) 65%,#0a2a30);
  --sh-sm:0 1px 2px rgba(15,42,50,.04),0 3px 10px rgba(15,42,50,.05);
  --sh-md:0 6px 16px rgba(15,42,50,.06),0 16px 40px rgba(15,42,50,.07);
  --sh-lg:0 24px 60px rgba(15,42,50,.12);
  --r:20px;
  background:var(--bg);color:var(--ink);line-height:1.75;font-family:inherit;-webkit-font-smoothing:antialiased;
}
.clinic-site *{box-sizing:border-box}
.clinic-site a{color:inherit;text-decoration:none}
.clinic-site svg{display:inline-block;vertical-align:middle}
.cl-container{max-width:1160px;margin:0 auto;padding:0 24px}
.cl-narrow{max-width:780px}
.cl-section{padding:96px 0}
.cl-tinted{background:linear-gradient(180deg,var(--tint),#fff)}
.cl-center{text-align:center}
/* heads */
.cl-head{max-width:640px;margin:0 auto 48px;text-align:center}
.cl-eyebrow{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.04em;color:var(--accent-ink);background:var(--accent-soft);padding:5px 14px;border-radius:999px;margin-bottom:14px}
.cl-h1{font-size:clamp(2.6rem,6vw,4.6rem);font-weight:800;line-height:1.06;letter-spacing:-.01em;margin:.18em 0;color:var(--ink)}
.cl-h2{font-size:clamp(1.7rem,3.6vw,2.5rem);font-weight:800;letter-spacing:-.01em;margin:0 0 .35em;color:var(--ink)}
.cl-sub{color:var(--body);font-size:1.06rem;margin:0 auto;max-width:560px}
.cl-lead{font-size:1.4rem;font-weight:700;line-height:1.5;margin:0 0 1rem;color:var(--ink)}
.cl-body{color:var(--body);font-size:1.02rem}
/* header */
.cl-header{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.72);backdrop-filter:blur(14px) saturate(1.4);border-bottom:1px solid var(--line)}
.cl-header-in{display:flex;align-items:center;gap:22px;height:70px}
.cl-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.2rem;color:var(--ink)}
.cl-logo{height:38px;width:38px;object-fit:contain;border-radius:10px}
.cl-logo-mark{display:grid;place-items:center;height:34px;width:34px;border-radius:10px;background:var(--accent);color:#fff;box-shadow:var(--sh-sm)}
.cl-nav{display:flex;gap:26px;margin-inline-start:auto;font-size:.96rem;color:var(--body);font-weight:500}
.cl-nav a{position:relative;transition:color .2s}
.cl-nav a:hover{color:var(--accent)}
.cl-nav a::after{content:"";position:absolute;inset-inline:0;bottom:-6px;height:2px;background:var(--accent);transform:scaleX(0);transition:transform .25s;border-radius:2px}
.cl-nav a:hover::after{transform:scaleX(1)}
@media(max-width:820px){.cl-nav{display:none}}
/* buttons */
.cl-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;border:none;cursor:pointer;font-size:.98rem;font-family:inherit;box-shadow:0 6px 18px color-mix(in srgb,var(--accent) 28%,transparent);transition:transform .2s,box-shadow .2s,filter .2s}
.cl-btn:hover{transform:translateY(-2px);box-shadow:0 12px 26px color-mix(in srgb,var(--accent) 36%,transparent);filter:brightness(1.04)}
.cl-btn:active{transform:translateY(0)}
.cl-btn-sm{padding:9px 18px;font-size:.9rem;box-shadow:none}
.cl-btn-lg{padding:15px 28px;font-size:1.05rem}
.cl-btn-ghost{background:#fff;color:var(--accent-ink);border:1.5px solid var(--accent-line);box-shadow:var(--sh-sm)}
.cl-btn-ghost:hover{background:var(--accent-soft);filter:none}
.cl-btn-block{width:100%}
/* hero */
.cl-hero{position:relative;overflow:hidden;padding:104px 0 92px;background:radial-gradient(120% 90% at 85% -10%,var(--accent-soft),transparent 60%),linear-gradient(180deg,#fff,var(--tint))}
.cl-hero-in{position:relative;z-index:2;text-align:center;max-width:820px;margin:0 auto}
.cl-chip{display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;color:var(--accent-ink);background:#fff;border:1px solid var(--accent-line);padding:7px 16px;border-radius:999px;box-shadow:var(--sh-sm);direction:rtl}
.cl-hero-sub{font-size:1.22rem;color:var(--body);max-width:640px;margin:1.1rem auto 1.8rem;line-height:1.7}
.cl-hero-cta{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.cl-hero-meta{display:flex;gap:14px;justify-content:center;margin-top:56px;flex-wrap:wrap}
.cl-meta-item{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 30px;box-shadow:var(--sh-sm);min-width:130px}
.cl-meta-val{font-size:2rem;font-weight:800;color:var(--accent);line-height:1}
.cl-meta-lbl{color:var(--body);font-size:.9rem;margin-top:6px}
.cl-blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5;z-index:0}
.cl-blob-1{width:420px;height:420px;background:var(--accent-soft);top:-160px;inset-inline-start:-120px}
.cl-blob-2{width:360px;height:360px;background:color-mix(in srgb,var(--accent) 9%,#fff);bottom:-180px;inset-inline-end:-100px}
/* about */
.cl-about{display:grid;grid-template-columns:1.5fr 1fr;gap:56px;align-items:center}
@media(max-width:820px){.cl-about{grid-template-columns:1fr;gap:36px}}
.cl-about-side{display:flex;flex-direction:column;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:24px;box-shadow:var(--sh-md)}
.cl-side-row{display:flex;gap:12px;align-items:flex-start}
.cl-side-ic{flex:none;display:grid;place-items:center;height:26px;width:26px;border-radius:8px;background:var(--accent-soft);color:var(--accent)}
.cl-side-k{display:block;font-size:.68rem;letter-spacing:.08em;color:var(--accent-ink);direction:ltr;text-align:right;font-weight:700}
.cl-side-v{color:var(--body);font-size:.96rem}
/* grid + cards */
.cl-grid{display:grid;gap:22px}
.cl-grid-2{grid-template-columns:repeat(2,1fr)}
.cl-grid-3{grid-template-columns:repeat(3,1fr)}
@media(max-width:880px){.cl-grid-3{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.cl-grid-2,.cl-grid-3{grid-template-columns:1fr}}
.cl-card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:30px 26px;box-shadow:var(--sh-sm);transition:transform .25s,box-shadow .25s,border-color .25s}
.cl-card:hover{transform:translateY(-6px);box-shadow:var(--sh-md);border-color:var(--accent-line)}
.cl-card h3{margin:.6em 0 .35em;font-size:1.18rem;color:var(--ink)}
.cl-card p{color:var(--body);margin:0;font-size:.98rem}
.cl-card-icon{display:grid;place-items:center;height:54px;width:54px;border-radius:16px;background:var(--accent-soft);color:var(--accent)}
/* doctors */
.cl-doctor{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:30px 22px;text-align:center;box-shadow:var(--sh-sm);transition:transform .25s,box-shadow .25s}
.cl-doctor:hover{transform:translateY(-6px);box-shadow:var(--sh-md)}
.cl-doctor-photo{height:132px;width:132px;border-radius:50%;margin:0 auto 16px;overflow:hidden;background:var(--accent-soft);display:grid;place-items:center;color:var(--accent);box-shadow:0 0 0 6px var(--tint),0 0 0 7px var(--line)}
.cl-doctor-photo img{height:100%;width:100%;object-fit:cover}
.cl-doctor h3{margin:0 0 .25em;font-size:1.15rem;color:var(--ink)}
.cl-doctor-spec{display:inline-block;color:var(--accent-ink);background:var(--accent-soft);font-weight:600;font-size:.85rem;padding:4px 14px;border-radius:999px;margin:0}
/* before/after */
.cl-result{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:16px;box-shadow:var(--sh-sm);transition:transform .25s,box-shadow .25s}
.cl-result:hover{transform:translateY(-4px);box-shadow:var(--sh-md)}
.cl-ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cl-ba-cell{position:relative;aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:var(--tint)}
.cl-ba-cell img{height:100%;width:100%;object-fit:cover}
.cl-ba-ph{height:100%;width:100%;background:repeating-linear-gradient(45deg,#eef4f6,#eef4f6 10px,#e6eef0 10px,#e6eef0 20px)}
.cl-ba-tag{position:absolute;top:10px;inset-inline-start:10px;z-index:2;background:rgba(19,52,59,.78);color:#fff;font-size:.72rem;font-weight:600;padding:3px 12px;border-radius:999px;backdrop-filter:blur(4px)}
.cl-ba-tag-after{background:var(--accent)}
.cl-result-title{text-align:center;margin:14px 0 6px;font-size:1.05rem;color:var(--ink)}
/* prices */
.cl-pricelist{border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--card);box-shadow:var(--sh-md)}
.cl-price-row{display:flex;justify-content:space-between;align-items:center;padding:20px 26px;border-bottom:1px solid var(--line);transition:background .2s}
.cl-price-row:last-child{border-bottom:none}
.cl-price-row:hover{background:var(--tint)}
.cl-price-name{font-weight:700;color:var(--ink)}
.cl-price-note{color:var(--body);font-size:.84rem;margin-top:2px}
.cl-price-val{font-weight:800;color:var(--accent);font-size:1.3rem;font-variant-numeric:tabular-nums}
.cl-price-val span{font-size:.8rem;color:var(--body);font-weight:600}
.cl-fineprint{color:var(--body);font-size:.86rem;margin-top:18px;text-align:center}
/* stats */
.cl-stats{position:relative;overflow:hidden;background:linear-gradient(120deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#0a2a30));color:#fff;padding:64px 0}
.cl-stats-glow{position:absolute;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.12);filter:blur(60px);top:-260px;inset-inline-start:30%}
.cl-stats-in{position:relative;z-index:2;display:flex;justify-content:space-around;gap:24px;flex-wrap:wrap;text-align:center}
.cl-stat-val{font-size:2.8rem;font-weight:800;font-variant-numeric:tabular-nums;line-height:1}
.cl-stat-lbl{opacity:.9;font-size:.95rem;margin-top:8px}
/* steps */
.cl-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;position:relative}
@media(max-width:880px){.cl-steps{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.cl-steps{grid-template-columns:1fr}}
.cl-step{text-align:center;padding:14px}
.cl-step-num{height:56px;width:56px;border-radius:50%;background:#fff;border:1px solid var(--accent-line);color:var(--accent);display:grid;place-items:center;margin:0 auto 16px;font-weight:800;font-size:1.3rem;box-shadow:var(--sh-sm)}
.cl-step h3{margin:0 0 .35em;font-size:1.1rem;color:var(--ink)}
.cl-step p{color:var(--body);font-size:.94rem;margin:0}
/* testimonials */
.cl-quote{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:30px 26px;margin:0;box-shadow:var(--sh-sm);transition:transform .25s,box-shadow .25s}
.cl-quote:hover{transform:translateY(-4px);box-shadow:var(--sh-md)}
.cl-stars{display:flex;gap:3px;color:#F5B301;margin-bottom:14px}
.cl-quote blockquote{margin:0 0 18px;font-size:1.04rem;color:var(--ink);line-height:1.8}
.cl-quote figcaption strong{display:block;color:var(--ink)}
.cl-quote figcaption span{color:var(--body);font-size:.86rem}
/* badges */
.cl-badges{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:8px}
.cl-badge{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 24px;box-shadow:var(--sh-sm);min-width:230px}
.cl-badge-ic{flex:none;display:grid;place-items:center;height:44px;width:44px;border-radius:12px;background:var(--accent-soft);color:var(--accent)}
.cl-badge-val{font-weight:800;color:var(--ink)}
.cl-badge-lbl{color:var(--body);font-size:.84rem}
/* faq */
.cl-faq{display:flex;flex-direction:column;gap:12px}
.cl-faq-item{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:4px 22px;box-shadow:var(--sh-sm);transition:box-shadow .2s}
.cl-faq-item[open]{box-shadow:var(--sh-md)}
.cl-faq-item summary{cursor:pointer;font-weight:700;padding:18px 0;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px;color:var(--ink)}
.cl-faq-item summary::-webkit-details-marker{display:none}
.cl-faq-item summary::after{content:"+";color:var(--accent);font-weight:700;font-size:1.4rem;line-height:1;transition:transform .25s}
.cl-faq-item[open] summary::after{content:"−"}
.cl-faq-item p{color:var(--body);margin:0 0 18px;line-height:1.8}
/* booking */
.cl-booking{background:linear-gradient(180deg,#fff,var(--tint))}
.cl-booking-card{border-radius:26px;overflow:hidden;box-shadow:var(--sh-lg);border:1px solid var(--line);background:var(--card)}
.cl-booking-head{background:linear-gradient(120deg,var(--accent),color-mix(in srgb,var(--accent) 72%,#0a2a30));color:#fff;padding:34px 34px 30px;text-align:center}
.cl-booking-head p{opacity:.92;margin:.4em 0 0}
.cl-h2-light{color:#fff;margin:.2em 0 0}
.cl-chip-light{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.3);color:#fff}
.cl-booking-body{padding:30px 34px 34px}
.cl-booking-note{text-align:center;color:var(--body);font-size:.86rem;margin:16px 0 0}
.cl-form{display:flex;flex-direction:column;gap:16px}
.cl-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:480px){.cl-row{grid-template-columns:1fr}}
.cl-fld{display:flex;flex-direction:column;gap:7px}
.cl-fld label{font-size:.84rem;color:var(--ink);font-weight:600}
.cl-fld input,.cl-fld select,.cl-fld textarea{border:1.5px solid var(--line);border-radius:12px;padding:13px 14px;font:inherit;background:#fff;outline:none;width:100%;color:var(--ink);transition:border-color .2s,box-shadow .2s}
.cl-fld input:focus,.cl-fld select:focus,.cl-fld textarea:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}
.cl-slots{display:flex;flex-wrap:wrap;gap:9px}
.cl-slot{border:1.5px solid var(--line);background:#fff;border-radius:11px;padding:9px 15px;font:inherit;cursor:pointer;color:var(--ink);font-variant-numeric:tabular-nums;transition:all .18s}
.cl-slot:hover{border-color:var(--accent);transform:translateY(-1px)}
.cl-slot-on{background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 6px 14px color-mix(in srgb,var(--accent) 30%,transparent)}
.cl-slots-msg{color:var(--body);font-size:.9rem;margin:0}
/* contact */
.cl-contact{display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:center}
@media(max-width:820px){.cl-contact{grid-template-columns:1fr}}
.cl-contact-row{display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line);transition:color .2s}
.cl-contact-row:hover{color:var(--accent)}
.cl-contact-ic{flex:none;display:grid;place-items:center;height:44px;width:44px;border-radius:12px;background:var(--accent-soft);color:var(--accent)}
.cl-contact-k{display:block;color:var(--body);font-size:.8rem}
.cl-contact-v{font-weight:600;color:var(--ink)}
.cl-contact-actions{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap}
.cl-map{border-radius:var(--r);overflow:hidden;border:1px solid var(--line);aspect-ratio:4/3;box-shadow:var(--sh-md)}
.cl-map iframe{width:100%;height:100%;border:0}
/* footer */
.cl-footer{border-top:1px solid var(--line);padding:28px 0;background:var(--tint)}
.cl-footer-in{display:flex;justify-content:space-between;align-items:center;color:var(--body);font-size:.88rem;flex-wrap:wrap;gap:12px}
.cl-footer-by{opacity:.85}
/* whatsapp float */
.cl-wa-float{position:fixed;bottom:24px;inset-inline-start:24px;height:58px;width:58px;border-radius:50%;background:#25D366;color:#fff;display:grid;place-items:center;box-shadow:0 10px 28px rgba(37,211,102,.45);z-index:40;transition:transform .2s}
.cl-wa-float:hover{transform:scale(1.08)}
/* hero image variant */
.cl-hero-img{background-size:cover;background-position:center;min-height:90vh;display:flex;align-items:center;padding:0}
.cl-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,32,38,.45),rgba(10,32,38,.82))}
.cl-hero-img .cl-hero-in{padding-top:96px;padding-bottom:64px}
.cl-hero-img .cl-h1,.cl-hero-img .cl-hero-sub{color:#fff}
.cl-hero-img .cl-chip{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.35);color:#fff}
.cl-hero-img .cl-meta-item{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.22);backdrop-filter:blur(8px)}
.cl-hero-img .cl-meta-val{color:#fff}
.cl-hero-img .cl-meta-lbl{color:rgba(255,255,255,.82)}
.cl-hero-img .cl-btn-ghost{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.4)}
/* about media */
.cl-about-facts{display:flex;flex-direction:column;gap:13px;margin-top:26px}
.cl-about-media{display:flex;align-items:center;justify-content:center}
.cl-about-img{width:100%;border-radius:24px;object-fit:cover;aspect-ratio:4/5;box-shadow:var(--sh-lg)}
.cl-about-deco{width:100%;aspect-ratio:4/5;border-radius:24px;background:linear-gradient(150deg,var(--accent-soft),var(--tint));display:grid;place-items:center;color:var(--accent);box-shadow:var(--sh-md)}
@media(max-width:820px){.cl-about-img,.cl-about-deco{aspect-ratio:16/10}}
/* rich footer */
.cl-footer{border-top:none;padding:0;background:#0E2A30;color:rgba(255,255,255,.7)}
.cl-footer-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:40px;padding:66px 24px 42px}
@media(max-width:820px){.cl-footer-grid{grid-template-columns:1fr 1fr;gap:32px}}
@media(max-width:520px){.cl-footer-grid{grid-template-columns:1fr}}
.cl-brand-light{color:#fff}
.cl-foot-brand p{margin:14px 0 18px;font-size:.92rem;line-height:1.8;max-width:320px;color:rgba(255,255,255,.58)}
.cl-socials{display:flex;gap:10px}
.cl-soc{display:grid;place-items:center;height:40px;width:40px;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.14);transition:background .2s,transform .2s}
.cl-soc:hover{background:var(--accent);border-color:var(--accent);transform:translateY(-2px)}
.cl-foot-col h4{color:#fff;font-size:1rem;margin:0 0 16px;font-weight:700}
.cl-foot-col a,.cl-foot-col span{display:block;color:rgba(255,255,255,.6);font-size:.92rem;margin-bottom:11px;transition:color .2s}
.cl-foot-col a:hover{color:#fff}
.cl-foot-ltr{direction:ltr;text-align:right}
.cl-foot-cta{margin-top:8px;color:#fff!important}
.cl-footer-bottom{border-top:1px solid rgba(255,255,255,.1)}
.cl-footer-bottom-in{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;font-size:.84rem;color:rgba(255,255,255,.5);flex-wrap:wrap;gap:10px}
.cl-footer-by{opacity:.85}
@media(prefers-reduced-motion:reduce){.clinic-site *{transition:none!important;animation:none!important}}
`;
