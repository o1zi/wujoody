"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Button, Alert } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("Email not confirmed")
          ? "لم يتم تأكيد بريدك بعد. تحقّق من رسالة التفعيل في بريدك."
          : "البريد أو كلمة المرور غير صحيحة.",
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
      <p className="mt-1 text-sm text-muted">أدخل بياناتك للوصول إلى لوحة التحكم.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="البريد الإلكتروني — EMAIL">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            dir="ltr"
          />
        </Field>
        <Field label="كلمة المرور — PASSWORD">
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            dir="ltr"
          />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-accent hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          دخول
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="text-accent hover:underline">
          أنشئ مكتبك الآن
        </Link>
      </p>
    </div>
  );
}
