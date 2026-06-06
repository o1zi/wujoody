"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, Input, Button, Alert } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Sent via our Resend-backed endpoint (reliable). Always succeeds for privacy.
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // ignore — we show the same neutral message regardless
    }
    setLoading(false);
    setSent(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">نسيت كلمة المرور؟</h1>
      <p className="mt-1 text-sm text-muted">سنرسل لك رابطاً لإعادة التعيين.</p>

      {sent ? (
        <div className="mt-7">
          <Alert kind="success">
            إن كان البريد مسجّلاً لدينا، فستصلك رسالة بها رابط إعادة التعيين خلال لحظات.
          </Alert>
          <Link href="/login" className="mt-6 block text-center text-sm text-accent hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <Field label="البريد الإلكتروني — EMAIL">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            إرسال الرابط
          </Button>
          <Link href="/login" className="block text-center text-sm text-muted hover:text-foreground">
            العودة لتسجيل الدخول
          </Link>
        </form>
      )}
    </div>
  );
}
