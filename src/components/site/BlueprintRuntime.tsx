"use client";

import { useEffect } from "react";

// Runtime for the Blueprint template: scroll-reveal, count-up stats, sticky
// bar, mobile menu. The drafting grid and dimension lines are pure CSS.
export default function BlueprintRuntime() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".bp");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealEls = Array.from(root.querySelectorAll<HTMLElement>(".bp-reveal"));
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
      const dur = 1450;
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

    const top = root.querySelector<HTMLElement>(".bp-top");
    const onScroll = () => top?.classList.toggle("solid", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const menuBtn = root.querySelector<HTMLElement>(".bp-menu");
    const toggle = () => root.classList.toggle("nav-open");
    const close = () => root.classList.remove("nav-open");
    menuBtn?.addEventListener("click", toggle);
    const navLinks = Array.from(root.querySelectorAll<HTMLElement>(".bp-nav a"));
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
