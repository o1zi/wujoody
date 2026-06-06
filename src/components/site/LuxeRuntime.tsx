"use client";

import { useEffect } from "react";

// Runtime for the Luxe template: scroll-reveal, count-up stats, sticky bar,
// mobile menu, and a gentle testimonials carousel. Motion-light by design.
export default function LuxeRuntime() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lx");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1) Reveal on scroll.
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>(".lx-reveal"));
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

    // 2) Count-up.
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
      const dur = 1500;
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

    // 3) Sticky bar.
    const top = root.querySelector<HTMLElement>(".lx-top");
    const onScroll = () => top?.classList.toggle("solid", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // 4) Mobile menu.
    const menuBtn = root.querySelector<HTMLElement>(".lx-menu");
    const toggleMenu = () => root.classList.toggle("nav-open");
    const closeMenu = () => root.classList.remove("nav-open");
    menuBtn?.addEventListener("click", toggleMenu);
    const navLinks = Array.from(root.querySelectorAll<HTMLElement>(".lx-nav a"));
    navLinks.forEach((a) => a.addEventListener("click", closeMenu));

    // 5) Testimonials carousel.
    const slides = Array.from(root.querySelectorAll<HTMLElement>(".lx-quote"));
    let idx = 0;
    const go = (n: number) => {
      if (!slides.length) return;
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("on", i === idx));
    };
    const prevBtn = root.querySelector<HTMLElement>('[data-q="prev"]');
    const nextBtn = root.querySelector<HTMLElement>('[data-q="next"]');
    const onPrev = () => go(idx - 1);
    const onNext = () => go(idx + 1);
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      io?.disconnect();
      cio?.disconnect();
      window.removeEventListener("scroll", onScroll);
      menuBtn?.removeEventListener("click", toggleMenu);
      navLinks.forEach((a) => a.removeEventListener("click", closeMenu));
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, []);

  return null;
}
