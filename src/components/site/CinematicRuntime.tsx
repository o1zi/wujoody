"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Loads the scroll engine once, then (re)initializes it on every mount and
// tears it down on unmount — so the cinematic background/loader work correctly
// even after client-side navigation (e.g. pressing Back). Also runs Lenis for
// buttery smooth (eased) page scrolling.
declare global {
  interface Window {
    __RIWAQ_ENGINE?: () => () => void;
  }
}

export default function CinematicRuntime() {
  useEffect(() => {
    let destroyed = false;
    let destroy: (() => void) | undefined;

    // ----- Smooth scrolling (Lenis) -----
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    // ----- Background/scroll engine -----
    const run = () => {
      if (destroyed) return;
      if (window.__RIWAQ_ENGINE) destroy = window.__RIWAQ_ENGINE();
    };
    if (window.__RIWAQ_ENGINE) {
      run();
    } else {
      const existing = document.querySelector<HTMLScriptElement>('script[data-riwaq-engine]');
      if (existing) {
        existing.addEventListener("load", run, { once: true });
      } else {
        const s = document.createElement("script");
        s.src = "/site-template/scroll-engine.js";
        s.dataset.riwaqEngine = "1";
        s.onload = run;
        document.body.appendChild(s);
      }
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (destroy) destroy();
    };
  }, []);

  return null;
}
