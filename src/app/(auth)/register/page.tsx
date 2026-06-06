"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizePhone } from "@/lib/phone";
import { Field, Input, Button, Alert } from "@/components/ui";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

function normalizeSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function RegisterPage() {
  const router = useRouter();
  const [officeName, setOfficeName] = useState("");
  const [slug, setSlug] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanSlug = normalizeSlug(slug);
    if (cleanSlug.length < 3) {
      setError("النطاق الفرعي يجب أن يكون 3 أحرف على الأقل (إنجليزية/أرقام).");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length !== 9 || !cleanPhone.startsWith("5")) {
      setError("أدخل رقم جوال سعودي صحيح (مثال: 05XXXXXXXX).");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        officeName,
        slug: cleanSlug,
        fullName,
        email,
        phone: cleanPhone,
        password,
      }),
    });
    const data = (await res.json().catch(() => ({ ok: false }))) as { ok?: boolean; signedIn?: boolean; error?: string };
    if (!data.ok) {
      setLoading(false);
      setError(data.error || "تعذّر إنشاء الحساب. تأكد من البيانات وحاول مجدداً.");
      return;
    }
    // Hard navigation so the freshly-set session cookie is seen server-side.
    if (data.signedIn) window.location.href = "/dashboard";
    else router.push("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">أنشئ مكتبك</h1>
      <p className="mt-1 text-sm text-muted">دقائق معدودة ويصبح موقعك جاهزاً.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="اسم المكتب — OFFICE NAME">
          <Input required value={officeName} onChange={(e) => setOfficeName(e.target.value)} placeholder="مكتب أوتاد الهندسي" />
        </Field>
        <Field label="النطاق الفرعي — SUBDOMAIN" hint={`موقعك سيكون: ${normalizeSlug(slug) || "اسم-المكتب"}.${ROOT_DOMAIN}`}>
          <div className="flex items-center gap-2" dir="ltr">
            <Input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={() => setSlug(normalizeSlug(slug))}
              placeholder="awtad"
              className="font-mono"
            />
            <span className="mono shrink-0 text-xs text-muted">.{ROOT_DOMAIN}</span>
          </div>
        </Field>
        <Field label="اسمك — YOUR NAME">
          <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="عبدالله الراشد" />
        </Field>
        <Field label="البريد الإلكتروني — EMAIL">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" />
        </Field>
        <Field label="رقم الجوال — MOBILE" hint="نتواصل معك عليه لتأكيد الاشتراك">
          <Input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" dir="ltr" />
        </Field>
        <Field label="كلمة المرور — PASSWORD" hint="8 أحرف على الأقل">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          إنشاء الحساب
        </Button>
        <p className="text-center text-xs leading-5 text-muted">
          بإنشائك الحساب فأنت توافق على{" "}
          <Link href="/terms" className="text-accent hover:underline">الشروط والأحكام</Link>{" "}
          و
          <Link href="/privacy" className="text-accent hover:underline">سياسة الخصوصية</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        لديك حساب؟{" "}
        <Link href="/login" className="text-accent hover:underline">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
