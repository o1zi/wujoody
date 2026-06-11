import { createClient } from "@/lib/supabase/server";
import type { Vertical } from "@/lib/vertical";

// Only these emails may access the super-admin area (in addition to having the
// super_admin role). Configurable via SUPER_ADMIN_EMAILS (comma-separated).
const SUPER_ADMIN_ALLOWLIST = (process.env.SUPER_ADMIN_EMAILS || "ziyadadmin@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedSuperAdmin(
  email: string | null | undefined,
  role: string | null | undefined,
): boolean {
  return role === "super_admin" && !!email && SUPER_ADMIN_ALLOWLIST.includes(email.toLowerCase());
}

export type Office = {
  id: string;
  name: string;
  slug: string;
  status: "pending" | "active" | "suspended";
  owner_id: string;
  kind: Vertical;
};

export type Profile = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: "super_admin" | "office_admin";
  office_id: string | null;
};

export type SessionContext = {
  userId: string;
  email: string | null;
  profile: Profile | null;
  office: Office | null;
};

// Loads the authenticated user along with their profile and office (if any).
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, office_id")
    .eq("id", user.id)
    .single();

  let office: Office | null = null;
  if (profile?.office_id) {
    const { data } = await supabase
      .from("offices")
      .select("id, name, slug, status, owner_id, kind")
      .eq("id", profile.office_id)
      .single();
    office = data as Office | null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as Profile) ?? null,
    office,
  };
}
