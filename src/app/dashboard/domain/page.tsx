import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlanCaps } from "@/lib/plans-server";
import DomainManager from "./DomainManager";

export default async function DomainPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.office) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl glass-panel p-8 text-center">
        <h1 className="text-xl font-bold">لا يوجد مكتب مرتبط بحسابك</h1>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("office_id", ctx.office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const caps = await getPlanCaps(sub?.plan);

  const { data: office } = await supabase
    .from("offices")
    .select("custom_domain, domain_status")
    .eq("id", ctx.office.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">النطاق الخاص</h1>
      <p className="mt-1 text-muted">اربط اسم نطاقك التجاري ليعمل عليه موقع مكتبك.</p>

      {caps.customDomain ? (
        <DomainManager
          initialDomain={(office?.custom_domain as string) || ""}
          initialStatus={(office?.domain_status as string) || "none"}
        />
      ) : (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-200">
          ربط النطاق الخاص متاح في الباقة الاحترافية وبريميوم. رقِّ باقتك لتفعيله.
        </div>
      )}
    </div>
  );
}
