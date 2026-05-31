import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        position: "relative",
        background:
          "radial-gradient(120% 80% at 50% -10%, rgba(194,151,78,0.12), transparent 60%), #06070A",
      }}
    >
      {/* same template style (glass cards, fonts, accent) — no video, no grid */}
      <link rel="stylesheet" href="/site-template/site.css" precedence="high" />

      <Link
        href="/"
        style={{ fontFamily: '"Readex Pro",sans-serif', fontWeight: 600, fontSize: 30, color: "#fff", marginBottom: 22 }}
      >
        رِواق<span style={{ color: "var(--accent)" }}>.</span>
      </Link>

      <div className="glass-card" style={{ width: "100%", maxWidth: 430 }}>
        <div className="glass-bar">
          <span className="dot r"></span>
          <span className="dot y"></span>
          <span className="dot g"></span>
        </div>
        <div className="glass-body">{children}</div>
      </div>

      <div className="mono" style={{ marginTop: 22, fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: ".1em" }}>
        منصّة المكاتب الهندسية · RIYADH
      </div>
    </div>
  );
}
