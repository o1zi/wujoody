"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Alert } from "@/components/ui";

function VerifyEmailInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!email) return;
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);
    setMsg(error ? "تعذّر إعادة الإرسال، حاول لاحقاً." : "تم إرسال رسالة جديدة.");
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-2xl">
        ✉️
      </div>
      <h1 className="text-2xl font-bold">تحقّق من بريدك</h1>
      <p className="mt-2 text-sm text-muted">
        أرسلنا رابط تفعيل إلى{" "}
        <span className="text-foreground" dir="ltr">
          {email || "بريدك"}
        </span>
        . افتح الرسالة واضغط الرابط لتفعيل حسابك.
      </p>

      {msg && (
        <div className="mt-4">
          <Alert kind="info">{msg}</Alert>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <Button onClick={resend} loading={loading} variant="ghost" className="w-full">
          إعادة إرسال الرسالة
        </Button>
        <Link href="/login" className="block text-sm text-accent hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
