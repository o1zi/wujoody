import Link from "next/link";
import Script from "next/script";
import { getPlans } from "@/lib/plans-server";

const FEATURES = [
  { p: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5", t: "نطاق فرعي خاص", d: "موقع مكتبك على نطاقٍ فرعي مستقل، جاهز فور الاشتراك." },
  { p: "M9 3h6v3H9zM5 6h14v15H5zM9 12h6M9 16h4", t: "محرّر متكامل", d: "عدّل النصوص والخدمات والمشاريع والفريق من لوحة واحدة." },
  { p: "M13 2 4 14h6l-1 8 9-12h-6z", t: "خلفيات سينمائية", d: "فيديو يتحرك مع التمرير، أو خلفية أنيقة — بنقرة." },
  { p: "M4 21a8 8 0 0 1 16 0M12 3a4 4 0 0 0-4 4v2h8V7a4 4 0 0 0-4-4zM8 9h8", t: "صندوق عملاء", d: "كل طلب تواصل يصلك في لوحتك وعلى بريدك فوراً." },
  { p: "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10", t: "تهيئة لجوجل", d: "وصف ومعاينة وبيانات منظّمة تجعل مكتبك يظهر في البحث." },
  { p: "M12 21c5-3 7-7 7-11a7 7 0 0 0-14 0c0 4 2 8 7 11z", t: "دفع آمن عبر سلة", d: "اشترك وادفع عبر سلة، ويُفعّل موقعك تلقائياً." },
];

const STEPS = [
  { t: "سجّل واحجز نطاقك", d: "أنشئ حساباً واختر النطاق الفرعي لمكتبك." },
  { t: "اشترك وادفع عبر سلة", d: "اختر باقتك وأكمل الدفع برابط سلة الآمن." },
  { t: "عدّل وانطلق", d: "خصّص محتوى موقعك من اللوحة، وموقعك يصبح حياً فوراً." },
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
  const plans = await getPlans();

  return (
    <>
      <link rel="stylesheet" href="/site-template/site.css" />

      {/* LOADER */}
      <div className="loader" id="loader">
        <div className="mk">
          وجود<span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <div className="bar">
          <i></i>
        </div>
        <div className="lbl mono">PREPARING THE SITE</div>
      </div>

      {/* CINEMATIC BACKGROUND */}
      <div className="bg-stage">
        <canvas className="bg-video" id="bgCanvas"></canvas>
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
            وجود<span style={{ color: "var(--accent)" }}>.</span>
          </span>
          <span className="en">WUJOOD</span>
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
        <span className="stat-lbl mono">WUJOOD · SAAS PLATFORM</span>
        <span className="track"><i id="hudFill"></i></span>
        <span className="pct mono" id="hudPct">نسبة الإنشاء <b>000%</b></span>
      </div>

      <main className="content">
        {/* HERO */}
        <section className="sec" id="hero" data-screen-label="الواجهة الرئيسية">
          <div className="wrap">
            <div className="hero-en mono">ENGINEERING OFFICES — SAAS PLATFORM · RIYADH</div>
            <div className="hero-grid">
              <div>
                <h1 className="hero-mark">
                  وجود<span className="dot">.</span>
                </h1>
                <p className="hero-sub">
                  موقع احترافي لمكتبك الهندسي بنطاقٍ فرعي خاص — سجّل، اشترك بالدفع عبر سلة، وخصّص موقعك من لوحة واحدة. بلا خبرة تقنية.
                </p>
                <div className="scrollcue mono">
                  <span className="m"></span>
                  <span>مرّر للأسفل · SCROLL</span>
                </div>
              </div>
              <div className="hero-meta">
                <div className="row mono"><b>5+</b> قوالب جاهزة</div>
                <div className="row mono"><b>24h</b> تفعيل خلال يوم</div>
                <div className="row mono"><b>RTL</b> دعم عربي كامل</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
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
                    <h2 className="sec-title" style={{ marginBottom: 0 }}>كل ما يحتاجه مكتبك،<br />في منصّة واحدة.</h2>
                  </div>
                  <p className="sec-lead" style={{ marginBottom: 6 }}>أدوات متكاملة لإطلاق موقع احترافي وإدارته دون تعقيد.</p>
                </div>
                <div className="svc-grid">
                  {FEATURES.map((f, i) => (
                    <div className="svc reveal" data-d={(i % 3) || undefined} key={i}>
                      <div className="no mono">{String(i + 1).padStart(2, "0")}</div>
                      <div className="ic">
                        <svg viewBox="0 0 24 24">
                          <path d={f.p} />
                        </svg>
                      </div>
                      <h3>{f.t}</h3>
                      <p>{f.d}</p>
                      <span className="arrow">←</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="sec" id="steps" data-screen-label="كيف تبدأ">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">02</span> كيف تبدأ — <span className="en">HOW IT WORKS</span>
                </div>
                <h2 className="sec-title" style={{ marginBottom: 10 }}>من التسجيل<br />إلى موقعٍ حيّ.</h2>
                <div className="proc">
                  {STEPS.map((s, i) => (
                    <div className="step reveal" data-d={i || undefined} key={i}>
                      <span className="bn"></span>
                      <div className="no mono">{String(i + 1).padStart(2, "0")}</div>
                      <h3>{s.t}</h3>
                      <p>{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="sec" id="pricing" data-screen-label="الباقات">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body">
                <div className="eyebrow mono">
                  <span className="ln"></span>
                  <span className="idx">03</span> الباقات — <span className="en">PRICING</span>
                </div>
                <h2 className="sec-title" style={{ marginBottom: 6 }}>باقات تناسب كل مكتب.</h2>
                <p className="sec-lead" style={{ marginBottom: 34 }}>الدفع آمن عبر سلة، ويُفعّل موقعك تلقائياً بعد الدفع.</p>
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

        {/* CTA */}
        <section className="sec" id="contact" data-screen-label="ابدأ الآن">
          <div className="wrap">
            <div className="glass-card reveal">
              <MacBar />
              <div className="glass-body" style={{ textAlign: "center" }}>
                <div className="eyebrow mono" style={{ justifyContent: "center" }}>
                  <span className="idx">04</span> ابدأ الآن — <span className="en">GET STARTED</span>
                </div>
                <h2 className="sec-title" style={{ fontSize: "clamp(32px,5vw,64px)" }}>
                  جاهز لإطلاق موقع مكتبك؟
                </h2>
                <p className="sec-lead" style={{ margin: "0 auto 30px" }}>
                  أنشئ حسابك خلال دقائق، وابدأ باستقبال عملائك من موقعٍ يليق بمكتبك.
                </p>
                <div className="hero-cta">
                  <Link className="btn" href="/register">
                    <span>أنشئ مكتبك الآن</span>
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

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-grid">
          <div>
            <div className="big">
              وجود<span className="dot">.</span>
            </div>
            <p className="tag">منصّة سعودية لإطلاق مواقع المكاتب الهندسية بنطاقٍ فرعي خاص خلال دقائق.</p>
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
          </div>
        </div>
        <div className="foot-bottom mono">
          <span>© {new Date().getFullYear()} WUJOOD · ENGINEERING OFFICES PLATFORM</span>
          <span>RIYADH · KSA</span>
        </div>
      </footer>

      <Script src="/site-template/scroll-engine.js" strategy="afterInteractive" />
    </>
  );
}
