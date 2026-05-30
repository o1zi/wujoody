"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Button, Alert } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <Button type="submit" loading={loading} className="w-full">
          حفظ كلمة المرور
        </Button>
      </form>
    </div>
  );
}
