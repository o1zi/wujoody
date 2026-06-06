import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { FALLBACK_PLANS, DEFAULT_CAPS, normalizePlan, type Plan, type PlanCaps } from "@/lib/plans";

// Source of truth = `plans` table; falls back to code defaults if missing/empty.
// Cached per request via React cache().
export const getPlans = cache(async (): Promise<Plan[]> => {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("plans")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_PLANS;
    return data.map(normalizePlan);
  } catch {
    return FALLBACK_PLANS;
  }
});

export async function getPlanByCode(code: string | null | undefined): Promise<Plan | undefined> {
  if (!code) return undefined;
  return (await getPlans()).find((p) => p.code === code);
}

export async function getPlanCaps(code: string | null | undefined): Promise<PlanCaps> {
  const plan = await getPlanByCode(code);
  return plan?.caps ?? DEFAULT_CAPS;
}
