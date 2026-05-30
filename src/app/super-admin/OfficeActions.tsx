"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setOfficeStatus, setOfficePlan, deleteOffice } from "./actions";

export default function OfficeActions({
  office,
  currentPlan,
  plans,
}: {
  office: { id: string; status: string };
  currentPlan: string | null;
  plans: { code: string; name: string }[];
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        value={currentPlan ?? ""}
        disabled={pending}
        onChange={(e) => start(() => setOfficePlan(office.id, e.target.value))}
        className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs"
      >
        <option value="" disabled>
          الباقة…
        </option>
        {plans.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      <Link
        href={`/super-admin/offices/${office.id}/edit`}
        className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface-2"
      >
        تعديل الموقع
      </Link>
      <Link
        href={`/super-admin/offices/${office.id}/leads`}
        className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface-2"
      >
        الرسائل
      </Link>

      {office.status !== "active" && (
        <button
          disabled={pending}
          onClick={() => start(() => setOfficeStatus(office.id, "active"))}
          className="rounded-md border border-emerald-500/40 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10"
        >
          تفعيل
        </button>
      )}
      {office.status !== "suspended" && (
        <button
          disabled={pending}
          onClick={() => start(() => setOfficeStatus(office.id, "suspended"))}
          className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10"
        >
          إيقاف
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("حذف هذا المكتب نهائياً؟ لا يمكن التراجع.")) start(() => deleteOffice(office.id));
        }}
        className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10"
      >
        حذف
      </button>
    </div>
  );
}
