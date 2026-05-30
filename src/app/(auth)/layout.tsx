import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <Link href="/" className="relative text-2xl font-bold">
          منصة المكاتب الهندسية<span className="text-accent">.</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug">
            موقع احترافي لمكتبك الهندسي،
            <br />
            بنطاقٍ فرعي خاص.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            سجّل، اشترك، وعدّل محتوى موقعك من لوحة تحكم واحدة — وسيكون موقعك جاهزاً على الفور.
          </p>
        </div>
        <div className="mono relative text-xs text-muted">24.7136°N · 46.6753°E · RIYADH</div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
