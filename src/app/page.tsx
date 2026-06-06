import Link from "next/link";
import { getPlans } from "@/lib/plans-server";
import { getLanding } from "@/lib/landing-server";
import { SITE_TEMPLATES } from "@/lib/site-templates";
import CinematicRuntime from "@/components/site/CinematicRuntime";

// Signature colours for each template's preview swatch (bg / text / accent).
const TEMPLATE_COLORS: Record<string, { bg: string; fg: string; accent: string }> = {
  cinematic: { bg: "#06070A", fg: "#EDE8DE", accent: "#C2974E" },
  editorial: { bg: "#F4F1EA", fg: "#15110C", accent: "#B5803A" },
  luxe: { bg: "#0C0E13", fg: "#ECE6DC", accent: "#C9A86A" },
  heritage: { bg: "#EDE3CE", fg: "#33271B", accent: "#B25430" },
  kinetic: { bg: "#ECE8DF", fg: "#121110", accent: "#E8462E" },
  aurora: { bg: "#E9EDF5", fg: "#1B2130", accent: "#6D5DF6" },
  blueprint: { bg: "#0B2A45", fg: "#E6EFF8", accent: "#54C5E8" },
  deco: { bg: "#082019", fg: "#EEE7D5", accent: "#C9A24B" },
  concrete: { bg: "#CBC7BE", fg: "#26241F", accent: "#B5462A" },
  atelier: { bg: "#141110", fg: "#F1E9D8", accent: "#C77B43" },
};

const FEATURE_ICONS = [
  "M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5",
  "M9 3h6v3H9zM5 6h14v15H5zM9 12h6M9 16h4",
  "M13 2 4 14h6l-1 8 9-12h-6z",
  "M4 21a8 8 0 0 1 16 0M12 3a4 4 0 0 0-4 4v2h8V7a4 4 0 0 0-4-4zM8 9h8",
  "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10",
  "M12 21c5-3 7-7 7-11a7 7 0 0 0-14 0c0 4 2 8 7 11z",
];

function MacBar() {
  return (
    <div className="glass-bar">
      <span className="dot r"></span>
      <span className="dot y"></span>
      <span className="dot g"></span>
    </div>
  );
}

