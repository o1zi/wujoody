import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = Promise<{ id: string }>;

export default async function SuperOfficeLeads({ params }: { params: Params }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: office } = await admin.from("offices").select("id, name").eq("id", id).maybeSingle();
  if (!office) notFound();

  const { data: leads } = await admin
    .from("leads")
    .select("id, name, contact, message, status, created_at")
    .eq("office_id", office.id)
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div>
      <Link href="/super-admin" className="text-sm text-accent hover:underline">← كل المكاتب</Link>
      <h1 className="mt-1 text-lg font-bold">رسائل: {office.name}</h1>
      <div className="mt-5 space-y-3">
        {(leads ?? []).length === 0 && (
          <div className="rounded-2xl glass-panel p-8 text-center text-muted">لا توجد رسائل.</div>
        )}
        {(leads ?? []).map((l) => (
          <div key={l.id} className="rounded-2xl glass-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{l.name || "—"}</div>
                <div className="mono mt-1 text-sm text-accent" dir="ltr">{l.contact}</div>
                {l.message && <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{l.message}</p>}
              </div>
              <div className="mono shrink-0 text-xs text-muted">
                {new Date(l.created_at).toLocaleString("ar-SA")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
