import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { whatsappLink } from "@/lib/bank";
import { getPaymentSettings } from "@/lib/bank-server";
import { getLanding } from "@/lib/landing-server";

export const metadata: Metadata = {
  title: "بانتظار التفعيل",
  robots: { index: false, follow: false },
};

// Landing for offices that exist but aren't active yet. The dashboard layout
// redirects them here; once an admin activates the subscription, the status
// flips to "active" and this page redirects them straight to the dashboard —
// so it disappears the moment they're live.
export default async function ActivatePage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  // Nothing to activate: no office (e.g. super-admin) or already live.
  if (!ctx.office || ctx.office.status === "active") redirect("/dashboard");

  const office = ctx.office;
  const suspended = office.status === "suspended";
  const [pay, landing] = await Promise.all([getPaymentSettings(), getLanding()]);

  const message =
    `السلام عليكم، أرغب ب${suspended ? "تجديد" : "تفعيل"} اشتراك مكتبي في منصة وجود.\n` +
    `المكتب: ${office.name || office.slug}\n` +
    `النطاق: ${office.slug}\n` +
    `الجوال: ${ctx.profile?.phone || "—"}\n` +
    `البريد: ${ctx.email || "—"}`;
  // Use whichever number is configured — payment settings or the landing contact.
  const wa = whatsappLink(message, pay.whatsapp || landing.contact.whatsapp);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-3xl glass-panel p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-2xl">
          {suspended ? "⛔" : "⏳"}
        </div>

        <h1 className="mt-5 text-2xl font-bold">
          {suspended ? "حسابك موقوف مؤقتاً" : "موقعك جاهز — بانتظار التفعيل"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          {suspended
            ? "تم إيقاف اشتراك مكتبك. للتجديد وإعادة تفعيل موقعك، تواصل معنا عبر واتساب ونعيد تفعيله لك فوراً."
            : "جهّزنا حسابك ومكتبك بالكامل. لتفعيل اشتراكك ونشر موقعك مباشرةً، تواصل معنا عبر واتساب ونفعّله لك فوراً."}
        </p>

        <div className="mt-5 rounded-xl border border-border bg-surface-2/40 p-3 text-sm">
          <div className="font-medium">{office.name || "—"}</div>
          <div className="mono mt-0.5 text-xs text-muted" dir="ltr">{office.slug}</div>
        </div>

        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.523 5.26l-.999 3.648 3.466-.907zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
            </svg>
            تواصل عبر واتساب للتفعيل
          </a>
        ) : (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            تواصل معنا لتفعيل اشتراكك. (لم يُضبط رقم واتساب بعد — حدّثه من إعدادات الدفع.)
          </div>
        )}

        <p className="mt-4 text-xs text-muted">يُفعّل اشتراكك يدوياً، وبمجرد التفعيل تدخل لوحة التحكم مباشرةً.</p>

        <form action="/auth/signout" method="post" className="mt-6">
          <button className="text-sm text-muted hover:text-foreground">تسجيل الخروج</button>
        </form>
      </div>
    </main>
  );
}
