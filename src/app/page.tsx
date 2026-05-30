import Link from "next/link";
import { PLANS } from "@/lib/plans";

const FEATURES = [
  { t: "نطاق فرعي خاص", d: "موقع مكتبك على نطاقٍ فرعي مستقل من المنصة، جاهز فور الاشتراك." },
  { t: "محرر متكامل", d: "عدّل كل شيء — النصوص، الخدمات، المشاريع، الفريق — من لوحة تحكم واحدة." },
  { t: "تصميم سينمائي", d: "قالب هندسي فاخر بخلفية متحركة وتأثيرات تمرير تليق بمكتبك." },
  { t: "اشتراك بالدفع عبر سلة", d: "ادفع بأمان عبر سلة، ويُفعّل موقعك تلقائياً بعد إتمام الدفع." },
  { t: "تحديثات فورية", d: "أي تعديل في لوحة التحكم يظهر مباشرةً على موقعك دون انتظار." },
  { t: "متعدد المكاتب", d: "كل مكتب بلوحته ومحرره وبياناته المعزولة بأمان." },
];

const STEPS = [
  { n: "01", t: "سجّل واختر نطاقك", d: "أنشئ حساباً واحجز النطاق الفرعي لمكتبك." },
  { n: "02", t: "اشترك وادفع عبر سلة", d: "اختر باقتك وأكمل الدفع برابط سلة الآمن." },
  { n: "03", t: "عدّل وانطلق", d: "خصّص محتوى موقعك من اللوحة، وموقعك يصبح حياً فوراً." },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold">
          منصة المكاتب الهندسية<span className="text-accent">.</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-muted hover:text-foreground">
            دخول
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft"
          >
            أنشئ مكتبك
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <div className="mono mb-5 inline-block rounded-full border border-border px-4 py-1.5 text-xs text-muted">
          ENGINEERING OFFICES · SAAS PLATFORM
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          موقع احترافي لمكتبك الهندسي،
          <br />
          <span className="text-accent">بنطاقٍ فرعي خاص</span> خلال دقائق.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          أنشئ حساباً، اشترك بالدفع عبر سلة، وخصّص موقعك من لوحة تحكم واحدة. لا حاجة لأي خبرة تقنية.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-accent px-7 py-3.5 font-medium text-[#0b0d10] hover:bg-accent-soft"
          >
            ابدأ الآن
          </Link>
          <Link href="#pricing" className="rounded-xl border border-border px-7 py-3.5 font-medium hover:bg-surface">
            الباقات والأسعار
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="bg-surface p-7">
              <h3 className="text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">كيف تبدأ؟</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-surface p-7">
              <div className="mono text-3xl font-bold text-accent">{s.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">باقات الاشتراك</h2>
        <p className="mt-3 text-center text-muted">اختر ما يناسب مكتبك. الدفع آمن عبر سلة.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.code}
              className={`rounded-2xl border bg-surface p-8 ${p.highlight ? "border-accent" : "border-border"}`}
            >
              {p.highlight && (
                <div className="mono mb-3 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                  الأكثر شيوعاً
                </div>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted">
                  {p.currency} / {p.period}
                </span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 text-accent">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-7 block rounded-xl bg-accent py-3 text-center font-medium text-[#0b0d10] hover:bg-accent-soft"
              >
                اشترك الآن
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative mx-auto max-w-6xl border-t border-border px-6 py-10">
        <div className="mono flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} ENGINEERING OFFICES PLATFORM</span>
          <span>24.7136°N · 46.6753°E</span>
        </div>
      </footer>
    </div>
  );
}
