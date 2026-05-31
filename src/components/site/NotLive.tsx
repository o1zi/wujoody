import StatusCard from "./StatusCard";

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
    <StatusCard
      chip={slug}
      title={copy.title}
      body={copy.body}
      actionHref={APP_URL}
      actionLabel="منصة المكاتب الهندسية"
    />
  );
}
