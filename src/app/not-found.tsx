import StatusCard from "@/components/site/StatusCard";

export default function NotFound() {
  return (
    <StatusCard
      chip="404"
      title="الصفحة غير موجودة"
      body="عذراً، الصفحة التي تبحث عنها غير متاحة أو تم نقلها."
      actionHref="/"
      actionLabel="العودة للرئيسية"
    />
  );
}
