import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { slug?: string; name?: string; contact?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const slug = (body.slug || "").toLowerCase().trim();
  const name = (body.name || "").trim().slice(0, 120);
  const contact = (body.contact || "").trim().slice(0, 160);
  const message = (body.message || "").trim().slice(0, 2000);

  if (!slug || !name || !contact) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Only accept leads for an existing, active office.
  const { data: office } = await admin
    .from("offices")
    .select("id, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!office || office.status !== "active") {
    return NextResponse.json({ error: "office not available" }, { status: 404 });
  }

  const { error } = await admin.from("leads").insert({
    office_id: office.id,
    name,
    contact,
    message,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
