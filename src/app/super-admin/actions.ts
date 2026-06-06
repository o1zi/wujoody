"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanByCode } from "@/lib/plans-server";

async function assertSuperAdmin() {
  const ctx = await getSessionContext();
  if (!isAllowedSuperAdmin(ctx?.email, ctx?.profile?.role)) throw new Error("forbidden");
}

export async function setOfficeStatus(officeId: string, status: "active" | "pending" | "suspended") {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("offices").update({ status }).eq("id", officeId);
  revalidateAdmin(officeId);
}

// Manually activate (or renew) an office's subscription after a confirmed bank
// transfer. Selecting a plan = the office paid for that plan: we open/extend an
// active subscription for the plan's full term (annual) and set the site live.
export async function setOfficePlan(officeId: string, plan: string) {
  await assertSuperAdmin();
  const admin = createAdminClient();

  const planDef = await getPlanByCode(plan);
  const durationDays = planDef?.durationDays ?? 365;
  const now = new Date();
  const ends = new Date(now.getTime() + durationDays * 86400000);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("office_id", officeId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = {
    plan,
    status: "active" as const,
    starts_at: now.toISOString(),
    ends_at: ends.toISOString(),
    amount: planDef?.price ?? null,
    currency: planDef?.currency ?? "SAR",
  };

  if (existing?.id) {
    await admin.from("subscriptions").update(row).eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert({ office_id: officeId, ...row });
  }

  // Go live.
  await admin.from("offices").update({ status: "active" }).eq("id", officeId);
  revalidateAdmin(officeId);
}

// Extend the latest subscription by N days (from its current end, or from now
// if already expired). Keeps the office live.
export async function extendSubscription(officeId: string, days: number) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id, plan, ends_at, amount, currency")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  const base = sub?.ends_at && new Date(sub.ends_at) > now ? new Date(sub.ends_at) : now;
  const ends = new Date(base.getTime() + days * 86400000);

  if (sub?.id) {
    await admin.from("subscriptions").update({ ends_at: ends.toISOString(), status: "active" }).eq("id", sub.id);
  } else {
    await admin.from("subscriptions").insert({
      office_id: officeId,
      plan: "basic",
      status: "active",
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
    });
  }
  await admin.from("offices").update({ status: "active" }).eq("id", officeId);
  revalidateAdmin(officeId);
}

// End the subscription immediately: set ends_at to now so the site goes offline
// at the next load (the tenant page treats an elapsed ends_at as expired).
export async function endSubscriptionNow(officeId: string) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("id")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sub?.id) {
    await admin.from("subscriptions").update({ ends_at: new Date().toISOString(), status: "expired" }).eq("id", sub.id);
  }
  revalidateAdmin(officeId);
}

// Edit the office owner's profile (name / phone shown in the admin).
export async function updateOfficeOwner(officeId: string, patch: { full_name?: string; phone?: string }) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { data: off } = await admin.from("offices").select("owner_id").eq("id", officeId).maybeSingle();
  if (!off?.owner_id) return;
  const row: Record<string, unknown> = {};
  if (patch.full_name !== undefined) row.full_name = patch.full_name.trim().slice(0, 120);
  if (patch.phone !== undefined) row.phone = patch.phone.trim().slice(0, 30);
  if (Object.keys(row).length) await admin.from("profiles").update(row).eq("id", off.owner_id);
  revalidateAdmin(officeId);
}

// Rename an office.
export async function setOfficeName(officeId: string, name: string) {
  await assertSuperAdmin();
  const clean = (name || "").trim().slice(0, 120);
  if (!clean) return;
  await createAdminClient().from("offices").update({ name: clean }).eq("id", officeId);
  revalidateAdmin(officeId);
}

// Refresh every admin surface that shows office/subscription data.
function revalidateAdmin(officeId?: string) {
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/offices");
  if (officeId) revalidatePath(`/super-admin/offices/${officeId}`);
}

const RESERVED_SLUGS = new Set(["www", "app", "api", "admin", "mail", "dashboard", "super-admin"]);

// Change an office's subdomain (slug). Returns {ok,error} for UI feedback.
export async function setOfficeSlug(
  officeId: string,
  rawSlug: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertSuperAdmin();
  const slug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length < 3) return { ok: false, error: "النطاق يجب أن يكون 3 أحرف على الأقل (إنجليزية/أرقام)." };
  if (RESERVED_SLUGS.has(slug)) return { ok: false, error: "هذا النطاق محجوز للنظام." };

  const admin = createAdminClient();
  const { data: taken } = await admin
    .from("offices")
    .select("id")
    .eq("slug", slug)
    .neq("id", officeId)
    .maybeSingle();
  if (taken) return { ok: false, error: `النطاق "${slug}" مستخدم من مكتب آخر.` };

  const { error } = await admin.from("offices").update({ slug }).eq("id", officeId);
  if (error) return { ok: false, error: error.message };
  revalidateAdmin(officeId);
  return { ok: true };
}

export async function deleteOffice(officeId: string) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  await admin.from("offices").delete().eq("id", officeId);
  revalidateAdmin();
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
  patch: {
    price?: number;
    name?: string;
    highlight?: boolean;
    active?: boolean;
    features?: string[];
    sections?: string[];
  },
) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { sections, ...rest } = patch;
  const row: Record<string, unknown> = { ...rest };
  if (sections !== undefined) {
    // Merge the allowed-sections list into the plan's caps jsonb.
    const { data: existing } = await admin.from("plans").select("caps").eq("code", code).maybeSingle();
    const caps = (existing?.caps as Record<string, unknown>) || {};
    row.caps = { ...caps, sections };
  }
  await admin.from("plans").update(row).eq("code", code);
  revalidatePath("/super-admin/plans");
  revalidatePath("/");
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

// Save bank-transfer / payment settings (shown on the office subscription page).
export async function savePayment(value: unknown) {
  await assertSuperAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("app_settings")
    .upsert({ key: "payment", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/subscription");
  revalidatePath("/super-admin/payment");
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
