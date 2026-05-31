import "server-only";

// Minimal Resend email sender. No-ops (returns false) if RESEND_API_KEY isn't set,
// so the app works without email configured. Add the key in env to enable.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Riwaq <onboarding@resend.dev>";
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Simple RTL email shell.
export function emailLayout(title: string, body: string): string {
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#0b0d10;color:#eef1f5;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#14171c;border:1px solid #262b33;border-radius:16px;padding:28px">
      <h2 style="margin:0 0 14px;color:#c08a4d">${title}</h2>
      <div style="font-size:15px;line-height:1.8;color:#cfd6df">${body}</div>
      <p style="margin-top:24px;font-size:12px;color:#98a2b3">منصة المكاتب الهندسية</p>
    </div>
  </div>`;
}
