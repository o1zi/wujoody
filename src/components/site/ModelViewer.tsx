"use client";

import { createElement, useEffect, useRef, useState } from "react";

// Google's <model-viewer> web component (glTF/GLB, orbit/zoom/pan + AR). The
// element is rendered BY REACT (no manual DOM insertion — doing that corrupts
// React's reconciliation and throws removeChild errors). We just inject the
// CDN module once; the custom element upgrades retroactively when it loads.
const SCRIPT_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
let injected = false;

function ensureScript() {
  if (injected || typeof document === "undefined") return;
  if (document.querySelector("script[data-model-viewer]")) {
    injected = true;
    return;
  }
  const s = document.createElement("script");
  s.type = "module";
  s.src = SCRIPT_SRC;
  s.setAttribute("data-model-viewer", "");
  document.head.appendChild(s);
  injected = true;
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
  const ref = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    ensureScript();
  }, []);

  // Listen for the element's load/error to drive the overlay.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onLoad = () => setStatus("ready");
    const onError = () => setStatus("error");
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
  }, [src]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mvProps: any = {
    ref,
    src,
    alt,
    "camera-controls": "",
    "auto-rotate": "",
    "auto-rotate-delay": "0",
    "rotation-per-second": "20deg",
    "interaction-prompt": "auto",
    "touch-action": "pan-y",
    "shadow-intensity": "1",
    exposure: "1",
    ar: "",
    "ar-modes": "webxr scene-viewer quick-look",
    style: { width: "100%", height: "100%", display: "block", backgroundColor: "transparent" },
  };
  if (poster) mvProps.poster = poster;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {createElement("model-viewer", mvProps)}
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
              تعذّر تحميل النموذج. تأكد أن الملف بصيغة GLB صحيحة.
            </span>
          )}
        </div>
      )}
      <style>{`@keyframes mvspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
