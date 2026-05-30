import type { ReactNode } from "react";
import type { SiteContent } from "@/lib/site-content";
import { tenantUrl } from "@/lib/urls";
import ContactForm from "./ContactForm";
import ProjectsGallery from "./ProjectsGallery";

const ACCENTS: Record<string, { hex: string; rgb: string }> = {
  bronze: { hex: "#C2974E", rgb: "194,151,78" },
  terracotta: { hex: "#D9774E", rgb: "217,119,78" },
  azure: { hex: "#4C7DF0", rgb: "76,125,240" },
  sage: { hex: "#8FA66E", rgb: "143,166,110" },
};

function Slot({ src, label }: { src: string | null; label: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(20,24,32,.6), rgba(40,46,58,.4))",
        color: "rgba(255,255,255,.4)",
        fontSize: 12,
        letterSpacing: ".1em",
      }}
      className="mono"
    >
      {label}
    </div>
  );
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

function SocialBtn({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: "rgba(16,20,28,0.34)",
        WebkitBackdropFilter: "blur(26px) saturate(1.4)",
        backdropFilter: "blur(26px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 16px 40px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.2)",
      }}
    >
      {children}
    </a>
  );
}

function MacBar() {
  return (
    <div className="glass-bar">
      <span className="dot r"></span>
      <span className="dot y"></span>
      <span className="dot g"></span>
    </div>
  );
}

