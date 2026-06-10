import type { ReactNode } from "react";
import type { SiteContent } from "@/lib/site-content";
import type { PlanCaps } from "@/lib/plans";
import { fontByKey } from "@/lib/site-fonts";
import { tenantUrl } from "@/lib/urls";
import ContactForm from "./ContactForm";
import BookingForm from "./BookingForm";
import CostCalculator from "./CostCalculator";
import ProjectsGallery from "./ProjectsGallery";
import Models3D from "./Models3D";

// Deco palette — gold-leaning accents on deep emerald.
const ACCENTS: Record<string, { hex: string; rgb: string }> = {
  bronze: { hex: "#C9A24B", rgb: "201,162,75" }, // gold (default)
  terracotta: { hex: "#CF8A56", rgb: "207,138,86" }, // copper
  azure: { hex: "#7FB3C9", rgb: "127,179,201" }, // deco teal
  sage: { hex: "#9FB57A", rgb: "159,181,122" }, // soft olive-gold
};

function hexToRgb(hex?: string | null): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

const SVG_PATHS = [
  "M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5",
  "M3 4h18M3 20h18M6 4v16M18 4v16M6 9h12M6 15h12",
  "M13 2 4 14h6l-1 8 9-12h-6z",
  "M4 21a8 8 0 0 1 16 0M12 3a4 4 0 0 0-4 4v2h8V7a4 4 0 0 0-4-4zM8 9h8",
  "M9 3h6v3H9zM5 6h14v15H5zM9 12h6M9 16h4",
  "M3 20h18M5 20v-7l5-3 5 3v7M9 20v-4h2v4M14 10V5h3v3",
  "M12 2v6M12 22v-6M2 12h6M22 12h-6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10",
  "M12 21c5-3 7-7 7-11a7 7 0 0 0-14 0c0 4 2 8 7 11zM12 12c0-3 2-5 4-5",
];

function Slot({ src, label, kind = "image" }: { src: string | null; label: string; kind?: "person" | "image" }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={label} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    );
  }
  const icon =
    kind === "person"
      ? "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20.5a8 8 0 0 1 16 0"
      : "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6";
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#0F342A" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", opacity: 0.85 }}>
        <path d={icon} />
      </svg>
    </div>
  );
}

