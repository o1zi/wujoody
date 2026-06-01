import type { SiteContent } from "@/lib/site-content";
import type { PlanCaps } from "@/lib/plans";
import { themeAttrs } from "@/lib/site-theme";
import { tenantUrl } from "@/lib/urls";
import ContactForm from "./ContactForm";
import BookingForm from "./BookingForm";
import CostCalculator from "./CostCalculator";
import ProjectsGallery from "./ProjectsGallery";

export default function MinimalSiteView({ content, slug, caps }: { content: SiteContent; slug: string; caps: PlanCaps }) {
  const t = themeAttrs(content.theme);
  const allowed = new Set(caps.sections);
  const show = (k: string) => allowed.has(k) && (content.visible as Record<string, boolean>)[k] !== false;
  const dark = content.media?.solid !== "white";
  const brand = content.brand;
  const home = tenantUrl(slug);

  const waNumber = (content.contact.whatsapp || content.contact.phone || "").replace(/\D/g, "");
  const socials: { key: string; emoji: string; href: string }[] = [];
  const add = (key: string, emoji: string, href: string | null) => href && socials.push({ key, emoji, href });
  add("whatsapp", "🟢", waNumber.length >= 8 ? `https://wa.me/${waNumber}` : null);
  const ig = content.contact.instagram?.trim();
  add("instagram", "📸", ig ? (/^https?:/i.test(ig) ? ig : `https://instagram.com/${ig.replace(/^@/, "")}`) : null);
  const tk = content.contact.tiktok?.trim();
  add("tiktok", "🎵", tk ? (/^https?:/i.test(tk) ? tk : `https://www.tiktok.com/@${tk.replace(/^@/, "")}`) : null);
  const sn = content.contact.snapchat?.trim();
  add("snapchat", "👻", sn ? (/^https?:/i.test(sn) ? sn : `https://www.snapchat.com/add/${sn.replace(/^@/, "")}`) : null);
  const ln = content.contact.linkedin?.trim();
  add("linkedin", "💼", ln ? (/^https?:/i.test(ln) ? ln : `https://www.linkedin.com/in/${ln.replace(/^@/, "")}`) : null);

  const mapSrc = content.contact.mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(content.contact.mapQuery)}&z=14&output=embed`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand.ar,
    description: content.hero.subtitle,
    url: home,
    telephone: content.contact.phone,
    email: content.contact.email,
  };

  return (
    <div className="m-site" data-bg={dark ? "dark" : undefined} data-card={t.dataCard} data-font={t.dataFont} style={t.style}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        dangerouslySetInnerHTML={{
          __html:
            `(function(){var s=${JSON.stringify(slug)};try{navigator.sendBeacon('/api/track',JSON.stringify({slug:s,type:'view'}));}catch(e){}` +
            `document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-track]');if(a){try{navigator.sendBeacon('/api/track',JSON.stringify({slug:s,type:a.getAttribute('data-track')}));}catch(_){}}});})();`,
        }}
      />

      <header className="m-header">
        <div className="m-wrap in">
          <a className="m-brand" href="#top">
            {brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt={brand.ar} />
            ) : null}
            {brand.ar}
          </a>
          <nav className="m-nav">
            {show("about") && <a href="#about">من نحن</a>}
            {show("services") && <a href="#services">الخدمات</a>}
            {show("projects") && <a href="#projects">المشاريع</a>}
            {show("blog") && <a href={`${home}/blog`}>المدوّنة</a>}
            <a className="m-cta" href="#contact">تواصل معنا</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="m-hero">
          <div className="m-wrap">
            <div className="m-eyebrow">{content.hero.eyebrow}</div>
            <h1>{brand.ar}</h1>
            <p>{content.hero.subtitle}</p>
            {content.hero.meta?.length > 0 && (
              <div className="m-meta">
                {content.hero.meta.map((m, i) => (
                  <div key={i}>
                    <div className="v">{m.value}</div>
                    <div className="l">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {show("about") && (
          <section className="m-sec" id="about">
            <div className="m-wrap">
              <h2>من نحن</h2>
              <p className="m-lead">{content.about.lead}</p>
              <p style={{ color: "var(--m-muted)" }}>{content.about.body}</p>
            </div>
          </section>
        )}

        {show("services") && (
          <section className="m-sec" id="services">
            <div className="m-wrap">
              <h2>{content.services.title || "خدماتنا"}</h2>
              <p className="m-lead">{content.services.lead}</p>
              <div className="m-grid">
                {content.services.items.filter((s) => s.title).map((s, i) => (
                  <div className="m-card" key={i}>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {show("stats") && content.stats.length > 0 && (
          <section className="m-sec">
            <div className="m-wrap m-stats">
              {content.stats.map((s, i) => (
                <div key={i}>
                  <div className="v">{s.value}{s.suffix}</div>
                  <div className="l">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {show("process") && content.process.length > 0 && (
          <section className="m-sec">
            <div className="m-wrap">
              <h2>منهجية العمل</h2>
              <div className="m-grid">
                {content.process.map((p, i) => (
                  <div className="m-card" key={i}>
                    <h3>{i + 1}. {p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {show("projects") && (
          <section className="m-sec" id="projects">
            <div className="m-wrap">
              <h2>المشاريع</h2>
              <ProjectsGallery items={content.projects.items} detailed={caps.projectDetails} />
            </div>
          </section>
        )}

        {show("team") && content.team.items.length > 0 && (
          <section className="m-sec">
            <div className="m-wrap">
              <h2>فريق العمل</h2>
              <div className="m-grid">
                {content.team.items.map((m, i) => (
                  <div className="m-card" key={i}>
                    <h3>{m.name}</h3>
                    <p>{m.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {show("testimonials") && content.testimonials.length > 0 && (
          <section className="m-sec">
            <div className="m-wrap">
              <h2>آراء العملاء</h2>
              <div className="m-grid">
                {content.testimonials.map((tt, i) => (
                  <div className="m-card" key={i}>
                    <p style={{ color: "var(--m-fg)" }}>«{tt.quote}»</p>
                    <p style={{ marginTop: 10 }}><b>{tt.name}</b> — {tt.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {show("credentials") && content.credentials.badges.length > 0 && (
          <section className="m-sec">
            <div className="m-wrap">
              <h2>الاعتمادات والثقة</h2>
              {content.credentials.lead ? <p className="m-lead">{content.credentials.lead}</p> : null}
              <div className="m-badges">
                {content.credentials.badges.map((b, i) => (
                  <div className="m-badge" key={i}><b>{b.value}</b><span>{b.label}</span></div>
                ))}
              </div>
            </div>
          </section>
        )}

        {show("faq") && content.faq.items.length > 0 && (
          <section className="m-sec">
            <div className="m-wrap m-faq">
              <h2>الأسئلة الشائعة</h2>
              {content.faq.items.map((f, i) => (
                <details key={i} open={i === 0}>
                  <summary>{f.q}</summary>
                  <div className="a">{f.a}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        {show("booking") && (
          <section className="m-sec">
            <div className="m-wrap" style={{ maxWidth: 640 }}>
              <h2>احجز استشارتك الأولى</h2>
              <p className="m-lead">اختر الوقت المناسب وسيتواصل معك أحد مهندسينا.</p>
              <BookingForm slug={slug} />
            </div>
          </section>
        )}

        {show("calculator") && content.calculator.types.some((x) => x.name) && (
          <section className="m-sec">
            <div className="m-wrap">
              <h2>حاسبة التكلفة</h2>
              {content.calculator.lead ? <p className="m-lead">{content.calculator.lead}</p> : null}
              <CostCalculator calc={content.calculator} />
            </div>
          </section>
        )}

        {show("contact") && (
          <section className="m-sec" id="contact">
            <div className="m-wrap">
              <h2>تواصل معنا</h2>
              <div className="m-contact">
                <div>
                  <ContactForm slug={slug} waNumber={caps.whatsapp && waNumber.length >= 8 ? waNumber : ""} brand={brand.ar} />
                </div>
                <div className="m-info">
                  {content.contact.phone ? <div className="it"><span className="k">الهاتف</span><span className="v">{content.contact.phone}</span></div> : null}
                  {content.contact.email ? <div className="it"><span className="k">البريد</span><span className="v">{content.contact.email}</span></div> : null}
                  {content.contact.office ? <div className="it"><span className="k">المكتب</span><span className="v">{content.contact.office}</span></div> : null}
                  {socials.length > 0 && (
                    <div className="m-social">
                      {socials.map((s) => (
                        <a key={s.key} href={s.href} target="_blank" rel="noreferrer" data-track={`click_${s.key}`} aria-label={s.key}>{s.emoji}</a>
                      ))}
                    </div>
                  )}
                  {mapSrc && (
                    <div className="m-map">
                      <iframe src={mapSrc} loading="lazy" title="map" referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="m-foot">
        <div className="m-wrap">© {new Date().getFullYear()} {brand.ar} — جميع الحقوق محفوظة.</div>
      </footer>
    </div>
  );
}
