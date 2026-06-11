import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/phone";
import { asVertical } from "@/lib/vertical";

export const runtime = "nodejs";

function normalizeSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Public self-registration. We deliberately create the account *already
// confirmed* (email_confirm: true) and sign the user straight in — no email
// verification step. Works regardless of the Supabase "Confirm email" setting,
// so no confirmation mail is ever sent. The site itself stays offline until an
// admin activates the subscription after the bank transfer.
export async function POST(req: NextRequest) {
  let body: {
    officeName?: string;
    slug?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    kind?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح." }, { status: 400 });
  }

  const officeName = (body.officeName ?? "").trim();
  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const slug = normalizeSlug(body.slug ?? "");
  const phone = normalizePhone(body.phone);
  // Unknown/missing values fall back to engineering — never rejected.
  const kind = asVertical(body.kind);

  // Throttle to stop scripted abuse from spinning up offices/auth users.
  if (!rateLimit(`register:ip:${clientIp(req)}`, 5, 15 * 60_000).ok) {
    return NextResponse.json({ ok: false, error: "محاولات كثيرة. حاول بعد قليل." }, { status: 429 });
  }

  if (!officeName || !fullName) {
    return NextResponse.json({ ok: false, error: "أكمل اسم المكتب واسمك." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "أدخل بريداً إلكترونياً صحيحاً." }, { status: 400 });
  }
  if (slug.length < 3) {
    return NextResponse.json({ ok: false, error: "النطاق الفرعي 3 أحرف على الأقل (إنجليزية/أرقام)." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "كلمة المرور 8 أحرف على الأقل." }, { status: 400 });
  }
  if (phone.length !== 9 || !phone.startsWith("5")) {
    return NextResponse.json({ ok: false, error: "أدخل رقم جوال سعودي صحيح (مثال: 05XXXXXXXX)." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: available } = await admin.rpc("slug_available", { s: slug });
  if (available === false) {
    return NextResponse.json({ ok: false, error: `النطاق "${slug}" محجوز. جرّب اسماً آخر.` }, { status: 409 });
  }

  // Creating the user fires the on_auth_user_created trigger, which reads this
  // metadata to provision the office + profile + site_content.
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, office_name: officeName, office_slug: slug, phone, office_kind: kind },
  });
  if (createErr) {
    const already = /registered|already|exists/i.test(createErr.message);
    return NextResponse.json(
      { ok: false, error: already ? "هذا البريد مسجّل مسبقاً. سجّل الدخول بدلاً من ذلك." : "تعذّر إنشاء الحساب. حاول مجدداً." },
      { status: already ? 409 : 500 },
    );
  }

  // Sign the new user in so they land on the dashboard immediately. This writes
  // the auth cookies onto the response via the SSR client.
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    // Account exists but auto sign-in hiccupped — send them to login instead.
    return NextResponse.json({ ok: true, signedIn: false });
  }

  return NextResponse.json({ ok: true, signedIn: true });
}
