import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setLeadStatus } from "./actions";

type Lead = {
  id: string;
  name: string | null;
  contact: string | null;
  message: string | null;
  status: string;
  kind: string | null;
  created_at: string;
};

export default async function LeadsPage() {
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
  const q1 = await supabase
    .from("leads")
    .select("id, name, contact, message, status, kind, created_at")
    .eq("office_id", ctx.office.id)
    .order("created_at", { ascending: false })
    .limit(200);

  // Fallback if the `kind` column hasn't been added yet (setup-all.sql not run).
  let rows = q1.data as Lead[] | null;
  if (!rows) {
    const q2 = await supabase
      .from("leads")
      .select("id, name, contact, message, status, created_at")
      .eq("office_id", ctx.office.id)
      .order("created_at", { ascending: false })
      .limit(200);
    rows = (q2.data ?? null) as Lead[] | null;
  }

  const leads = (rows ?? []) as Lead[];
  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الرسائل الواردة</h1>
        {newCount > 0 && (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-sm text-accent">{newCount} جديدة</span>
        )}
      </div>
      <p className="mt-1 text-muted">طلبات التواصل التي تصلك من زوّار موقعك.</p>

      <div className="mt-6 space-y-3">
        {leads.length === 0 && (
          <div className="rounded-2xl glass-panel p-10 text-center text-muted">
            لا توجد رسائل بعد. ستظهر هنا فور إرسال أي زائر نموذج «تواصل معنا».
          </div>
        )}

        {leads.map((l) => (
          <div
            key={l.id}
            className={`rounded-2xl border bg-surface p-5 ${l.status === "new" ? "border-accent/50" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{l.name || "—"}</span>
                  {l.kind === "booking" && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">🗓️ حجز استشارة</span>
                  )}
                  {l.status === "new" && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">جديدة</span>
                  )}
                </div>
                <div className="mono mt-1 text-sm text-accent" dir="ltr">
                  {l.contact}
                </div>
                {l.message && <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{l.message}</p>}
              </div>
              <div className="shrink-0 text-left">
                <div className="mono text-xs text-muted">
                  {new Date(l.created_at).toLocaleString("ar-SA")}
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  {l.status === "new" ? (
                    <form action={setLeadStatus.bind(null, l.id, "read")}>
                      <button className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface-2">
                        تمييز كمقروء
                      </button>
                    </form>
                  ) : (
                    <form action={setLeadStatus.bind(null, l.id, "archived")}>
                      <button className="rounded-md border border-border px-2.5 py-1 text-xs text-muted hover:bg-surface-2">
                        أرشفة
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
