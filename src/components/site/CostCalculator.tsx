"use client";

import { useState } from "react";

type Calc = {
  unit: string;
  note: string;
  types: { name: string; price: number }[];
  levels: { name: string; factor: number }[];
};

export default function CostCalculator({ calc }: { calc: Calc }) {
  const types = calc.types.filter((t) => t.name);
  const levels = calc.levels.filter((l) => l.name);
  const [area, setArea] = useState("");
  const [ti, setTi] = useState(0);
  const [li, setLi] = useState(0);

  const a = Math.max(0, Number(area) || 0);
  const price = Number(types[ti]?.price) || 0;
  const factor = Number(levels[li]?.factor) || 1;
  const est = a * price * factor;
  const low = Math.round((est * 0.9) / 10) * 10;
  const high = Math.round((est * 1.1) / 10) * 10;
  const fmt = (n: number) => n.toLocaleString("en-US");

  function goContact() {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="calc">
      <div className="calc-fields">
        <label className="calc-fld">
          <span>المساحة (م²)</span>
          <input type="number" inputMode="numeric" min={0} value={area} onChange={(e) => setArea(e.target.value)} placeholder="مثال: 400" dir="ltr" />
        </label>
        {types.length > 0 && (
          <label className="calc-fld">
            <span>نوع الخدمة</span>
            <select value={ti} onChange={(e) => setTi(Number(e.target.value))}>
              {types.map((t, i) => (
                <option key={i} value={i}>{t.name}</option>
              ))}
            </select>
          </label>
        )}
        {levels.length > 0 && (
          <label className="calc-fld">
            <span>مستوى التشطيب</span>
            <select value={li} onChange={(e) => setLi(Number(e.target.value))}>
              {levels.map((l, i) => (
                <option key={i} value={i}>{l.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="calc-result">
        <div className="calc-label mono">التقدير التقريبي</div>
        <div className="calc-value">
          {a > 0 ? (
            <>
              {fmt(low)} – {fmt(high)} <span className="calc-unit">{calc.unit}</span>
            </>
          ) : (
            <span className="calc-hint">أدخل المساحة لعرض التقدير</span>
          )}
        </div>
        {calc.note ? <p className="calc-note">{calc.note}</p> : null}
        <button type="button" className="btn" onClick={goContact}>
          <span>اطلب عرضاً دقيقاً</span>
          <span className="mono">→</span>
        </button>
      </div>
    </div>
  );
}
