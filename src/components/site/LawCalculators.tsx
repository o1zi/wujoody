"use client";

import { useState } from "react";
import { endOfService, inheritance, type EosReason } from "@/lib/legal-calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pct = (f: number) => `${(f * 100).toFixed(1)}%`;

export default function LawCalculators() {
  const [tab, setTab] = useState<"eos" | "mirath">("eos");
  return (
    <div className="lw-calc">
      <div className="lw-calc-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "eos"} className={`lw-calc-tab${tab === "eos" ? " on" : ""}`} onClick={() => setTab("eos")}>مكافأة نهاية الخدمة</button>
        <button type="button" role="tab" aria-selected={tab === "mirath"} className={`lw-calc-tab${tab === "mirath" ? " on" : ""}`} onClick={() => setTab("mirath")}>حاسبة المواريث</button>
      </div>
      {tab === "eos" ? <Eos /> : <Mirath />}
      <p className="lw-calc-disc">هذه الحاسبة تقديرية للحالات الشائعة. للحالات الخاصة أو المعقّدة، احجز استشارة مع أحد محامينا.</p>
      <a href="#book" className="lw-btn lw-calc-cta">احجز استشارة لتأكيد الحساب</a>
    </div>
  );
}

function Eos() {
  const [wage, setWage] = useState("6000");
  const [years, setYears] = useState("5");
  const [months, setMonths] = useState("0");
  const [reason, setReason] = useState<EosReason>("termination");
  const r = endOfService({ wage: Number(wage) || 0, years: Number(years) || 0, months: Number(months) || 0, reason });

  return (
    <>
      <div className="lw-calc-grid">
        <label className="lw-calc-fld"><span>الراتب الشهري (ر.س)</span><input type="number" inputMode="numeric" value={wage} onChange={(e) => setWage(e.target.value)} dir="ltr" /></label>
        <label className="lw-calc-fld"><span>سنوات الخدمة</span><input type="number" inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} dir="ltr" /></label>
        <label className="lw-calc-fld"><span>أشهر إضافية</span><input type="number" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} dir="ltr" /></label>
        <label className="lw-calc-fld"><span>سبب انتهاء العقد</span>
          <select value={reason} onChange={(e) => setReason(e.target.value as EosReason)}>
            <option value="termination">إنهاء من صاحب العمل / انتهاء العقد</option>
            <option value="resignation">استقالة</option>
          </select>
        </label>
      </div>
      <div className="lw-calc-result">
        <div className="lw-calc-total"><span>المكافأة المستحقة التقديرية</span><strong>{fmt(r.payable)} <small>ر.س</small></strong></div>
        {reason === "resignation" && r.factor < 1 && (
          <div className="lw-calc-row"><span>المكافأة الكاملة قبل خصم الاستقالة</span><span>{fmt(r.full)} ر.س</span></div>
        )}
        <div className="lw-calc-row"><span>أساس الاحتساب</span><span>نصف شهر لأول 5 سنوات + شهر كامل لما بعدها</span></div>
      </div>
    </>
  );
}

function Mirath() {
  const [estate, setEstate] = useState("100000");
  const [spouse, setSpouse] = useState<"husband" | "wife" | "none">("wife");
  const [father, setFather] = useState(false);
  const [mother, setMother] = useState(false);
  const [sons, setSons] = useState("1");
  const [daughters, setDaughters] = useState("1");

  const { shares, awl, radd } = inheritance({
    estate: Number(estate) || 0,
    spouse, father, mother,
    sons: Number(sons) || 0,
    daughters: Number(daughters) || 0,
  });

  return (
    <>
      <div className="lw-calc-grid">
        <label className="lw-calc-fld"><span>قيمة التركة (ر.س)</span><input type="number" inputMode="numeric" value={estate} onChange={(e) => setEstate(e.target.value)} dir="ltr" /></label>
        <label className="lw-calc-fld"><span>الزوج / الزوجة</span>
          <select value={spouse} onChange={(e) => setSpouse(e.target.value as typeof spouse)}>
            <option value="wife">زوجة</option>
            <option value="husband">زوج</option>
            <option value="none">لا يوجد</option>
          </select>
        </label>
        <label className="lw-calc-fld"><span>عدد الأبناء (ذكور)</span><input type="number" inputMode="numeric" value={sons} onChange={(e) => setSons(e.target.value)} dir="ltr" /></label>
        <label className="lw-calc-fld"><span>عدد البنات</span><input type="number" inputMode="numeric" value={daughters} onChange={(e) => setDaughters(e.target.value)} dir="ltr" /></label>
        <label className="lw-calc-check"><input type="checkbox" checked={father} onChange={(e) => setFather(e.target.checked)} /> الأب على قيد الحياة</label>
        <label className="lw-calc-check"><input type="checkbox" checked={mother} onChange={(e) => setMother(e.target.checked)} /> الأم على قيد الحياة</label>
      </div>
      <div className="lw-calc-result">
        {shares.length === 0 ? (
          <div className="lw-calc-row"><span>لا يوجد ورثة محدّدون — أضف الورثة أعلاه.</span></div>
        ) : (
          shares.map((s) => (
            <div key={s.key} className="lw-calc-row">
              <span>{s.label}{s.each ? ` — لكل فرد ${fmt(s.each)} ر.س` : ""}</span>
              <span><strong>{fmt(s.amount)} ر.س</strong> <small>({pct(s.fraction)})</small></span>
            </div>
          ))
        )}
        {(awl || radd) && <div className="lw-calc-row lw-calc-note">{awl ? "حالة عَوْل: تجاوزت الفروض التركة فتُقسَّم بالنسبة." : "حالة رَدّ: تبقّى من التركة فأُعيد على الورثة."}</div>}
      </div>
    </>
  );
}
