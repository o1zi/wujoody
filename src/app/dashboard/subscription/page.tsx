import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";

export default async function SubscriptionPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

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

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">الاشتراك</h1>
      <p className="mt-1 text-muted">اختر باقتك وادفع بأمان عبر سلة. يُفعّل موقعك تلقائياً بعد الدفع.</p>

      {isActive ? (
        <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
          <div className="text-lg font-semibold text-emerald-300">اشتراكك نشط ✓</div>
          <p className="mt-1 text-sm text-emerald-200/80">
            الباقة: {PLANS.find((p) => p.code === current?.plan)?.name || current?.plan}
            {current?.ends_at && ` — ينتهي في ${new Date(current.ends_at).toLocaleDateString("ar-SA")}`}
          </p>
        </div>
      ) : current?.status === "pending" ? (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-200">
          لديك طلب بانتظار تأكيد الدفع. إن كنت قد دفعت للتو، سيُفعّل خلال لحظات.
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        مهم: ادفع باستخدام <span className="text-foreground">نفس بريدك المسجّل في المنصة</span>{" "}
        (<span dir="ltr" className="mono">{ctx.email}</span>) ليُربط الدفع بمكتبك تلقائياً.
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {PLANS.map((p, i) => {
          const isCurrent = isActive && current?.plan === p.code;
          return (
            <div key={p.code} className={`rounded-2xl border bg-surface p-7 ${i === 1 ? "border-accent" : "border-border"}`}>
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-muted">{p.currency} / {p.period}</span>
              </div>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 text-accent">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={p.paymentLink}
                target="_blank"
                rel="noreferrer"
                className={`mt-6 block rounded-xl py-3 text-center font-medium ${
                  isCurrent
                    ? "border border-border text-muted"
                    : "bg-accent text-[#0b0d10] hover:bg-accent-soft"
                }`}
              >
                {isCurrent ? "باقتك الحالية" : "ادفع عبر سلة"}
              </a>
            </div>
          );
        })}
      </div>

      <Link href="/dashboard" className="mt-8 inline-block text-sm text-accent hover:underline">
        ← العودة للوحة التحكم
      </Link>
    </div>
  );
}
