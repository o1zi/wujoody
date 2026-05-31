"use client";

type Row = { name: string | null; contact: string | null; message: string | null; status: string; kind: string | null; created_at: string };

export default function ExportCsv({ rows }: { rows: Row[] }) {
  function download() {
    const head = ["الاسم", "التواصل", "النوع", "الحالة", "التاريخ", "الرسالة"];
    const esc = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [
        r.name || "",
        r.contact || "",
        r.kind === "booking" ? "حجز" : "رسالة",
        r.status,
        new Date(r.created_at).toLocaleString("ar-SA"),
        (r.message || "").replace(/\n/g, " "),
      ]
        .map(esc)
        .join(","),
    );
    const csv = "﻿" + [head.map(esc).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={download} className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground">
      تصدير CSV
    </button>
  );
}
