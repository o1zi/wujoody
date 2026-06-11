import type { ClinicContent } from "@/lib/clinic-content";
import { fontByKey } from "@/lib/site-fonts";
import ClinicBookingForm, { type BookingService, type BookingDoctor } from "./ClinicBookingForm";

const ACCENT_HEX: Record<string, string> = {
  azure: "#2563EB",
  sage: "#5C8A52",
  terracotta: "#C65D3B",
  bronze: "#B07D38",
};

function accentOf(theme: ClinicContent["theme"]): string {
  if (theme.accentHex) return theme.accentHex;
  return ACCENT_HEX[theme.accent] ?? ACCENT_HEX.azure;
}

function waLink(num: string): string | null {
  const digits = (num || "").replace(/[^\d]/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
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
  doctors?: BookingDoctor[];
}) {
  const c = content;
  const v = c.visible;
  const accent = accentOf(c.theme);
  const fontFamily = `${fontByKey(c.theme.font).family}, system-ui, sans-serif`;
  const wa = waLink(c.contact.whatsapp);
  // Booking services: prefer the operational list (clinic_services); fall back
  // to the names from the editable specialties section for a fresh clinic.
  const bookingServices: BookingService[] =
    services.length > 0
      ? services
      : c.specialties.items.map((s) => s.title).filter(Boolean).map((name) => ({ id: null, name }));
  const mapQ = c.contact.mapQuery?.trim();
  const mapSrc = mapQ ? `https://www.google.com/maps?q=${encodeURIComponent(mapQ)}&hl=ar&output=embed` : null;

  // Build the nav anchor list from visible sections.
  const nav = [
    v.specialties && { href: "#specialties", label: "الخدمات" },
    v.doctors && { href: "#doctors", label: "الأطباء" },
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
            {c.brand.logo ? <img src={c.brand.logo} alt={c.brand.ar} className="cl-logo" /> : <span className="cl-logo-dot" />}
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
      <section id="top" className="cl-hero">
        <div className="cl-container">
          <p className="cl-eyebrow">{c.hero.eyebrow}</p>
          <h1 className="cl-h1">{c.brand.ar}</h1>
          <p className="cl-hero-sub">{c.hero.subtitle}</p>
          <div className="cl-hero-cta">
            <a href="#booking" className="cl-btn">احجز موعدك الآن</a>
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="cl-btn cl-btn-ghost">واتساب</a>}
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
              <p className="cl-lead">{c.about.lead}</p>
              <p className="cl-body">{c.about.body}</p>
            </div>
            <div className="cl-about-side">
              {c.about.side.map((s, i) => (
                <div key={i} className="cl-side-row">
                  <span className="cl-side-k">{s.k}</span>
                  <span className="cl-side-v">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specialties */}
      {v.specialties && c.specialties.items.length > 0 && (
        <section id="specialties" className="cl-section cl-tinted">
          <div className="cl-container">
            <h2 className="cl-h2">{c.specialties.title}</h2>
            <p className="cl-sub">{c.specialties.lead}</p>
            <div className="cl-grid cl-grid-3">
              {c.specialties.items.map((s, i) => (
                <div key={i} className="cl-card">
                  <div className="cl-card-icon">＋</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {v.doctors && c.doctors.items.length > 0 && (
        <section id="doctors" className="cl-section">
          <div className="cl-container">
            <h2 className="cl-h2">{c.doctors.title}</h2>
            <p className="cl-sub">{c.doctors.lead}</p>
            <div className="cl-grid cl-grid-3">
              {c.doctors.items.map((d, i) => (
                <div key={i} className="cl-doctor">
                  <div className="cl-doctor-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {d.image ? <img src={d.image} alt={d.name} /> : <span className="cl-doctor-ph">🩺</span>}
                  </div>
                  <h3>{d.name}</h3>
                  <p className="cl-doctor-spec">{d.specialty}</p>
                  {d.specialtyEn && <p className="cl-doctor-en">{d.specialtyEn}</p>}
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
            <h2 className="cl-h2">{c.results.title}</h2>
            <p className="cl-sub">{c.results.lead}</p>
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
            <h2 className="cl-h2">الأسعار</h2>
            <p className="cl-sub">{c.prices.lead}</p>
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
            <h2 className="cl-h2">رحلة المريض</h2>
            <div className="cl-grid cl-grid-4">
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
            <h2 className="cl-h2">آراء مرضانا</h2>
            <div className="cl-grid cl-grid-3">
              {c.testimonials.map((t, i) => (
                <figure key={i} className="cl-quote">
                  <blockquote>“{t.quote}”</blockquote>
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
            <p className="cl-sub cl-center">{c.credentials.lead}</p>
            <div className="cl-badges">
              {c.credentials.badges.map((b, i) => (
                <div key={i} className="cl-badge">
                  <div className="cl-badge-val">{b.value}</div>
                  <div className="cl-badge-lbl">{b.label}</div>
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
            <h2 className="cl-h2">الأسئلة الشائعة</h2>
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
            <h2 className="cl-h2 cl-center">{c.booking.title}</h2>
            <p className="cl-sub cl-center">{c.booking.lead}</p>
            <div className="cl-booking-card">
              <ClinicBookingForm slug={slug} services={bookingServices} doctors={doctors} />
              <p className="cl-booking-note">{c.booking.note}</p>
            </div>
          </div>
        </section>
      )}

      {/* Contact + map */}
      <section id="contact" className="cl-section cl-tinted">
        <div className="cl-container cl-contact">
          <div className="cl-contact-info">
            <h2 className="cl-h2">تواصل معنا</h2>
            <div className="cl-contact-row"><span>الهاتف</span><a href={`tel:${c.contact.phone}`} dir="ltr">{c.contact.phone}</a></div>
            {c.contact.phoneNote && <p className="cl-contact-note">{c.contact.phoneNote}</p>}
            <div className="cl-contact-row"><span>البريد</span><a href={`mailto:${c.contact.email}`} dir="ltr">{c.contact.email}</a></div>
            <div className="cl-contact-row"><span>العنوان</span><span>{c.contact.office}</span></div>
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
        <div className="cl-container">
          <span>© {c.brand.ar}</span>
          <span className="cl-footer-by">صُمم عبر منصة وجود</span>
        </div>
      </footer>

      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="cl-wa-float" aria-label="واتساب">💬</a>
      )}
    </div>
  );
}

const CLINIC_CSS = `
.clinic-site{--ink:#0f172a;--muted:#64748b;--line:#e6eaf0;--tint:#f5f8fd;--card:#ffffff;background:#fff;color:var(--ink);font-family:inherit;line-height:1.7;-webkit-font-smoothing:antialiased}
.clinic-site *{box-sizing:border-box}
.clinic-site a{color:inherit;text-decoration:none}
.cl-container{max-width:1120px;margin:0 auto;padding:0 24px}
.cl-narrow{max-width:760px}
.cl-section{padding:72px 0}
.cl-tinted{background:var(--tint)}
.cl-center{text-align:center}
.cl-h1{font-size:clamp(2.2rem,6vw,4rem);font-weight:800;line-height:1.1;margin:.2em 0}
.cl-h2{font-size:clamp(1.5rem,3.5vw,2.2rem);font-weight:800;margin:0 0 .3em}
.cl-sub{color:var(--muted);font-size:1.05rem;margin:0 0 2rem;max-width:640px}
.cl-lead{font-size:1.3rem;font-weight:700;margin:0 0 1rem}
.cl-body{color:var(--muted)}
.cl-eyebrow{letter-spacing:.18em;font-size:.72rem;color:var(--accent);font-weight:700;direction:ltr;text-align:right}
/* header */
.cl-header{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.cl-header-in{display:flex;align-items:center;gap:20px;height:64px}
.cl-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.15rem}
.cl-logo{height:34px;width:34px;object-fit:contain;border-radius:8px}
.cl-logo-dot{height:14px;width:14px;border-radius:50%;background:var(--accent)}
.cl-nav{display:flex;gap:22px;margin-inline-start:auto;font-size:.95rem;color:var(--muted)}
.cl-nav a:hover{color:var(--accent)}
@media(max-width:760px){.cl-nav{display:none}}
/* buttons */
.cl-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#fff;font-weight:700;padding:12px 22px;border-radius:999px;border:none;cursor:pointer;font-size:.98rem;transition:filter .2s}
.cl-btn:hover{filter:brightness(1.08)}
.cl-btn-sm{padding:9px 18px;font-size:.9rem}
.cl-btn-ghost{background:transparent;color:var(--accent);border:1.5px solid var(--accent)}
.cl-btn-block{width:100%}
/* hero */
.cl-hero{padding:86px 0 64px;background:linear-gradient(180deg,var(--tint),#fff)}
.cl-hero-sub{font-size:1.2rem;color:var(--muted);max-width:620px;margin:1rem 0 1.6rem}
.cl-hero-cta{display:flex;gap:12px;flex-wrap:wrap}
.cl-hero-meta{display:flex;gap:40px;margin-top:48px;flex-wrap:wrap}
.cl-meta-val{font-size:2rem;font-weight:800;color:var(--accent)}
.cl-meta-lbl{color:var(--muted);font-size:.9rem}
/* about */
.cl-about{display:grid;grid-template-columns:1.6fr 1fr;gap:48px}
@media(max-width:760px){.cl-about{grid-template-columns:1fr}}
.cl-about-side{border-inline-start:3px solid var(--accent);padding-inline-start:18px;display:flex;flex-direction:column;gap:14px}
.cl-side-k{display:block;font-size:.7rem;letter-spacing:.1em;color:var(--accent);direction:ltr;text-align:right;font-weight:700}
.cl-side-v{color:var(--muted)}
/* grid + cards */
.cl-grid{display:grid;gap:20px;margin-top:8px}
.cl-grid-2{grid-template-columns:repeat(2,1fr)}
.cl-grid-3{grid-template-columns:repeat(3,1fr)}
.cl-grid-4{grid-template-columns:repeat(4,1fr)}
@media(max-width:860px){.cl-grid-3,.cl-grid-4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.cl-grid-2,.cl-grid-3,.cl-grid-4{grid-template-columns:1fr}}
.cl-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px;transition:box-shadow .2s,transform .2s}
.cl-card:hover{box-shadow:0 12px 32px rgba(15,23,42,.08);transform:translateY(-3px)}
.cl-card h3{margin:.4em 0 .3em;font-size:1.12rem}
.cl-card p{color:var(--muted);margin:0;font-size:.96rem}
.cl-card-icon{height:44px;width:44px;display:grid;place-items:center;border-radius:12px;background:color-mix(in srgb,var(--accent) 14%,#fff);color:var(--accent);font-size:1.4rem;font-weight:800}
/* doctors */
.cl-doctor{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px;text-align:center}
.cl-doctor-photo{height:120px;width:120px;border-radius:50%;margin:0 auto 14px;overflow:hidden;background:var(--tint);display:grid;place-items:center}
.cl-doctor-photo img{height:100%;width:100%;object-fit:cover}
.cl-doctor-ph{font-size:2.4rem}
.cl-doctor h3{margin:0 0 .2em;font-size:1.1rem}
.cl-doctor-spec{color:var(--accent);font-weight:600;margin:0}
.cl-doctor-en{color:var(--muted);font-size:.74rem;direction:ltr;letter-spacing:.08em;margin:.2em 0 0}
/* before/after */
.cl-result{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px}
.cl-ba{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cl-ba-cell{position:relative;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:var(--tint)}
.cl-ba-cell img{height:100%;width:100%;object-fit:cover}
.cl-ba-ph{height:100%;width:100%;background:repeating-linear-gradient(45deg,#eef2f8,#eef2f8 10px,#e6eaf0 10px,#e6eaf0 20px)}
.cl-ba-tag{position:absolute;top:8px;inset-inline-start:8px;z-index:2;background:rgba(15,23,42,.7);color:#fff;font-size:.72rem;padding:2px 10px;border-radius:999px}
.cl-ba-tag-after{background:var(--accent)}
.cl-result-title{text-align:center;margin:12px 0 4px;font-size:1.02rem}
/* prices */
.cl-pricelist{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--card)}
.cl-price-row{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-bottom:1px solid var(--line)}
.cl-price-row:last-child{border-bottom:none}
.cl-price-name{font-weight:700}
.cl-price-note{color:var(--muted);font-size:.84rem}
.cl-price-val{font-weight:800;color:var(--accent);font-size:1.15rem}
.cl-price-val span{font-size:.8rem;color:var(--muted);font-weight:600}
.cl-fineprint{color:var(--muted);font-size:.84rem;margin-top:14px;text-align:center}
/* stats */
.cl-stats{background:var(--accent);color:#fff;padding:46px 0}
.cl-stats-in{display:flex;justify-content:space-around;gap:24px;flex-wrap:wrap;text-align:center}
.cl-stat-val{font-size:2.4rem;font-weight:800}
.cl-stat-lbl{opacity:.85;font-size:.92rem}
/* steps */
.cl-step{text-align:center}
.cl-step-num{height:46px;width:46px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;margin:0 auto 12px;font-weight:800;font-size:1.2rem}
.cl-step h3{margin:0 0 .3em;font-size:1.05rem}
.cl-step p{color:var(--muted);font-size:.92rem;margin:0}
/* testimonials */
.cl-quote{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px;margin:0}
.cl-quote blockquote{margin:0 0 14px;font-size:1.02rem}
.cl-quote figcaption strong{display:block}
.cl-quote figcaption span{color:var(--muted);font-size:.86rem}
/* badges */
.cl-badges{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:24px}
.cl-badge{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 24px;text-align:center;min-width:150px}
.cl-badge-val{font-weight:800;color:var(--accent)}
.cl-badge-lbl{color:var(--muted);font-size:.84rem}
/* faq */
.cl-faq{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.cl-faq-item{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:4px 18px}
.cl-faq-item summary{cursor:pointer;font-weight:700;padding:14px 0;list-style:none}
.cl-faq-item summary::-webkit-details-marker{display:none}
.cl-faq-item summary::after{content:"+";float:left;color:var(--accent);font-weight:800}
.cl-faq-item[open] summary::after{content:"−"}
.cl-faq-item p{color:var(--muted);margin:0 0 16px}
/* booking */
.cl-booking-card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:28px;box-shadow:0 16px 50px rgba(15,23,42,.07);margin-top:20px}
.cl-booking-note{text-align:center;color:var(--muted);font-size:.84rem;margin:14px 0 0}
.cl-form{display:flex;flex-direction:column;gap:14px}
.cl-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cl-fld{display:flex;flex-direction:column;gap:6px}
.cl-fld label{font-size:.82rem;color:var(--muted);font-weight:600}
.cl-fld input,.cl-fld select,.cl-fld textarea{border:1px solid var(--line);border-radius:10px;padding:11px 13px;font:inherit;background:#fff;outline:none;width:100%}
.cl-fld input:focus,.cl-fld select:focus,.cl-fld textarea:focus{border-color:var(--accent)}
.cl-slots{display:flex;flex-wrap:wrap;gap:8px}
.cl-slot{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 14px;font:inherit;cursor:pointer;color:var(--ink);transition:all .15s}
.cl-slot:hover{border-color:var(--accent)}
.cl-slot-on{background:var(--accent);color:#fff;border-color:var(--accent)}
.cl-slots-msg{color:var(--muted);font-size:.88rem;margin:0}
/* contact */
.cl-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
@media(max-width:760px){.cl-contact{grid-template-columns:1fr}}
.cl-contact-row{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:12px 0}
.cl-contact-row span:first-child{color:var(--muted)}
.cl-contact-note{color:var(--muted);font-size:.84rem;margin:4px 0 0}
.cl-contact-actions{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}
.cl-map{border-radius:18px;overflow:hidden;border:1px solid var(--line);aspect-ratio:4/3}
.cl-map iframe{width:100%;height:100%;border:0}
/* footer */
.cl-footer{border-top:1px solid var(--line);padding:24px 0}
.cl-footer .cl-container{display:flex;justify-content:space-between;color:var(--muted);font-size:.86rem}
.cl-footer-by{opacity:.8}
/* whatsapp float */
.cl-wa-float{position:fixed;bottom:22px;inset-inline-start:22px;height:56px;width:56px;border-radius:50%;background:#25D366;color:#fff;display:grid;place-items:center;font-size:1.5rem;box-shadow:0 8px 24px rgba(37,211,102,.4);z-index:40}
`;
