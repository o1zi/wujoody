"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertSuperAdmin() {
  const ctx = await getSessionContext();
  if (!isAllowedSuperAdmin(ctx?.email, ctx?.profile?.role)) throw new Error("forbidden");
}

export async function setOfficeStatus(officeId: string, status: "active" | "pending" | "suspended") {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("offices").update({ status }).eq("id", officeId);
  revalidatePath("/super-admin");
}

// Change an office's plan: updates the latest active subscription, or creates one.
export async function setOfficePlan(officeId: string, plan: string) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("office_id", officeId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await admin.from("subscriptions").update({ plan }).eq("id", existing.id);
  } else {
    const now = new Date();
    const ends = new Date(now.getTime() + 30 * 86400000);
    await admin.from("subscriptions").insert({
      office_id: officeId,
      plan,
      status: "active",
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
    });
  }
  revalidatePath("/super-admin");
}

export async function deleteOffice(officeId: string) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("offices").delete().eq("id", officeId);
  revalidatePath("/super-admin");
}

// Save an office's site content (super admin editing any office).
export async function saveOfficeContent(officeId: string, content: unknown) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("site_content").update({ content }).eq("office_id", officeId);
  revalidatePath(`/super-admin/offices/${officeId}/edit`);
}

// Update a plan row (price/features/caps/flags). Requires the plans table.
export async function savePlan(
  code: string,
  patch: { price?: number; name?: string; highlight?: boolean; active?: boolean; features?: string[] },
) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("plans").update(patch).eq("code", code);
  revalidatePath("/super-admin/plans");
}

export async function logoutToLogin() {
  redirect("/login");
}

// Super admin replies to an office's support thread.
export async function replySupport(officeId: string, body: string) {
  await assertSuperAdmin();
  const text = (body || "").trim().slice(0, 2000);
  if (!text) return;
  const admin = createAdminClient();
  await admin.from("support_messages").insert({
    office_id: officeId,
    sender: "admin",
    body: text,
    read: false,
  });
  revalidatePath(`/super-admin/support/${officeId}`);
  revalidatePath("/super-admin/support");
}

// Save the editable landing-page content.
export async function saveLanding(content: unknown) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("app_settings")
    .upsert({ key: "landing", value: content, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/super-admin/landing");
}
