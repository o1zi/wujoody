import { NextResponse, type NextRequest } from "next/server";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Super-admin only: log in AS an office owner (support/debug). Mints a magic-link
// token for the owner and routes through /auth/callback (verifyOtp) so the
// current browser session becomes that office. NOTE: this replaces the admin's
// own session — to return, sign out and sign back in as the admin.
export async function GET(req: NextRequest) {
  const { origin, searchParams } = req.nextUrl;
  const ctx = await getSessionContext();
  if (!isAllowedSuperAdmin(ctx?.email, ctx?.profile?.role)) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const officeId = searchParams.get("office") || "";
  const admin = createAdminClient();
  const { data: off } = await admin.from("offices").select("owner_id").eq("id", officeId).maybeSingle();
  if (!off?.owner_id) return NextResponse.redirect(`${origin}/super-admin/offices`);

  const { data: prof } = await admin.from("profiles").select("email").eq("id", off.owner_id).maybeSingle();
  const email = prof?.email as string | undefined;
  if (!email) return NextResponse.redirect(`${origin}/super-admin/offices/${officeId}`);

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) return NextResponse.redirect(`${origin}/super-admin/offices/${officeId}`);

  const base = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/+$/, "");
  return NextResponse.redirect(`${base}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&next=/dashboard`);
}
