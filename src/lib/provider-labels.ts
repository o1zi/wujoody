// Dashboard label set for the shared booking-management pages (doctors/services/
// hours/appointments are reused across clinic + law). Swaps the provider wording
// so a law firm sees "المحامون / استشارات" instead of "الأطباء / مواعيد".

export type ProviderLabels = {
  providersTitle: string;
  providersSub: string;
  providerName: string;
  providerNamePlaceholder: string;
  providerSpecialtyPlaceholder: string;
  providerItem: string; // e.g. "طبيب #" / "محامي #"
  servicesTitle: string;
  servicesSub: string;
  serviceNamePlaceholder: string;
  apptTitle: string;
  apptSub: string;
};

const LAW: ProviderLabels = {
  providersTitle: "المحامون",
  providersSub: "عدد المحامين النشطين يحدّد كم استشارة يمكن حجزها في نفس الوقت.",
  providerName: "اسم المحامي",
  providerNamePlaceholder: "أ. عبدالعزيز الراشد",
  providerSpecialtyPlaceholder: "قانون تجاري",
  providerItem: "محامٍ",
  servicesTitle: "الخدمات القانونية والأتعاب",
  servicesSub: "الخدمات التي تظهر للعميل عند الحجز. المدة تحدّد طول الاستشارة.",
  serviceNamePlaceholder: "استشارة قانونية",
  apptTitle: "الاستشارات",
  apptSub: "حجوزات استشارات عملائك — اضغط الحالة لتغييرها. تصلك إشعارات فورية عند كل حجز جديد.",
};

const CLINIC: ProviderLabels = {
  providersTitle: "الأطباء",
  providersSub: "عدد الأطباء النشطين يحدّد كم موعداً يمكن حجزه في نفس الوقت.",
  providerName: "اسم الطبيب",
  providerNamePlaceholder: "د. أحمد الزهراني",
  providerSpecialtyPlaceholder: "استشاري أسنان",
  providerItem: "طبيب",
  servicesTitle: "الخدمات والأسعار",
  servicesSub: "الخدمات التي تظهر للمريض عند الحجز. المدة تحدّد طول الموعد.",
  serviceNamePlaceholder: "تنظيف الأسنان",
  apptTitle: "المواعيد",
  apptSub: "حجوزات مرضاك — اضغط الحالة لتغييرها. تصلك إشعارات فورية عند كل حجز جديد.",
};

export function providerLabels(kind: string | null | undefined): ProviderLabels {
  return kind === "law" ? LAW : CLINIC;
}
