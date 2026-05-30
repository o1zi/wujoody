"use client";

import { useState } from "react";

const SHAPES = ["big", "tall", "wide", "wide"];

type Item = { tag: string; title: string; meta: string; image: string | null };

export default function ProjectsGallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? items[open] : null;

  return (
    <>
      <div className="proj-grid reveal" data-d="2">
        {items.map((pr, i) => (
          <div
            className={`proj ${SHAPES[i % SHAPES.length]}`}
            key={i}
            onClick={() => pr.image && setOpen(i)}
            style={pr.image ? { cursor: "zoom-in" } : undefined}
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
                className="mono"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, rgba(20,24,32,.6), rgba(40,46,58,.4))",
                  color: "rgba(255,255,255,.4)",
                  fontSize: 12,
                }}
              >
                صورة المشروع
              </div>
            )}
            <div className="cap">
              <h3>{pr.title}</h3>
              <span className="meta mono">{pr.meta}</span>
            </div>
          </div>
        ))}
      </div>

      {active?.image ? (
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
