"use client";

import { useEffect } from "react";

// Flagship runtime for the Atelier template: cursor-follow spotlight,
// split-word heading reveals, magnetic buttons, plus reveal / count-up /
// sticky bar / mobile menu. All pointer effects gate on hover + reduced-motion.
export default function AtelierRuntime() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".at");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    // 0) Split headings into per-word spans for the staggered rise.
    if (!reduce) {
      root.querySelectorAll<HTMLElement>(".at-split").forEach((el) => {
        const text = el.textContent || "";
        el.textContent = "";
        text.split(/(\s+)/).forEach((token) => {
          if (/^\s+$/.test(token)) {
            el.appendChild(document.createTextNode(" "));
            return;
          }
          if (!token) return;
          const w = document.createElement("span");
          w.className = "w";
          const i = document.createElement("span");
          i.className = "i";
          i.textContent = token;
          w.appendChild(i);
          el.appendChild(w);
        });
        const inners = el.querySelectorAll<HTMLElement>(".i");
        inners.forEach((inner, idx) => {
          inner.style.transitionDelay = `${Math.min(idx * 0.045, 0.5)}s`;
        });
      });
    }

    // 1) Reveal (and split trigger) on scroll.
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>(".at-reveal, .at-split"));
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
    const top = root.querySelector<HTMLElement>(".at-top");
    const onScroll = () => top?.classList.toggle("solid", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // 4) Mobile menu.
    const menuBtn = root.querySelector<HTMLElement>(".at-menu");
    const toggle = () => root.classList.toggle("nav-open");
    const close = () => root.classList.remove("nav-open");
    menuBtn?.addEventListener("click", toggle);
    const navLinks = Array.from(root.querySelectorAll<HTMLElement>(".at-nav a"));
    navLinks.forEach((a) => a.addEventListener("click", close));
    cleanups.push(() => {
      menuBtn?.removeEventListener("click", toggle);
      navLinks.forEach((a) => a.removeEventListener("click", close));
    });

    // 5) Cursor spotlight (hover devices only).
    const spot = root.querySelector<HTMLElement>(".at-spot");
    if (spot && canHover && !reduce) {
      let tx = window.innerWidth / 2;
      let ty = window.innerHeight / 2;
      let cx = tx;
      let cy = ty;
      let raf = 0;
      let shown = false;
      const onMove = (e: MouseEvent) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!shown) {
          shown = true;
          spot.classList.add("on");
        }
      };
      const loop = () => {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        spot.style.transform = `translate(${cx}px, ${cy}px)`;
        raf = requestAnimationFrame(loop);
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
      cleanups.push(() => {
        window.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(raf);
      });
    }

    // 6) Magnetic buttons (hover devices only).
    if (canHover && !reduce) {
      const mags = Array.from(root.querySelectorAll<HTMLElement>(".btn"));
      mags.forEach((btn) => {
        const onMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const mx = e.clientX - (r.left + r.width / 2);
          const my = e.clientY - (r.top + r.height / 2);
          btn.style.transform = `translate(${Math.max(-10, Math.min(10, mx * 0.25))}px, ${Math.max(-8, Math.min(8, my * 0.3))}px)`;
        };
        const onLeave = () => {
          btn.style.transform = "translate(0,0)";
        };
        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          btn.removeEventListener("mousemove", onMove);
          btn.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    return () => {
      io?.disconnect();
      cio?.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
