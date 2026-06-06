import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Sends the password-reset email via Resend (reliable) instead of Supabase's
// rate-limited default mailer. We mint a recovery token with the admin API and
// build a token_hash link that /auth/callback verifies (verifyOtp).
export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = body.email ?? "";
  } catch {
    // ignore — handled by validation below
  }
  email = email.trim().toLowerCase();

  // Always respond ok so we don't leak which emails are registered.
  const ok = NextResponse.json({ ok: true });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return ok;

  // Throttle reset requests to prevent email floods / targeting. We still
  // return ok (no detail) when over the limit, just without sending.
  const ipOk = rateLimit(`forgot:ip:${clientIp(req)}`, 5, 15 * 60_000).ok;
  const emailOk = rateLimit(`forgot:email:${email}`, 3, 15 * 60_000).ok;
  if (!ipOk || !emailOk) return ok;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) return ok; // user not found / error → stay silent

    const base = (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/+$/, "");
    const link = `${base}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=/reset-password`;

    await sendEmail({
      to: email,
      subject: "إعادة تعيين كلمة المرور",
      html: emailLayout(
        "إعادة تعيين كلمة المرور",
        `طلبت إعادة تعيين كلمة المرور لحسابك. اضغط الزر أدناه لتعيين كلمة مرور جديدة:<br/><br/>` +
          `<a href="${link}" style="display:inline-block;background:#c08a4d;color:#0b0d10;font-weight:600;text-decoration:none;padding:12px 26px;border-radius:10px">تعيين كلمة مرور جديدة</a>` +
          `<br/><br/><span style="font-size:12px;color:#98a2b3">إن لم تطلب ذلك، تجاهل هذه الرسالة. الرابط صالح لفترة محدودة.</span>`,
      ),
    });
  } catch {
    // best-effort — never surface internal errors to the client
  }

  return ok;
}
