"use server";

import { promises as dns } from "dns";
import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Where a customer must point their domain (Vercel defaults).
export const DOMAIN_TARGETS = { cname: "cname.vercel-dns.com", aRecord: "76.76.21.21" };

function cleanDomain(raw: string): string {
  return (raw || "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\s+/g, "");
}

const DOMAIN_RE = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export async function saveCustomDomain(raw: string): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false, error: "لا يوجد مكتب مرتبط بحسابك." };
  const domain = cleanDomain(raw);
  if (!DOMAIN_RE.test(domain)) return { ok: false, error: "أدخل نطاقاً صحيحاً مثل example.com أو www.example.com" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("offices")
    .update({ custom_domain: domain, domain_status: "pending" })
    .eq("id", ctx.office.id);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "هذا النطاق مستخدم من مكتب آخر." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/dashboard/domain");
  return { ok: true };
}

export async function removeCustomDomain(): Promise<{ ok: boolean }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false };
  const admin = createAdminClient();
  await admin.from("offices").update({ custom_domain: null, domain_status: "none" }).eq("id", ctx.office.id);
  revalidatePath("/dashboard/domain");
  return { ok: true };
}

// Best-effort DNS check: verified if the domain points at our Vercel targets.
export async function verifyCustomDomain(): Promise<{ ok: boolean; status: string; error?: string }> {
  const ctx = await getSessionContext();
  if (!ctx?.office) return { ok: false, status: "none", error: "لا يوجد مكتب." };
  const admin = createAdminClient();
  const { data: office } = await admin
    .from("offices")
    .select("custom_domain")
    .eq("id", ctx.office.id)
    .maybeSingle();
  const domain = office?.custom_domain as string | undefined;
  if (!domain) return { ok: false, status: "none", error: "لم تُضف نطاقاً بعد." };

  let verified = false;
  try {
    const a = await dns.resolve4(domain).catch(() => [] as string[]);
    if (a.includes(DOMAIN_TARGETS.aRecord)) verified = true;
  } catch {}
  if (!verified) {
    try {
      const c = await dns.resolveCname(domain).catch(() => [] as string[]);
      if (c.some((h) => /vercel-dns\.com\.?$/i.test(h))) verified = true;
    } catch {}
  }

  const status = verified ? "verified" : "pending";
  await admin.from("offices").update({ domain_status: status }).eq("id", ctx.office.id);
  revalidatePath("/dashboard/domain");
  return { ok: true, status };
}
