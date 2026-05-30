import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeContent } from "@/lib/site-content";
import { getPlanCaps } from "@/lib/plans-server";
import { tenantUrl } from "@/lib/urls";
import Editor from "@/app/dashboard/site-editor/Editor";

type Params = Promise<{ id: string }>;

export default async function SuperEditOffice({ params }: { params: Params }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: office } = await admin
    .from("offices")
    .select("id, name, slug, status")
    .eq("id", id)
    .maybeSingle();
  if (!office) notFound();

  const { data: row } = await admin
    .from("site_content")
    .select("content")
    .eq("office_id", office.id)
    .maybeSingle();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("office_id", office.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const content = mergeContent(row?.content);
  const caps = await getPlanCaps(sub?.plan);
  const siteUrl = office.status === "active" ? tenantUrl(office.slug) : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/super-admin" className="text-sm text-accent hover:underline">
            ← كل المكاتب
          </Link>
          <h1 className="mt-1 text-lg font-bold">
            تعديل موقع: {office.name} <span className="mono text-xs text-muted" dir="ltr">/{office.slug}</span>
          </h1>
        </div>
      </div>
      <Editor officeId={office.id} initial={content} siteUrl={siteUrl} caps={caps} />
    </div>
  );
}
