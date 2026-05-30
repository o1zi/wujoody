const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function NotLive({
  variant,
  slug,
  name,
}: {
  variant: "missing" | "pending" | "suspended" | "expired";
  slug: string;
  name?: string;
}) {
  const copy = {
    missing: {
      title: "هذا الموقع غير موجود",
      body: `لا يوجد مكتب مرتبط بالنطاق "${slug}".`,
    },
    pending: {
      title: "الموقع قيد التفعيل",
      body: `${name || "هذا المكتب"} لم يُفعّل اشتراكه بعد. عند إتمام الاشتراك سيصبح الموقع متاحاً.`,
    },
    suspended: {
      title: "الموقع موقوف مؤقتاً",
      body: `${name || "هذا المكتب"} موقوف حالياً. يرجى التواصل مع الإدارة.`,
    },
    expired: {
      title: "انتهى الاشتراك",
      body: `انتهى اشتراك ${name || "هذا المكتب"}. يُرجى تجديد الاشتراك لإعادة تفعيل الموقع.`,
    },
  }[variant];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mono mb-4 rounded-full border border-border px-4 py-1.5 text-xs text-muted">
        {slug}
      </div>
      <h1 className="text-3xl font-bold">{copy.title}</h1>
      <p className="mt-3 max-w-md text-muted">{copy.body}</p>
      <a
        href={APP_URL}
        className="mt-7 rounded-xl bg-accent px-6 py-3 font-medium text-[#0b0d10] hover:bg-accent-soft"
      >
        منصة المكاتب الهندسية
      </a>
    </div>
  );
}
