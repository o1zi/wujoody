"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ModelViewer from "./ModelViewer";

const SHAPES = ["big", "tall", "wide", "wide"];

// Each template wraps its body in one of these; the wrapper sets z-index, which
// traps the modal *below* the fixed top bar (a higher-z sibling of the wrapper).
// We portal the modal out to the wrapper's parent (the template root) so it
// escapes the trap while still inheriting scoped styles and --accent.
const CONTENT_WRAP =
  ".content,.at-content,.au-content,.bp-content,.cn-content,.dc-content,.hr-content,.kn-content,.lx-content";

type Item = {
  tag: string;
  title: string;
  meta: string;
  image: string | null;
  body?: string;
  details?: { k: string; v: string }[];
  gallery?: (string | null)[];
  model?: string | null;
};

export default function ProjectsGallery({ items, detailed = false }: { items: Item[]; detailed?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? items[open] : null;
  // A project opens a rich modal if it has a case study (Pro) or a 3D model.
  const hasStudy = (pr: Item) => detailed && !!(pr.body || (pr.gallery && pr.gallery.some(Boolean)) || (pr.details && pr.details.length));
  const isRich = (pr: Item) => hasStudy(pr) || !!pr.model;
  const canOpen = (pr: Item) => !!pr.image || isRich(pr);

  // Resolve the portal host once mounted: the template root (parent of the
  // content wrapper), falling back to the editorial root or <body>.
  const gridRef = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => {
    const g = gridRef.current;
    if (!g) return;
    const wrap = g.closest(CONTENT_WRAP);
    setHost(wrap?.parentElement ?? g.closest(".ed") ?? document.body);
  }, []);

  const overlay =
    active && isRich(active) ? (
      <div className="proj-modal" onClick={() => setOpen(null)}>
        <div
          className="glass-card proj-study"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: "calc(100dvh - 24px)", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <div className="glass-bar" style={{ flex: "0 0 auto" }}>
            <span className="dot r"></span>
            <span className="dot y"></span>
            <span className="dot g"></span>
            <button aria-label="إغلاق" className="proj-x" onClick={() => setOpen(null)}>✕</button>
          </div>
          <div className="proj-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            {active.model ? (
              <div
                style={{
                  position: "relative",
                  height: "clamp(280px, 52vh, 460px)",
                  background: "linear-gradient(160deg, rgba(255,255,255,.06), rgba(0,0,0,.18))",
                }}
              >
                <ModelViewer src={active.model} poster={active.image} alt={active.title} />
                <span
                  className="mono"
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    background: "rgba(0,0,0,.55)",
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                    pointerEvents: "none",
                  }}
                >
                  3D · اسحب للتدوير
                </span>
              </div>
            ) : active.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="proj-hero" src={active.image} alt={active.title} />
            ) : null}
            <div className="glass-body proj-study-body">
              <span className="tag mono">{active.tag}</span>
              <h3>{active.title}</h3>
              <span className="meta mono" dir="ltr">{active.meta}</span>
              {active.details && active.details.length > 0 && (
                <div className="proj-facts">
                  {active.details.map((d, i) => (
                    <div className="fact" key={i}>
                      <span className="k mono">{d.k}</span>
                      <span className="v">{d.v}</span>
                    </div>
                  ))}
                </div>
              )}
              {active.body ? <p className="proj-text">{active.body}</p> : null}
              {active.gallery && active.gallery.some(Boolean) && (
                <div className="proj-gallery">
                  {active.gallery.filter(Boolean).map((g, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={g as string} alt={`${active.title} ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : active?.image ? (
      <div
        onClick={() => setOpen(null)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 400,
          background: "rgba(0,0,0,.88)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          cursor: "zoom-out",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.image}
          alt={active.title}
          style={{ maxWidth: "92vw", maxHeight: "82vh", objectFit: "contain", borderRadius: 12 }}
        />
        <div style={{ marginTop: 16, textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{active.title}</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--accent)", marginTop: 4 }} dir="ltr">
            {active.meta}
          </div>
        </div>
        <button
          aria-label="إغلاق"
          onClick={() => setOpen(null)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            color: "#fff",
            fontSize: 22,
          }}
        >
          ✕
        </button>
      </div>
    ) : null;

  return (
    <>
      <div ref={gridRef} className="proj-grid reveal" data-d="2">
        {items.map((pr, i) => (
          <div
            className={`proj ${SHAPES[i % SHAPES.length]}`}
            key={i}
            onClick={() => canOpen(pr) && setOpen(i)}
            style={canOpen(pr) ? { cursor: "zoom-in" } : undefined}
          >
            <span className="tag mono">{pr.tag}</span>
            {pr.model ? (
              <span
                className="mono"
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  zIndex: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(0,0,0,.6)",
                  color: "#fff",
                  backdropFilter: "blur(4px)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                3D
              </span>
            ) : null}
            {pr.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pr.image}
                alt={pr.title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, rgba(18,22,30,.92), rgba(38,44,56,.6))",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.13,
                    backgroundImage:
                      "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(var(--accent-rgb),.2), transparent 70%)",
                  }}
                />
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: "relative", opacity: 0.85 }}
                >
                  <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
                </svg>
              </div>
            )}
            <div className="cap">
              <h3>{pr.title}</h3>
              <span className="meta mono">{pr.meta}</span>
            </div>
          </div>
        ))}
      </div>

      {host && overlay ? createPortal(overlay, host) : null}
    </>
  );
}