export default function SiteView({ content, slug }: { content: SiteContent; slug: string }) {
  const accent = ACCENTS[content.theme.accent] ?? ACCENTS.bronze;
  const { brand } = content;
  const m = content.media;
  const isSolid = m?.bgMode === "solid";
  const solidColor = m?.solid === "white" ? "white" : "black";
  const customFrames = !isSolid && m?.bgMode === "frames" && m.frames && m.frames.length > 0 ? m.frames : null;
  const bgMedia = !isSolid && !customFrames ? (m?.bgVideo ?? null) : null;
  const bgIsVideo = !!bgMedia && /\.(mp4|webm|mov|m4v|ogg|ogv)(\?|$)/i.test(bgMedia);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand.ar,
    description: content.hero.subtitle,
    url: tenantUrl(slug),
    telephone: content.contact.phone,
    email: content.contact.email,
    image: brand.logo || content.projects.items.find((p) => p.image)?.image || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: content.contact.office,
      addressCountry: "SA",
    },
  };

  const waNumber = (content.contact.whatsapp || content.contact.phone || "").replace(/\D/g, "");
  const waHref = waNumber.length >= 8 ? `https://wa.me/${waNumber}` : null;
  const tk = (content.contact.tiktok || "").trim();
  const tkHref = tk ? (/^https?:\/\//i.test(tk) ? tk : `https://www.tiktok.com/@${tk.replace(/^@/, "")}`) : null;
  const sn = (content.contact.snapchat || "").trim();
  const snHref = sn ? (/^https?:\/\//i.test(sn) ? sn : `https://www.snapchat.com/add/${sn.replace(/^@/, "")}`) : null;

  return (
    <div
      className={isSolid && solidColor === "white" ? "theme-light" : undefined}
      style={{ ["--accent" as string]: accent.hex, ["--accent-rgb" as string]: accent.rgb }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {customFrames ? (
        <script
          dangerouslySetInnerHTML={{ __html: `window.__BG_FRAMES__=${JSON.stringify(customFrames)};` }}
        />
      ) : null}
      {/* Social floating buttons (left side, glass) */}
      {waHref || tkHref || snHref ? (
        <div
          style={{
            position: "fixed",
            left: 22,
            bottom: 26,
            zIndex: 90,
            display: "flex",
            flexDirection: "column-reverse",
            gap: 12,
          }}
        >
          {waHref ? (
            <SocialBtn href={waHref} label="تواصل عبر واتساب">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.41c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </SocialBtn>
          ) : null}
          {tkHref ? (
            <SocialBtn href={tkHref} label="تيك توك">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </SocialBtn>
          ) : null}
          {snHref ? (
            <SocialBtn href={snHref} label="سناب شات">
              <svg width="30" height="30" viewBox="147.353 39.286 514.631 514.631" fill="#FFFC00" aria-hidden="true">
                <path d="M407.001,473.488c-1.068,0-2.087-0.039-2.862-0.076c-0.615,0.053-1.25,0.076-1.886,0.076c-22.437,0-37.439-10.607-50.678-19.973c-9.489-6.703-18.438-13.031-28.922-14.775c-5.149-0.854-10.271-1.287-15.22-1.287c-8.917,0-15.964,1.383-21.109,2.389c-3.166,0.617-5.896,1.148-8.006,1.148c-2.21,0-4.895-0.49-6.014-4.311c-0.887-3.014-1.523-5.934-2.137-8.746c-1.536-7.027-2.65-11.316-5.281-11.723c-28.141-4.342-44.768-10.738-48.08-18.484c-0.347-0.814-0.541-1.633-0.584-2.443c-0.129-2.309,1.501-4.334,3.777-4.711c22.348-3.68,42.219-15.492,59.064-35.119c13.049-15.195,19.457-29.713,20.145-31.316c0.03-0.072,0.065-0.148,0.101-0.217c3.247-6.588,3.893-12.281,1.926-16.916c-3.626-8.551-15.635-12.361-23.58-14.882c-1.976-0.625-3.845-1.217-5.334-1.808c-7.043-2.782-18.626-8.66-17.083-16.773c1.124-5.916,8.949-10.036,15.273-10.036c1.756,0,3.312,0.308,4.622,0.923c7.146,3.348,13.575,5.045,19.104,5.045c6.876,0,10.197-2.618,11-3.362c-0.198-3.668-0.44-7.546-0.674-11.214c0-0.004-0.005-0.048-0.005-0.048c-1.614-25.675-3.627-57.627,4.546-75.95c24.462-54.847,76.339-59.112,91.651-59.112c0.408,0,6.674-0.062,6.674-0.062c0.283-0.005,0.59-0.009,0.908-0.009c15.354,0,67.339,4.27,91.816,59.15c8.173,18.335,6.158,50.314,4.539,76.016l-0.076,1.23c-0.222,3.49-0.427,6.793-0.6,9.995c0.756,0.696,3.795,3.096,9.978,3.339c5.271-0.202,11.328-1.891,17.998-5.014c2.062-0.968,4.345-1.169,5.895-1.169c2.343,0,4.727,0.456,6.714,1.285l0.106,0.041c5.66,2.009,9.367,6.024,9.447,10.242c0.071,3.932-2.851,9.809-17.223,15.485c-1.472,0.583-3.35,1.179-5.334,1.808c-7.952,2.524-19.951,6.332-23.577,14.878c-1.97,4.635-1.322,10.326,1.926,16.912c0.036,0.072,0.067,0.145,0.102,0.221c1,2.344,25.205,57.535,79.209,66.432c2.275,0.379,3.908,2.406,3.778,4.711c-0.048,0.828-0.248,1.656-0.598,2.465c-3.289,7.703-19.915,14.09-48.064,18.438c-2.642,0.408-3.755,4.678-5.277,11.668c-0.63,2.887-1.271,5.717-2.146,8.691c-0.819,2.797-2.641,4.164-5.567,4.164h-0.441c-1.905,0-4.604-0.346-8.008-1.012c-5.95-1.158-12.623-2.236-21.109-2.236c-4.948,0-10.069,0.434-15.224,1.287c-10.473,1.744-19.421,8.062-28.893,14.758C444.443,462.88,429.436,473.488,407.001,473.488" />
              </svg>
            </SocialBtn>
          ) : null}
        </div>
      ) : null}

      {/* LOADER */}
      <div className="loader" id="loader">
        <div className="mk">
          {brand.ar}
          <span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <div className="bar">
          <i></i>
        </div>
        <div className="lbl mono">PREPARING THE SITE</div>
      </div>

      {/* CINEMATIC BACKGROUND */}
      <div className="bg-stage">
        {isSolid ? (
          <div className={`bg-solid bg-solid-${solidColor}`} />
        ) : bgMedia ? (
          bgIsVideo ? (
            // Native autoplay loop video — fast, smooth, SEO-friendly (no client processing).
            <video className="bg-video" id="bgVideo" src={bgMedia} autoPlay muted loop playsInline preload="auto" />
          ) : (
            // Image / animated GIF background.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="bg-video" id="bgImage" src={bgMedia} alt="" />
          )
        ) : (
          // Frame sequence (default Awtad, or the office's own extracted frames).
          <canvas className="bg-video" id="bgCanvas"></canvas>
        )}
        <div className="bg-grid"></div>
        <div className="bg-tint"></div>
        <div className="bg-grain"></div>
        <div className="bg-vignette"></div>
      </div>

      <span className="crop tl"></span>
      <span className="crop tr"></span>
      <span className="crop bl"></span>
      <span className="crop br"></span>

      <header className="topbar" id="topbar">
        <a className="brand" href="#" data-goto="hero">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={brand.ar} style={{ height: 38, width: "auto", display: "block" }} />
          ) : (
            <>
              <span className="ar">
                {brand.ar}
                <span style={{ color: "var(--accent)" }}>.</span>
              </span>
              <span className="en">{brand.en}</span>
            </>
          )}
        </a>
        <nav className="nav" id="nav">
          <a href="#" data-goto="about">من نحن</a>
          <a href="#" data-goto="services">الخدمات</a>
          <a href="#" data-goto="projects">المشاريع</a>
          <a href="#" data-goto="team">الفريق</a>
          <a className="cta" href="#" data-goto="contact">تواصل معنا</a>
        </nav>
        <button className="menu-btn" id="menuBtn" aria-label="القائمة">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <aside className="rail">
        <span className="coord mono">
          {content.coordinates.lat}&nbsp;&nbsp;{content.coordinates.lng}
        </span>
        <span className="stem"></span>
        <span className="coord mono">{content.coordinates.label}</span>
      </aside>

      <nav className="dots">
        <button className="active" data-target="hero"><span className="tip">الواجهة</span></button>
        <button data-target="about"><span className="tip">من نحن</span></button>
        <button data-target="services"><span className="tip">الخدمات</span></button>
        <button data-target="projects"><span className="tip">المشاريع</span></button>
        <button data-target="contact"><span className="tip">تواصل</span></button>
      </nav>

      <div className="hud">
        <span className="stat-lbl mono">{brand.en} · BUILD SEQUENCE</span>
        <span className="track"><i id="hudFill"></i></span>
        <span className="pct mono" id="hudPct">نسبة الإنشاء <b>000%</b></span>
      </div>

      <main className="content">
        {/* HERO */}
        <section className="sec" id="hero" data-screen-label="الواجهة الرئيسية">
          <div className="wrap">
            <div className="hero-en mono">{content.hero.eyebrow}</div>
            <div className="hero-grid">
              <div>
                <h1 className="hero-mark">
                  {brand.ar}
                  <span className="dot">.</span>
                </h1>
                <p className="hero-sub">{content.hero.subtitle}</p>
                <div className="scrollcue mono">
                  <span className="m"></span>
                  <span>مرّر لِيرتفع البناء · SCROLL</span>
                </div>
              </div>
              <div className="hero-meta">
                {content.hero.meta.map((m, i) => (
                  <div className="row mono" key={i}>
                    <b>{m.value}</b> {m.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="sec" id="about" data-screen-label="من نحن" style={{ display: content.visible.about === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">01</span> من نحن — <span className="en">ABOUT</span>
                </div>
                <div className="about-grid">
                  <div>
                    <h2 className="about-lead reveal">{content.about.lead}</h2>
                    <p className="about-body reveal" data-d="1">{content.about.body}</p>
                  </div>
                  <div className="about-side reveal" data-d="2">
                    {content.about.side.map((it, i) => (
                      <div className="it" key={i}>
                        <div className="k mono">{it.k}</div>
                        <div className="v">{it.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="sec" id="services" data-screen-label="الخدمات" style={{ display: content.visible.services === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="svc-head">
                  <div>
                    <div className="eyebrow mono">
                      <span className="ln"></span>
                      <span className="idx">02</span> الخدمات — <span className="en">SERVICES</span>
                    </div>
                    <h2 className="sec-title" style={{ marginBottom: 0 }}>{content.services.title}</h2>
                  </div>
                  <p className="sec-lead" style={{ marginBottom: 6 }}>{content.services.lead}</p>
                </div>
                <div className="svc-grid">
                  {content.services.items.map((s, i) => (
                    <div className="svc reveal" data-d={(i % 3) || undefined} key={i}>
                      <div className="no mono">{String(i + 1).padStart(2, "0")}</div>
                      <div className="ic">
                        <svg viewBox="0 0 24 24">
                          <path d={SVG_PATHS[i % SVG_PATHS.length]} />
                        </svg>
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                      <span className="arrow">←</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="sec" id="stats" data-screen-label="الأرقام والإنجازات" style={{ display: content.visible.stats === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono reveal">
                  <span className="ln"></span>
                  <span className="idx">03</span> بالأرقام — <span className="en">BY THE NUMBERS</span>
                </div>
                <h2 className="sec-title reveal" data-d="1" style={{ marginBottom: 54 }}>سجلٌّ يُبنى عاماً بعد عام.</h2>
                <div className="stats-grid">
                  {content.stats.map((st, i) => {
                    const dec = st.value.includes(".") ? 1 : undefined;
                    return (
                      <div className="stat reveal" data-d={i || undefined} key={i}>
                        <div className="num">
                          <span data-count={st.value} data-dec={dec}>0</span>
                          <span className="u">{st.suffix}</span>
                        </div>
                        <div className="lbl">{st.label}</div>
                        <div className="en mono">{st.en}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="sec" id="process" data-screen-label="منهجية العمل" style={{ display: content.visible.process === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono reveal">
                  <span className="ln"></span>
                  <span className="idx">04</span> منهجية العمل — <span className="en">PROCESS</span>
                </div>
                <h2 className="sec-title reveal" data-d="1" style={{ marginBottom: 10 }}>من الأرض البِكر<br />إلى المفتاح في يدك.</h2>
                <div className="proc">
                  {content.process.map((p, i) => (
                    <div className="step reveal" data-d={i || undefined} key={i}>
                      <span className="bn"></span>
                      <div className="no mono">{String(i + 1).padStart(2, "0")}</div>
                      <h3>{p.title}</h3>
                      <p>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="sec" id="projects" data-screen-label="المشاريع / أعمالنا" style={{ display: content.visible.projects === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="eyebrow mono reveal">
              <span className="ln"></span>
              <span className="idx">05</span> أعمالنا — <span className="en">SELECTED WORK</span>
            </div>
            <div className="svc-head" style={{ marginBottom: 0 }}>
              <h2 className="sec-title reveal" data-d="1" style={{ marginBottom: 0 }}>مشاريع تحكي الرسوخ.</h2>
              <p className="sec-lead reveal" data-d="2">نماذج من أعمالنا عبر القطاعات.</p>
            </div>
            <ProjectsGallery items={content.projects.items} />
          </div>
        </section>

        {/* TEAM */}
        <section className="sec" id="team" data-screen-label="فريق العمل" style={{ display: content.visible.team === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="eyebrow mono reveal">
              <span className="ln"></span>
              <span className="idx">06</span> الفريق — <span className="en">LEADERSHIP</span>
            </div>
            <h2 className="sec-title reveal" data-d="1" style={{ marginBottom: 6 }}>عقولٌ تقف خلف كل وتد.</h2>
            <div className="team-grid">
              {content.team.items.map((m, i) => (
                <div className="member reveal" data-d={i || undefined} key={i}>
                  <div className="ph">
                    <span className="n mono">{String(i + 1).padStart(2, "0")}</span>
                    <Slot src={m.image} label="صورة" />
                  </div>
                  <h3>{m.name}</h3>
                  <div className="role">
                    {m.role}
                    <span className="en mono">{m.roleEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sec" id="voices" data-screen-label="آراء العملاء" style={{ display: content.visible.testimonials === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">07</span> آراء العملاء — <span className="en">CLIENTS</span>
                </div>
                {content.testimonials.map((t, i) => (
                  <div className={`t-slide ${i === 0 ? "on" : ""}`} key={i}>
                    <p className="quote">
                      <span className="mk">«</span>
                      {t.quote}
                      <span className="mk">»</span>
                    </p>
                    <div className="t-foot">
                      <div className="av">{t.name.trim().charAt(0)}</div>
                      <div className="who">
                        <b>{t.name}</b>
                        <span>{t.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="t-nav">
                  <button id="tPrev" aria-label="السابق">→</button>
                  <button id="tNext" aria-label="التالي">←</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="sec" id="contact" data-screen-label="تواصل معنا" style={{ display: content.visible.contact === false ? "none" : undefined }}>
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">08</span> تواصل معنا — <span className="en">CONTACT</span>
                </div>
                <div className="contact-grid">
                  <div>
                    <h2 className="sec-title" style={{ fontSize: "clamp(30px,4vw,52px)", marginBottom: 18 }}>لديك مشروع؟<br />لنضع له وتداً.</h2>
                    <p className="sec-lead" style={{ marginBottom: 34 }}>أخبرنا عن فكرتك، وسيتواصل معك أحد مهندسينا خلال يوم عمل واحد.</p>
                    <ContactForm slug={slug} />
                  </div>
                  <div className="cinfo">
                    <div className="it"><span className="k mono">PHONE</span><span className="v">{content.contact.phone}<small>{content.contact.phoneNote}</small></span></div>
                    <div className="it"><span className="k mono">EMAIL</span><span className="v">{content.contact.email}<small>{content.contact.emailNote}</small></span></div>
                    <div className="it"><span className="k mono">OFFICE</span><span className="v">{content.contact.office}<small>{content.contact.officeNote}</small></span></div>
                    <div className="it"><span className="k mono">SOCIAL</span><span className="v">{content.contact.social}<small>{content.contact.socialNote}</small></span></div>
                  </div>
                </div>
                {content.contact.mapQuery ? (
                  <div style={{ marginTop: 28, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.14)" }}>
                    <iframe
                      title="موقع المكتب"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(content.contact.mapQuery)}&z=15&output=embed`}
                      width="100%"
                      height="320"
                      style={{ border: 0, display: "block", filter: "grayscale(0.3) contrast(1.05)" }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-grid">
          <div>
            <div className="big">
              {brand.ar}
              <span className="dot">.</span>
            </div>
            <p className="tag">{content.hero.subtitle}</p>
          </div>
          <div className="col">
            <h4>ROAM</h4>
            <a href="#" data-goto="about">من نحن</a>
            <a href="#" data-goto="services">الخدمات</a>
            <a href="#" data-goto="projects">المشاريع</a>
            <a href="#" data-goto="team">الفريق</a>
          </div>
          <div className="col">
            <h4>CONTACT</h4>
            <a href="#" data-goto="contact">تواصل معنا</a>
            <a href="#">{content.contact.email}</a>
            <a href="#">{content.contact.phone}</a>
            <a href="#">{content.contact.office}</a>
          </div>
        </div>
        <div className="foot-bottom mono">
          <span>© {new Date().getFullYear()} {brand.en} ENGINEERING CONSULTANCY</span>
          <span>{content.coordinates.lat} · {content.coordinates.lng}</span>
        </div>
      </footer>
    </div>
  );
}
