"use client";

import { createElement, useEffect } from "react";

// Google's <model-viewer> web component — renders glTF/GLB with orbit/zoom/pan
// and AR. The script is ~300KB so we load it lazily, only when a viewer mounts
// (i.e. when a visitor opens a project that has a 3D model).
const SCRIPT_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
let scriptInjected = false;

function ensureScript() {
  if (scriptInjected || typeof document === "undefined") return;
  if (document.querySelector("script[data-model-viewer]")) {
    scriptInjected = true;
    return;
  }
  const s = document.createElement("script");
  s.type = "module";
  s.src = SCRIPT_SRC;
  s.setAttribute("data-model-viewer", "");
  document.head.appendChild(s);
  scriptInjected = true;
}

export default function ModelViewer({
  src,
  poster,
  alt = "نموذج ثلاثي الأبعاد",
  style,
}: {
  src: string;
  poster?: string | null;
  alt?: string;
  style?: React.CSSProperties;
}) {
  useEffect(() => {
    ensureScript();
  }, []);

  // Boolean attributes use "" (presence = enabled). Custom element, so we build
  // the props bag and let React set the attributes.
  const props: Record<string, unknown> = {
    src,
    alt,
    "camera-controls": "",
    "auto-rotate": "",
    "auto-rotate-delay": "0",
    "rotation-per-second": "18deg",
    "touch-action": "pan-y",
    "interaction-prompt": "auto",
    "shadow-intensity": "1",
    exposure: "1",
    ar: "",
    "ar-modes": "webxr scene-viewer quick-look",
    loading: "eager",
    style: {
      width: "100%",
      height: "100%",
      display: "block",
      backgroundColor: "transparent",
      "--poster-color": "transparent",
      ...style,
    },
  };
  if (poster) props.poster = poster;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement("model-viewer", props as any);
}
