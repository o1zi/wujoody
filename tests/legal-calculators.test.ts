import { describe, it, expect } from "vitest";
import { endOfService, inheritance } from "@/lib/legal-calculators";

const approx = (a: number, b: number) => Math.abs(a - b) < 1e-6;

describe("endOfService", () => {
  it("termination: half-month for first 5 years, full-month after", () => {
    // 10 years @ 6000 → (5*0.5 + 5*1)*6000 = 7.5*6000 = 45000
    expect(endOfService({ wage: 6000, years: 10, reason: "termination" }).payable).toBe(45000);
    // 3 years → (3*0.5)*6000 = 9000
    expect(endOfService({ wage: 6000, years: 3, reason: "termination" }).payable).toBe(9000);
  });
  it("resignation reductions by tenure", () => {
    const w = 6000;
    expect(endOfService({ wage: w, years: 1, reason: "resignation" }).payable).toBe(0);
    // 3 years: full = 9000, third → 3000
    expect(endOfService({ wage: w, years: 3, reason: "resignation" }).payable).toBe(3000);
    // 7 years: full = (5*.5+2)*6000 = 27000, two-thirds → 18000
    expect(endOfService({ wage: w, years: 7, reason: "resignation" }).payable).toBe(18000);
    // 12 years: full
    const r = endOfService({ wage: w, years: 12, reason: "resignation" });
    expect(r.payable).toBe(r.full);
  });
});

describe("inheritance", () => {
  it("wife + son + daughter", () => {
    const { shares } = inheritance({ estate: 120000, spouse: "wife", father: false, mother: false, sons: 1, daughters: 1 });
    const m = Object.fromEntries(shares.map((s) => [s.key, s.amount]));
    expect(m.spouse).toBe(15000); // 1/8
    expect(m.sons).toBe(70000); // 2/3 of 7/8
    expect(m.daughters).toBe(35000);
    expect(shares.reduce((a, s) => a + s.amount, 0)).toBe(120000);
  });

  it("husband + 2 daughters + father + mother → عول (12→15)", () => {
    const { shares, awl } = inheritance({ estate: 1, spouse: "husband", father: true, mother: true, sons: 0, daughters: 2 });
    expect(awl).toBe(true);
    const m = Object.fromEntries(shares.map((s) => [s.key, s.fraction]));
    // base shares /1.25: husband 1/4→1/5, daughters 2/3→8/15, mother 1/6→2/15, father 1/6→2/15
    expect(approx(m.spouse, 1 / 5)).toBe(true);
    expect(approx(m.daughters, 8 / 15)).toBe(true);
    expect(approx(m.father, 2 / 15)).toBe(true);
    expect(approx(shares.reduce((a, s) => a + s.fraction, 0), 1)).toBe(true);
  });

  it("عمرية: wife + father + mother, no children", () => {
    const { shares } = inheritance({ estate: 1, spouse: "wife", father: true, mother: true, sons: 0, daughters: 0 });
    const m = Object.fromEntries(shares.map((s) => [s.key, s.fraction]));
    expect(approx(m.spouse, 1 / 4)).toBe(true);
    expect(approx(m.mother, 1 / 4)).toBe(true); // third of remainder (3/4)
    expect(approx(m.father, 1 / 2)).toBe(true);
  });

  it("son(s) only → take everything as عصبة", () => {
    const { shares } = inheritance({ estate: 90000, spouse: "none", father: false, mother: false, sons: 3, daughters: 0 });
    expect(shares.length).toBe(1);
    expect(shares[0].amount).toBe(90000);
    expect(shares[0].each).toBe(30000);
  });

  it("father + mother, no children → mother 1/3, father residue", () => {
    const { shares } = inheritance({ estate: 1, spouse: "none", father: true, mother: true, sons: 0, daughters: 0 });
    const m = Object.fromEntries(shares.map((s) => [s.key, s.fraction]));
    expect(approx(m.mother, 1 / 3)).toBe(true);
    expect(approx(m.father, 2 / 3)).toBe(true);
  });
});
