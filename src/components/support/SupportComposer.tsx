"use client";

import { useState, useTransition } from "react";

export default function SupportComposer({
  action,
  placeholder = "اكتب رسالتك…",
}: {
  action: (body: string) => Promise<void>;
  placeholder?: string;
}) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  function send() {
    const t = body.trim();
    if (!t || pending) return;
    start(async () => {
      await action(t);
      setBody("");
    });
  }

  return (
    <div className="mt-4 flex items-end gap-2">
      <textarea
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
        }}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={send}
        disabled={pending}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? "…" : "إرسال"}
      </button>
    </div>
  );
}
