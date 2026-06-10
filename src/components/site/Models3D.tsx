"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ModelViewer from "./ModelViewer";

// Same wrappers ProjectsGallery escapes — the modal must portal out of the
// template's content wrapper so it covers the fixed top bar.
const CONTENT_WRAP =
  ".content,.at-content,.au-content,.bp-content,.cn-content,.dc-content,.hr-content,.kn-content,.lx-content";

type ModelItem = { title: string; caption: string; url: string | null; poster: string | null };

function CubeIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

// Dedicated interactive 3D showcase, rendered below the projects grid. Each card
// opens a Google <model-viewer> in a modal the visitor can orbit/zoom/pan/AR.
export default function Models3D({ title, lead, items }: { title: string; lead: string; items: ModelItem[] }) {
  const valid = items.filter((m) => m.url);
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? valid[open] : null;

  const ref = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    const wrap = g.closest(CONTENT_WRAP);
    setHost(wrap?.parentElement ?? g.closest(".ed") ?? document.body);
  }, []);

  if (valid.length === 0) return null;

  const overlay = active ? (
    <div className="proj-modal" onClick={() => setOpen(null)}>
      <div
        className="glass-card proj-study"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "calc(100dvh - 24px)", width: "min(940px, 96vw)", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="glass-bar" style={{ flex: "0 0 auto" }}>
          <span className="dot r"></span>
          <span className="dot y"></span>
          <span className="dot g"></span>
          <button aria-label="إغلاق" className="proj-x" onClick={() => setOpen(null)}>✕</button>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: "clamp(300px, 58vh, 560px)",
            background: "linear-gradient(160deg, rgba(255,255,255,.05), rgba(0,0,0,.22))",
          }}
        >
          <ModelViewer src={active.url as string} poster={active.poster} alt={active.title} />
        </div>
        <div className="glass-body" style={{ flex: "0 0 auto" }}>
          <h3 style={{ margin: 0 }}>{active.title || "نموذج ثلاثي الأبعاد"}</h3>
          {active.caption ? <p className="proj-text" style={{ marginTop: 6 }}>{active.caption}</p> : null}
          <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>اسحب للتدوير · مرّر للتقريب · زر AR للعرض بكاميرتك</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div ref={ref} className="reveal" style={{ marginTop: 56 }}>
      <div style={{ marginBottom: 20 }}>
        <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent)" }}>
          <CubeIcon size={14} /> 3D · INTERACTIVE
        </span>
        <h3 style={{ fontSize: "clamp(22px, 3vw, 34px)", margin: "8px 0 0" }}>{title}</h3>
        {lead ? <p className="sec-lead" style={{ marginTop: 8, maxWidth: 600, opacity: 0.85 }}>{lead}</p> : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {valid.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            className="glass-card"
            style={{ textAlign: "right", cursor: "pointer", overflow: "hidden", padding: 0, border: "1px solid var(--line, rgba(255,255,255,.12))" }}
          >
            <div style={{ position: "relative", aspectRatio: "4 / 3", background: "linear-gradient(135deg, rgba(255,255,255,.06), rgba(0,0,0,.22))" }}>
              {m.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.poster} alt={m.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", opacity: 0.5 }}>
                  <CubeIcon size={46} />
                </span>
              )}
              <span
                className="mono"
                style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(0,0,0,.6)", color: "#fff", backdropFilter: "blur(4px)" }}
              >
                <CubeIcon /> 3D
              </span>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,.5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title || "نموذج"}</div>
              {m.caption ? <div className="mono" style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>{m.caption}</div> : null}
            </div>
          </button>
        ))}
      </div>

      {host && overlay ? createPortal(overlay, host) : null}
    </div>
  );
}
