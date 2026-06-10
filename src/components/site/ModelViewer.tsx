"use client";

import { useEffect, useRef, useState } from "react";

// Google's <model-viewer> web component (glTF/GLB, orbit/zoom/pan + AR). We load
// the module from a CDN once and build the element imperatively so the custom
// element gets clean attributes (React's custom-element attribute handling is
// unreliable for boolean attrs like camera-controls). Surfaces load/error state.
const SCRIPT_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
let loadPromise: Promise<void> | null = null;

function loadModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.customElements?.get("model-viewer")) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-model-viewer]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script")));
      return;
    }
    const s = document.createElement("script");
    s.type = "module";
    s.src = SCRIPT_SRC;
    s.setAttribute("data-model-viewer", "");
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error("script")));
    document.head.appendChild(s);
  });
  return loadPromise;
}

export default function ModelViewer({
  src,
  poster,
  alt = "نموذج ثلاثي الأبعاد",
}: {
  src: string;
  poster?: string | null;
  alt?: string;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    loadModelViewer()
      .then(() => window.customElements.whenDefined("model-viewer"))
      .then(() => {
        if (cancelled || !mount.current) return;
        const mv = document.createElement("model-viewer");
        mv.setAttribute("src", src);
        if (poster) mv.setAttribute("poster", poster);
        mv.setAttribute("alt", alt);
        mv.setAttribute("camera-controls", "");
        mv.setAttribute("auto-rotate", "");
        mv.setAttribute("auto-rotate-delay", "0");
        mv.setAttribute("rotation-per-second", "20deg");
        mv.setAttribute("interaction-prompt", "auto");
        mv.setAttribute("touch-action", "pan-y");
        mv.setAttribute("shadow-intensity", "1");
        mv.setAttribute("exposure", "1");
        mv.setAttribute("ar", "");
        mv.setAttribute("ar-modes", "webxr scene-viewer quick-look");
        mv.style.width = "100%";
        mv.style.height = "100%";
        mv.style.display = "block";
        mv.style.backgroundColor = "transparent";
        mv.addEventListener("load", () => !cancelled && setStatus("ready"));
        mv.addEventListener("error", () => !cancelled && setStatus("error"));
        mount.current.replaceChildren(mv);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [src, poster, alt]);

  return (
    <div ref={mount} style={{ position: "relative", width: "100%", height: "100%" }}>
      {status !== "ready" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            textAlign: "center",
            padding: 24,
            color: "var(--accent, #c2974e)",
            pointerEvents: "none",
          }}
        >
          {status === "loading" ? (
            <>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "3px solid currentColor",
                  borderTopColor: "transparent",
                  animation: "mvspin 0.8s linear infinite",
                }}
              />
              <span className="mono" style={{ fontSize: 12, opacity: 0.8 }}>جارٍ تحميل النموذج…</span>
            </>
          ) : (
            <span className="mono" style={{ fontSize: 12, opacity: 0.9, maxWidth: 280 }}>
              تعذّر تحميل النموذج. تأكد أن الملف بصيغة GLB صحيحة، وأن مانع الإعلانات لا يحجب العرض.
            </span>
          )}
        </div>
      )}
      <style>{`@keyframes mvspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
