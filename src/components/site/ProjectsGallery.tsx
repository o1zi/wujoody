"use client";

import { useState } from "react";

const SHAPES = ["big", "tall", "wide", "wide"];

type Item = {
  tag: string;
  title: string;
  meta: string;
  image: string | null;
  body?: string;
  details?: { k: string; v: string }[];
  gallery?: (string | null)[];
};

export default function ProjectsGallery({ items, detailed = false }: { items: Item[]; detailed?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? items[open] : null;
  // A project is openable if it has an image, or (with the Pro feature) a case study.
  const hasStudy = (pr: Item) => detailed && !!(pr.body || (pr.gallery && pr.gallery.some(Boolean)) || (pr.details && pr.details.length));
  const canOpen = (pr: Item) => !!pr.image || hasStudy(pr);

  return (
    <>
      <div className="proj-grid reveal" data-d="2">
        {items.map((pr, i) => (
          <div
            className={`proj ${SHAPES[i % SHAPES.length]}`}
            key={i}
            onClick={() => canOpen(pr) && setOpen(i)}
            style={canOpen(pr) ? { cursor: "zoom-in" } : undefined}
          >
            <span className="tag mono">{pr.tag}</span>
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

      {active && hasStudy(active) ? (
        <div className="proj-modal" onClick={() => setOpen(null)}>
          <div className="glass-card proj-study" onClick={(e) => e.stopPropagation()}>
            <div className="glass-bar">
              <span className="dot r"></span>
              <span className="dot y"></span>
              <span className="dot g"></span>
              <button aria-label="إغلاق" className="proj-x" onClick={() => setOpen(null)}>✕</button>
            </div>
            <div className="proj-scroll">
              {active.image ? (
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
            zIndex: 200,
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
      ) : null}
    </>
  );
}
