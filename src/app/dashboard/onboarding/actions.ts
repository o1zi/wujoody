"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Mark the office as onboarded (offices has no owner-update RLS policy, so use
// the admin client after verifying the session owns the office).
export async function markOnboarded(): Promise<{ ok: boolean }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false };
  const admin = createAdminClient();
  await admin.from("offices").update({ onboarded: true }).eq("id", ctx.office.id);
  revalidatePath("/dashboard");
  return { ok: true };
}