export default async function HomePage() {
  const [plans, c] = await Promise.all([getPlans(), getLanding()]);

  const m = c.media;
  const isSolid = m.bgMode === "solid";
  const solidColor = m.solid === "white" ? "white" : "black";
  const customFrames = !isSolid && m.bgMode === "frames" && m.frames && m.frames.length > 0 ? m.frames : null;
  const bgMedia = !isSolid && !customFrames ? m.bgVideo : null;
  const bgIsVideo = !!bgMedia && /\.(mp4|webm|mov|m4v|ogg|ogv)(\?|$)/i.test(bgMedia);
  const lightClass = isSolid && solidColor === "white" ? "theme-light" : undefined;

  return (
    <div className={lightClass}>
      <link rel="stylesheet" href="/site-template/site.css" precedence="high" />
      {customFrames ? (
        <script dangerouslySetInnerHTML={{ __html: `window.__BG_FRAMES__=${JSON.stringify(customFrames)};` }} />
      ) : null}

      <div className="loader" id="loader">
        <div className="mk">
          {c.brand.ar}
          <span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <div className="bar">
          <i></i>
        </div>
        <div className="lbl mono">PREPARING THE SITE</div>
      </div>

      <div className="bg-stage">
        {isSolid ? (
          <div className={`bg-solid bg-solid-${solidColor}`} />
        ) : bgMedia ? (
          bgIsVideo ? (
            <video className="bg-video" id="bgVideo" src={bgMedia} autoPlay muted loop playsInline preload="auto" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="bg-video" id="bgImage" src={bgMedia} alt="" />
          )
        ) : (
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
          <span className="ar">
            {c.brand.ar}
            <span style={{ color: "var(--accent)" }}>.</span>
          </span>
          <span className="en">{c.brand.en}</span>
        </a>
        <nav className="nav" id="nav">
          <a href="#" data-goto="features">المزايا</a>
          <a href="#" data-goto="steps">كيف تبدأ</a>
          <a href="#" data-goto="pricing">الباقات</a>
          <Link className="cta" href="/register">
            أنشئ مكتبك
          </Link>
        </nav>
        <button className="menu-btn" id="menuBtn" aria-label="القائمة">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <aside className="rail">
        <span className="coord mono">منصّة المكاتب الهندسية</span>
        <span className="stem"></span>
        <span className="coord mono">RIYADH · KSA</span>
      </aside>

      <nav className="dots">
        <button className="active" data-target="hero"><span className="tip">الواجهة</span></button>
        <button data-target="features"><span className="tip">المزايا</span></button>
        <button data-target="steps"><span className="tip">كيف تبدأ</span></button>
        <button data-target="pricing"><span className="tip">الباقات</span></button>
        <button data-target="contact"><span className="tip">ابدأ</span></button>
      </nav>

      <div className="hud">
        <span className="stat-lbl mono">{c.brand.en} · SAAS PLATFORM</span>
        <span className="track"><i id="hudFill"></i></span>
        <span className="pct mono" id="hudPct">نسبة الإنشاء <b>000%</b></span>
      </div>

      <main className="content">
        <section className="sec" id="hero" data-screen-label="الواجهة الرئيسية">
          <div className="wrap">
            <div className="hero-en mono">{c.hero.eyebrow}</div>
            <div className="hero-grid">
              <div>
                <h1 className="hero-mark">
                  {c.brand.ar}
                  <span className="dot">.</span>
                </h1>
                <p className="hero-sub">{c.hero.subtitle}</p>
                <div className="scrollcue mono">
                  <span className="m"></span>
                  <span>مرّر للأسفل · SCROLL</span>
                </div>
              </div>
              <div className="hero-meta">
                {c.hero.meta.map((m, i) => (
                  <div className="row mono" key={i}>
                    <b>{m.value}</b> {m.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="features" data-screen-label="المزايا">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="svc-head">
                  <div>
                    <div className="eyebrow mono">
                      <span className="ln"></span>
                      <span className="idx">01</span> المزايا — <span className="en">FEATURES</span>
                    </div>
                    <h2 className="sec-title" style={{ marginBottom: 0 }}>{c.features.title}</h2>
                  </div>
                  <p className="sec-lead" style={{ marginBottom: 6 }}>{c.features.lead}</p>
                </div>
                <div className="svc-grid">
                  {c.features.items.map((f, i) => (
                    <div className="svc reveal" data-d={(i % 3) || undefined} key={i}>
                      <div className="no mono">{String(i + 1).padStart(2, "0")}</div>
                      <div className="ic">
                        <svg viewBox="0 0 24 24">
                          <path d={FEATURE_ICONS[i % FEATURE_ICONS.length]} />
                        </svg>
                      </div>
                      <h3>{f.title}</h3>
                      <p>{f.desc}</p>
                      <span className="arrow">←</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="templates" data-screen-label="القوالب">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">✦</span> القوالب — <span className="en">TEMPLATES</span>
                </div>
                <h2 className="sec-title" style={{ marginBottom: 6 }}>عشرة تصاميم… بنقرة واحدة.</h2>
                <p className="sec-lead" style={{ marginBottom: 30 }}>
                  اختر مظهر موقعك من ١٠ قوالب احترافية — يبدّلها مكتبك متى شاء، والمحتوى يبقى كما هو. اضغط أي بطاقة لمعاينة نموذج حيّ.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
                  {SITE_TEMPLATES.map((t) => {
                    const col = TEMPLATE_COLORS[t.id] || { bg: "#14171c", fg: "#fff", accent: "#C2974E" };
                    return (
                      <a
                        key={t.id}
                        href={`/s/${t.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "block",
                          borderRadius: 14,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,.12)",
                          background: "rgba(255,255,255,.03)",
                          textDecoration: "none",
                        }}
                      >
                        <div
                          style={{
                            height: 138,
                            background: col.bg,
                            padding: 18,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: 21, color: col.fg, letterSpacing: "-.02em" }}>
                              أبجد<span style={{ color: col.accent }}>.</span>
                            </span>
                            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: ".18em", color: col.accent, direction: "ltr" }}>
                              {t.id.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ height: 6, width: "72%", borderRadius: 3, background: col.accent, opacity: 0.85 }}></span>
                            <span style={{ height: 5, width: "46%", borderRadius: 3, background: col.fg, opacity: 0.22 }}></span>
                          </div>
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                            <span className="mono" style={{ fontSize: 11, color: "var(--accent)", whiteSpace: "nowrap" }}>معاينة ↗</span>
                          </div>
                          <p style={{ marginTop: 5, fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>{t.tagline}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="steps" data-screen-label="كيف تبدأ">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">02</span> كيف تبدأ — <span className="en">HOW IT WORKS</span>
                </div>
                <h2 className="sec-title" style={{ marginBottom: 10 }}>{c.steps.title}</h2>
                <div className="proc">
                  {c.steps.items.map((s, i) => (
                    <div className="step reveal" data-d={i || undefined} key={i}>
                      <span className="bn"></span>
                      <div className="no mono">{String(i + 1).padStart(2, "0")}</div>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="pricing" data-screen-label="الباقات">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">03</span> الباقات — <span className="en">PRICING</span>
                </div>
                <h2 className="sec-title" style={{ marginBottom: 6 }}>{c.pricing.title}</h2>
                <p className="sec-lead" style={{ marginBottom: 34 }}>{c.pricing.lead}</p>
                <div className="pricing-grid">
                  {plans.map((p) => (
                    <div className={`price-card${p.highlight ? " featured" : ""}`} key={p.code}>
                      {p.highlight && <span className="price-badge mono">الأكثر شيوعاً</span>}
                      <h3>{p.name}</h3>
                      <div className="price-amount">
                        <b>{p.price}</b>
                        <span className="mono">{p.currency} / {p.period}</span>
                      </div>
                      <ul className="price-feats">
                        {p.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                      <Link className="price-cta" href="/register">
                        اشترك الآن
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="payments" data-screen-label="الاشتراك">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">04</span> الاشتراك — <span className="en">SUBSCRIPTION</span>
                </div>
                <h2 className="sec-title" style={{ marginBottom: 6 }}>اشتراك سنوي بتحويل بنكي بسيط.</h2>
                <p className="sec-lead" style={{ marginBottom: 28 }}>
                  اختر باقتك، حوّل قيمتها السنوية على حسابنا البنكي، وأرسل الإيصال عبر واتساب — ونفعّل موقعك يدوياً خلال وقت قصير.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {[
                    { n: "١", t: "اختر باقتك", d: "باقة سنوية تناسب حجم مكتبك واحتياجه." },
                    { n: "٢", t: "حوّل بنكياً", d: "حوّل قيمة الباقة على الحساب المعروض في لوحتك." },
                    { n: "٣", t: "أرسل الإيصال", d: "عبر واتساب — ونفعّل اشتراكك وموقعك مباشرة." },
                  ].map((s) => (
                    <div
                      key={s.n}
                      style={{
                        background: "rgba(255,255,255,.04)",
                        border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: 14,
                        padding: "20px 22px",
                      }}
                    >
                      <div className="mono" style={{ fontSize: 22, fontWeight: 700, opacity: 0.5 }}>{s.n}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, marginTop: 8 }}>{s.t}</div>
                      <p style={{ marginTop: 6, opacity: 0.7, fontSize: 15, lineHeight: 1.6 }}>{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="contact" data-screen-label="ابدأ الآن">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body" style={{ textAlign: "center" }}>
                <div className="eyebrow mono" style={{ justifyContent: "center" }}>
                  <span className="idx">05</span> ابدأ الآن — <span className="en">GET STARTED</span>
                </div>
                <h2 className="sec-title" style={{ fontSize: "clamp(32px,5vw,64px)" }}>{c.cta.title}</h2>
                <p className="sec-lead" style={{ margin: "0 auto 30px" }}>{c.cta.lead}</p>
                <div className="hero-cta">
                  <Link className="btn" href="/register">
                    <span>{c.cta.button}</span>
                    <span className="mono">→</span>
                  </Link>
                  <Link className="btn-ghost" href="/login">
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-grid">
          <div>
            <div className="big">
              {c.brand.ar}
              <span className="dot">.</span>
            </div>
            <p className="tag">{c.footerTag}</p>
          </div>
          <div className="col">
            <h4>المنصّة</h4>
            <a href="#" data-goto="features">المزايا</a>
            <a href="#" data-goto="steps">كيف تبدأ</a>
            <a href="#" data-goto="pricing">الباقات</a>
          </div>
          <div className="col">
            <h4>الحساب</h4>
            <Link href="/register">أنشئ مكتبك</Link>
            <Link href="/login">تسجيل الدخول</Link>
            <Link href="/terms">الشروط والأحكام</Link>
            <Link href="/privacy">سياسة الخصوصية</Link>
          </div>
        </div>
        <div className="foot-bottom mono">
          <span>© {new Date().getFullYear()} {c.brand.en} · ENGINEERING OFFICES PLATFORM</span>
          <span style={{ display: "flex", gap: 18 }}>
            <Link href="/terms" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>الشروط</Link>
            <Link href="/privacy" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>الخصوصية</Link>
          </span>
          <span>RIYADH · KSA</span>
        </div>
      </footer>

      <CinematicRuntime />
    </div>
  );
}
