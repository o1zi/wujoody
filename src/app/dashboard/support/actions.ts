"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function sendOfficeSupport(body: string) {
  const ctx = await getSessionContext();
  if (!ctx?.office) throw new Error("no office");
  const text = (body || "").trim().slice(0, 2000);
  if (!text) return;
  const admin = createAdminClient();
  await admin.from("support_messages").insert({
    office_id: ctx.office.id,
    sender: "office",
    body: text,
    read: false,
  });
  revalidatePath("/dashboard/support");
  revalidatePath("/super-admin/support");
}
