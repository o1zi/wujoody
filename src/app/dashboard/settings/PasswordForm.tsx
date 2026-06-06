"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Button, Alert } from "@/components/ui";

export default function PasswordForm({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) {
      setMsg({ kind: "error", text: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل." });
      return;
    }
    if (next !== confirm) {
      setMsg({ kind: "error", text: "كلمتا المرور غير متطابقتين." });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    // Re-authenticate with the current password before allowing a change.
    const { error: verifyErr } = await supabase.auth.signInWithPassword({ email, password: current });
    if (verifyErr) {
      setLoading(false);
      setMsg({ kind: "error", text: "كلمة المرور الحالية غير صحيحة." });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) {
      setMsg({ kind: "error", text: "تعذّر تغيير كلمة المرور. حاول مجدداً." });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setMsg({ kind: "success", text: "تم تغيير كلمة المرور بنجاح ✓" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      <Field label="كلمة المرور الحالية — CURRENT">
        <Input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" dir="ltr" autoComplete="current-password" />
      </Field>
      <Field label="كلمة المرور الجديدة — NEW" hint="8 أحرف على الأقل">
        <Input type="password" required value={next} onChange={(e) => setNext(e.target.value)} placeholder="••••••••" dir="ltr" autoComplete="new-password" />
      </Field>
      <Field label="تأكيد كلمة المرور — CONFIRM">
        <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" dir="ltr" autoComplete="new-password" />
      </Field>
      <Button type="submit" loading={loading}>تغيير كلمة المرور</Button>
    </form>
  );
}
