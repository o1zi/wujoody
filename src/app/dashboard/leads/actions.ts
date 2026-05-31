"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setLeadStatus(id: string, status: string) {
  const allowed = ["new", "read", "contacted", "won", "lost", "archived"];
  if (!allowed.includes(status)) return;
  const supabase = await createClient();
  // RLS ensures the office can only update its own leads.
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

export async function setLeadNote(id: string, note: string) {
  const supabase = await createClient();
  await supabase.from("leads").update({ note: (note || "").slice(0, 2000) }).eq("id", id);
  revalidatePath("/dashboard/leads");
}
