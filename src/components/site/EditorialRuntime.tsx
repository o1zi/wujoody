"use client";

import { useEffect } from "react";

// Lightweight runtime for the Editorial template: scroll-reveal, count-up
// stats, sticky-bar hairline on scroll, and the mobile menu toggle. Smooth
// anchor scrolling is handled by CSS (scroll-behavior). Intentionally far
// lighter than CinematicRuntime — the editorial look is type-led, not motion-led.
export default function EditorialRuntime() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ed");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1) Reveal on scroll.
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>(".ed-reveal"));
    let io: IntersectionObserver | null = null;
    if (reduce) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
      );
      revealEls.forEach((el) => io!.observe(el));
    }

    // 2) Count-up for [data-count] (runs once when its stat scrolls in).
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const runCount = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || "0");
      const dec = el.dataset.dec ? parseInt(el.dataset.dec, 10) : 0;
      if (!isFinite(target)) {
        el.textContent = el.dataset.count || "";
        return;
      }
      if (reduce) {
        el.textContent = target.toFixed(dec);
        return;
      }
      const dur = 1400;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min(1, (ts - start) / dur);
        el.textContent = (target * easeOut(p)).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
      };
      requestAnimationFrame(step);
    };
    const countEls = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    let cio: IntersectionObserver | null = null;
    if (countEls.length) {
      cio = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              runCount(e.target as HTMLElement);
              cio?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.5 },
      );
      countEls.forEach((el) => cio!.observe(el));
    }

    // 3) Sticky bar hairline on scroll.
    const top = root.querySelector<HTMLElement>(".ed-top");
    const onScroll = () => top?.classList.toggle("solid", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // 4) Mobile menu.
    const menuBtn = root.querySelector<HTMLElement>(".ed-menu");
    const toggle = () => root.classList.toggle("nav-open");
    const close = () => root.classList.remove("nav-open");
    menuBtn?.addEventListener("click", toggle);
    const navLinks = Array.from(root.querySelectorAll<HTMLElement>(".ed-nav a"));
    navLinks.forEach((a) => a.addEventListener("click", close));

    return () => {
      io?.disconnect();
      cio?.disconnect();
      window.removeEventListener("scroll", onScroll);
      menuBtn?.removeEventListener("click", toggle);
      navLinks.forEach((a) => a.removeEventListener("click", close));
    };
  }, []);

  return null;
}
