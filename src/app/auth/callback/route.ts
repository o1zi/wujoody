import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email OTP / recovery types accepted by Supabase verifyOtp.
type OtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

// Handles email-confirmation and password-recovery links. Supports two link
// styles so it works regardless of the Supabase email-template format:
//   - token_hash + type  -> verifyOtp (recommended for server-side; no PKCE
//     code_verifier cookie needed, so it works across devices/redirects).
//   - code               -> exchangeCodeForSession (PKCE fallback).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as OtpType | null;
  const next = searchParams.get("next") || "/dashboard";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Recovery links that fail should send the user back to request a fresh one.
  const dest = next.includes("reset-password") ? "/forgot-password?expired=1" : "/login?error=auth";
  return NextResponse.redirect(`${origin}${dest}`);
}
