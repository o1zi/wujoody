"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertSuperAdmin() {
  const ctx = await getSessionContext();
  if (ctx?.profile?.role !== "super_admin") throw new Error("forbidden");
}

export async function setOfficeStatus(officeId: string, status: "active" | "pending" | "suspended") {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("offices").update({ status }).eq("id", officeId);
  revalidatePath("/super-admin");
}
