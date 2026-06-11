import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlans } from "@/lib/plans-server";
import { planFeaturesFor } from "@/lib/plans";
import { verticalConfig } from "@/lib/vertical";
import { hasBankDetails, whatsappLink } from "@/lib/bank";
import { getPaymentSettings } from "@/lib/bank-server";

export default async function SubscriptionPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  const plans = await getPlans();
  const pay = await getPaymentSettings();
  let current: { plan: string; status: string; ends_at: string | null } | null = null;
  if (ctx.office) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status, ends_at")
      .eq("office_id", ctx.office.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    current = data;
  }

  const isActive = current?.status === "active" && ctx.office?.status === "active";

  // Build a prefilled WhatsApp request for a given plan, carrying the office's
  // identity so the admin can match the transfer and activate the subscription.
  const cfg = verticalConfig(ctx.office?.kind);
  const officeLabel = ctx.office?.name || ctx.office?.slug || "—";
  const requestLink = (planName: string, price: number, currency: string) =>
    whatsappLink(
      `السلام عليكم، أرغب بالاشتراك في باقة «${planName}» (${price} ${currency} سنوياً).\n` +
        `${cfg.entityLabel}: ${officeLabel}\n` +
        `الجوال: ${ctx.profile?.phone || "—"}\n` +
        `البريد: ${ctx.email || "—"}\n` +
        `سأرفق إيصال التحويل البنكي.`,
      pay.whatsapp,
    );

  const bankConfigured = hasBankDetails(pay);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">الاشتراك</h1>
      <p className="mt-1 text-muted">
        اختر باقتك السنوية، حوّل المبلغ على الحساب البنكي، وأرسل الإيصال عبر واتساب — ويُفعّل موقعك يدوياً خلال وقت قصير.
      </p>

      {isActive ? (
        <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
          <div className="text-lg font-semibold text-emerald-300">اشتراكك نشط ✓</div>
          <p className="mt-1 text-sm text-emerald-200/80">
            الباقة: {plans.find((p) => p.code === current?.plan)?.name || current?.plan}
            {current?.ends_at && ` — ينتهي في ${new Date(current.ends_at).toLocaleDateString("ar-SA")}`}
          </p>
        </div>
      ) : current?.status === "pending" ? (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-200">
          لديك طلب اشتراك بانتظار تأكيد التحويل. بعد إرسالك للإيصال سيُفعّل موقعك يدوياً.
        </div>
      ) : null}

      {/* Bank transfer details */}
      <div className="mt-6 rounded-2xl glass-panel p-6">
        <h2 className="text-lg font-semibold">بيانات التحويل البنكي</h2>
        {bankConfigured ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {pay.bankName && (
              <div>
                <dt className="text-xs text-muted">البنك</dt>
                <dd className="font-medium">{pay.bankName}</dd>
              </div>
            )}
            {pay.accountName && (
              <div>
                <dt className="text-xs text-muted">اسم صاحب الحساب</dt>
                <dd className="font-medium">{pay.accountName}</dd>
              </div>
            )}
            {pay.iban && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">رقم الآيبان (IBAN)</dt>
                <dd dir="ltr" className="mono select-all break-all font-medium">{pay.iban}</dd>
              </div>
            )}
            {pay.accountNumber && (
              <div>
                <dt className="text-xs text-muted">رقم الحساب</dt>
                <dd dir="ltr" className="mono select-all font-medium">{pay.accountNumber}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-amber-300">
            لم تُضف بيانات الحساب البنكي بعد. تواصل معنا عبر واتساب لإتمام الاشتراك.
          </p>
        )}

        {pay.instructions && (
          <p className="mt-4 whitespace-pre-line rounded-lg border border-border bg-surface-2 p-3 text-sm text-muted">{pay.instructions}</p>
        )}

        <ol className="mt-5 space-y-1.5 text-sm text-muted">
          <li>١. اختر باقتك من الأسفل وحوّل قيمتها السنوية على الحساب أعلاه.</li>
          <li>٢. أرسل صورة إيصال التحويل عبر واتساب مع اسم مكتبك.</li>
          <li>٣. نفعّل اشتراكك يدوياً ويُنشر موقعك مباشرة.</li>
        </ol>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = isActive && current?.plan === p.code;
          const wa = requestLink(p.name, p.price, p.currency);
          return (
            <div key={p.code} className={`rounded-2xl border bg-surface p-7 ${p.highlight ? "border-accent" : "border-border"}`}>
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-bold">{p.price.toLocaleString("en-US")}</span>
                <span className="text-muted">{p.currency} / {p.period}</span>
              </div>
              <ul className="mt-5 space-y-2">
                {planFeaturesFor(ctx.office?.kind, p).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 text-accent">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="mt-6 block rounded-xl border border-border py-3 text-center font-medium text-muted">
                  باقتك الحالية
                </span>
              ) : wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 block rounded-xl bg-accent py-3 text-center font-medium text-[#0b0d10] hover:bg-accent-soft"
                >
                  اطلب الاشتراك عبر واتساب
                </a>
              ) : (
                <span className="mt-6 block rounded-xl border border-border py-3 text-center text-sm text-muted">
                  تواصل معنا لإتمام الاشتراك
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl glass-panel p-6">
        <h2 className="text-lg font-semibold">تجديد الاشتراك وإلغاؤه</h2>
        <p className="mt-1 text-sm text-muted">
          الاشتراك سنوي ولا يُجدّد تلقائياً — لا تُسحب منك أي مبالغ دون علمك. قبل انتهاء السنة نُذكّرك،
          وللتجديد تُعيد التحويل وترسل الإيصال. إن لم ترغب بالتجديد، يبقى موقعك يعمل حتى نهاية الفترة المدفوعة ثم يُغلق.
        </p>
        {whatsappLink("لدي استفسار بخصوص الاشتراك.", pay.whatsapp) && (
          <a
            href={whatsappLink("لدي استفسار بخصوص الاشتراك.", pay.whatsapp) || "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-lg border border-border px-4 py-2 text-sm text-accent hover:bg-surface-2"
          >
            تواصل عبر واتساب ↗
          </a>
        )}
      </div>

      <Link href="/dashboard" className="mt-8 inline-block text-sm text-accent hover:underline">
        ← العودة للوحة التحكم
      </Link>
    </div>
  );
}