function DcSocial({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export default function DecoView({ content, slug, caps }: { content: SiteContent; slug: string; caps: PlanCaps }) {
  const preset = ACCENTS[content.theme.accent] ?? ACCENTS.bronze;
  const customRgb = hexToRgb(content.theme.accentHex);
  const accent = customRgb ? { hex: content.theme.accentHex as string, rgb: customRgb } : preset;
  const fontFamily = fontByKey(content.theme.font).family;

  const allowedSections = new Set(caps.sections);
  const show = (k: string) => allowedSections.has(k) && (content.visible as Record<string, boolean>)[k] !== false;
  const { brand } = content;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand.ar,
    description: content.hero.subtitle,
    url: tenantUrl(slug),
    telephone: content.contact.phone,
    email: content.contact.email,
    image: brand.logo || content.projects.items.find((p) => p.image)?.image || undefined,
    address: { "@type": "PostalAddress", addressLocality: content.contact.office, addressCountry: "SA" },
  };

  const waNumber = (content.contact.whatsapp || content.contact.phone || "").replace(/\D/g, "");
  const waHref = waNumber.length >= 8 ? `https://wa.me/${waNumber}` : null;
  const tk = (content.contact.tiktok || "").trim();
  const tkHref = tk ? (/^https?:\/\//i.test(tk) ? tk : `https://www.tiktok.com/@${tk.replace(/^@/, "")}`) : null;
  const sn = (content.contact.snapchat || "").trim();
  const snHref = sn ? (/^https?:\/\//i.test(sn) ? sn : `https://www.snapchat.com/add/${sn.replace(/^@/, "")}`) : null;
  const ig = (content.contact.instagram || "").trim();
  const igHref = ig ? (/^https?:\/\//i.test(ig) ? ig : `https://instagram.com/${ig.replace(/^@/, "")}`) : null;
  const ln = (content.contact.linkedin || "").trim();
  const lnHref = ln ? (/^https?:\/\//i.test(ln) ? ln : `https://www.linkedin.com/in/${ln.replace(/^@/, "")}`) : null;

  const Brand = (
    <>
      {brand.ar}
      <span className="dot">.</span>
    </>
  );

  const head = (kicker: string, title?: string) => (
    <div className="dc-head dc-reveal">
      <span className="dc-kicker">{kicker}</span>
      {title ? <h2 className="dc-title">{title}</h2> : null}
    </div>
  );

  return (
    <div
      className="dc"
      style={{
        ["--accent" as string]: accent.hex,
        ["--accent-rgb" as string]: accent.rgb,
        fontFamily,
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script dangerouslySetInnerHTML={{ __html: `window.__OFFICE_SLUG__=${JSON.stringify(slug)};` }} />

      <div className="dc-amb" />

      {/* floating social */}
      {waHref || tkHref || snHref || igHref || lnHref ? (
        <div className="dc-social">
          {waHref ? (
            <DcSocial href={waHref} label="تواصل عبر واتساب">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.41c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
            </DcSocial>
          ) : null}
          {igHref ? (
            <DcSocial href={igHref} label="إنستقرام">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#EEE7D5" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.85 5.85 0 0 0-2.13 1.38A5.85 5.85 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.85 5.85 0 0 0 2.13-1.38 5.85 5.85 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.85 5.85 0 0 0-1.38-2.13A5.85 5.85 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" /></svg>
            </DcSocial>
          ) : null}
          {lnHref ? (
            <DcSocial href={lnHref} label="لينكدإن">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#EEE7D5" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
            </DcSocial>
          ) : null}
          {tkHref ? (
            <DcSocial href={tkHref} label="تيك توك">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#EEE7D5" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
            </DcSocial>
          ) : null}
          {snHref ? (
            <DcSocial href={snHref} label="سناب شات">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#EEE7D5" aria-hidden="true"><path d="M12.06 2c2.06.01 3.96.99 5.06 2.65.78 1.18.7 2.74.62 4.18l-.02.34c-.01.18-.02.35-.03.52.05.04.2.13.5.13.27-.01.6-.1.96-.27.1-.05.23-.07.34-.07.2 0 .41.05.56.13.3.16.34.4.34.5.01.42-.55.7-1.07.9-.07.03-.16.06-.26.09-.4.13-1 .32-1.18.74-.1.23-.06.52.11.86 0 .01.42 1.97 2.33 2.28.16.02.27.16.26.32 0 .06-.02.12-.05.17-.18.43-1.13.74-2.66 1-.07.12-.16.5-.22.79-.04.18-.1.4-.32.4h-.03c-.13 0-.32-.02-.55-.07-.33-.07-.7-.13-1.17-.13-.27 0-.56.02-.84.07-.55.09-1.02.43-1.56.81-.73.52-1.56 1.1-2.79 1.1h-.21c-1.23 0-2.05-.58-2.78-1.09-.55-.39-1.02-.72-1.57-.81-.28-.05-.56-.07-.84-.07-.48 0-.86.07-1.16.13-.21.04-.4.07-.54.07-.27 0-.31-.16-.35-.4-.05-.29-.14-.67-.22-.8-1.53-.25-2.48-.56-2.66-1-.03-.05-.05-.11-.05-.17-.01-.16.1-.3.26-.32 1.91-.31 2.33-2.27 2.33-2.28.17-.34.21-.63.11-.86-.18-.42-.78-.61-1.18-.74-.1-.03-.19-.06-.26-.09-.69-.27-1.11-.57-1.06-.99.03-.27.34-.5.71-.5.1 0 .2.02.28.06.39.18.74.27 1.03.27.32 0 .47-.1.5-.13l-.03-.52c-.09-1.45-.18-3.08.6-4.27C8.08 2.99 9.99 2.01 12.06 2z" /></svg>
            </DcSocial>
          ) : null}
        </div>
      ) : null}

      {/* TOP BAR */}
      <header className="dc-top">
        <a className="dc-brand" href="#top">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={brand.ar} style={{ height: 34, width: "auto", display: "block" }} />
          ) : (
            <>
              <span>{Brand}</span>
              <span className="en">{brand.en}</span>
            </>
          )}
        </a>
        <nav className="dc-nav">
          {show("about") && <a href="#about">من نحن</a>}
          {show("services") && <a href="#services">الخدمات</a>}
          {show("projects") && <a href="#projects">المشاريع</a>}
          {show("team") && <a href="#team">الفريق</a>}
          {show("blog") && <a href={`${tenantUrl(slug)}/blog`}>المدوّنة</a>}
          {show("contact") && <a className="cta" href="#contact">تواصل معنا</a>}
        </nav>
        <button className="dc-menu" aria-label="القائمة"><span /><span /><span /></button>
      </header>

      <div className="dc-content">
        <main id="top">
          {/* HERO */}
          <section className="dc-hero">
            <div className="dc-rays" aria-hidden="true" />
            <div className="dc-wrap dc-hero-inner">
              <div className="dc-hero-kicker dc-reveal">{content.hero.eyebrow}</div>
              <h1 className="dc-hero-title dc-reveal" data-d="1">{Brand}</h1>
              <div className="dc-rule dc-reveal" data-d="2"><span className="d" /></div>
              <p className="dc-hero-sub dc-reveal" data-d="2">{content.hero.subtitle}</p>
              <div className="dc-hero-meta dc-reveal" data-d="3">
                {content.hero.meta.map((mt, i) => (
                  <div className="it" key={i}>
                    <b>{mt.value}</b>
                    <span>{mt.label}</span>
                  </div>
                ))}
              </div>
              <div className="dc-scrollcue dc-reveal" data-d="4"><span className="dc-orn" />SCROLL</div>
            </div>
          </section>

          {/* ABOUT */}
          {show("about") && (
            <section className="dc-sec" id="about">
              <div className="dc-wrap">
                {head("من نحن · About")}
                <div className="dc-about">
                  <div className="dc-reveal" data-d="1">
                    <h2 className="dc-about-lead">{content.about.lead}</h2>
                    <p className="dc-about-body">{content.about.body}</p>
                  </div>
                  <div className="dc-side dc-reveal" data-d="2">
                    {content.about.side.map((it, i) => (
                      <div className="it" key={i}>
                        <div className="k">{it.k}</div>
                        <div className="v">{it.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SERVICES */}
          {show("services") && (
            <section className="dc-sec" id="services">
              <div className="dc-wrap">
                {head("الخدمات · Services", content.services.title)}
                <p className="dc-lead dc-reveal" data-d="1" style={{ textAlign: "center", marginBottom: 44 }}>{content.services.lead}</p>
                <div className="dc-svc-grid">
                  {content.services.items.map((s, i) => (
                    <div className="dc-svc dc-reveal" data-d={(i % 3) + 1} key={i}>
                      <div className="ic"><svg viewBox="0 0 24 24"><path d={SVG_PATHS[i % SVG_PATHS.length]} /></svg></div>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CREDENTIALS */}
          {show("credentials") && (content.credentials.badges.length > 0 || content.credentials.clients.length > 0) && (
            <section className="dc-sec" id="credentials">
              <div className="dc-wrap">
                {head("الاعتمادات والثقة · Credentials")}
                {content.credentials.lead ? <p className="dc-lead dc-reveal" data-d="1" style={{ textAlign: "center", marginBottom: 34 }}>{content.credentials.lead}</p> : null}
                {content.credentials.badges.length > 0 && (
                  <div className="dc-cred dc-reveal" data-d="2">
                    {content.credentials.badges.map((b, i) => (
                      <div className="badge" key={i}>
                        <div className="v">{b.value}</div>
                        <div className="k">{b.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {content.credentials.clients.length > 0 && (
                  <div className="dc-clients dc-reveal" data-d="3">
                    {content.credentials.clients.map((cl, i) => (
                      <div className="dc-client" key={i} title={cl.name}>
                        {cl.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cl.logo} alt={cl.name} />
                        ) : (
                          <span>{cl.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STATS */}
          {show("stats") && (
            <section className="dc-sec" id="stats">
              <div className="dc-wrap">
                {head("بالأرقام · By the numbers")}
                <div className="dc-stats dc-reveal" data-d="1">
                  {content.stats.map((st, i) => {
                    const dec = st.value.includes(".") ? 1 : undefined;
                    return (
                      <div className="dc-stat" key={i}>
                        <div className="num">
                          <span data-count={st.value} data-dec={dec}>0</span>
                          <span className="u">{st.suffix}</span>
                        </div>
                        <div className="lbl">{st.label}</div>
                        <div className="en">{st.en}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* PROCESS */}
          {show("process") && (
            <section className="dc-sec" id="process">
              <div className="dc-wrap">
                {head("منهجية العمل · Process")}
                <div className="dc-proc">
                  {content.process.map((p, i) => (
                    <div className="dc-step dc-reveal" data-d={(i % 4) + 1} key={i}>
                      <div className="no"><span>{String(i + 1).padStart(2, "0")}</span></div>
                      <h3>{p.title}</h3>
                      <p>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {show("projects") && (
            <section className="dc-sec" id="projects">
              <div className="dc-wrap">
                {head("أعمالنا · Selected work", "مشاريع تليق بالطموح.")}
                <div className="dc-reveal" data-d="2">
                  <ProjectsGallery items={content.projects.items} detailed={caps.projectDetails} />
                  {show("models3d") && <Models3D title={content.models.title} lead={content.models.lead} items={content.models.items} />}
                </div>
              </div>
            </section>
          )}

          {/* TEAM */}
          {show("team") && (
            <section className="dc-sec" id="team">
              <div className="dc-wrap">
                {head("الفريق · Team", "عقولٌ تقف خلف كل عمل.")}
                <div className="dc-team">
                  {content.team.items.map((mb, i) => (
                    <div className="dc-member dc-reveal" data-d={(i % 4) + 1} key={i}>
                      <div className="ph"><Slot src={mb.image} label={mb.name} kind="person" /></div>
                      <h3>{mb.name}</h3>
                      <div className="role">{mb.role}<span className="en">{mb.roleEn}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* TESTIMONIALS */}
          {show("testimonials") && content.testimonials.length > 0 && (
            <section className="dc-sec" id="voices">
              <div className="dc-wrap">
                {head("آراء العملاء · Clients")}
                <div className="dc-quotes dc-reveal" data-d="1">
                  {content.testimonials.map((t, i) => (
                    <div className="dc-quote" key={i}>
                      <p>{t.quote}</p>
                      <div className="by"><b>{t.name}</b><span>{t.role}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FAQ */}
          {show("faq") && content.faq.items.length > 0 && (
            <section className="dc-sec" id="faq">
              <div className="dc-wrap">
                {head("الأسئلة الشائعة · FAQ")}
                <div className="dc-faq dc-reveal" data-d="1">
                  {content.faq.items.map((f, i) => (
                    <details key={i} open={i === 0}>
                      <summary>{f.q}</summary>
                      <div className="a">{f.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* BOOKING */}
          {show("booking") && (
            <section className="dc-sec" id="booking">
              <div className="dc-wrap">
                {head("احجز استشارة · Book", "احجز استشارتك الأولى")}
                <p className="dc-lead dc-reveal" data-d="1" style={{ textAlign: "center", marginBottom: 40 }}>اختر الوقت المناسب لك وسيتواصل معك أحد مهندسينا لتأكيد الموعد.</p>
                <div className="dc-card dc-reveal" data-d="2" style={{ maxWidth: 680, margin: "0 auto" }}>
                  <BookingForm slug={slug} />
                </div>
              </div>
            </section>
          )}

          {/* CALCULATOR */}
          {show("calculator") && content.calculator.types.some((t) => t.name) && (
            <section className="dc-sec" id="calculator">
              <div className="dc-wrap">
                {head("حاسبة التكلفة · Estimate")}
                {content.calculator.lead ? <p className="dc-lead dc-reveal" data-d="1" style={{ textAlign: "center", marginBottom: 36 }}>{content.calculator.lead}</p> : null}
                <div className="dc-card dc-reveal" data-d="2" style={{ maxWidth: 920, margin: "0 auto" }}>
                  <CostCalculator calc={content.calculator} />
                </div>
              </div>
            </section>
          )}

          {/* CONTACT */}
          {show("contact") && (
            <section className="dc-sec" id="contact">
              <div className="dc-wrap">
                {head("تواصل معنا · Contact", "لديك مشروع؟ لنبدأه معاً.")}
                <div className="dc-contact">
                  <div className="dc-card dc-reveal" data-d="1">
                    <ContactForm slug={slug} waNumber={caps.whatsapp && waNumber.length >= 8 ? waNumber : ""} brand={brand.ar} />
                  </div>
                  <div className="dc-card dc-cinfo dc-reveal" data-d="2">
                    <div className="it"><span className="k">PHONE</span><span className="v">{content.contact.phone}<small>{content.contact.phoneNote}</small></span></div>
                    <div className="it"><span className="k">EMAIL</span><span className="v">{content.contact.email}<small>{content.contact.emailNote}</small></span></div>
                    <div className="it"><span className="k">OFFICE</span><span className="v">{content.contact.office}<small>{content.contact.officeNote}</small></span></div>
                    <div className="it"><span className="k">SOCIAL</span><span className="v">{content.contact.social}<small>{content.contact.socialNote}</small></span></div>
                  </div>
                </div>
                {content.contact.mapQuery ? (
                  <div className="dc-map dc-reveal" data-d="2">
                    <iframe
                      title="موقع المكتب"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(content.contact.mapQuery)}&z=15&output=embed`}
                      width="100%"
                      height="320"
                      style={{ border: 0, display: "block", filter: "invert(0.9) hue-rotate(120deg) brightness(0.9) contrast(0.95) saturate(0.7)" }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : null}
              </div>
            </section>
          )}
        </main>

        <footer className="dc-foot">
          <div className="dc-wrap">
            <div className="dc-rule dc-reveal"><span className="d" /></div>
            <div className="big dc-reveal">{Brand}</div>
            <p className="tag dc-reveal" data-d="1">{content.hero.subtitle}</p>
            <div className="dc-foot-nav dc-reveal" data-d="1">
              {show("about") && <a href="#about">من نحن</a>}
              {show("services") && <a href="#services">الخدمات</a>}
              {show("projects") && <a href="#projects">المشاريع</a>}
              {show("team") && <a href="#team">الفريق</a>}
              {show("contact") && <a href="#contact">تواصل</a>}
            </div>
            <div className="dc-foot-bottom">
              <span>© {new Date().getFullYear()} {brand.en} ENGINEERING CONSULTANCY</span>
              <span>{content.coordinates.lat} · {content.coordinates.lng}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
