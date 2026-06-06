import type { ReactNode } from "react";
import Link from "next/link";

// Shared shell for the legal pages (terms, privacy). Server component.
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-white/10 glass-panel">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-bold">
            وجود<span className="text-accent">.</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← العودة للرئيسية
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mono mt-2 text-xs text-muted">آخر تحديث: {updated}</p>

        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-6 text-amber-200/90">
          هذه الوثيقة نموذج استرشادي عام. يُنصح بمراجعتها واعتمادها من مختصٍّ قانوني قبل الاعتماد النهائي، خصوصاً ما يتعلق
          بالمدفوعات وحماية البيانات في المملكة العربية السعودية.
        </div>

        {intro && <p className="mt-6 leading-8 text-muted">{intro}</p>}

        <div className="mt-8 space-y-7">{children}</div>

        <div className="mt-12 border-t border-border pt-6 text-sm text-muted">
          <p>
            للاطّلاع على{" "}
            {title.includes("الخصوصية") ? (
              <Link href="/terms" className="text-accent hover:underline">الشروط والأحكام</Link>
            ) : (
              <Link href="/privacy" className="text-accent hover:underline">سياسة الخصوصية</Link>
            )}
            .
          </p>
        </div>
      </main>
    </div>
  );
}

export function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="flex items-baseline gap-2 text-lg font-semibold">
        <span className="mono text-sm text-accent">{n}</span>
        <span>{title}</span>
      </h2>
      <div className="mt-2 space-y-3 leading-8 text-muted">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-0.5 text-accent">•</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
