import type { ReactNode } from "react";

// Self-contained glass "mac window" status card (no external CSS needed).
export default function StatusCard({
  chip,
  icon,
  title,
  body,
  actionHref,
  actionLabel,
}: {
  chip?: string;
  icon?: ReactNode;
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(120% 80% at 50% -10%, rgba(194,151,78,0.14), transparent 60%), radial-gradient(90% 60% at 0% 110%, rgba(194,151,78,0.07), transparent 55%), #06070A",
        color: "#fff",
        fontFamily: '"Readex Pro", "Segoe UI", Tahoma, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 18,
          overflow: "hidden",
          background: "rgba(16,20,28,0.55)",
          WebkitBackdropFilter: "blur(26px) saturate(1.4)",
          backdropFilter: "blur(26px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 40px 120px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2)",
        }}
      >
        <div
          style={{
            direction: "ltr",
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 16px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
        </div>

        <div style={{ padding: "40px 30px", textAlign: "center" }}>
          {chip ? (
            <div
              style={{
                display: "inline-block",
                fontSize: 12,
                letterSpacing: ".1em",
                color: "rgba(255,255,255,.7)",
                border: "1px solid rgba(255,255,255,.15)",
                borderRadius: 20,
                padding: "4px 14px",
                marginBottom: 18,
                fontFamily: "ui-monospace, monospace",
              }}
              dir="ltr"
            >
              {chip}
            </div>
          ) : null}

          {icon ? <div style={{ marginBottom: 16, color: "var(--accent)" }}>{icon}</div> : null}

          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.25 }}>{title}</h1>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,.6)", fontSize: 15, lineHeight: 1.7 }}>{body}</p>

          <a
            href={actionHref}
            style={{
              display: "inline-block",
              marginTop: 26,
              background: "var(--accent, #c08a4d)",
              color: "#0b0d10",
              fontWeight: 600,
              fontSize: 15,
              padding: "12px 26px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            {actionLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
