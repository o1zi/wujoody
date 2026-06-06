import { NextResponse, type NextRequest } from "next/server";
import { getSessionContext, isAllowedSuperAdmin } from "@/lib/auth";

export const runtime = "nodejs";

// Super-admin-only email diagnostic. Sends a test email straight through the
// Resend API and returns the raw result so the exact failure (missing key,
// unverified domain, test-mode restriction…) is visible in the UI.
export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!isAllowedSuperAdmin(ctx?.email, ctx?.profile?.role)) {
    return NextResponse.json({ ok: false, reason: "غير مصرّح" }, { status: 403 });
  }

  let to = "";
  try {
    const body = (await req.json()) as { to?: string };
    to = body.to ?? "";
  } catch {
    // ignore
  }
  to = (to || "").trim() || ctx?.email || "";
  if (!to) return NextResponse.json({ ok: false, reason: "لا يوجد بريد للإرسال إليه" });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  if (!key) {
    return NextResponse.json({
      ok: false,
      reason: "RESEND_API_KEY غير مضبوط في متغيّرات البيئة (Vercel). خدمة البريد غير مفعّلة.",
      from,
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: "اختبار بريد — وجود ✅",
        html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif">هذا بريد تجريبي للتأكد من إعداد الإرسال. إن وصلك فالإعداد سليم ✅</div>`,
      }),
    });
    const detail = (await res.text()).slice(0, 600);
    return NextResponse.json({ ok: res.ok, status: res.status, from, to, detail });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: "تعذّر الاتصال بـ Resend", detail: String(e).slice(0, 300) });
  }
}
