"use client";

import { useEffect } from "react";

// Opens the browser print dialog once, on load, when the page is reached with
// ?print=1 — so "تحميل PDF" buttons land straight on Save-as-PDF.
export default function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);
  return null;
}
