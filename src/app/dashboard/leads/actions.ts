"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setLeadStatus(id: string, status: "new" | "read" | "archived") {
  const supabase = await createClient();
  // RLS ensures the office can only update its own leads.
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}
