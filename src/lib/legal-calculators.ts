// Pure calculation helpers for the law-firm public calculators. No deps → unit
// tested in tests/legal-calculators.test.ts. These are estimators; the UI shows
// a "consult a specialist" disclaimer for complex cases.

// ---------- End-of-service gratuity (Saudi Labour Law) ----------
// Gratuity base: half-month wage for each of the first 5 years, full-month wage
// for each subsequent year. On resignation it is reduced: <2y nothing,
// 2–5y a third, 5–10y two-thirds, ≥10y full. Termination / contract end = full.
export type EosReason = "termination" | "resignation";
export function endOfService(opts: { wage: number; years: number; months?: number; reason: EosReason }) {
  const wage = Math.max(0, opts.wage || 0);
  const totalYears = Math.max(0, (opts.years || 0) + (opts.months || 0) / 12);
  const firstFive = Math.min(totalYears, 5);
  const beyond = Math.max(totalYears - 5, 0);
  const full = (firstFive * 0.5 + beyond) * wage;

  let factor = 1;
  if (opts.reason === "resignation") {
    if (totalYears < 2) factor = 0;
    else if (totalYears < 5) factor = 1 / 3;
    else if (totalYears < 10) factor = 2 / 3;
    else factor = 1;
  }
  return { full, payable: full * factor, factor, totalYears };
}

// ---------- Islamic inheritance (common cases) ----------
export type InheritanceInput = {
  estate: number;
  spouse: "husband" | "wife" | "none";
  father: boolean;
  mother: boolean;
  sons: number;
  daughters: number;
};
export type Share = { key: string; label: string; fraction: number; amount: number; each?: number };

// Returns the per-heir shares as fractions of the estate (after عول / radd) plus
// amounts. Handles: spouse + children + parents, the عمريتان case, عول, and
// radd to non-spouse heirs. Complex edge cases (siblings, grandparents, …) are
// out of scope and flagged by the UI disclaimer.
export function inheritance(input: InheritanceInput): { shares: Share[]; awl: boolean; radd: boolean } {
  const estate = Math.max(0, input.estate || 0);
  const sons = Math.max(0, Math.floor(input.sons || 0));
  const daughters = Math.max(0, Math.floor(input.daughters || 0));
  const hasChildren = sons + daughters > 0;

  // ---- fixed (fardh) shares ----
  const fardh: Record<string, number> = {};
  if (input.spouse === "husband") fardh.spouse = hasChildren ? 1 / 4 : 1 / 2;
  else if (input.spouse === "wife") fardh.spouse = hasChildren ? 1 / 8 : 1 / 4;

  if (input.mother) fardh.mother = hasChildren ? 1 / 6 : 1 / 3;

  // عمريتان: spouse + both parents, no children → mother gets a third of the remainder.
  const umariyya = !hasChildren && input.mother && input.father && input.spouse !== "none";
  if (umariyya) fardh.mother = (1 - (fardh.spouse || 0)) / 3;

  let fatherFardh = 0;
  if (input.father && hasChildren) { fatherFardh = 1 / 6; fardh.father = 1 / 6; }

  let daughtersFardh = 0;
  if (sons === 0 && daughters > 0) { daughtersFardh = daughters >= 2 ? 2 / 3 : 1 / 2; fardh.daughters = daughtersFardh; }

  const fardhSum = Object.values(fardh).reduce((a, b) => a + b, 0);

  const out: Record<string, number> = { ...fardh };
  let awl = false;
  let radd = false;

  if (fardhSum > 1 + 1e-9) {
    // عول — scale every fixed share down proportionally; no residue.
    awl = true;
    for (const k of Object.keys(out)) out[k] = out[k] / fardhSum;
  } else {
    const residue = 1 - fardhSum;
    if (residue > 1e-9) {
      if (sons > 0) {
        // children are عصبة: split residue 2:1.
        const unit = residue / (2 * sons + daughters);
        out.sons = 2 * sons * unit;
        if (daughters > 0) out.daughters = daughters * unit;
      } else if (input.father) {
        // father takes the residue as عاصب (in addition to any fardh).
        out.father = fatherFardh + residue;
      } else {
        // no عاصب → radd to non-spouse fardh holders proportionally.
        radd = true;
        const base = (fardh.mother || 0) + (fardh.daughters || 0) + (fardh.father || 0);
        if (base > 0) {
          for (const k of ["mother", "daughters", "father"]) {
            if (out[k]) out[k] += residue * (fardh[k] / base);
          }
        } else if (out.spouse) {
          // only spouse → spouse takes all (no other heirs).
          out.spouse = 1;
        }
      }
    }
  }

  const labels: Record<string, string> = {
    spouse: input.spouse === "husband" ? "الزوج" : "الزوجة",
    father: "الأب",
    mother: "الأم",
    sons: sons > 1 ? `الأبناء (${sons})` : "الابن",
    daughters: daughters > 1 ? `البنات (${daughters})` : "البنت",
  };

  const shares: Share[] = Object.entries(out)
    .filter(([, f]) => f > 1e-9)
    .map(([key, f]) => {
      const count = key === "sons" ? sons : key === "daughters" ? daughters : 1;
      const amount = estate * f;
      return { key, label: labels[key] ?? key, fraction: f, amount, each: count > 1 ? amount / count : undefined };
    });

  return { shares, awl, radd };
}
