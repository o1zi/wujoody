"use client";

import { useState, useTransition } from "react";
import { savePlan } from "../actions";

type PlanRow = {
  code: string;
  name: string;
  price: number;
  features: string[];
  highlight: boolean;
  active: boolean;
  paymentLink: string;
  sallaProductId: string;
};

export default function PlanEditor({ plan }: { plan: PlanRow }) {
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(String(plan.price));
  const [highlight, setHighlight] = useState(plan.highlight);
  const [active, setActive] = useState(plan.active);
  const [features, setFeatures] = useState(plan.features.join("\n"));
  const [paymentLink, setPaymentLink] = useState(plan.paymentLink);
  const [sallaProductId, setSallaProductId] = useState(plan.sallaProductId);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    start(async () => {
      await savePlan(plan.code, {
        name,
        price: Number(price),
        highlight,
        active,
        features: features.split("\n").map((f) => f.trim()).filter(Boolean),
        paymentLink: paymentLink.trim(),
        sallaProductId: sallaProductId.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  const input = "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="rounded-2xl glass-panel p-5">
      <div className="mono mb-3 text-xs text-muted">{plan.code}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">الاسم</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">السعر (ر.س / شهر)</span>
          <input className={input} type="number" value={price} onChange={(e) => setPrice(e.target.value)} dir="ltr" />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-muted">المزايا (ميزة في كل سطر)</span>
        <textarea className={input} rows={6} value={features} onChange={(e) => setFeatures(e.target.value)} />
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-muted">رابط الدفع (سلة)</span>
        <input className={input} dir="ltr" value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="https://salla.sa/.../checkout/..." />
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-muted">رقم منتج سلة (Product ID)</span>
        <input className={input} dir="ltr" value={sallaProductId} onChange={(e) => setSallaProductId(e.target.value)} placeholder="1234567890" />
      </label>
      <div className="mt-3 flex items-center gap-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} /> مميّزة
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> فعّالة
        </label>
        <button
          onClick={save}
          disabled={pending}
          className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#0b0d10] hover:bg-accent-soft disabled:opacity-60"
        >
          {pending ? "…" : saved ? "تم الحفظ ✓" : "حفظ"}
        </button>
      </div>
    </div>
  );
}
