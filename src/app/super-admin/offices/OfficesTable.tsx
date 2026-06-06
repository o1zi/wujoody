"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { OfficeRow } from "../data";

const STATUS: Record<string, { text: string; cls: string }> = {
  active: { text: "مُفعّل", cls: "bg-emerald-500/15 text-emerald-300" },
  pending: { text: "معلّق", cls: "bg-amber-500/15 text-amber-300" },
  suspended: { text: "موقوف", cls: "bg-red-500/15 text-red-300" },
};

const TABS = [
  { key: "all", label: "الكل" },
  { key: "active", label: "مُفعّل" },
  { key: "pending", label: "معلّق" },
  { key: "suspended", label: "موقوف" },
  { key: "expiring", label: "قارب الانتهاء" },
  { key: "expired", label: "منتهي" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function inTab(r: OfficeRow, tab: TabKey): boolean {
  switch (tab) {
    case "active":
      return r.status === "active";
    case "pending":
      return r.status === "pending";
    case "suspended":
      return r.status === "suspended";
    case "expiring":
      return r.expiringSoon;
    case "expired":
      return r.expired;
    default:
      return true;
  }
}

export default function OfficesTable({
  rows,
  planNames,
  initialTab,
}: {
  rows: OfficeRow[];
  planNames: Record<string, string>;
  initialTab?: string;
}) {
  const [tab, setTab] = useState<TabKey>(
    (TABS.some((t) => t.key === initialTab) ? (initialTab as TabKey) : "all"),
  );
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "ends" | "name">("new");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of TABS) c[t.key] = rows.filter((r) => inTab(r, t.key)).length;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = rows.filter((x) => inTab(x, tab));
    if (s) r = r.filter((x) => x.name.toLowerCase().includes(s) || x.slug.toLowerCase().includes(s) || x.ownerEmail.toLowerCase().includes(s));
    r = [...r];
    if (sort === "name") r.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else if (sort === "ends") r.sort((a, b) => (a.daysLeft ?? 1e9) - (b.daysLeft ?? 1e9));
    else r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return r;
  }, [rows, tab, q, sort]);

  return (
    <div>
      {/* tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${tab === t.key ? "bg-accent text-[#0b0d10]" : "glass-panel-2 text-muted hover:text-foreground"}`}
          >
            {t.label}
            <span className={`mr-1.5 text-xs ${tab === t.key ? "opacity-70" : "opacity-60"}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* search + sort */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالاسم أو النطاق أو البريد…"
          className="flex-1 rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg glass-panel-2 px-3 py-2 text-sm outline-none">
          <option value="new">الأحدث</option>
          <option value="ends">الأقرب انتهاءً</option>
          <option value="name">الاسم</option>
        </select>
      </div>

      {/* table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 text-right font-medium">المكتب</th>
              <th className="px-4 py-3 text-right font-medium">المالك</th>
              <th className="px-4 py-3 text-right font-medium">الباقة</th>
              <th className="px-4 py-3 text-right font-medium">ينتهي</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const st = STATUS[r.status] ?? { text: r.status, cls: "bg-surface-2 text-muted" };
              return (
                <tr key={r.id} className="border-t border-border bg-surface/40 hover:bg-surface-2/40">
                  <td className="px-4 py-3">
                    <Link href={`/super-admin/offices/${r.id}`} className="font-medium hover:text-accent">{r.name}</Link>
                    <div className="mono text-[11px] text-muted" dir="ltr">{r.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted" dir="ltr">{r.ownerEmail || "—"}</td>
                  <td className="px-4 py-3 text-xs">{r.plan ? planNames[r.plan] || r.plan : "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.endsAt ? (
                      <span className={r.expired ? "text-red-300" : r.expiringSoon ? "text-amber-300" : "text-muted"}>
                        {new Date(r.endsAt).toLocaleDateString("ar-SA")}
                        <span className="mono mr-1 text-[10px]">{r.expired ? "(منتهٍ)" : `(${r.daysLeft}ي)`}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${st.cls}`}>{st.text}</span>
                  </td>
                  <td className="px-4 py-3 text-left">
                    <Link href={`/super-admin/offices/${r.id}`} className="text-xs text-accent hover:underline">إدارة ←</Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">لا توجد مكاتب مطابقة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
