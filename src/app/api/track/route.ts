import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "view",
  "click_whatsapp",
  "click_tiktok",
  "click_snapchat",
  "click_instagram",
  "click_linkedin",
]);

export async function POST(request: NextRequest) {
  let slug = "";
  let type = "";
  try {
    const body = JSON.parse(await request.text());
    slug = (body.slug || "").toLowerCase().trim();
    type = (body.type || "").trim();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!slug || !ALLOWED.has(type)) return NextResponse.json({ ok: false }, { status: 400 });

  const admin = createAdminClient();
  const { data: office } = await admin
    .from("offices")
    .select("id, status")
    .eq("slug", slug)
    .maybeSingle();
  if (!office || office.status !== "active") return NextResponse.json({ ok: true });

  await admin.from("site_events").insert({ office_id: office.id, type });
  return NextResponse.json({ ok: true });
}
