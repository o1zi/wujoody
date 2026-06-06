"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Button, Alert } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // "checking" until we confirm the recovery link established a session.
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");

  // The /auth/callback exchange sets a session cookie before redirecting here.
  // If there's no session, the link was invalid or expired — tell the user.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? "ready" : "invalid");
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("انتهت صلاحية الرابط أو حدث خطأ. اطلب رابطاً جديداً.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (status === "invalid") {
    return (
      <div>
        <h1 className="text-2xl font-bold">رابط غير صالح</h1>
        <p className="mt-1 text-sm text-muted">انتهت صلاحية رابط إعادة التعيين أو سبق استخدامه.</p>
        <div className="mt-7">
          <Alert>افتح الرابط من أحدث رسالة وصلتك، أو اطلب رابطاً جديداً.</Alert>
          <Link
            href="/forgot-password"
            className="mt-6 block rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-medium text-[#0b0d10] hover:bg-accent-soft"
          >
            اطلب رابطاً جديداً
          </Link>
          <Link href="/login" className="mt-4 block text-center text-sm text-muted hover:text-foreground">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">كلمة مرور جديدة</h1>
      <p className="mt-1 text-sm text-muted">اختر كلمة مرور قوية لحسابك.</p>
      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="كلمة المرور الجديدة — NEW PASSWORD">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
        </Field>
        <Field label="تأكيد كلمة المرور — CONFIRM">
          <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" dir="ltr" />
        </Field>
        <Button type="submit" loading={loading || status === "checking"} className="w-full">
          حفظ كلمة المرور
        </Button>
      </form>
    </div>
  );
}
