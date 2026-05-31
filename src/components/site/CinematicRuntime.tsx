"use client";

import { useEffect } from "react";

// Loads the scroll engine once, then (re)initializes it on every mount and
// tears it down on unmount — so the cinematic background/loader work correctly
// even after client-side navigation (e.g. pressing Back).
declare global {
  interface Window {
    __WUJOOD_ENGINE?: () => () => void;
  }
}

export default function CinematicRuntime() {
  useEffect(() => {
    let destroyed = false;
    let destroy: (() => void) | undefined;

    const run = () => {
      if (destroyed) return;
      if (window.__WUJOOD_ENGINE) destroy = window.__WUJOOD_ENGINE();
    };

    if (window.__WUJOOD_ENGINE) {
      run();
    } else {
      const existing = document.querySelector<HTMLScriptElement>('script[data-wujood-engine]');
      if (existing) {
        existing.addEventListener("load", run, { once: true });
      } else {
        const s = document.createElement("script");
        s.src = "/site-template/scroll-engine.js";
        s.dataset.wujoodEngine = "1";
        s.onload = run;
        document.body.appendChild(s);
      }
    }

    return () => {
      destroyed = true;
      if (destroy) destroy();
    };
  }, []);

  return null;
}
