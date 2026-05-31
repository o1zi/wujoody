import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: {
    slug?: string;
    name?: string;
    contact?: string;
    message?: string;
    kind?: string;
    preferredDate?: string;
    preferredTime?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const slug = (body.slug || "").toLowerCase().trim();
  const name = (body.name || "").trim().slice(0, 120);
  const contact = (body.contact || "").trim().slice(0, 160);
  const kind = body.kind === "booking" ? "booking" : "message";
  let message = (body.message || "").trim().slice(0, 2000);

  // For a consultation booking, fold the preferred slot into the message.
  if (kind === "booking") {
    const date = (body.preferredDate || "").trim().slice(0, 20);
    const time = (body.preferredTime || "").trim().slice(0, 10);
    const slot = [date && `التاريخ: ${date}`, time && `الوقت: ${time}`].filter(Boolean).join(" — ");
    message = [`🗓️ طلب حجز استشارة${slot ? ` (${slot})` : ""}`, message].filter(Boolean).join("\n").slice(0, 2000);
  }

  if (!slug || !name || !contact) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Only accept leads for an existing, active office.
  const { data: office } = await admin
    .from("offices")
    .select("id, name, status, owner_id")
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
    kind,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }

  // Notify the office owner by email (no-op if Resend isn't configured).
  const { data: owner } = await admin
    .from("profiles")
    .select("email")
    .eq("id", office.owner_id)
    .maybeSingle();
  if (owner?.email) {
    await sendEmail({
      to: owner.email,
      subject: `${kind === "booking" ? "طلب حجز استشارة" : "طلب تواصل"} جديد — ${office.name}`,
      html: emailLayout(
        "وصلك طلب تواصل جديد",
        `<b>الاسم:</b> ${name}<br/><b>التواصل:</b> ${contact}<br/><b>الرسالة:</b><br/>${(message || "—").replace(/</g, "&lt;")}<br/><br/>راجع رسائلك من لوحة التحكم.`,
      ),
    });
  }

  return NextResponse.json({ ok: true });
}
