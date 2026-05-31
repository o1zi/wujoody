"use client";

import { useState } from "react";
import { SUPPORT_FAQ } from "@/lib/support-faq";

export default function SupportFaq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-2">
      {SUPPORT_FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm font-medium hover:bg-surface-2"
            >
              <span>{f.q}</span>
              <span className="shrink-0 text-lg leading-none text-accent">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted whitespace-pre-wrap">
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
